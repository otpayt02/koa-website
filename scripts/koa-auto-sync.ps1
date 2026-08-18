[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$logPath = Join-Path $repoRoot '.git\koa-auto-sync.log'

function Write-SyncLog {
  param([string]$Message)
  $line = "$(Get-Date -Format o) $Message"
  Add-Content -LiteralPath $logPath -Value $line
}

function Test-SafeNewPath {
  param([string]$Path)
  $normalized = $Path.Replace('\', '/')
  $allowedPrefixes = @(
    'app/', 'components/', 'db/', 'docs/', 'drizzle/', 'examples/', 'lib/',
    'messages/', 'public/', 'scripts/', 'tests/', 'worker/', '.github/',
    '.hermes/ref/'
  )
  $allowedRoots = @(
    '.gitignore', 'README.md', 'IDEA.md', 'package.json', 'package-lock.json',
    'tsconfig.json', 'next.config.ts', 'vite.config.ts', 'wrangler.jsonc',
    'drizzle.config.ts', 'middleware.ts', 'proxy.ts'
  )
  $isAllowed = (($allowedRoots -contains $normalized) -or ($allowedPrefixes | Where-Object { $normalized.StartsWith($_) }))
  $isSensitive = $normalized -match '(^|/)\.env|(^|/)(secret|credential|token|password|private)(s|/|\.)|\.(pem|key|pfx|p12)$'
  return ($isAllowed -and (-not $isSensitive))
}

$mutex = New-Object System.Threading.Mutex($false, 'KOA-GitHub-Auto-Sync')
if (-not $mutex.WaitOne(0)) { exit 0 }

try {
  Set-Location -LiteralPath $repoRoot
  $origin = (& git remote get-url origin).Trim()
  if ($origin -notmatch 'github\.com[:/]otpayt02/koa-website(?:\.git)?$') {
    throw "Refusing to sync because origin is not the KOA GitHub repository: $origin"
  }

  if ((Test-Path '.git\MERGE_HEAD') -or (Test-Path '.git\rebase-merge') -or (Test-Path '.git\rebase-apply')) {
    throw 'A merge or rebase needs manual resolution before automatic sync can continue.'
  }

  $branch = (& git branch --show-current).Trim()
  if ([string]::IsNullOrWhiteSpace($branch)) { throw 'Automatic sync requires a named branch.' }

  $safePathspecs = @(
    'app', 'components', 'db', 'docs', 'drizzle', 'examples', 'lib', 'messages',
    'public', 'scripts', 'tests', 'worker', '.github', '.hermes/ref',
    '.gitignore', 'README.md', 'IDEA.md',
    'package.json', 'package-lock.json', 'tsconfig.json', 'next.config.ts',
    'vite.config.ts', 'wrangler.jsonc', 'drizzle.config.ts', 'middleware.ts', 'proxy.ts'
  )

  # Existing tracked files are already part of this repository's approved history.
  # New files go through the allow-list below before they are ever staged.
  & git add -u -- .
  $newFiles = & git ls-files --others --exclude-standard -- @safePathspecs
  foreach ($file in $newFiles) {
    if (Test-SafeNewPath $file) { & git add -- $file }
    else { Write-SyncLog "Skipped unapproved or sensitive new file: $file" }
  }

  & git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) {
    & git commit -m "autosync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    Write-SyncLog 'Committed local project changes.'
  }

  & git pull --rebase origin $branch
  if ($LASTEXITCODE -ne 0) {
    & git rebase --abort 2>$null
    throw 'A remote conflict needs manual resolution in GitHub Desktop.'
  }

  & git push origin $branch
  if ($LASTEXITCODE -ne 0) { throw 'Push failed. Check GitHub Desktop authentication or the remote branch.' }
  Write-SyncLog "Synced $branch to GitHub."
}
catch {
  Write-SyncLog "SYNC ERROR: $($_.Exception.Message)"
  exit 1
}
finally {
  $mutex.ReleaseMutex() | Out-Null
  $mutex.Dispose()
}
