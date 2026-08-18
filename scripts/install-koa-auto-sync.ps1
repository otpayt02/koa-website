[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$taskName = 'KOA GitHub Auto Sync'
$syncScript = Join-Path $PSScriptRoot 'koa-auto-sync.ps1'
$powershell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$taskCommand = "`"$powershell`" -NoProfile -ExecutionPolicy Bypass -File `"$syncScript`""

& schtasks.exe /Create /TN $taskName /TR $taskCommand /SC MINUTE /MO 1 /F | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not create the KOA GitHub Auto Sync scheduled task.' }

& $syncScript
if ($LASTEXITCODE -ne 0) { throw 'The scheduled task was created, but the first sync needs attention. See .git\koa-auto-sync.log.' }

Write-Output "Installed '$taskName'. It checks GitHub every minute while this Windows account is active."
