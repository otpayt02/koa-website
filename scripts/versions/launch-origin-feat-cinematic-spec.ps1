param([switch]$NoBrowser, [switch]$KeepWorktree)
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$ref = 'origin/feat/cinematic-spec'
$worktree = Join-Path ([IO.Path]::GetTempPath()) ('koa-version-' + ('origin-feat-cinematic-spec' -replace '[^A-Za-z0-9-]','-') + '-' + [guid]::NewGuid().ToString('N').Substring(0,8))
git -C $repo worktree add --detach $worktree $ref
if ($LASTEXITCODE -ne 0) { throw "Could not create temporary worktree for $ref" }
try {
  if (-not (Test-Path (Join-Path $worktree 'package.json'))) { throw "$ref has no package.json runtime." }
  if (-not (Test-Path (Join-Path $worktree 'node_modules\.bin\vinext.cmd'))) { npm.cmd --prefix $worktree ci }
  $args = @('-NoProfile','-ExecutionPolicy','Bypass','-File',(Join-Path $worktree 'scripts\run-koa.ps1'))
  if ($NoBrowser) { $args += '-NoBrowser' }
  & powershell @args
} finally {
  if (-not $KeepWorktree) { git -C $repo worktree remove --force $worktree | Out-Null }
  else { Write-Host "Temporary worktree retained at $worktree" }
}
