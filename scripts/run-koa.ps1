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

if (Test-Path -LiteralPath $statePath -PathType Leaf) {
  try {
    $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
  }
  catch {
    throw "Refusing unreadable runtime state at '$statePath': $($_.Exception.Message)"
  }

  $recordedRoot = [System.IO.Path]::GetFullPath([string]$state.root).TrimEnd('\')
  if (-not [string]::Equals($recordedRoot, $koaRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing mismatched runtime state for '$recordedRoot'."
  }

  $recordedPid = [int]$state.pid
  $recordedProcess = Get-CimInstance -ClassName Win32_Process -Filter "ProcessId = $recordedPid" -ErrorAction SilentlyContinue
  if ($null -ne $recordedProcess) {
    $commandLine = [string]$recordedProcess.CommandLine
    $matchesRoot = $commandLine.IndexOf($koaRoot, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
    $matchesPort = $commandLine -match "--port(?:=|\s+)$([regex]::Escape([string]$state.port))(?:\s|`"|$)"
    if (-not ($matchesRoot -or $matchesPort)) {
      throw "Recorded PID $recordedPid does not match this repository or its recorded port; refusing to reuse or stop it."
    }

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
$startedAt = [DateTimeOffset]::UtcNow
$koaProcess = Start-Process -FilePath 'npm.cmd' -ArgumentList @('run', 'dev', '--', '--host', '127.0.0.1', '--port', [string]$Port) -WorkingDirectory $koaRoot -WindowStyle Hidden -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath -PassThru

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
$runtimeState | ConvertTo-Json | Set-Content -LiteralPath $statePath -Encoding utf8

Write-Host "KOA ready: $koaUrl (owned PID $($koaProcess.Id))."
Write-Host "Stop with: powershell -NoProfile -ExecutionPolicy Bypass -File '$PSScriptRoot\stop-koa.ps1'"
if (-not $NoBrowser) {
  Start-Process $koaUrl
}
