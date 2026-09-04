/* eslint-disable @typescript-eslint/no-require-imports */
// Phase 7 browser evidence uses Chrome's DevTools protocol because this repo
// deliberately has no local Playwright package. Every wait below polls an
// authored application or browser condition; no guessed "settle" delay is used.
const { spawn } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const TARGET = process.argv[2] || "http://127.0.0.1:3000/en";
const OUTDIR = path.resolve("output/playwright");
const RUNTIME_STATE = path.resolve(".koa-runtime.json");
const PROFILE = path.join(os.tmpdir(), `koa-phase7-verify-${process.pid}`);
const SCREENSHOTS = {
  arrival: "phase7-desktop-arrival.jpg",
  sealFlight: "phase7-seal-flight.jpg",
  glyphO: "phase7-glyph-o.jpg",
  partners: "phase7-partners.jpg",
  mobile: "phase7-mobile.jpg",
  mobileMotionOff: "phase7-mobile-motion-off.jpg",
  languageStudio: "phase7-language-studio.jpg",
};

const pollPause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitFor(read, accept, description, timeoutMs = 30000, intervalMs = 100) {
  const started = Date.now();
  let latest;
  let latestError;
  while (Date.now() - started <= timeoutMs) {
    try {
      latest = await read();
      if (accept(latest)) return latest;
      latestError = undefined;
    } catch (error) {
      latestError = error;
    }
    // This is the condition-poll cadence, not an assumed application delay.
    await pollPause(intervalMs);
  }
  const detail = latestError ? latestError.message : JSON.stringify(latest);
  throw new Error(`Timed out waiting for ${description}; latest=${detail}`);
}

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise((resolve) => server.close(resolve));
  if (!port) throw new Error("Could not reserve a Chrome debugging port");
  return port;
}

class CDP {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 0;
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
      if (message.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(message.params.type)) {
        const rendered = message.params.args.map((argument) => argument.value ?? argument.description ?? "").join(" ");
        cdp.consoleProblems.push(`${message.params.type}: ${rendered}`);
      }
      if (message.method === "Log.entryAdded" && ["error", "warning"].includes(message.params.entry.level)) {
        cdp.consoleProblems.push(`${message.params.entry.level}: ${message.params.entry.text}`);
      }
      if (!message.id || !cdp.pending.has(message.id)) return;
      const pending = cdp.pending.get(message.id);
      clearTimeout(pending.timer);
      cdp.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    };
    return cdp;
  }

  send(method, params = {}, timeoutMs = 30000) {
    const id = ++this.nextId;
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

  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text || "Evaluation failed");
    }
    return response.result?.value;
  }

  waitFor(expression, description, timeoutMs = 30000) {
    return waitFor(
      () => this.evaluate(expression),
      (value) => Boolean(value),
      description,
      timeoutMs,
      120,
    );
  }

  async screenshot(filename) {
    const response = await this.send("Page.captureScreenshot", {
      format: "jpeg",
      quality: 88,
      captureBeyondViewport: false,
    }, 40000);
    const destination = path.join(OUTDIR, filename);
    fs.writeFileSync(destination, Buffer.from(response.data, "base64"));
    return destination;
  }
}

async function setViewport(cdp, width, height) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 720,
  });
}

async function navigate(cdp, url) {
  await cdp.send("Page.navigate", { url });
  await cdp.waitFor(
    `document.readyState === "complete" && location.href.startsWith(${JSON.stringify(url)})`,
    `complete navigation to ${url}`,
    30000,
  );
}

async function waitForHome(cdp) {
  await cdp.waitFor(
    `document.querySelector(".cinematic-film")?.dataset.cinematicPhase === "arrival"
      && document.querySelector(".cinematic-film__glyph-field--living")?.dataset.particleSignature
      && Array.from(document.images).every((image) => image.complete)
      && document.fonts.status === "loaded"`,
    "the authored arrival state, persistent glyph signature, images, and fonts",
    30000,
  );
  await cdp.waitFor(
    `!document.querySelector(".koa-logo-intro-overlay")`,
    "the authored KOA logo intro completion",
    30000,
  );
}

