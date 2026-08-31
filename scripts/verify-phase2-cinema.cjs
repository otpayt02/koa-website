// Rendered verification for the static KOA cinematic entrypoint.
// Usage: node scripts/verify-phase2-cinema.cjs [url] [artifact-prefix] [settle-ms]
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PROFILE = "C:/Users/olive/AppData/Local/Temp/koa_phase2_verify";
const PORT = 9382;
const TARGET = process.argv[2] || "http://127.0.0.1:4187/koa/";
const PREFIX = process.argv[3] || "phase2";
const SETTLE_MS = Number(process.argv[4] || 2200);
const REDUCED_ONLY = process.argv[5] === "reduced-only";
const OUTDIR = path.resolve("output/playwright");

try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {}
fs.mkdirSync(OUTDIR, { recursive: true });

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox",
  "--user-data-dir=" + PROFILE,
  "--remote-debugging-port=" + PORT,
  "--remote-debugging-address=127.0.0.1",
  "--window-size=1440,900", "--hide-scrollbars", "about:blank",
], { stdio: "ignore", windowsHide: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getPageTarget(timeoutMs = 30000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
      if (page) return page;
    } catch (_) {}
    await sleep(300);
  }
  throw new Error("Chrome debugging target did not appear");
}

class CDP {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    this.exceptions = [];
  }

  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = () => reject(new Error("Chrome debugging connection failed"));
    });
    const cdp = new CDP(socket);
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.method === "Runtime.exceptionThrown") {
        cdp.exceptions.push(message.params.exceptionDetails.text || "Runtime exception");
      }
      if (message.id && cdp.pending.has(message.id)) {
        const { resolve, reject } = cdp.pending.get(message.id);
        cdp.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
      }
    };
    return cdp;
  }

  send(method, params = {}, timeoutMs = 30000) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`Timed out: ${method}`));
      }, timeoutMs);
    });
  }

  evaluate(expression) {
    return this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    }).then((result) => (result.result || {}).value);
  }

  async screenshot(name) {
    const result = await this.send("Page.captureScreenshot", { format: "png" }, 40000);
    const file = path.join(OUTDIR, `${name}.png`);
    fs.writeFileSync(file, Buffer.from(result.data, "base64"));
    return file;
  }
}

async function setViewport(cdp, width, height, scale = 1) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: scale,
    mobile: width < 700,
  });
}

async function goToArrivalPhase(cdp, phase) {
  await cdp.evaluate(`(() => {
    const arrival = document.querySelector('.arrival');
    const runway = Math.max(1, arrival.offsetHeight - innerHeight);
    scrollTo(0, arrival.offsetTop + runway * ${phase});
  })()`);
  await sleep(SETTLE_MS);
}

async function snapshotState(cdp, label) {
  return cdp.evaluate(`(() => {
    const arrival = document.querySelector('.arrival');
    const halo = document.querySelector('.halo');
    const flight = document.querySelector('[data-logo-flight]');
    const brand = document.querySelector('.brand');
    return {
      label: ${JSON.stringify(label)},
      viewport: [innerWidth, innerHeight],
      scrollY,
      bodyMotion: document.body.dataset.motion,
      arrivalClass: arrival.className,
      haloVisibility: getComputedStyle(halo).visibility,
      flightOpacity: Number(getComputedStyle(flight).opacity),
      brandFilled: brand.classList.contains('is-filled'),
      rayIntensity: getComputedStyle(document.documentElement).getPropertyValue('--ray-intensity').trim(),
      horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
    };
  })()`);
}

