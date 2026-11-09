param(
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
$archiveDir = Join-Path $RepoRoot 'docs\archive'
$launcherDir = Join-Path $RepoRoot 'scripts\versions'
New-Item -ItemType Directory -Force -Path $archiveDir, $launcherDir | Out-Null

function Invoke-Git([string[]]$GitArgs) {
  $result = & git -C $RepoRoot @GitArgs 2>&1
  if ($LASTEXITCODE -ne 0) { throw "git $($GitArgs -join ' ') failed: $result" }
  return @($result)
}

$refs = Invoke-Git @('for-each-ref',"--format=%(refname:short)`t%(objectname)`t%(committerdate:iso-strict)`t%(subject)",'refs/heads','refs/remotes') |
  Where-Object { $_ -and ($_ -notmatch '/HEAD`t') } |
  ForEach-Object {
    $parts = $_ -split "`t", 4
    if ($parts.Count -ge 4 -and $parts[0] -notmatch "`t" -and $parts[1] -match '^[0-9a-f]{40}$') { [pscustomobject]@{ Name=$parts[0]; Sha=$parts[1]; Date=$parts[2]; Subject=$parts[3] } }
  }

$commits = Invoke-Git @('log','--all','--date=iso-strict',"--pretty=format:%H`t%h`t%ad`t%an`t%s") |
  Where-Object { $_ } | ForEach-Object {
    $parts = $_ -split "`t", 5
    [pscustomobject]@{ Full=$parts[0]; Short=$parts[1]; Date=$parts[2]; Author=$parts[3]; Subject=$parts[4] }
  }

$deletions = Invoke-Git @('log','--all','--diff-filter=D','--date=short','--pretty=format:%h`t%ad`t%s','--name-status') |
  Where-Object { $_ -and ($_ -notmatch '^\s*$') }

$files = Invoke-Git @('ls-tree','-r','--name-only','HEAD') | Where-Object { $_ }
$trackedEvidence = $files | Where-Object { $_ -match '\.(html?|css|js|tsx?|jsx?|md|json|png|jpe?g|webp|svg|gif|webm|mp4|pdf|docx|ps1)$' }
$html = $trackedEvidence | Where-Object { $_ -match '\.html?$' }
$assets = $trackedEvidence | Where-Object { $_ -match '\.(png|jpe?g|webp|svg|gif|webm|mp4|pdf|docx)$' }
$docs = $trackedEvidence | Where-Object { $_ -match '(^|/)(docs|README|GLYPH_HANDOFF|IDEA|UNDERSTANDING|cinematic-cookbook)' }
$commands = @(
  "Set-Location '$RepoRoot'; powershell -NoProfile -ExecutionPolicy Bypass -File '.\scripts\run-koa.ps1'",
  "Set-Location '$RepoRoot'; powershell -NoProfile -ExecutionPolicy Bypass -File '.\scripts\run-koa.ps1' -NoBrowser",
  "Set-Location '$RepoRoot'; npm.cmd ci",
  "Set-Location '$RepoRoot'; npm.cmd run dev",
  "Set-Location '$RepoRoot'; npm.cmd run build",
  "Set-Location '$RepoRoot'; npm.cmd test",
  "Set-Location '$RepoRoot'; node --test tests\cinematic-landing.test.mjs tests\rendered-html.test.mjs",
  "Set-Location '$RepoRoot'; powershell -NoProfile -ExecutionPolicy Bypass -File '.\scripts\stop-koa.ps1'"
)

function SafeName([string]$value) {
  $safe = $value -replace '[^A-Za-z0-9._-]+','-'
  return $safe.Trim('-')
}

$launcherRows = @()
foreach ($ref in $refs) {
  $slug = SafeName $ref.Name
  $launcher = Join-Path $launcherDir "launch-$slug.ps1"
  $content = @"
param([switch]`$NoBrowser, [switch]`$KeepWorktree)
`$ErrorActionPreference = 'Stop'
`$repo = (Resolve-Path (Join-Path `$PSScriptRoot '..\..')).Path
`$ref = '$($ref.Name)'
`$worktree = Join-Path ([IO.Path]::GetTempPath()) ('koa-version-' + ('$slug' -replace '[^A-Za-z0-9-]','-') + '-' + [guid]::NewGuid().ToString('N').Substring(0,8))
git -C `$repo worktree add --detach `$worktree `$ref
if (`$LASTEXITCODE -ne 0) { throw "Could not create temporary worktree for `$ref" }
try {
  if (-not (Test-Path (Join-Path `$worktree 'package.json'))) { throw "`$ref has no package.json runtime." }
  if (-not (Test-Path (Join-Path `$worktree 'node_modules\.bin\vinext.cmd'))) { npm.cmd --prefix `$worktree ci }
  `$args = @('-NoProfile','-ExecutionPolicy','Bypass','-File',(Join-Path `$worktree 'scripts\run-koa.ps1'))
  if (`$NoBrowser) { `$args += '-NoBrowser' }
  & powershell @args
} finally {
  if (-not `$KeepWorktree) { git -C `$repo worktree remove --force `$worktree | Out-Null }
  else { Write-Host "Temporary worktree retained at `$worktree" }
}
"@
  Set-Content -LiteralPath $launcher -Value $content -Encoding UTF8
  $sha12 = $ref.Sha.Substring(0,12)
  $launcherRows += "- [$($ref.Name)](../../scripts/versions/launch-$slug.ps1) - $sha12 - $($ref.Subject)"
}

$md = [System.Text.StringBuilder]::new()
[void]$md.AppendLine('# KOA website — full local change archive')
[void]$md.AppendLine()
[void]$md.AppendLine("Generated $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz') from the local checkout at ``$RepoRoot``. This is an evidence index, not a claim that every historical ChatGPT conversation or Sites account version is available locally.")
[void]$md.AppendLine()
[void]$md.AppendLine('## Scope and evidence boundary')
[void]$md.AppendLine()
[void]$md.AppendLine('- Recoverable here: Git refs and commits, tracked HTML/CSS/JS/TS source, local images/video/documents, repository decisions/plans/history, and local PowerShell launch paths.')
[void]$md.AppendLine('- Not recoverable from this checkout alone: deleted/untracked files that were never committed, private ChatGPT Sites versions not represented by a ref or checked-out artifact, browser-only mockups, and prior chat transcripts outside the repository.')
[void]$md.AppendLine('- The working tree was already dirty before this archive was generated; no existing user changes were restored, deleted, committed, pushed, published, or deployed.')
[void]$md.AppendLine()
[void]$md.AppendLine('## Clickable launchers')
[void]$md.AppendLine()
$launcherRows | ForEach-Object { [void]$md.AppendLine($_) }
[void]$md.AppendLine()
[void]$md.AppendLine('Each launcher creates a detached temporary Git worktree for that exact ref, installs locked dependencies if absent, runs the version-local ``scripts/run-koa.ps1``, and removes the temporary worktree when the runner exits. Add ``-KeepWorktree`` to inspect it after launch; add ``-NoBrowser`` for headless startup.')
[void]$md.AppendLine()
[void]$md.AppendLine('## Recoverable HTML landing pages')
[void]$md.AppendLine()
foreach ($f in $html) { [void]$md.AppendLine("- [$f](../../$f)") }
[void]$md.AppendLine()
[void]$md.AppendLine('## Pictures, video, and other binary assets')
[void]$md.AppendLine()
foreach ($f in $assets) { [void]$md.AppendLine("- [$f](../../$f)") }
[void]$md.AppendLine()
[void]$md.AppendLine('## Decisions, plans, history, and specifications')
[void]$md.AppendLine()
foreach ($f in ($docs | Sort-Object -Unique)) { [void]$md.AppendLine("- [$f](../../$f)") }
[void]$md.AppendLine()
[void]$md.AppendLine('## PowerShell and local verification commands')
[void]$md.AppendLine()
foreach ($c in $commands) { [void]$md.AppendLine("````powershell`n$c`n````") }
[void]$md.AppendLine()
[void]$md.AppendLine('## Branch and ref inventory')
[void]$md.AppendLine()
[void]$md.AppendLine('| Ref | Commit | Date | Subject |')
[void]$md.AppendLine('| --- | --- | --- | --- |')
foreach ($ref in $refs) { [void]$md.AppendLine("| ``$($ref.Name)`` | ``$($ref.Sha)`` | $($ref.Date) | $($ref.Subject -replace '\|','\\|') |") }
[void]$md.AppendLine()
[void]$md.AppendLine('## Complete reachable commit ledger')
[void]$md.AppendLine()
[void]$md.AppendLine('| Commit | Date | Author | Subject |')
[void]$md.AppendLine('| --- | --- | --- | --- |')
foreach ($c in $commits) { [void]$md.AppendLine("| [$($c.Short)](https://github.com/otpayt02/koa-website/commit/$($c.Full)) | $($c.Date) | $($c.Author -replace '\|','\\|') | $($c.Subject -replace '\|','\\|') |") }
[void]$md.AppendLine()
[void]$md.AppendLine('## Major architectural evolution and purpose')
[void]$md.AppendLine()
[void]$md.AppendLine('- Static ``public/koa`` HTML/CSS/JS landing surface: preserves the original multi-page public content and asset inventory as a locally inspectable baseline.')
[void]$md.AppendLine('- Cinematic landing components such as ``CinematicLanding``, ``KOALogoIntro``, ``KAGlyphField``, ``KarenGlyphField``, ``SealAssembly``, ``LoomWeave``, ``SunshineRays``, and ``PartnerMarquee``: turn the landing page into a staged, scroll-linked narrative while retaining semantic content.')
[void]$md.AppendLine('- Canonical localized App Router route ``app/[lang]/page.tsx``: consolidates the runtime around one React/vinext application and four locale surfaces.')
[void]$md.AppendLine('- Content/data modules and provenance-aware studios: separate content, translation retention, dictionary review, design preview, and admin-only authoring concerns from public rendering.')
[void]$md.AppendLine('- Motion foundation and normalized scroll: make cinematic effects deterministic, responsive, and suppressible under reduced-motion preferences.')
[void]$md.AppendLine('- PowerShell runner/stopper: make the exact local version reproducible, prevent duplicate vinext processes, and avoid accidental deployment.')
[void]$md.AppendLine('- Tests and verification scripts: protect locale, seal, glyph, motion, rendered HTML, admin access, and runner contracts.')
[void]$md.AppendLine()
[void]$md.AppendLine('## Deletions and superseded decisions')
[void]$md.AppendLine()
[void]$md.AppendLine('Git retains deletion evidence in each commit diff. The following is the reachable deletion ledger; inspect a specific record with ``git show <commit> -- <path>``. This archive does not rewrite deleted content into a new “decision”; it links the surviving decision/history records and preserves the exact commit ledger.')
[void]$md.AppendLine()
[void]$md.AppendLine('````text')
$deletions | ForEach-Object { [void]$md.AppendLine($_) }
[void]$md.AppendLine('````')
[void]$md.AppendLine()
[void]$md.AppendLine('## Commands used to generate this archive')
[void]$md.AppendLine()
[void]$md.AppendLine('````powershell')
[void]$md.AppendLine("Set-Location '$RepoRoot'")
[void]$md.AppendLine("powershell -NoProfile -ExecutionPolicy Bypass -File '.\scripts\generate-koa-change-archive.ps1'")
[void]$md.AppendLine('````')

Set-Content -LiteralPath (Join-Path $archiveDir 'KOA-FULL-CHANGE-ARCHIVE.md') -Value $md.ToString() -Encoding UTF8
Write-Host "Wrote $(Join-Path $archiveDir 'KOA-FULL-CHANGE-ARCHIVE.md')"
Write-Host "Wrote $($launcherRows.Count) clickable ref launchers under $launcherDir"
