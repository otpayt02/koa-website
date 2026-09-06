Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$koaRoot = (Resolve-Path -LiteralPath (Split-Path -Parent $PSScriptRoot)).Path.TrimEnd('\')
$statePath = Join-Path $koaRoot '.koa-runtime.json'
$runnerPath = Join-Path $PSScriptRoot 'run-koa.ps1'
$vinextCliPath = [System.IO.Path]::GetFullPath((Join-Path $koaRoot 'node_modules\vinext\dist\cli.js'))
$evidenceDirectory = Join-Path $koaRoot 'output\runtime'
$evidencePath = Join-Path $evidenceDirectory 'task2-stop-diagnostic.json'
$protectedPid = 14356

if (Test-Path -LiteralPath $statePath -PathType Leaf) {
  throw "Diagnostic refuses pre-existing runtime state at '$statePath'."
}

New-Item -ItemType Directory -Path $evidenceDirectory -Force | Out-Null
$evidence = [ordered]@{
  diagnostic = 'task2-stop-lifecycle'
  root = $koaRoot
  port = $null
  before = $null
  terminateReturnValue = $null
  waitProcess = $null
  afterImmediate = $null
  afterPoll = $null
  taskkillFallbackExitCode = $null
  cleanup = $null
  error = $null
}
$caughtError = $null

function Get-ExactDiagnosticProcess {
  param(
    [Parameter(Mandatory)]$State,
    [Parameter(Mandatory)][int]$Port,
    [Parameter(Mandatory)][string]$ExpectedRoot,
    [Parameter(Mandatory)][string]$ExpectedVinextCliPath
  )

  if ($Port -eq 3000 -or [int]$State.port -eq 3000) {
    throw 'Diagnostic refuses protected port 3000.'
  }
  if ([int]$State.port -ne $Port) {
    throw "Diagnostic state port $($State.port) does not match disposable port $Port."
  }

  $recordedRoot = [System.IO.Path]::GetFullPath([string]$State.root).TrimEnd('\')
  if (-not [string]::Equals([string]$State.root, $recordedRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
      -not [string]::Equals($recordedRoot, $ExpectedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Diagnostic refuses mismatched or non-normalized root '$($State.root)'."
  }

  $expectedUrl = "http://127.0.0.1:$Port/en"
  if (-not [string]::Equals([string]$State.url, $expectedUrl, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Diagnostic refuses mismatched URL '$($State.url)'."
  }

  $ownedPid = [int]$State.pid
  if ($ownedPid -lt 1 -or $ownedPid -eq $protectedPid) {
    throw "Diagnostic refuses protected or invalid PID $ownedPid."
  }

  $process = Get-CimInstance -ClassName Win32_Process -Filter "ProcessId = $ownedPid" -ErrorAction SilentlyContinue
  if ($null -eq $process) {
    return $null
  }

  $startedAt = [DateTimeOffset]::MinValue
  $parsedStartedAt = [DateTimeOffset]::TryParse(
    [string]$State.startedAt,
    [System.Globalization.CultureInfo]::InvariantCulture,
    [System.Globalization.DateTimeStyles]::RoundtripKind,
    [ref]$startedAt
  )
  $creationTime = [DateTimeOffset]$process.CreationDate
  if (-not $parsedStartedAt -or [Math]::Abs(($creationTime - $startedAt).TotalSeconds) -gt 5) {
    throw "Diagnostic refuses PID $ownedPid with mismatched creation time."
  }

  $commandLine = [string]$process.CommandLine
  $normalizedCommand = $commandLine.Replace('/', '\')
  $matchesCli = $normalizedCommand.IndexOf($ExpectedVinextCliPath.Replace('/', '\'), [System.StringComparison]::OrdinalIgnoreCase) -ge 0
  $matchesDev = $commandLine -match '(?:^|\s)dev(?:\s|$)'
  $matchesHost = $commandLine -match '--hostname(?:=|\s+)127\.0\.0\.1(?:\s|"|$)'
  $matchesPort = $commandLine -match "--port(?:=|\s+)$([regex]::Escape([string]$Port))(?:\s|`"|$)"
  if (-not [string]::Equals([string]$process.Name, 'node.exe', [System.StringComparison]::OrdinalIgnoreCase) -or
      -not $matchesCli -or -not $matchesDev -or -not $matchesHost -or -not $matchesPort) {
    throw "Diagnostic refuses PID $ownedPid with a mismatched vinext command signature."
  }

  $listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
  if ($listeners.Count -eq 0) {
    throw "Diagnostic refuses PID $ownedPid without a listener on port $Port."
  }
  foreach ($listener in $listeners) {
    if ([int]$listener.OwningProcess -ne $ownedPid) {
      throw "Diagnostic refuses port $Port with unrelated listener PID $($listener.OwningProcess)."
    }
  }

  return $process
}

function Get-ProcessEvidence {
  param(
    $Process,
    [Parameter(Mandatory)][int]$Port
  )

  $listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
  return [ordered]@{
    processExists = $null -ne $Process
    pid = if ($Process) { [int]$Process.ProcessId } else { $null }
    creationDate = if ($Process) { ([DateTimeOffset]$Process.CreationDate).ToString('o') } else { $null }
    parentProcessId = if ($Process) { [int]$Process.ParentProcessId } else { $null }
    executablePath = if ($Process) { [string]$Process.ExecutablePath } else { $null }
    commandLine = if ($Process) { [string]$Process.CommandLine } else { $null }
    listenerOwners = @($listeners | ForEach-Object { [int]$_.OwningProcess })
  }
}

try {
  $portProbe = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  $portProbe.Start()
  $diagnosticPort = ([System.Net.IPEndPoint]$portProbe.LocalEndpoint).Port
  $portProbe.Stop()
  if ($diagnosticPort -eq 3000) {
    throw 'Diagnostic selected protected port 3000.'
  }
  $evidence.port = $diagnosticPort

  & $runnerPath -Port $diagnosticPort -NoBrowser
  $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
  $diagnosticPid = [int]$state.pid
  $ownedProcess = Get-ExactDiagnosticProcess -State $state -Port $diagnosticPort -ExpectedRoot $koaRoot -ExpectedVinextCliPath $vinextCliPath
  if ($null -eq $ownedProcess) {
    throw "Diagnostic process PID $diagnosticPid exited before evidence capture."
  }
  $evidence.before = Get-ProcessEvidence -Process $ownedProcess -Port $diagnosticPort

  $terminateResult = Invoke-CimMethod -InputObject $ownedProcess -MethodName Terminate -Arguments @{ Reason = [uint32]0 } -ErrorAction Stop
  $evidence.terminateReturnValue = [int]$terminateResult.ReturnValue

  $waitStartedAt = [DateTimeOffset]::UtcNow
  try {
    Wait-Process -Id $diagnosticPid -Timeout 15 -ErrorAction Stop
    $evidence.waitProcess = [ordered]@{
      outcome = 'completed'
      elapsedMs = [Math]::Round(([DateTimeOffset]::UtcNow - $waitStartedAt).TotalMilliseconds)
    }
  }
  catch {
    $evidence.waitProcess = [ordered]@{
      outcome = 'error'
      elapsedMs = [Math]::Round(([DateTimeOffset]::UtcNow - $waitStartedAt).TotalMilliseconds)
      exceptionType = $_.Exception.GetType().FullName
      message = $_.Exception.Message
      fullyQualifiedErrorId = $_.FullyQualifiedErrorId
    }
  }

  $immediateProcess = Get-CimInstance -ClassName Win32_Process -Filter "ProcessId = $diagnosticPid" -ErrorAction SilentlyContinue
  $evidence.afterImmediate = Get-ProcessEvidence -Process $immediateProcess -Port $diagnosticPort

  $pollDeadline = [DateTimeOffset]::UtcNow.AddSeconds(15)
  do {
    $polledProcess = Get-CimInstance -ClassName Win32_Process -Filter "ProcessId = $diagnosticPid" -ErrorAction SilentlyContinue
    $polledListeners = @(Get-NetTCPConnection -LocalPort $diagnosticPort -State Listen -ErrorAction SilentlyContinue)
    $sameCreation = $false
    if ($polledProcess) {
      $sameCreation = [Math]::Abs((([DateTimeOffset]$polledProcess.CreationDate) - ([DateTimeOffset]$state.startedAt)).TotalSeconds) -le 5
    }
    if (-not $sameCreation -and $polledListeners.Count -eq 0) {
      break
    }
    Start-Sleep -Milliseconds 100
  } while ([DateTimeOffset]::UtcNow -lt $pollDeadline)
  $evidence.afterPoll = Get-ProcessEvidence -Process $polledProcess -Port $diagnosticPort

  if ($sameCreation -or $polledListeners.Count -gt 0) {
    $cleanupProcess = Get-ExactDiagnosticProcess -State $state -Port $diagnosticPort -ExpectedRoot $koaRoot -ExpectedVinextCliPath $vinextCliPath
    if ($null -eq $cleanupProcess) {
      throw 'Diagnostic cleanup identity disappeared while the listener remained; state preserved.'
    }
    & taskkill.exe /PID $diagnosticPid /T /F
    $evidence.taskkillFallbackExitCode = $LASTEXITCODE
    if ($LASTEXITCODE -ne 0) {
      throw "Diagnostic taskkill cleanup failed for PID $diagnosticPid; state preserved."
    }
  }

  $cleanupDeadline = [DateTimeOffset]::UtcNow.AddSeconds(15)
  do {
    $cleanupProcess = Get-CimInstance -ClassName Win32_Process -Filter "ProcessId = $diagnosticPid" -ErrorAction SilentlyContinue
    $cleanupListeners = @(Get-NetTCPConnection -LocalPort $diagnosticPort -State Listen -ErrorAction SilentlyContinue)
    $cleanupSameCreation = $false
    if ($cleanupProcess) {
      $cleanupSameCreation = [Math]::Abs((([DateTimeOffset]$cleanupProcess.CreationDate) - ([DateTimeOffset]$state.startedAt)).TotalSeconds) -le 5
    }
    if (-not $cleanupSameCreation -and $cleanupListeners.Count -eq 0) {
      break
    }
    Start-Sleep -Milliseconds 100
  } while ([DateTimeOffset]::UtcNow -lt $cleanupDeadline)

  if ($cleanupSameCreation -or $cleanupListeners.Count -gt 0) {
    throw "Diagnostic cleanup did not release PID $diagnosticPid and port $diagnosticPort; state preserved."
  }

  Remove-Item -LiteralPath $statePath -Force
  $evidence.cleanup = 'process-identity-gone, listener-gone, state-removed'
}
catch {
  $caughtError = $_
  $evidence.error = [ordered]@{
    message = $_.Exception.Message
    fullyQualifiedErrorId = $_.FullyQualifiedErrorId
  }
}
finally {
  $evidenceJson = $evidence | ConvertTo-Json -Depth 8
  [System.IO.File]::WriteAllText($evidencePath, $evidenceJson, [System.Text.UTF8Encoding]::new($false))
  Write-Host $evidenceJson
  Write-Host "Diagnostic evidence: $evidencePath"
}

if ($caughtError) {
  throw $caughtError
}