async function main() {
  const target = await getPageTarget();
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);
  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  await cdp.send("Emulation.setEmulatedMedia", {
    media: "screen",
    features: [{ name: "prefers-reduced-motion", value: REDUCED_ONLY ? "reduce" : "no-preference" }],
  });
  await setViewport(cdp, REDUCED_ONLY ? 1280 : 1440, REDUCED_ONLY ? 720 : 900);
  await cdp.send("Page.navigate", { url: TARGET });
  await sleep(2600);
  await cdp.evaluate("document.documentElement.style.scrollBehavior = 'auto'");

  const evidence = [];
  if (REDUCED_ONLY) {
    evidence.push(await cdp.evaluate(`(() => {
      const copy = document.querySelector('.arrival-copy');
      const mission = document.querySelector('.arrival-mission');
      return {
        label: '${PREFIX}-opener',
        viewport: [innerWidth, innerHeight],
        bodyMotion: document.body.dataset.motion,
        motionPreference: document.body.dataset.motionPreference,
        missionDisplay: getComputedStyle(mission).display,
        copyBottom: Math.round(copy.getBoundingClientRect().bottom),
        horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
      };
    })()`));
    await cdp.screenshot(`${PREFIX}-opener`);
    const reducedReport = {
      target: TARGET,
      capturedAt: new Date().toISOString(),
      runtimeExceptions: cdp.exceptions,
      evidence,
    };
    const reducedReportPath = path.join(OUTDIR, `${PREFIX}-runtime-evidence.json`);
    fs.writeFileSync(reducedReportPath, JSON.stringify(reducedReport, null, 2) + "\n");
    console.log(JSON.stringify(reducedReport, null, 2));
    console.log(`Evidence: ${reducedReportPath}`);
    cdp.socket.close();
    chrome.kill();
    try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {}
    if (reducedReport.runtimeExceptions.length) process.exitCode = 1;
    return;
  }
  if (PREFIX === "phase3") {
    await cdp.evaluate("scrollTo(0, 0)");
    await sleep(500);
    const initialScale = await cdp.evaluate("getComputedStyle(document.querySelector('.arrival')).getPropertyValue('--seal-scale').trim() || '1'");
    await cdp.evaluate(`(() => {
      const arrival = document.querySelector('.arrival');
      scrollTo(0, (arrival.offsetHeight - innerHeight) * 0.38);
    })()`);
    await sleep(1000);
    const scaleAfterOneSecond = await cdp.evaluate("getComputedStyle(document.querySelector('.arrival')).getPropertyValue('--seal-scale').trim() || '1'");
    await sleep(5000);
    const scaleAfterSixSeconds = await cdp.evaluate("getComputedStyle(document.querySelector('.arrival')).getPropertyValue('--seal-scale').trim() || '1'");
    evidence.push({
      label: "phase3-scroll-buffer",
      initialScale,
      scaleAfterOneSecond,
      scaleAfterSixSeconds,
      heldForThreeSeconds: Math.abs(Number(initialScale) - Number(scaleAfterOneSecond)) < 0.01,
      replayStartedAfterBuffer: Number(scaleAfterSixSeconds) < Number(scaleAfterOneSecond) - 0.04,
    });
    await cdp.evaluate("scrollTo(0, 0)");
    await sleep(SETTLE_MS);
  }
  const desktopPhases = [
    [`${PREFIX}-desktop-opener`, 0],
    [`${PREFIX}-desktop-seal-migration`, 0.38],
    [`${PREFIX}-desktop-seal-flight`, 0.65],
    [`${PREFIX}-desktop-glyph-o`, 0.79],
    [`${PREFIX}-desktop-complete-koa`, 0.87],
  ];
  for (const [label, phase] of desktopPhases) {
    await goToArrivalPhase(cdp, phase);
    evidence.push(await snapshotState(cdp, label));
    await cdp.screenshot(label);
  }

  await cdp.evaluate(`(() => {
    const film = document.querySelector('[data-film]');
    const runway = Math.max(1, film.offsetHeight - innerHeight);
    scrollTo(0, film.offsetTop + runway * 0.12);
  })()`);
  await sleep(SETTLE_MS);
  evidence.push(await cdp.evaluate(`(() => {
    const scene = document.querySelector('[data-scene].active');
    const corridor = scene && scene.querySelector('[data-reading-corridor]');
    return {
      label: '${PREFIX}-desktop-film',
      viewport: [innerWidth, innerHeight],
      activeChapter: scene && scene.dataset.glyphNum,
      corridorOpacity: corridor && getComputedStyle(corridor).opacity,
      corridorTransform: corridor && getComputedStyle(corridor).transform,
      horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
    };
  })()`));
  await cdp.screenshot(`${PREFIX}-desktop-film`);

  await setViewport(cdp, 390, 844, 2);
  await cdp.send("Page.reload", { ignoreCache: true });
  await sleep(2200);
  await goToArrivalPhase(cdp, 0.84);
  evidence.push(await snapshotState(cdp, `${PREFIX}-mobile-glyph-o`));
  await cdp.screenshot(`${PREFIX}-mobile-glyph-o`);

  const report = {
    target: TARGET,
    capturedAt: new Date().toISOString(),
    runtimeExceptions: cdp.exceptions,
    evidence,
  };
  const reportPath = path.join(OUTDIR, `${PREFIX}-runtime-evidence.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
  console.log(`Evidence: ${reportPath}`);

  cdp.socket.close();
  chrome.kill();
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {}
  if (report.runtimeExceptions.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`PHASE 2 VERIFY CRASH: ${error.message}`);
  try { chrome.kill(); } catch (_) {}
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {}
  process.exit(2);
});
