param(
  [switch]$Open
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$python = Get-Command python -ErrorAction SilentlyContinue
if ($null -eq $python) {
  throw 'Python was not found on PATH. Install Python or run: py -m http.server ...'
}

$variants = @(
  [pscustomobject]@{ Name = 'canonical-static'; Port = 8143; Root = 'C:\Users\olive\Projects\koa-website\public\koa'; Path = '/index.html' },
  [pscustomobject]@{ Name = 'enhanced-static'; Port = 8144; Root = 'C:\Users\olive\Projects\koa-website\public\koa'; Path = '/index-enhanced.html' },
  [pscustomobject]@{ Name = 'url-clone-static'; Port = 8145; Root = 'C:\Users\olive\Projects\koa-url-clone\public\koa'; Path = '/index.html' },
  [pscustomobject]@{ Name = 'koa-sites-v5'; Port = 8146; Root = 'C:\Users\olive\Projects\sons_of_kawthoolei\KOA\koa-sites\public\koa-v5'; Path = '/index.html' },
  [pscustomobject]@{ Name = 'koa-sites-v4'; Port = 8147; Root = 'C:\Users\olive\Projects\sons_of_kawthoolei\KOA\koa-sites\public\koa'; Path = '/index.html' },
  [pscustomobject]@{ Name = 'mock-v4'; Port = 8148; Root = 'C:\Users\olive\Projects\sons_of_kawthoolei\KOA\mock-site-v4'; Path = '/index.html' },
  [pscustomobject]@{ Name = 'mock-v3'; Port = 8149; Root = 'C:\Users\olive\Projects\sons_of_kawthoolei\KOA\mock-site-v3'; Path = '/index.html' },
  [pscustomobject]@{ Name = 'mock-v2'; Port = 8150; Root = 'C:\Users\olive\Projects\sons_of_kawthoolei\KOA\mock-site-v2'; Path = '/index.html' },
  [pscustomobject]@{ Name = 'mock-original'; Port = 8151; Root = 'C:\Users\olive\Projects\sons_of_kawthoolei\KOA\mock-site'; Path = '/index.html' }
)

$started = @()
foreach ($variant in $variants) {
  if (-not (Test-Path -LiteralPath $variant.Root -PathType Container)) {
    Write-Warning "Skipping missing variant root: $($variant.Root)"
    continue
  }

  $listener = @(Get-NetTCPConnection -LocalPort $variant.Port -State Listen -ErrorAction SilentlyContinue)
  if ($listener.Count -gt 0) {
    Write-Host "Already listening: $($variant.Name) -> http://127.0.0.1:$($variant.Port)$($variant.Path)"
    $started += [pscustomobject]@{ Variant = $variant.Name; Port = $variant.Port; Pid = ($listener | Select-Object -First 1).OwningProcess; Url = "http://127.0.0.1:$($variant.Port)$($variant.Path)" }
    continue
  }

  $process = Start-Process -FilePath $python.Source -ArgumentList @('-m', 'http.server', [string]$variant.Port) -WorkingDirectory $variant.Root -WindowStyle Hidden -PassThru
  Start-Sleep -Milliseconds 250
  $started += [pscustomobject]@{ Variant = $variant.Name; Port = $variant.Port; Pid = $process.Id; Url = "http://127.0.0.1:$($variant.Port)$($variant.Path)" }
}

Write-Host ''
Write-Host 'KOA variant previews:'
$started | Format-Table -AutoSize

Write-Host 'Stop only the processes started by this run with:'
$pidList = ($started | ForEach-Object { $_.Pid }) -join ','
Write-Host "Stop-Process -Id $pidList"

if ($Open) {
  foreach ($entry in $started) {
    Start-Process $entry.Url
  }
}
