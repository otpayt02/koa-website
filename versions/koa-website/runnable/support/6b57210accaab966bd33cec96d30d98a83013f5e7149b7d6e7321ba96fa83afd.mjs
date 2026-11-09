import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koaRoot = fileURLToPath(new URL("../", import.meta.url)).replace(/[\\/]$/, "");
const statePath = path.join(koaRoot, ".koa-runtime.json");
const runScriptPath = path.join(koaRoot, "scripts", "run-koa.ps1");
const stopScriptPath = path.join(koaRoot, "scripts", "stop-koa.ps1");

function runPowerShellFile(scriptPath, args = [], timeout = 90_000) {
  return spawnSync(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath, ...args],
    { cwd: koaRoot, encoding: "utf8", timeout, windowsHide: true },
  );
}

function runPowerShellCommand(command) {
  const result = spawnSync(
    "powershell.exe",
    ["-NoProfile", "-Command", command],
    { cwd: koaRoot, encoding: "utf8", timeout: 15_000, windowsHide: true },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
}

async function getFreePort() {
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

function getListenerPids(port) {
  const output = runPowerShellCommand(
    `$ids = @(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique); $ids -join ','`,
  );
  return output ? output.split(",").map(Number) : [];
}

function getProcessTree(rootPid) {
  const output = runPowerShellCommand(`
    $processes = @(Get-CimInstance -ClassName Win32_Process)
    $pending = New-Object 'System.Collections.Generic.Queue[int]'
    $ids = New-Object 'System.Collections.Generic.List[int]'
    $pending.Enqueue(${rootPid})
    while ($pending.Count -gt 0) {
      $current = $pending.Dequeue()
      if (-not $ids.Contains($current)) {
        $ids.Add($current)
        foreach ($candidate in $processes) {
          if ([int]$candidate.ParentProcessId -eq $current) {
            $pending.Enqueue([int]$candidate.ProcessId)
          }
        }
      }
    }
    $ids -join ','
  `);
  return output ? output.split(",").map(Number) : [];
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function canConnect(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    const finish = (connected) => {
      socket.destroy();
      resolve(connected);
    };
    socket.setTimeout(250, () => finish(false));
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
  });
}

async function waitFor(condition, description, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${description}`);
}

async function terminateTestProcesses(pids) {
  for (const pid of [...pids].reverse()) {
    if (isProcessAlive(pid)) {
      try {
        process.kill(pid);
      } catch {
        // The PID may exit between the liveness check and termination.
      }
    }
  }
  await waitFor(() => pids.every((pid) => !isProcessAlive(pid)), "test-owned processes to exit").catch(() => {});
}

test("the PowerShell runner enforces behavioral PID ownership", async (t) => {
  assert.equal(existsSync(statePath), false, "behavior tests require no active canonical KOA state");

  await t.test("stop removes the owned process tree and listener", async () => {
    const port = await getFreePort();
    let ownedPids = [];

    try {
      const startResult = runPowerShellFile(runScriptPath, ["-Port", String(port), "-NoBrowser"]);
      assert.equal(startResult.status, 0, startResult.stderr || startResult.stdout);

      const state = JSON.parse(readFileSync(statePath, "utf8"));
      assert.equal(state.port, port);
      ownedPids = getProcessTree(state.pid);
      assert.ok(ownedPids.includes(state.pid));
      assert.deepEqual(getListenerPids(port), [state.pid], "the recorded PID must directly own the listener");

      const stopResult = runPowerShellFile(stopScriptPath);
      assert.equal(stopResult.status, 0, stopResult.stderr || stopResult.stdout);
      await waitFor(
        async () => ownedPids.every((pid) => !isProcessAlive(pid)) && !(await canConnect(port)),
        "the owned process tree and listener to exit",
      );
      assert.equal(existsSync(statePath), false);
    } finally {
      if (existsSync(statePath)) runPowerShellFile(stopScriptPath, [], 15_000);
      ownedPids = [...new Set([...ownedPids, ...getListenerPids(port)])];
      await terminateTestProcesses(ownedPids);
      if (existsSync(statePath)) rmSync(statePath, { force: true });
    }
  });

  await t.test("stop refuses stale state for an unrelated process that only mentions the port", async () => {
    const port = await getFreePort();
    const harmlessProcess = spawn(
      process.execPath,
      ["-e", "setInterval(() => {}, 1000)", "--", "--port", String(port)],
      { cwd: path.dirname(process.execPath), stdio: "ignore", windowsHide: true },
    );

    try {
      await waitFor(() => isProcessAlive(harmlessProcess.pid), "the harmless process to start");
      writeFileSync(
        statePath,
        JSON.stringify({
          pid: harmlessProcess.pid,
          port,
          url: `http://127.0.0.1:${port}/en`,
          root: koaRoot,
          startedAt: "2000-01-01T00:00:00.000Z",
        }),
      );

      const stopResult = runPowerShellFile(stopScriptPath, [], 15_000);
      assert.notEqual(stopResult.status, 0, "mismatched state must be refused");
      assert.match(`${stopResult.stdout}\n${stopResult.stderr}`, /refus/i);
      assert.equal(isProcessAlive(harmlessProcess.pid), true, "the unrelated process must survive refusal");
    } finally {
      if (isProcessAlive(harmlessProcess.pid)) process.kill(harmlessProcess.pid);
      await waitFor(() => !isProcessAlive(harmlessProcess.pid), "the harmless process to exit").catch(() => {});
      if (existsSync(statePath)) rmSync(statePath, { force: true });
    }
  });
});
