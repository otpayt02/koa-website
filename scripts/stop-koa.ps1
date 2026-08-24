Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$koaRoot = Split-Path -Parent $PSScriptRoot
$statePath = Join-Path $koaRoot '.koa-runtime.json'
$expectedRoot = [System.IO.Path]::GetFullPath('C:\Users\olive\Projects\koa-website').TrimEnd('\')
$koaRoot = (Resolve-Path -LiteralPath $koaRoot).Path.TrimEnd('\')

if (-not [string]::Equals($koaRoot, $expectedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to stop a different checkout. Expected '$expectedRoot'; resolved '$koaRoot'."
}

if (-not (Test-Path -LiteralPath $statePath -PathType Leaf)) {
  Write-Host "No owned KOA runtime state exists at '$statePath'."
  return
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

$recordedRoot = [System.IO.Path]::GetFullPath([string]$state.root).TrimEnd('\')
if (-not [string]::Equals($recordedRoot, $koaRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing mismatched runtime state for '$recordedRoot'."
}

$recordedPort = [int]$state.port
$expectedUrl = "http://127.0.0.1:$recordedPort/en"
if ($recordedPort -lt 1 -or $recordedPort -gt 65535 -or -not [string]::Equals([string]$state.url, $expectedUrl, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'Refusing runtime state with a mismatched port or URL.'
}

$ownedPid = [int]$state.pid
if ($ownedPid -lt 1) {
  throw "Refusing invalid recorded PID $ownedPid."
}

$ownedProcess = Get-CimInstance -ClassName Win32_Process -Filter "ProcessId = $ownedPid" -ErrorAction SilentlyContinue
if ($null -eq $ownedProcess) {
  Remove-Item -LiteralPath $statePath -Force
  Write-Host "Recorded KOA PID $ownedPid has already exited; stale state removed."
  return
}

$commandLine = [string]$ownedProcess.CommandLine
$matchesRoot = $commandLine.IndexOf([string]$state.root, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
$matchesPort = $commandLine -match "--port(?:=|\s+)$([regex]::Escape([string]$state.port))(?:\s|`"|$)"
if (-not ($matchesRoot -or $matchesPort)) {
  throw "Recorded PID $ownedPid does not reference this repository or port $($state.port); refusing to stop it."
}

Stop-Process -Id $ownedPid -ErrorAction Stop
Wait-Process -Id $ownedPid -Timeout 10 -ErrorAction SilentlyContinue
if ($null -ne (Get-Process -Id $ownedPid -ErrorAction SilentlyContinue)) {
  throw "Owned PID $ownedPid did not exit; runtime state was preserved."
}

Remove-Item -LiteralPath $statePath -Force
Write-Host "Stopped owned KOA PID $ownedPid and removed '$statePath'."
