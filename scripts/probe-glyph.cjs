// Pixel-probe the glyph canvas + wordmark in the packed KOA build.
// Usage: node probe-glyph.cjs <path-to-index.html>
const { spawn } = require("node:child_process");
const fs = require("node:fs");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PROFILE = "C:/Users/olive/AppData/Local/Temp/koa_probe_glyph";
const PORT = 9350;
const TARGET = "file:///" + process.argv[2].replace(/\\/g, "/");

const http = require("node:http");
function getJSON(path) {
  return new Promise((res, rej) => {
    http.get({ host: "127.0.0.1", port: PORT, path }, (r) => {
      let b = "";
      r.on("data", (c) => (b += c));
      r.on("end", () => res(JSON.parse(b)));
    }).on("error", rej);
  });
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = [];
    ws.addEventListener("message", (e) => {
      const m = JSON.parse(e.data.toString());
      if (m.id && this.pending.has(m.id)) { const { resolve, reject } = this.pending.get(m.id); this.pending.delete(m.id);
        if (m.error) reject(new Error(JSON.stringify(m.error))); else resolve(m.result); }
      else this.handlers.forEach((h) => h(m));
    });
  }
  on(fn) { this.handlers.push(fn); }
  send(method, params = {}) { return new Promise((resolve, reject) => { const id = ++this.id; this.pending.set(id, { resolve, reject }); this.ws.send(JSON.stringify({ id, method, params })); }); }
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  fs.rmSync(PROFILE, { recursive: true, force: true });
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-sandbox",
    "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=1440,900", "--user-data-dir=" + PROFILE,
    "--remote-debugging-port=" + PORT, TARGET], { stdio: "ignore" });

  let targets = null;
  for (let i = 0; i < 40; i++) {
    await sleep(300);
    try { targets = await getJSON("/json/list"); if (targets.length) break; } catch {}
  }
  if (!targets || !targets.length) { console.log("FAIL: chrome not up"); chrome.kill(); process.exit(1); }
  const page = targets.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  const cdp = new CDP(ws);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  await new Promise((res) => {
    let done = false;
    cdp.on((m) => { if (m.method === "Page.loadEventFired" && !done) { done = true; res(); } });
    setTimeout(() => { if (!done) { done = true; res(); } }, 8000);
  });
  await sleep(2500); // let the glyph canvas drift + wordmark animation settle

  const ev = async (expr) => (await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true })).result.value;

  // 1. glyph canvas exists with drawn pixels
  const probe = await ev(`(() => {
    const cv = document.querySelector("canvas.glyph-stage");
    if (!cv) return { canvas: false };
    const s = document.createElement("canvas"); s.width = cv.width; s.height = cv.height;
    const sx = s.getContext("2d"); sx.drawImage(cv, 0, 0);
    const d = sx.getImageData(0, 0, cv.width, cv.height).data;
    let nonzero = 0;
    for (let i = 3; i < d.length; i += 16) if (d[i] > 4) nonzero++;
    return { canvas: true, w: cv.width, h: cv.height, nonzeroSamples: nonzero, total: Math.floor(d.length / 16) };
  })()`);
  console.log("glyph canvas:", JSON.stringify(probe));

  // 2. wordmark present + white
  const wm = await ev(`(() => {
    const w = document.querySelector(".wordmark");
    if (!w) return { present: false };
    const cs = getComputedStyle(w.querySelector("span") || w);
    return { present: true, color: cs.color, fontSize: cs.fontSize, opacity: cs.opacity };
  })()`);
  console.log("wordmark:", JSON.stringify(wm));

  // 3. letterbox bars
  const lb = await ev(`(() => {
    const t = document.querySelector(".lb--top"), b = document.querySelector(".lb--bottom");
    if (!t || !b) return { present: false };
    const ct = getComputedStyle(t), cb = getComputedStyle(b);
    return { present: true, topH: ct.height, botH: cb.height, topBg: ct.backgroundColor };
  })()`);
  console.log("letterbox:", JSON.stringify(lb));

  // 4. veil cleared
  const veil = await ev(`(() => {
    const v = document.querySelector(".veil");
    if (!v) return { present: false };
    return { present: true, clear: v.classList.contains("is-clear"), opacity: getComputedStyle(v).opacity };
  })()`);
  console.log("veil:", JSON.stringify(veil));

  // 5. scroll mid-film, re-probe canvas (formation should have changed pixel count)
  await ev("window.scrollTo(0, document.querySelector('.film').offsetHeight * 0.35);");
  await sleep(1800);
  const probe2 = await ev(`(() => {
    const cv = document.querySelector("canvas.glyph-stage");
    const s = document.createElement("canvas"); s.width = cv.width; s.height = cv.height;
    const sx = s.getContext("2d"); sx.drawImage(cv, 0, 0);
    const d = sx.getImageData(0, 0, cv.width, cv.height).data;
    let nonzero = 0;
    for (let i = 3; i < d.length; i += 16) if (d[i] > 4) nonzero++;
    return { nonzeroSamples: nonzero, frame: (document.querySelector("[data-frame]") || {}).textContent };
  })()`);
  console.log("mid-film canvas:", JSON.stringify(probe2));

  // 6. navigate to about — interior glyph formation
  await ev("window.scrollTo(0,0);");
  await sleep(400);
  await ev("location.hash = '#/about';");
  await sleep(2200);
  const probe3 = await ev(`(() => {
    const cv = document.querySelector("canvas.glyph-stage");
    if (!cv) return { canvas: false };
    const s = document.createElement("canvas"); s.width = cv.width; s.height = cv.height;
    const sx = s.getContext("2d"); sx.drawImage(cv, 0, 0);
    const d = sx.getImageData(0, 0, cv.width, cv.height).data;
    let nonzero = 0;
    for (let i = 3; i < d.length; i += 16) if (d[i] > 4) nonzero++;
    const title = document.querySelector(".page-hero h1");
    return { canvas: true, nonzeroSamples: nonzero, h1: title ? title.textContent.trim().slice(0, 60) : null };
  })()`);
  console.log("about-page canvas:", JSON.stringify(probe3));

  ws.close();
  chrome.kill();
  await sleep(800); // let chrome release file locks before profile cleanup
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { console.log("note: profile cleanup deferred:", e.code); }

  const ok = probe.canvas && probe.nonzeroSamples > 20
    && wm.present && wm.color && /255\s*,\s*255\s*,\s*255/.test(wm.color)
    && lb.present && veil.present && veil.clear
    && probe2.nonzeroSamples > 20
    && probe3.canvas && probe3.nonzeroSamples > 20 && probe3.h1;
  console.log(ok ? "GLYPH PROBE: PASS" : "GLYPH PROBE: FAIL");
  process.exit(ok ? 0 : 1);
}

main().catch((e) => { console.error("ERR", e.message); process.exit(1); });