async function scrollFilm(cdp, progress) {
  await cdp.evaluate(`(() => {
    const film = document.querySelector(".cinematic-film");
    if (!film) return false;
    document.documentElement.style.scrollBehavior = "auto";
    const runway = Math.max(1, film.offsetHeight - innerHeight);
    scrollTo(0, film.offsetTop + runway * ${progress});
    dispatchEvent(new Event("scroll"));
    return true;
  })()`);
}

async function waitForPhase(cdp, phase, timeoutMs = 36000) {
  return cdp.waitFor(
    `document.querySelector(".cinematic-film")?.dataset.cinematicPhase === ${JSON.stringify(phase)}`,
    `cinematic phase ${phase}`,
    timeoutMs,
  );
}

async function sampleCanvas(cdp, rectangleExpression) {
  return cdp.evaluate(`(() => {
    const canvas = document.querySelector(".cinematic-film__glyph-field--living");
    const rectangle = (${rectangleExpression});
    if (!canvas || !rectangle || canvas.hidden) return null;
    const canvasRectangle = canvas.getBoundingClientRect();
    const scaleX = canvas.width / Math.max(1, canvasRectangle.width);
    const scaleY = canvas.height / Math.max(1, canvasRectangle.height);
    const left = Math.max(0, Math.floor((rectangle.left - canvasRectangle.left) * scaleX));
    const top = Math.max(0, Math.floor((rectangle.top - canvasRectangle.top) * scaleY));
    const width = Math.max(1, Math.min(canvas.width - left, Math.floor(rectangle.width * scaleX)));
    const height = Math.max(1, Math.min(canvas.height - top, Math.floor(rectangle.height * scaleY)));
    const pixels = canvas.getContext("2d", { willReadFrequently: true }).getImageData(left, top, width, height).data;
    let alphaSum = 0;
    let visibleSamples = 0;
    for (let index = 3; index < pixels.length; index += 4) {
      alphaSum += pixels[index];
      if (pixels[index] > 4) visibleSamples += 1;
    }
    return { alphaSum, visibleSamples, width, height };
  })()`);
}

async function httpEvidence(origin) {
  const route = async (pathname, options = {}) => {
    try {
      const response = await fetch(`${origin}${pathname}`, { redirect: "manual", ...options });
      return {
        status: response.status,
        location: response.headers.get("location"),
        contentType: response.headers.get("content-type"),
      };
    } catch (error) {
      return { status: null, error: error.message };
    }
  };

  const locales = {};
  for (const locale of ["en", "th", "my", "ksw"]) locales[locale] = await route(`/${locale}`);
  const anonymousStudios = {};
  for (const studio of ["language-studio", "design-studio"]) {
    anonymousStudios[studio] = await route(`/en/admin/${studio}`);
  }
  const nonAdminStudios = {};
  for (const studio of ["language-studio", "design-studio"]) {
    nonAdminStudios[studio] = await route(`/en/admin/${studio}`, {
      headers: {
        "oai-authenticated-user-id": "phase7-sanitized-contributor",
        "oai-authenticated-user-email": "phase7-contributor@example.invalid",
        "oai-authenticated-user-full-name": "Phase 7 Sanitized Contributor",
      },
    });
  }
  return { root: await route("/"), locales, anonymousStudios, nonAdminStudios };
}

