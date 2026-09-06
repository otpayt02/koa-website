import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const runnerUrl = new URL("../scripts/run-koa.ps1", import.meta.url);
const stopUrl = new URL("../scripts/stop-koa.ps1", import.meta.url);

function readRequiredScript(url, relativePath) {
  assert.ok(existsSync(url), `${relativePath} must exist`);
  return readFileSync(url, "utf8");
}

test("the KOA runner owns one safe condition-checked local runtime", () => {
  const source = readRequiredScript(runnerUrl, "scripts/run-koa.ps1");

  assert.match(source, /\[switch\]\$NoBrowser/);
  assert.match(source, /\[switch\]\$CheckOnly/);
  assert.match(source, /2GB/);
  assert.match(source, /node_modules\\\.bin\\vinext\.cmd/);
  assert.match(source, /npm\.cmd["']?\s+ci/);
  assert.match(source, /Get-NetTCPConnection/);
  assert.match(source, /vinextCliPath/);
  assert.match(source, /Start-Process\s+-FilePath\s+\$nodePath[\s\S]*-WindowStyle\s+Hidden/);
  assert.doesNotMatch(source, /Start-Process[\s\S]*npm\.cmd[\s\S]*-WindowStyle\s+Hidden/);
  assert.match(source, /Invoke-WebRequest[\s\S]*\$koaUrl/);
  assert.match(source, /AddSeconds\(60\)/);
  assert.match(source, /\.koa-runtime\.json/);
  for (const field of ["pid", "port", "url", "root", "startedAt"]) {
    assert.match(source, new RegExp(`\\b${field}\\s*=`));
  }
  assert.match(source, /ConvertTo-Json/);
  assert.match(source, /CreationDate/);
  assert.match(source, /OwningProcess/);
  assert.match(source, /\$state\.startedAt/i);
  assert.match(source, /Start-Process\s+\$koaUrl/);
  assert.match(source, /stop-koa\.ps1/);
  assert.doesNotMatch(source, /\b(?:git\s+push|npm(?:\.cmd)?\s+publish|wrangler(?:\.cmd)?\s+deploy|vercel(?:\.cmd)?\s+deploy)\b/i);
  assert.doesNotMatch(source, /Start-Sleep\s+-Seconds\s+(?:[6-9]\d|\d{3,})\b/i);
});

test("the KOA stop script stops only the recorded matching PID", () => {
  const source = readRequiredScript(stopUrl, "scripts/stop-koa.ps1");

  assert.match(source, /\.koa-runtime\.json/);
  assert.match(source, /ConvertFrom-Json/);
  assert.match(source, /\$state\.pid/);
  assert.match(source, /Win32_Process/);
  assert.match(source, /CommandLine/);
  assert.match(source, /vinextCliPath/);
  assert.match(source, /CreationDate/);
  assert.match(source, /OwningProcess/);
  assert.match(source, /\$state\.startedAt/i);
  assert.match(source, /\$state\.root/i);
  assert.match(source, /\$state\.port/i);
  assert.match(source, /Stop-Process\s+-Id\s+\$ownedPid\b/);
  assert.match(source, /Wait-Process\s+-Id\s+\$ownedPid\b/);
  assert.match(source, /Remove-Item[\s\S]*\$statePath/);
  assert.doesNotMatch(source, /\$matchesRoot\s+-or\s+\$matchesPort/);
  assert.doesNotMatch(source, /Get-Process[\s\S]*\|[\s\S]*Stop-Process/);
});
