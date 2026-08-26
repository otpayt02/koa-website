import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
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

test("impossible runtime PIDs are cleared before PowerShell inspects a process", () => {
  const runner = readRequiredScript(runnerUrl, "scripts/run-koa.ps1");
  const stopper = readRequiredScript(stopUrl, "scripts/stop-koa.ps1");

  assert.match(
    runner,
    /if \(\$recordedPid -lt 1\) \{[\s\S]*?Remove-Item[^\r\n]*\$statePath[\s\S]*?Write-Host[^\r\n]*impossible PID/i,
  );
  assert.ok(
    runner.indexOf("if ($recordedPid -lt 1)") < runner.indexOf("$recordedProcess = Get-CimInstance"),
    "the runner must clear an impossible PID before querying Win32_Process",
  );

  assert.match(
    stopper,
    /if \(\$ownedPid -lt 1\) \{[\s\S]*?Remove-Item[^\r\n]*\$statePath[\s\S]*?Write-Host[^\r\n]*impossible PID[\s\S]*?return/i,
  );
  assert.ok(
    stopper.indexOf("if ($ownedPid -lt 1)") < stopper.indexOf("$ownedProcess = Get-CimInstance"),
    "the stop script must clear an impossible PID before querying Win32_Process",
  );
});

function runPowerShell(scriptPath, args = []) {
  return spawnSync(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath, ...args],
    { encoding: "utf8", timeout: 20_000, windowsHide: true },
  );
}

async function reserveFreePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const port = address.port;
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  return port;
}

function createIsolatedRunnerFixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "koa-runner-state-"));
  const scripts = path.join(root, "scripts");
  mkdirSync(scripts, { recursive: true });
  mkdirSync(path.join(root, "node_modules", ".bin"), { recursive: true });
  mkdirSync(path.join(root, "node_modules", "vinext", "dist"), { recursive: true });
  writeFileSync(path.join(root, "node_modules", ".bin", "vinext.cmd"), "@exit /b 0\r\n");
  writeFileSync(path.join(root, "node_modules", "vinext", "dist", "cli.js"), "// fixture\n");

  const escapedRoot = root.replaceAll("'", "''");
  const sentinel = [
    "function Get-CimInstance { throw 'GET_CIM_SENTINEL_CALLED' }",
    "function Stop-Process { throw 'STOP_PROCESS_SENTINEL_CALLED' }",
  ].join("\r\n");

  for (const [sourceUrl, name] of [[runnerUrl, "run-koa.ps1"], [stopUrl, "stop-koa.ps1"]]) {
    const source = readFileSync(sourceUrl, "utf8");
    const rooted = source.replace(
      "[System.IO.Path]::GetFullPath('C:\\Users\\olive\\Projects\\koa-website')",
      `[System.IO.Path]::GetFullPath('${escapedRoot}')`,
    );
    assert.notEqual(rooted, source, `${name} fixture must replace the canonical-root guard`);
    const instrumented = rooted.replace(
      "$ErrorActionPreference = 'Stop'",
      `$ErrorActionPreference = 'Stop'\r\n${sentinel}`,
    );
    writeFileSync(path.join(scripts, name), instrumented);
  }

  return {
    root,
    statePath: path.join(root, ".koa-runtime.json"),
    runScript: path.join(scripts, "run-koa.ps1"),
    stopScript: path.join(scripts, "stop-koa.ps1"),
  };
}

test("runner state recovery executes only for genuine integral nonpositive PIDs", async () => {
  const fixture = createIsolatedRunnerFixture();
  const port = await reserveFreePort();
  const stateFor = (pid) => ({
    pid,
    port,
    url: `http://127.0.0.1:${port}/en`,
    root: fixture.root,
    startedAt: "2000-01-01T00:00:00.000Z",
  });

  try {
    writeFileSync(fixture.statePath, JSON.stringify(stateFor(0)));
    const runZero = runPowerShell(fixture.runScript, ["-Port", String(port), "-CheckOnly", "-NoBrowser"]);
    assert.equal(runZero.status, 0, runZero.stderr || runZero.stdout);
    assert.match(runZero.stdout, /impossible PID 0; no process was inspected or stopped/i);
    assert.doesNotMatch(`${runZero.stdout}\n${runZero.stderr}`, /GET_CIM_SENTINEL_CALLED|STOP_PROCESS_SENTINEL_CALLED/);
    assert.equal(existsSync(fixture.statePath), false, "runner must clear genuine numeric PID zero");

    writeFileSync(fixture.statePath, JSON.stringify(stateFor(-1)));
    const stopNegative = runPowerShell(fixture.stopScript);
    assert.equal(stopNegative.status, 0, stopNegative.stderr || stopNegative.stdout);
    assert.match(stopNegative.stdout, /impossible PID -1; no process was inspected or stopped/i);
    assert.doesNotMatch(`${stopNegative.stdout}\n${stopNegative.stderr}`, /GET_CIM_SENTINEL_CALLED|STOP_PROCESS_SENTINEL_CALLED/);
    assert.equal(existsSync(fixture.statePath), false, "stop must clear a genuine negative integer PID");

    for (const malformedPid of ["", "   ", true, 1.5]) {
      for (const [script, args] of [
        [fixture.runScript, ["-Port", String(port), "-CheckOnly", "-NoBrowser"]],
        [fixture.stopScript, []],
      ]) {
        writeFileSync(fixture.statePath, JSON.stringify(stateFor(malformedPid)));
        const result = runPowerShell(script, args);
        assert.notEqual(result.status, 0, `malformed PID ${JSON.stringify(malformedPid)} must be refused`);
        assert.match(`${result.stdout}\n${result.stderr}`, /malformed PID/i);
        assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /GET_CIM_SENTINEL_CALLED|STOP_PROCESS_SENTINEL_CALLED/);
        assert.equal(existsSync(fixture.statePath), true, "refused malformed state must be preserved");
      }
    }
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});