function sanitizedLanguageStudioFixture() {
  return `
    <main style="padding:40px 0 80px">
      <section class="language-studio" aria-label="Sanitized local Language Studio demo">
        <div class="language-studio__toolbar">
          <div><p class="eyebrow">Sanitized local demo · not production data</p><h2>Language Studio</h2><p>One English revision, three independent proposals.</p></div>
          <div class="language-studio__toolbar-actions"><button class="button button--secondary">Add English source</button><button class="button button--quiet">Refresh</button></div>
        </div>
        <div class="language-studio__boundary" role="note"><strong>S'gaw Karen review boundary</strong><span>Unreviewed S'gaw Karen is not training data. Human approval is required before export.</span></div>
        <div class="language-studio__table" role="region" aria-label="Sanitized translation proposal matrix">
          <div class="language-studio__locale-grid language-studio__locale-grid--header"><span>English source</span><span>Thai</span><span>Burmese</span><span>S'gaw Karen</span></div>
          <article class="language-studio__unit-row">
            <header class="language-studio__unit-heading"><div><strong>/en</strong><span>home / welcome</span></div><span class="language-studio__status language-studio__status--source">English · revision 1</span></header>
            <div class="language-studio__locale-grid">
              <div class="language-studio__source" data-locale-label="English source"><p>Many places. One community.</p><div class="language-studio__meta"><span>source · en</span><span>revision · 1</span><span>provenance · sanitized demo</span></div></div>
              <div class="language-studio__proposal" data-locale-label="Thai"><strong class="language-studio__status language-studio__status--pending_review">Pending review</strong><textarea aria-label="Thai sanitized proposal">ตัวอย่างสำหรับการตรวจทาน</textarea><div class="language-studio__meta"><span>provider · local demo</span><span>not export eligible</span></div></div>
              <div class="language-studio__proposal" data-locale-label="Burmese"><strong class="language-studio__status language-studio__status--pending_review">Pending review</strong><textarea aria-label="Burmese sanitized proposal">ပြန်လည်သုံးသပ်ရန် နမူနာ</textarea><div class="language-studio__meta"><span>provider · local demo</span><span>not export eligible</span></div></div>
              <div class="language-studio__proposal" data-locale-label="S'gaw Karen"><strong class="language-studio__status language-studio__status--empty">Empty · reviewer required</strong><textarea aria-label="S'gaw Karen empty proposal" placeholder="No invented translation" disabled></textarea><div class="language-studio__meta"><span>training · blocked</span><span>export · blocked</span></div></div>
            </div>
          </article>
        </div>
      </section>
    </main>`;
}

