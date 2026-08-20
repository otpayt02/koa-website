// Mobile spot-check of the packed build: 390px viewport, no horizontal overflow.
const { spawn } = require("node:child_process");
const fs = require("node:fs");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PROFILE = "C:/Users/olive/AppData/Local/Temp/koa_mobile_check";
const PORT = 9349;
const file = process.argv[2];
const TARGET = "file:///" + file.replace(/\\/g, "/");
const ROUTES = ["/", "/about", "/programs", "/stories", "/music", "/coming-soon", "/contact"];

try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) {}
const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox",
  "--user-data-dir=" + PROFILE,
  "--remote-debugging-port=" + PORT, "--remote-debugging-address=127.0.0.1",
  "--window-size=390,844",
  "--force-device-scale-factor=1",
  "about:blank",
], { stdio: "ignore", windowsHide: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("ws fail")); });
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
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error("timeout " + method)); } }, 20000);
    });
  }
  eval(expr) {
    return this.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })
      .then((r) => (r.result || {}).value);
  }
  close() { try { this.ws.close(); } catch (e) {} }
}

let fails = 0;
(async () => {
  let target;
  for (let i = 0; i < 60; i++) {
    try {
      const d = await (await fetch("http://127.0.0.1:" + PORT + "/json/list")).json();
      target = d.find((x) => x.type === "page");
      if (target) break;
    } catch (e) {}
    await sleep(500);
  }
  if (!target) throw new Error("no target");
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);
  await cdp.send("Runtime.enable"); await cdp.send("Page.enable");
  cdp.send("Page.navigate", { url: TARGET }).catch(() => {});
  await sleep(4000);

  for (const route of ROUTES) {
    await cdp.eval("location.hash = " + JSON.stringify("#" + route));
    await sleep(900);
    const d = await cdp.eval(`(() => {
      var m = document.getElementById('main');
      var vw = document.documentElement.clientWidth;
      var overflow = document.documentElement.scrollWidth - vw;
      return JSON.stringify({
        route: location.hash,
        vw: vw,
        overflowPx: overflow,
        mainText: m ? m.textContent.trim().length : -1,
        header: !!document.querySelector('header'),
        navVisible: !!document.querySelector('[data-mobile-panel]')
      });
    })()`);
    let j; try { j = JSON.parse(d); } catch (e) { j = { raw: String(d) }; }
    const ok = j.overflowPx <= 2 && j.mainText > 300 && j.header;
    if (!ok) fails++;
    console.log((ok ? "PASS" : "FAIL"), JSON.stringify(j));
  }
  console.log("MOBILE RESULT:", fails === 0 ? "PASS" : "FAIL (" + fails + ")");
  cdp.close(); chrome.kill();
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) {}
  process.exit(fails ? 1 : 0);
})().catch((e) => {
  console.error("MOBILE CRASH:", e.message);
  try { chrome.kill(); } catch (x) {}
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (x) {}
  process.exit(2);
});
