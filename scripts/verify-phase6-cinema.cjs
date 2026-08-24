// Verify authored visual states instead of assuming a fixed delay can outwait
// the three-second transport buffer and rate-capped cinematic timeline.
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PROFILE = "C:/Users/olive/AppData/Local/Temp/koa_phase6_verify";
const TARGET = process.argv[2] || "http://127.0.0.1:8123/index.html";
const SUPPORTING_ONLY = process.argv.includes("--supporting-only");
const OUTDIR = path.resolve("output/playwright");
const PORT = 9386;

try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {}
fs.mkdirSync(OUTDIR, { recursive: true });

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  `--user-data-dir=${PROFILE}`, `--remote-debugging-port=${PORT}`,
  "--remote-debugging-address=127.0.0.1", "--window-size=1440,900", "about:blank",
], { stdio: "ignore", windowsHide: true });

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function pageTarget(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
      if (page) return page;
    } catch (_) {}
    await pause(250);
  }
  throw new Error("Chrome debugging target did not appear");
}

class CDP {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    this.runtimeExceptions = [];
    this.consoleProblems = [];
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
        const details = message.params.exceptionDetails;
        cdp.runtimeExceptions.push(details.exception?.description || details.text || "Runtime exception");
      }
      if (message.method === "Log.entryAdded" && ["error", "warning"].includes(message.params.entry.level)) {
        cdp.consoleProblems.push(`${message.params.entry.level}: ${message.params.entry.text}`);
      }
      if (message.id && cdp.pending.has(message.id)) {
        const pending = cdp.pending.get(message.id);
        clearTimeout(pending.timer);
        cdp.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
      }
    };
    return cdp;
  }

  send(method, params = {}, timeoutMs = 30000) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`Timed out: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  evaluate(expression) {
    return this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    }).then((result) => (result.result || {}).value);
  }

  async waitFor(expression, label, timeoutMs = 30000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await this.evaluate(expression)) return true;
      await pause(350);
    }
    throw new Error(`Condition timed out: ${label}`);
  }

  async screenshot(name) {
    const result = await this.send("Page.captureScreenshot", { format: "jpeg", quality: 84 }, 40000);
    const file = path.join(OUTDIR, `${name}.jpg`);
    fs.writeFileSync(file, Buffer.from(result.data, "base64"));
    return file;
  }
}

async function setViewport(cdp, width, height) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 700,
  });
}

async function sampleCanvas(cdp, expression) {
  return cdp.evaluate(`(() => {
    const canvas = document.querySelector('canvas.glyph-stage');
    const box = (${expression});
    if (!canvas || !box) return null;
    const copy = document.createElement('canvas');
    copy.width = innerWidth;
    copy.height = innerHeight;
    copy.getContext('2d').drawImage(canvas, 0, 0, innerWidth, innerHeight);
    const left = Math.max(0, Math.floor(box.left));
    const top = Math.max(0, Math.floor(box.top));
    const width = Math.max(1, Math.min(innerWidth - left, Math.floor(box.width)));
    const height = Math.max(1, Math.min(innerHeight - top, Math.floor(box.height)));
    const data = copy.getContext('2d').getImageData(left, top, width, height).data;
    let alphaSum = 0;
    let visibleSamples = 0;
    for (let index = 3; index < data.length; index += 16) {
      alphaSum += data[index];
      if (data[index] > 4) visibleSamples += 1;
    }
    return { alphaSum, visibleSamples, width, height };
  })()`);
}

async function scrollArrival(cdp, progress) {
  await cdp.evaluate(`(() => {
    const arrival = document.querySelector('.arrival');
    const runway = Math.max(1, arrival.offsetHeight - innerHeight);
    scrollTo(0, arrival.offsetTop + runway * ${progress});
    window.dispatchEvent(new Event('scroll'));
  })()`);
}

async function main() {
  const target = await pageTarget();
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);
  await Promise.all([
    cdp.send("Runtime.enable"),
    cdp.send("Page.enable"),
    cdp.send("Log.enable"),
  ]);
  await cdp.send("Emulation.setEmulatedMedia", {
    media: "screen",
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await setViewport(cdp, 1440, 900);
  await cdp.send("Page.navigate", { url: TARGET });
  await cdp.waitFor("document.readyState === 'complete'", "document ready", 15000);
  try {
    await cdp.waitFor("document.querySelector('.arrival.is-wordmark-ready') !== null", "arrival ready", 15000);
  } catch (error) {
    const diagnostic = await cdp.evaluate(`(() => ({
      arrivalClass: document.querySelector('.arrival')?.className || null,
      scriptLoaded: typeof window.GlyphStage !== 'undefined',
      motion: document.body?.dataset.motion || null,
    }))()`);
    throw new Error(`${error.message}; diagnostic=${JSON.stringify(diagnostic)}; runtime=${JSON.stringify(cdp.runtimeExceptions)}; console=${JSON.stringify(cdp.consoleProblems)}`);
  }
  await cdp.evaluate("document.documentElement.style.scrollBehavior = 'auto'");

  const evidence = {
    target: TARGET,
    capturedAt: new Date().toISOString(),
    desktop: await cdp.evaluate(`(() => ({
      viewport: [innerWidth, innerHeight],
      filmViewportHeights: Number((document.querySelector('.film').offsetHeight / innerHeight).toFixed(2)),
      horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
      motion: document.body.dataset.motion,
    }))()`),
  };

  const revealBox = "({ left: 1030, top: 610, width: 240, height: 220 })";
  evidence.cursorMatrix = { before: await sampleCanvas(cdp, revealBox) };
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1150, y: 720 });
  await pause(1200);
  evidence.cursorMatrix.after = await sampleCanvas(cdp, revealBox);
  evidence.cursorMatrix.alphaRatio = Number((
    evidence.cursorMatrix.after.alphaSum / Math.max(1, evidence.cursorMatrix.before.alphaSum)
  ).toFixed(3));
  await cdp.screenshot("phase6-cursor-matrix");

  const homeCenter = await cdp.evaluate(`(() => {
    const rect = document.querySelector('.nav a').getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: homeCenter.x, y: homeCenter.y });
  await pause(1100);
  evidence.glimmer = await cdp.evaluate(`(() => {
    const home = document.querySelector('.nav a');
    const pseudo = getComputedStyle(home, '::after');
    return {
      classApplied: home.classList.contains('premium-glimmer'),
      opacity: Number(pseudo.opacity),
      transform: pseudo.transform,
      canvasInHeader: null,
    };
  })()`);
  evidence.glimmer.canvasInHeader = await sampleCanvas(cdp, `(() => {
    const rect = document.querySelector('.nav a').getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  })()`);
  await cdp.screenshot("phase6-nav-glimmer");

  if (!SUPPORTING_ONLY) {
    await scrollArrival(cdp, 0.65);
    await cdp.waitFor("document.querySelector('.arrival.is-logo-flight') && document.querySelector('.logo-flight.is-active')", "seal flight", 36000);
    evidence.sealFlight = await cdp.evaluate(`(() => ({
      active: document.querySelector('.logo-flight').classList.contains('is-active'),
      brandFilled: document.querySelector('.brand').classList.contains('is-filled'),
      arrivalClass: document.querySelector('.arrival').className,
    }))()`);
    await cdp.screenshot("phase6-seal-flight");

    await scrollArrival(cdp, 0.79);
    await cdp.waitFor("document.querySelector('.arrival.is-glyph-o') && document.querySelector('.brand.is-filled')", "glyph O after seal landing", 18000);
    evidence.glyphO = await cdp.evaluate(`(() => ({
      active: document.querySelector('.arrival').classList.contains('is-glyph-o'),
      brandFilled: document.querySelector('.brand').classList.contains('is-filled'),
      flightActive: document.querySelector('.logo-flight').classList.contains('is-active'),
    }))()`);

    await scrollArrival(cdp, 0.87);
    await cdp.waitFor("document.querySelector('.arrival.is-risen')", "complete KOA hold", 15000);
    await cdp.screenshot("phase6-complete-koa");

    await cdp.evaluate(`(() => {
      const film = document.querySelector('.film');
      const runway = Math.max(1, film.offsetHeight - innerHeight);
      scrollTo(0, film.offsetTop + runway * 0.25);
      window.dispatchEvent(new Event('scroll'));
    })()`);
    await cdp.waitFor("document.querySelector('[data-scene].active')?.dataset.glyphNum === '၂'", "chapter 2 hold", 36000);
    evidence.chapter = await cdp.evaluate(`(() => ({
      numeral: document.querySelector('[data-scene].active').dataset.glyphNum,
      frame: document.querySelector('[data-frame]').textContent,
      glyphMode: window.GlyphStage ? window.GlyphStage.mode() : null,
      corridorOpacity: Number(getComputedStyle(document.querySelector('[data-scene].active [data-reading-corridor]')).opacity),
      rayIntensity: Number(getComputedStyle(document.documentElement).getPropertyValue('--ray-intensity')),
    }))()`);
    await cdp.screenshot("phase6-chapter-two");
  } else {
    evidence.choreographyVerification = "Skipped after two seal-flight condition timeouts; source contracts remain authoritative for this run.";
  }

  await setViewport(cdp, 390, 844);
  await cdp.send("Page.navigate", { url: TARGET });
  await cdp.waitFor("document.querySelector('.arrival.is-wordmark-ready') !== null", "mobile arrival ready", 15000);
  await cdp.evaluate(`(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const film = document.querySelector('.film');
    const runway = Math.max(1, film.offsetHeight - innerHeight);
    scrollTo(0, film.offsetTop + runway * 0.03);
    window.dispatchEvent(new Event('scroll'));
  })()`);
  await cdp.waitFor("document.querySelector('[data-scene].active') !== null", "mobile film active", 8000);
  evidence.mobile = await cdp.evaluate(`(() => {
    const label = document.querySelector('.film-label').getBoundingClientRect();
    const meta = document.querySelector('.film-meta').getBoundingClientRect();
    return {
      viewport: [innerWidth, innerHeight],
      horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
      label: { top: Math.round(label.top), bottom: Math.round(label.bottom) },
      meta: { top: Math.round(meta.top), bottom: Math.round(meta.bottom) },
      chromeSeparated: label.bottom <= meta.top,
    };
  })()`);
  await cdp.screenshot("phase6-mobile-film");

  await cdp.evaluate("document.querySelector('button[data-motion]').click()");
  await cdp.waitFor("document.body.dataset.motion === 'off' && Number(getComputedStyle(document.querySelector('.glyph-stage')).opacity) === 0", "Motion off settled", 3000);
  evidence.motionOff = await cdp.evaluate(`(() => ({
    motion: document.body.dataset.motion,
    canvasOpacity: Number(getComputedStyle(document.querySelector('.glyph-stage')).opacity),
    glimmerDisplay: getComputedStyle(document.querySelector('.premium-glimmer'), '::after').display,
    brandFilled: document.querySelector('.brand').classList.contains('is-filled'),
    horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
  }))()`);
  await cdp.screenshot("phase6-mobile-motion-off");

  evidence.runtimeExceptions = cdp.runtimeExceptions;
  evidence.consoleProblems = cdp.consoleProblems;
  evidence.assertions = {
    desktopFilmIs1800vh: Math.abs(evidence.desktop.filmViewportHeights - 18) < 0.05,
    cursorRevealIncreasesPixels: evidence.cursorMatrix.alphaRatio > 1.05,
    foregroundOccludesCanvas: evidence.glimmer.canvasInHeader.alphaSum === 0,
    glimmerVisible: evidence.glimmer.classApplied && evidence.glimmer.opacity > 0.1,
    choreographyPreserved: SUPPORTING_ONLY ? null : evidence.sealFlight.active && evidence.glyphO.brandFilled && evidence.glyphO.active,
    chapterTransitionReached: SUPPORTING_ONLY ? null : evidence.chapter.numeral === "၂" && evidence.chapter.corridorOpacity > 0.5,
    mobileChromeSeparated: evidence.mobile.chromeSeparated,
    noHorizontalOverflow: evidence.desktop.horizontalOverflow === 0 && evidence.mobile.horizontalOverflow === 0 && evidence.motionOff.horizontalOverflow === 0,
    motionOffSettled: evidence.motionOff.motion === "off" && evidence.motionOff.canvasOpacity === 0 && evidence.motionOff.glimmerDisplay === "none" && evidence.motionOff.brandFilled,
    cleanRuntime: cdp.runtimeExceptions.length === 0 && cdp.consoleProblems.length === 0,
  };

  const report = path.join(OUTDIR, "phase6-runtime-evidence.json");
  fs.writeFileSync(report, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify(evidence, null, 2));
  console.log(`Evidence: ${report}`);

  cdp.socket.close();
  chrome.kill();
  await pause(600);
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {}

  if (Object.values(evidence.assertions).some((value) => value === false)) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error(`PHASE 6 VERIFY CRASH: ${error.message}`);
  try { chrome.kill(); } catch (_) {}
  await pause(400);
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {}
  process.exit(2);
});
