// Screenshot the packed KOA build: wordmark opener, release, mid-film, interior.
// Usage: node shot-cinema.cjs <path-to-index.html>
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PROFILE = "C:/Users/olive/AppData/Local/Temp/koa_cinema_shot_node";
const PORT = 9378;
const file = path.resolve(process.argv[2] || "C:/Users/olive/index.html");
const TARGET = "file:///" + file.replace(/\\/g, "/").replace(/^\/\//, "/");
const OUTDIR = "C:/Users/olive/AppData/Local/Temp/koa_shots";

try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) {}
fs.mkdirSync(OUTDIR, { recursive: true });

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox",
  "--user-data-dir=" + PROFILE,
  "--remote-debugging-port=" + PORT, "--remote-debugging-address=127.0.0.1",
  "--window-size=1440,900", "--hide-scrollbars", "about:blank",
], { stdio: "ignore", windowsHide: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getPageTarget(timeoutMs = 30000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      const res = await fetch("http://127.0.0.1:" + PORT + "/json/list");
      const data = await res.json();
      const page = data.find((d) => d.type === "page" && d.webSocketDebuggerUrl);
      if (page) return page;
    } catch (e) {}
    await sleep(500);
  }
  throw new Error("no chrome page target");
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("ws connect failed")); });
    const c = new CDP(ws);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && c.pending.has(msg.id)) {
        const { resolve, reject } = c.pending.get(msg.id);
        c.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
      }
    };
    return c;
  }
  send(method, params = {}, timeoutMs = 25000) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) { this.pending.delete(id); reject(new Error("timeout: " + method)); }
      }, timeoutMs);
    });
  }
  eval(expr) {
    return this.send("Runtime.evaluate", { expression: expr, returnByValue: true }).then((r) => (r.result || {}).value);
  }
  async shot(name) {
    const r = await this.send("Page.captureScreenshot", { format: "jpeg", quality: 80 }, 40000);
    const p = path.join(OUTDIR, name + ".jpg");
    fs.writeFileSync(p, Buffer.from(r.data, "base64"));
    console.log("saved", p);
  }
}

async function main() {
  const target = await getPageTarget();
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);
  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  await cdp.send("Page.navigate", { url: TARGET });
  await sleep(5000); // fonts + glyph stage settle

  // 1. wordmark opener — white KOA letters, glyph field behind
  await cdp.eval("window.scrollTo(0,0)");
  await sleep(1200);
  await cdp.shot("cine_01_wordmark");

  // 2. release — letters dissolving as scene 1→2 crossfades (~14% of film)
  await cdp.eval("window.scrollTo(0, document.querySelector('[data-film]').offsetHeight * 0.13)");
  await sleep(2200);
  await cdp.shot("cine_02_release");

  // 3. mid-film scene 4 (sepak takraw) with numeral formation
  await cdp.eval("window.scrollTo(0, document.querySelector('[data-film]').offsetHeight * 0.62)");
  await sleep(2200);
  await cdp.shot("cine_03_scene4");

  // 4. interior page — coming-soon, glyph numeral forming in the hero
  await cdp.eval("location.hash = '#/coming-soon'");
  await sleep(2800);
  await cdp.shot("cine_04_comingsoon");

  // 5. letterbox + grain on the home opener again (after route return)
  await cdp.eval("location.hash = '#/'");
  await sleep(2200);
  await cdp.eval("window.scrollTo(0,0)");
  await sleep(800);
  await cdp.shot("cine_05_return");

  console.log("DONE");
  cdp.ws.close();
  chrome.kill();
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) {}
}

main().catch((e) => {
  console.error("SHOT CRASH:", e.message);
  try { chrome.kill(); } catch (x) {}
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (x) {}
  process.exit(2);
});