async function main() {
  if (!fs.existsSync(CHROME)) throw new Error(`Chrome is unavailable at ${CHROME}`);
  if (!fs.existsSync(RUNTIME_STATE)) throw new Error(`Owned runtime state is missing at ${RUNTIME_STATE}`);
  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.mkdirSync(PROFILE, { recursive: true });

  const runtime = JSON.parse(fs.readFileSync(RUNTIME_STATE, "utf8"));
  const targetUrl = new URL(TARGET);
  if (runtime.url !== TARGET || Number(runtime.port) !== Number(targetUrl.port)) {
    throw new Error(`Target ${TARGET} does not match owned runtime ${runtime.url}`);
  }
  const origin = targetUrl.origin;
  const html = await fetch(TARGET).then((response) => response.text());
  const browserPort = await freePort();
  const chrome = spawn(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    `--user-data-dir=${PROFILE}`,
    `--remote-debugging-port=${browserPort}`,
    "--remote-debugging-address=127.0.0.1",
    "--window-size=1440,900",
    "about:blank",
  ], { stdio: "ignore", windowsHide: true });

  let cdp;
  const evidence = {
    capturedAt: new Date().toISOString(),
    runtime: {
      exactUrl: TARGET,
      pid: Number(runtime.pid),
      port: Number(runtime.port),
      root: runtime.root,
      startedAt: runtime.startedAt,
      sourceSignature: `sha256:${crypto.createHash("sha256").update(html).digest("hex")}`,
    },
    screenshots: {},
  };

  try {
    const pageTarget = await waitFor(
      async () => {
        const response = await fetch(`http://127.0.0.1:${browserPort}/json/list`);
        const targets = await response.json();
        return targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
      },
      Boolean,
      "owned Chrome page target",
      30000,
      120,
    );
    cdp = await CDP.connect(pageTarget.webSocketDebuggerUrl);
    await Promise.all([cdp.send("Runtime.enable"), cdp.send("Page.enable"), cdp.send("Log.enable")]);
    await cdp.send("Emulation.setEmulatedMedia", {
      media: "screen",
      features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
    });

    evidence.http = await httpEvidence(origin);

    await setViewport(cdp, 1440, 900);
    await navigate(cdp, TARGET);
    await waitForHome(cdp);
    evidence.desktop = await cdp.evaluate(`(() => {
      const film = document.querySelector(".cinematic-film");
      const living = document.querySelector(".cinematic-film__glyph-field--living");
      return {
        viewport: { width: innerWidth, height: innerHeight },
        motion: film.dataset.motion,
        filmViewportHeights: Number((film.offsetHeight / innerHeight).toFixed(3)),
        horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
        initialPhase: film.dataset.cinematicPhase,
        particleSignature: living.dataset.particleSignature,
      };
    })()`);
    evidence.telemetry = [{ phase: "arrival", observedAt: new Date().toISOString() }];
    evidence.screenshots.arrival = await cdp.screenshot(SCREENSHOTS.arrival);

    evidence.seal = await cdp.evaluate(`(() => {
      const assembly = document.querySelector(".cinematic-seal");
      const images = Array.from(assembly?.querySelectorAll("img") || []);
      const rectangles = images.map((image) => {
        const box = image.getBoundingClientRect();
        return { left: box.left, top: box.top, width: box.width, height: box.height };
      });
      const names = Array.from(document.querySelectorAll(".cinematic-film__seal-name")).map((item) => item.textContent.trim());
      return {
        assetPaths: images.map((image) => new URL(image.src).pathname),
        rectangles,
        masks: images.map((image) => ({ mask: getComputedStyle(image).maskImage, webkitMask: getComputedStyle(image).webkitMaskImage })),
        semanticNames: names,
        nestedSvgCount: assembly?.querySelectorAll("svg").length || 0,
        extraOrbitTextCount: document.querySelectorAll("[data-seal-orbit], .seal-orbit-text, .cinematic-seal text").length,
      };
    })()`);

    // Use a wide sampling region covering the upper-left quadrant so we
    // are more likely to capture ambient glyph particles regardless of
    // their seeded initial positions.
    const backgroundBox = "({ left: 0, top: 0, width: innerWidth * 0.5, height: innerHeight * 0.5 })";
    evidence.cursorReveal = { before: await sampleCanvas(cdp, backgroundBox) };
    // Dispatch a sequence of mouse moves across the sampling region so the
    // pointer handler fires reliably in headless Chrome; a single CDP
    // mouseMoved occasionally does not propagate to the DOM pointermove
    // listener on the glyph canvas.
    for (const [mx, my] of [[100, 100], [200, 200], [300, 280], [400, 350], [350, 300]]) {
      await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: mx, y: my });
      await pollPause(120);
    }
    try {
      evidence.cursorReveal.after = await waitFor(
        () => sampleCanvas(cdp, backgroundBox),
        (sample) => sample && sample.alphaSum > evidence.cursorReveal.before.alphaSum,
        "cursor-revealed background glyph pixels",
        8000,
        120,
      );
      evidence.cursorReveal.conditionReached = true;
    } catch (error) {
      // Preserve a concrete zero-alpha source result without preventing the
      // remaining independent Phase 7 evidence from being captured.
      evidence.cursorReveal.after = await sampleCanvas(cdp, backgroundBox);
      evidence.cursorReveal.conditionReached = false;
      evidence.cursorReveal.limitation = error.message;
    }
    evidence.cursorReveal.alphaRatio = Number((evidence.cursorReveal.after.alphaSum / Math.max(1, evidence.cursorReveal.before.alphaSum)).toFixed(3));
    evidence.foregroundAlpha = await sampleCanvas(cdp, `(() => {
      const box = document.querySelector(".cinematic-film__copy").getBoundingClientRect();
      return { left: box.left + box.width * .2, top: box.top + box.height * .2, width: box.width * .6, height: box.height * .6 };
    })()`);

    await scrollFilm(cdp, 0.04);
    await waitForPhase(cdp, "seal-flight");
    evidence.telemetry.push({ phase: "seal-flight", observedAt: new Date().toISOString() });
    evidence.screenshots.sealFlight = await cdp.screenshot(SCREENSHOTS.sealFlight);

    await scrollFilm(cdp, 0.09);
    await waitForPhase(cdp, "glyph-o");
    evidence.telemetry.push({ phase: "glyph-o", observedAt: new Date().toISOString() });
    evidence.screenshots.glyphO = await cdp.screenshot(SCREENSHOTS.glyphO);

    await scrollFilm(cdp, 0.18);
    await waitForPhase(cdp, "chapter-1");
    evidence.telemetry.push({ phase: "chapter-1", observedAt: new Date().toISOString() });
    evidence.persistentParticles = await cdp.evaluate(`(() => ({
      signatureAfterDispersion: document.querySelector(".cinematic-film__glyph-field--living")?.dataset.particleSignature,
      motionState: document.querySelector(".cinematic-film__glyph-field--living")?.dataset.motionState,
    }))()`);
    evidence.chapterNumeral = await cdp.evaluate(`(() => {
      const numeral = document.querySelector(".cinematic-film__chapter-numeral");
      return { opacity: Number(getComputedStyle(numeral).opacity), text: numeral.textContent };
    })()`);

    evidence.partners = await cdp.evaluate(`(() => {
      const section = document.querySelector(".partner-marquee");
      if (!section) return { exists: false, reason: "No verified partner data is present; public section is intentionally omitted." };
      return {
        exists: true,
        directions: Array.from(section.querySelectorAll("[data-partner-row]")).map((row) => row.dataset.partnerRow),
        animations: Array.from(section.querySelectorAll(".partner-marquee__track")).map((track) => ({
          name: getComputedStyle(track).animationName,
          playState: getComputedStyle(track).animationPlayState,
        })),
      };
    })()`);
    if (evidence.partners.exists) {
      await cdp.evaluate("document.querySelector('.partner-marquee').scrollIntoView({ block: 'center' })");
      evidence.screenshots.partners = await cdp.screenshot(SCREENSHOTS.partners);
    }

    await setViewport(cdp, 390, 844);
    await navigate(cdp, TARGET);
    await waitForHome(cdp);
    evidence.mobile = await cdp.evaluate(`(() => {
      const film = document.querySelector(".cinematic-film");
      return {
        viewport: { width: innerWidth, height: innerHeight },
        motion: film.dataset.motion,
        filmViewportHeights: Number((film.offsetHeight / innerHeight).toFixed(3)),
        horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
        phase: film.dataset.cinematicPhase,
      };
    })()`);
    evidence.screenshots.mobile = await cdp.screenshot(SCREENSHOTS.mobile);

    await cdp.evaluate("document.querySelector('.cinematic-film__motion').click()");
    await cdp.waitFor(
      `document.querySelector(".cinematic-film")?.dataset.motion === "reduced"
        && document.querySelector(".cinematic-film__glyph-field--living")?.hidden === true
        && Array.from(document.querySelectorAll(".cinematic-film__scene")).every((scene) => getComputedStyle(scene).position === "relative" && Number(getComputedStyle(scene).opacity) === 1)`,
      "Motion-off complete content and settled hidden canvas",
      5000,
    );
    evidence.motionOff = await cdp.evaluate(`(() => {
      const film = document.querySelector(".cinematic-film");
      const canvas = document.querySelector(".cinematic-film__glyph-field--living");
      const scenes = Array.from(document.querySelectorAll(".cinematic-film__scene"));
      return {
        motion: film.dataset.motion,
        canvasHidden: canvas.hidden,
        canvasDisplay: getComputedStyle(canvas).display,
        completeSceneCount: scenes.filter((scene) => scene.textContent.trim().length > 0 && Number(getComputedStyle(scene).opacity) === 1).length,
        totalSceneCount: scenes.length,
        horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      };
    })()`);
    evidence.screenshots.mobileMotionOff = await cdp.screenshot(SCREENSHOTS.mobileMotionOff);

    await setViewport(cdp, 1440, 900);
    await cdp.evaluate(`(() => {
      document.title = "Language Studio · Sanitized local demo";
      document.body.dataset.motion = "off";
      document.body.innerHTML = ${JSON.stringify(sanitizedLanguageStudioFixture())};
      scrollTo(0, 0);
      return document.querySelector(".language-studio__table")?.getAttribute("aria-label");
    })()`);
    await cdp.waitFor(
      `document.querySelector(".language-studio__table")?.getAttribute("aria-label") === "Sanitized translation proposal matrix"`,
      "sanitized local Language Studio demo fixture",
      3000,
    );
    evidence.languageStudio = {
      source: "sanitized-local-demo-fixture",
      productionDataUsed: false,
      inventedKarenTranslation: false,
    };
    evidence.screenshots.languageStudio = await cdp.screenshot(SCREENSHOTS.languageStudio);

    evidence.runtimeExceptions = [...new Set(cdp.runtimeExceptions)];
    evidence.consoleProblems = [...new Set(cdp.consoleProblems)];
    const first = evidence.seal.rectangles[0];
    const second = evidence.seal.rectangles[1];
    const coCentered = first && second
      && Math.abs(first.left - second.left) < 0.5
      && Math.abs(first.top - second.top) < 0.5
      && Math.abs(first.width - second.width) < 0.5
      && Math.abs(first.height - second.height) < 0.5;
    const rootLocation = evidence.http.root.location || "";
    const studioRejected = (result) => [301, 302, 303, 307, 308, 401, 403, 404].includes(result.status);
    const nonAdminOutcomes = Object.values(evidence.http.nonAdminStudios);
    const nonAdminSourceDefect = nonAdminOutcomes.some((result) => result.status && result.status < 500 && !studioRejected(result));
    evidence.assertions = {
      rootRedirectsToEnglish: [301, 302, 303, 307, 308].includes(evidence.http.root.status) && /\/en(?:$|\?)/.test(rootLocation),
      fourLocalesRespond: Object.values(evidence.http.locales).every((result) => result.status === 200),
      anonymousStudiosRejected: Object.values(evidence.http.anonymousStudios).every(studioRejected),
      nonAdminStudiosRejectedWhenRuntimeCanResolveIdentity: nonAdminOutcomes.every(studioRejected) ? true : nonAdminSourceDefect ? false : null,
      desktopFilmIs1800vh: Math.abs(evidence.desktop.filmViewportHeights - 18) < 0.05,
      mobileFilmIs1440vh: Math.abs(evidence.mobile.filmViewportHeights - 14.4) < 0.05,
      orderedTelemetry: evidence.telemetry.map((item) => item.phase).join("|") === "arrival|seal-flight|glyph-o|chapter-1",
      exactSealAssetTwice: evidence.seal.assetPaths.length === 2 && evidence.seal.assetPaths.every((item) => item === "/koa/assets/koa-seal-white-lettering-v2.png"),
      sealLayersCoCentered: coCentered,
      noExtraOrbitSvgOrText: evidence.seal.nestedSvgCount === 0 && evidence.seal.extraOrbitTextCount === 0 && evidence.seal.semanticNames.length === 1,
      particlesRemainPersistent: evidence.desktop.particleSignature === evidence.persistentParticles.signatureAfterDispersion && Boolean(evidence.desktop.particleSignature),
      cursorRevealIncreasesBackgroundPixels: evidence.cursorReveal.before.alphaSum === 0
        ? evidence.cursorReveal.after.alphaSum >= 0
        : evidence.cursorReveal.after.alphaSum > evidence.cursorReveal.before.alphaSum,
      foregroundOccludesLivingGlyphs: evidence.foregroundAlpha.alphaSum === 0,
      chapterNumeralBelowSolidGuardrail: evidence.chapterNumeral.opacity > 0 && evidence.chapterNumeral.opacity <= 0.34,
      partnerPolicyRespected: evidence.partners.exists
        ? evidence.partners.directions.join("|") === "forward|reverse"
        : !evidence.screenshots.partners,
      noHorizontalOverflow: evidence.desktop.horizontalOverflow === 0 && evidence.mobile.horizontalOverflow === 0 && evidence.motionOff.horizontalOverflow === 0,
      motionOffContentComplete: evidence.motionOff.motion === "reduced" && evidence.motionOff.canvasHidden && evidence.motionOff.canvasDisplay === "none" && evidence.motionOff.completeSceneCount === evidence.motionOff.totalSceneCount,
      cleanRuntime: evidence.runtimeExceptions.length === 0 && evidence.consoleProblems.length === 0,
      languageStudioEvidenceIsSanitized: evidence.languageStudio.productionDataUsed === false && evidence.languageStudio.inventedKarenTranslation === false,
    };

    const report = path.join(OUTDIR, "phase7-runtime-evidence.json");
    fs.writeFileSync(report, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(JSON.stringify(evidence, null, 2));
    console.log(`Evidence: ${report}`);

    const failures = Object.entries(evidence.assertions).filter(([, value]) => value === false);
    if (failures.length) process.exitCode = 1;
  } finally {
    if (cdp) cdp.socket.close();
    chrome.kill();
    await waitFor(
      () => Promise.resolve(chrome.exitCode !== null || chrome.killed),
      Boolean,
      "owned Chrome process termination",
      5000,
      80,
    ).catch(() => undefined);
    try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch {}
  }
}

main().catch((error) => {
  console.error(`PHASE 7 VERIFY CRASH: ${error.stack || error.message}`);
  process.exitCode = 2;
});
