param(
  [string]$Commit = '0ab248b',
  [int]$Port = 3000,
  [switch]$Open,
  [switch]$List
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $root
try {
  if ($List) { & (Join-Path $PSScriptRoot 'list-koa-versions.ps1'); return }
  if ($Port -lt 1 -or $Port -gt 65535) { throw 'Port must be between 1 and 65535.' }
  $resolved = (git rev-parse --verify "$Commit^{commit}").Trim()
  if (-not $resolved) { throw "Could not resolve commit '$Commit'." }
  $short = (git rev-parse --short $resolved).Trim()
  $versionRoot = Join-Path $root '.codex-worktrees\versions'
  $checkout = Join-Path $versionRoot $short
  New-Item -ItemType Directory -Path $versionRoot -Force | Out-Null
  if (-not (Test-Path (Join-Path $checkout 'package.json'))) {
    if (Test-Path $checkout) { git worktree remove --force $checkout }
    git worktree add --detach $checkout $resolved
  }
  if (-not (Test-Path (Join-Path $checkout 'node_modules\.bin\vinext.cmd'))) {
    Push-Location $checkout
    try { npm.cmd ci } finally { Pop-Location }
  }
  $url = "http://127.0.0.1:$Port/en"
  Write-Host "KOA version $short: $url"
  Write-Host "Source: $checkout"
  $proc = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev','--','--hostname','127.0.0.1','--port',[string]$Port -WorkingDirectory $checkout -PassThru
  if ($Open) { Start-Sleep -Seconds 2; Start-Process $url }
  Write-Host "PID: $($proc.Id). Stop with: Stop-Process -Id $($proc.Id)"
} finally { Pop-Location }
