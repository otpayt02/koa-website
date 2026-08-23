// Phase 3 uses the shared rendered verifier with enough time for the explicit
// three-second scroll buffer and the secondary cinematic easing to settle.
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const target = process.argv[2] || "http://127.0.0.1:4187/koa/";
const verifier = path.join(__dirname, "verify-phase2-cinema.cjs");
const result = spawnSync(process.execPath, [verifier, target, "phase3", "9000"], {
  cwd: path.resolve(__dirname, ".."),
  stdio: "inherit",
  windowsHide: true,
});

process.exit(result.status == null ? 2 : result.status);
