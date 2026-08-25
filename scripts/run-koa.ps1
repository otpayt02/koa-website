param(
  [int]$Port = 3000,
  [switch]$NoBrowser,
  [switch]$CheckOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$koaRoot = Split-Path -Parent $PSScriptRoot
$statePath = Join-Path $koaRoot '.koa-runtime.json'
$vinextPath = Join-Path $koaRoot 'node_modules\.bin\vinext.cmd'
$vinextCliPath = Join-Path $koaRoot 'node_modules\vinext\dist\cli.js'
$koaUrl = "http://127.0.0.1:$Port/en"
$expectedRoot = [System.IO.Path]::GetFullPath('C:\Users\olive\Projects\koa-website').TrimEnd('\')
$koaRoot = (Resolve-Path -LiteralPath $koaRoot).Path.TrimEnd('\')

if (-not [string]::Equals($koaRoot, $expectedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to run a different checkout. Expected '$expectedRoot'; resolved '$koaRoot'."
}

if ($Port -lt 1 -or $Port -gt 65535) {
  throw "Port must be between 1 and 65535; received $Port."
}

$npmCommand = Get-Command 'npm.cmd' -ErrorAction SilentlyContinue
if ($null -eq $npmCommand) {
  throw 'npm.cmd was not found on PATH.'
}

$nodeCommand = Get-Command 'node.exe' -ErrorAction SilentlyContinue
if ($null -eq $nodeCommand) {
  throw 'node.exe was not found on PATH.'
}
$nodePath = $nodeCommand.Source

if (-not (Test-Path -LiteralPath $vinextPath -PathType Leaf)) {
  $driveName = ([System.IO.Path]::GetPathRoot($koaRoot)).TrimEnd('\').TrimEnd(':')
  $freeBytes = (Get-PSDrive -Name $driveName).Free
  if ($freeBytes -lt 2GB) {
    throw 'At least 2 GB free is required before npm ci.'
  }

  Write-Host 'Locked dependencies are missing; running npm.cmd ci after the 2 GB disk preflight.'
  Push-Location -LiteralPath $koaRoot
  try {
    & npm.cmd ci
    if ($LASTEXITCODE -ne 0) {
      throw "npm.cmd ci failed with exit code $LASTEXITCODE."
    }
  }
  finally {
    Pop-Location
  }
}

if (-not (Test-Path -LiteralPath $vinextPath -PathType Leaf)) {
  throw "The locked vinext command is still missing at '$vinextPath'."
}
if (-not (Test-Path -LiteralPath $vinextCliPath -PathType Leaf)) {
  throw "The locked vinext CLI is missing at '$vinextCliPath'."
}

function Assert-KoaRuntimeIdentity {
  param(
    [Parameter(Mandatory)]$State,
    [Parameter(Mandatory)]$Process,
    [Parameter(Mandatory)][string]$ExpectedRoot,
    [Parameter(Mandatory)][string]$ExpectedVinextCliPath
  )

  foreach ($field in @('pid', 'port', 'url', 'root', 'startedAt')) {
    if ($null -eq $State.$field) {
      throw "Refusing incomplete runtime state: missing '$field'."
    }
  }

  $recordedRoot = [System.IO.Path]::GetFullPath([string]$State.root).TrimEnd('\')
  if (-not [string]::Equals([string]$State.root, $recordedRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
      -not [string]::Equals($recordedRoot, $ExpectedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing runtime state with a non-canonical root '$($State.root)'."
  }

  $recordedPort = [int]$State.port
  $expectedUrl = "http://127.0.0.1:$recordedPort/en"
  if ($recordedPort -lt 1 -or $recordedPort -gt 65535 -or
      -not [string]::Equals([string]$State.url, $expectedUrl, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Refusing runtime state with a mismatched port or URL.'
  }

  $recordedPid = [int]$State.pid
  if ($recordedPid -lt 1 -or [int]$Process.ProcessId -ne $recordedPid) {
    throw "Refusing runtime state with mismatched PID $recordedPid."
  }

  $recordedStartedAt = [DateTimeOffset]::MinValue
  $parsedStartedAt = [DateTimeOffset]::TryParse(
    [string]$State.startedAt,
    [System.Globalization.CultureInfo]::InvariantCulture,
    [System.Globalization.DateTimeStyles]::RoundtripKind,
    [ref]$recordedStartedAt
  )
  $creationTime = [DateTimeOffset]$Process.CreationDate
  if (-not $parsedStartedAt -or [Math]::Abs(($creationTime - $recordedStartedAt).TotalSeconds) -gt 5) {
    throw "Refusing runtime state whose startedAt does not match PID $recordedPid creation time."
  }

  $commandLine = [string]$Process.CommandLine
  $normalizedCommandLine = $commandLine.Replace('/', '\')
  $normalizedVinextCliPath = [System.IO.Path]::GetFullPath($ExpectedVinextCliPath).Replace('/', '\')
  $matchesVinextCli = $normalizedCommandLine.IndexOf($normalizedVinextCliPath, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
  $matchesDev = $commandLine -match '(?:^|\s)dev(?:\s|$)'
  $matchesHost = $commandLine -match '--hostname(?:=|\s+)127\.0\.0\.1(?:\s|"|$)'
  $matchesPort = $commandLine -match "--port(?:=|\s+)$([regex]::Escape([string]$recordedPort))(?:\s|`"|$)"
  if (-not [string]::Equals([string]$Process.Name, 'node.exe', [System.StringComparison]::OrdinalIgnoreCase) -or
      -not $matchesVinextCli -or -not $matchesDev -or -not $matchesHost -or -not $matchesPort) {
    throw "Refusing PID $recordedPid because its command is not the exact KOA vinext server signature."
  }

  $listeners = @(Get-NetTCPConnection -LocalPort $recordedPort -State Listen -ErrorAction SilentlyContinue)
  if ($listeners.Count -eq 0) {
    throw "Refusing PID $recordedPid because it does not own a listener on port $recordedPort."
  }
  foreach ($listener in $listeners) {
    if ([int]$listener.OwningProcess -ne $recordedPid) {
      throw "Refusing PID $recordedPid because port $recordedPort has a different listener owner."
    }
  }
}

if (Test-Path -LiteralPath $statePath -PathType Leaf) {
  try {
    $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
  }
  catch {
    throw "Refusing unreadable runtime state at '$statePath': $($_.Exception.Message)"
  }

  $recordedPid = [int]$state.pid
  $recordedProcess = Get-CimInstance -ClassName Win32_Process -Filter "ProcessId = $recordedPid" -ErrorAction SilentlyContinue
  if ($null -ne $recordedProcess) {
    Assert-KoaRuntimeIdentity -State $state -Process $recordedProcess -ExpectedRoot $koaRoot -ExpectedVinextCliPath $vinextCliPath

    Write-Host "KOA already owns PID $recordedPid at $($state.url)."
    if (-not $CheckOnly -and -not $NoBrowser) {
      Start-Process ([string]$state.url)
    }
    Write-Host "Stop with: powershell -NoProfile -ExecutionPolicy Bypass -File '$PSScriptRoot\stop-koa.ps1'"
    return
  }

  Remove-Item -LiteralPath $statePath -Force
  Write-Host "Removed stale KOA runtime state for exited PID $recordedPid."
}

$listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
if ($listeners.Count -gt 0) {
  $ownerIds = @($listeners.OwningProcess | Sort-Object -Unique)
  throw "Port $Port belongs to an unidentified process (PID $($ownerIds -join ', ')); refusing to stop it."
}

Write-Host "KOA preflight passed: root=$koaRoot; vinext=$vinextPath; port=$Port is available."
if ($CheckOnly) {
  Write-Host 'CheckOnly complete; no process was started.'
  return
}

$runtimeDirectory = Join-Path $koaRoot 'output\runtime'
New-Item -ItemType Directory -Path $runtimeDirectory -Force | Out-Null
$stdoutPath = Join-Path $runtimeDirectory "koa-$Port.stdout.log"
$stderrPath = Join-Path $runtimeDirectory "koa-$Port.stderr.log"
$koaProcess = Start-Process -FilePath $nodePath -ArgumentList @($vinextCliPath, 'dev', '--hostname', '127.0.0.1', '--port', [string]$Port) -WorkingDirectory $koaRoot -WindowStyle Hidden -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath -PassThru
$startedAt = [DateTimeOffset]$koaProcess.StartTime.ToUniversalTime()

$deadline = [DateTimeOffset]::UtcNow.AddSeconds(60)
$ready = $false
while ([DateTimeOffset]::UtcNow -lt $deadline) {
  if ($koaProcess.HasExited) {
    break
  }

  try {
    $response = Invoke-WebRequest -Uri $koaUrl -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
      $ready = $true
      break
    }
  }
  catch {
    # Readiness is the HTTP condition; transient connection failures are expected while vinext starts.
  }

  Start-Sleep -Milliseconds 250
  $koaProcess.Refresh()
}

if (-not $ready) {
  if (-not $koaProcess.HasExited) {
    Stop-Process -Id $koaProcess.Id -Force -ErrorAction SilentlyContinue
    Wait-Process -Id $koaProcess.Id -Timeout 10 -ErrorAction SilentlyContinue
  }
  throw "KOA did not become ready at '$koaUrl' within 60 seconds. Logs: '$stdoutPath' and '$stderrPath'."
}

$runtimeState = [ordered]@{
  pid = $koaProcess.Id
  port = $Port
  url = $koaUrl
  root = $koaRoot
  startedAt = $startedAt.ToString('o')
}
try {
  $startedProcess = Get-CimInstance -ClassName Win32_Process -Filter "ProcessId = $($koaProcess.Id)" -ErrorAction Stop
  Assert-KoaRuntimeIdentity -State $runtimeState -Process $startedProcess -ExpectedRoot $koaRoot -ExpectedVinextCliPath $vinextCliPath
}
catch {
  if (-not $koaProcess.HasExited) {
    Stop-Process -Id $koaProcess.Id -Force -ErrorAction SilentlyContinue
    Wait-Process -Id $koaProcess.Id -Timeout 10 -ErrorAction SilentlyContinue
  }
  throw
}
$stateJson = $runtimeState | ConvertTo-Json
[System.IO.File]::WriteAllText($statePath, $stateJson, [System.Text.UTF8Encoding]::new($false))

Write-Host "KOA ready: $koaUrl (owned PID $($koaProcess.Id))."
Write-Host "Stop with: powershell -NoProfile -ExecutionPolicy Bypass -File '$PSScriptRoot\stop-koa.ps1'"
if (-not $NoBrowser) {
  Start-Process $koaUrl
}
