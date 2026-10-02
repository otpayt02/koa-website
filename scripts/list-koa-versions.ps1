param([int]$Limit = 30)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
  git log --all --date=short --format='%h`t%ad`t%s' -$Limit
} finally { Pop-Location }
