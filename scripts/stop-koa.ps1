Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$koaRoot = Split-Path -Parent $PSScriptRoot
$statePath = Join-Path $koaRoot '.koa-runtime.json'
$vinextCliPath = Join-Path $koaRoot 'node_modules\vinext\dist\cli.js'
$expectedRoot = [System.IO.Path]::GetFullPath('C:\Users\olive\Projects\koa-website').TrimEnd('\')
$koaRoot = (Resolve-Path -LiteralPath $koaRoot).Path.TrimEnd('\')

if (-not [string]::Equals($koaRoot, $expectedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to stop a different checkout. Expected '$expectedRoot'; resolved '$koaRoot'."
}

if (-not (Test-Path -LiteralPath $statePath -PathType Leaf)) {
  Write-Host "No owned KOA runtime state exists at '$statePath'."
  return
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

function ConvertTo-KoaProcessId {
  param($Value)

  $integralTypeNames = @(
    'System.SByte',
    'System.Byte',
    'System.Int16',
    'System.UInt16',
    'System.Int32',
    'System.UInt32',
    'System.Int64',
    'System.UInt64'
  )
  if ($null -eq $Value -or $Value.GetType().FullName -notin $integralTypeNames) {
    throw 'Refusing runtime state with a malformed PID; expected a JSON integer.'
  }
  if ([decimal]$Value -lt [int]::MinValue -or [decimal]$Value -gt [int]::MaxValue) {
    throw 'Refusing runtime state with a malformed PID outside the supported process-ID range.'
  }

  return [int]$Value
}

try {
  $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
}
catch {
  throw "Refusing unreadable runtime state at '$statePath': $($_.Exception.Message)"
}

foreach ($field in @('pid', 'port', 'url', 'root', 'startedAt')) {
  if ($null -eq $state.$field) {
    throw "Refusing incomplete runtime state: missing '$field'."
  }
}

$ownedPid = ConvertTo-KoaProcessId -Value $state.pid
if ($ownedPid -lt 1) {
  Remove-Item -LiteralPath $statePath -Force
  Write-Host "Removed stale KOA runtime state with impossible PID $ownedPid; no process was inspected or stopped."
  return
}

$ownedProcess = Get-CimInstance -ClassName Win32_Process -Filter "ProcessId = $ownedPid" -ErrorAction SilentlyContinue
if ($null -eq $ownedProcess) {
  Remove-Item -LiteralPath $statePath -Force
  Write-Host "Recorded KOA PID $ownedPid has already exited; stale state removed."
  return
}

Assert-KoaRuntimeIdentity -State $state -Process $ownedProcess -ExpectedRoot $koaRoot -ExpectedVinextCliPath $vinextCliPath

Stop-Process -Id $ownedPid -Force -ErrorAction Stop
Wait-Process -Id $ownedPid -Timeout 10 -ErrorAction SilentlyContinue
if ($null -ne (Get-Process -Id $ownedPid -ErrorAction SilentlyContinue)) {
  throw "Owned PID $ownedPid did not exit; runtime state was preserved."
}

$listenerDeadline = [DateTimeOffset]::UtcNow.AddSeconds(10)
do {
  $remainingListeners = @(Get-NetTCPConnection -LocalPort ([int]$state.port) -State Listen -ErrorAction SilentlyContinue)
  if ($remainingListeners.Count -eq 0) {
    break
  }
  Start-Sleep -Milliseconds 100
} while ([DateTimeOffset]::UtcNow -lt $listenerDeadline)
if ($remainingListeners.Count -gt 0) {
  throw "Listener on port $($state.port) remained after owned PID $ownedPid exited; runtime state was preserved."
}

Remove-Item -LiteralPath $statePath -Force
Write-Host "Stopped owned KOA PID $ownedPid and removed '$statePath'."
