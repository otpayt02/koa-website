// Live-verify the packed single-file KOA build in headless Chrome via CDP.
// Usage: node verify-pack.cjs <path-to-index.html>
const { execFileSync, spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const net = require("node:net");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PROFILE = "C:/Users/olive/AppData/Local/Temp/koa_pack_verify_node";
const PORT = 9347;
const file = path.resolve(process.argv[2]);
const TARGET = "file:///" + file.replace(/\\/g, "/").replace(/^\/\//, "/").replace(/\\/g, "/");
const ROUTES = ["/", "/about", "/programs", "/stories", "/music", "/coming-soon", "/contact"];

// clean profile
try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) {}

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox",
  "--user-data-dir=" + PROFILE,
  "--remote-debugging-port=" + PORT, "--remote-debugging-address=127.0.0.1",
  "--window-size=1440,900", "about:blank",
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
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = []; }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = (e) => rej(new Error("ws connect failed"));
    });
    const c = new CDP(ws);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && c.pending.has(msg.id)) {
        const { resolve, reject } = c.pending.get(msg.id);
        c.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
      } else if (msg.method) {
        c.handlers.forEach((h) => h(msg));
      }
    };
    return c;
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) { this.pending.delete(id); reject(new Error("timeout: " + method)); }
      }, 20000);
    });
  }
  onEvent(fn) { this.handlers.push(fn); }
  eval(expr) {
    return this.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })
      .then((r) => (r.result || {}).value);
  }
  close() { try { this.ws.close(); } catch (e) {} }
}

let failures = 0;
const errors = [];

async function main() {
  const target = await getPageTarget();
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);
  cdp.onEvent((ev) => {
    if (ev.method === "Runtime.exceptionThrown") {
      const det = ev.params.exceptionDetails || {};
      errors.push("EXCEPTION: " + String(((det.exception || {}).description) || JSON.stringify(det)).slice(0, 300));
    } else if (ev.method === "Runtime.consoleAPICalled" && ev.params.type === "error") {
      errors.push("CONSOLE: " + ev.params.args.map((a) => String(a.value || a.description || "")).join(" ").slice(0, 300));
    } else if (ev.method === "Log.entryAdded" && ev.params.entry.level === "error") {
      errors.push("LOG: " + String(ev.params.entry.text || "").slice(0, 300));
    }
  });
  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  await cdp.send("Log.enable");

  const navP = cdp.send("Page.navigate", { url: TARGET });
  // wait for Page.loadEventFired event (with fallback timeout)
  await new Promise((resolve) => {
    const h = (ev) => { if (ev.method === "Page.loadEventFired") { cdp.handlers = cdp.handlers.filter((x) => x !== h); resolve(); } };
    cdp.onEvent(h);
    navP.catch(() => {});
    setTimeout(resolve, 15000);
  });
  await sleep(1500);

  const title = await cdp.eval("document.title");
  const navOk = await cdp.eval("!!document.querySelector('header') && !!document.getElementById('main')");
  const imgInfo = await cdp.eval("(() => { const im = Array.from(document.images); return JSON.stringify({ total: im.length, inlined: im.filter(i => i.src.indexOf('data:') === 0).length }); })()");
  console.log("title:", title, "| chrome ok:", navOk, "| images:", imgInfo);

  for (const route of ROUTES) {
    await cdp.eval("location.hash = " + JSON.stringify("#" + route));
    // wait until main has substantial content for this route
    let state = null;
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      state = await cdp.eval(`(() => {
        var m = document.getElementById('main');
        if (!m) return JSON.stringify({ bad: 'no main' });
        var h = m.querySelector('h1,h2');
        return JSON.stringify({
          title: document.title,
          children: m.children.length,
          heading: h ? h.textContent.trim().slice(0, 70) : null,
          imgs: m.querySelectorAll('img').length,
          broken: Array.from(m.querySelectorAll('img')).filter(i => !i.complete || i.naturalWidth === 0).length,
          textLen: m.textContent.length
        });
      })()`);
      try {
        const d = JSON.parse(state);
        if (!d.bad && d.children > 0 && d.textLen > 500) break;
      } catch (e) {}
    }
    let d;
    try { d = JSON.parse(state); } catch (e) { d = { raw: String(state).slice(0, 200) }; }
    const ok = d.children > 0 && d.textLen > 500 && (d.broken || 0) === 0;
    if (!ok) failures++;
    console.log((ok ? "PASS" : "FAIL"), route.padEnd(14), JSON.stringify(d));
  }

  await sleep(500);
  console.log("");
  if (errors.length) {
    failures++;
    console.log("PAGE ERRORS (" + errors.length + "):");
    [...new Set(errors)].slice(0, 12).forEach((e) => console.log("  -", e));
  } else {
    console.log("no console/page errors");
  }
  console.log("RESULT:", failures === 0 ? "PASS" : "FAIL (" + failures + ")");
  cdp.close();
  chrome.kill();
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) {}
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("VERIFY CRASH:", e.message);
  try { chrome.kill(); } catch (x) {}
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (x) {}
  process.exit(2);
});
