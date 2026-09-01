const fs = require("fs");
const { spawn } = require("child_process");

const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";

async function waitForBrowser(port) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 125));
  }
  throw new Error(`Chrome did not start on port ${port}`);
}

async function capture({ port, url, prefix, width, height }) {
  const target = await fetch(
    `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`,
    { method: "PUT" },
  ).then((response) => response.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const promise = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) promise.reject(message.error);
    else promise.resolve(message.result);
  };
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  const call = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const callId = ++id;
      pending.set(callId, { resolve, reject });
      socket.send(JSON.stringify({ id: callId, method, params }));
    });

  await call("Page.enable");
  await call("Runtime.enable");
  await call("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await call("Page.navigate", { url });
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const page = await call("Runtime.evaluate", {
    expression:
      '({height:document.documentElement.scrollHeight,film:document.querySelector("[data-film]")?.offsetHeight,view:innerHeight,title:document.title})',
    returnByValue: true,
  });
  console.log(JSON.stringify(page.result.value));

  for (const [name, fraction] of [
    ["opening", 0],
    ["first-transition", 0.13],
    ["community", 0.23],
    ["review", 1.5],
  ]) {
    await call("Runtime.evaluate", {
      expression: `scrollTo(0,(document.querySelector('[data-film]').offsetHeight-innerHeight)*${fraction})`,
    });
    await new Promise((resolve) => setTimeout(resolve, 900));
    const screenshot = await call("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    fs.writeFileSync(
      `C:/Users/olive/Projects/koa/tmp/browser/${prefix}-${name}.png`,
      Buffer.from(screenshot.data, "base64"),
    );
  }
  await call("Page.close");
  socket.close();
}

const [port, url, prefix, width = "1440", height = "1000"] = process.argv.slice(2);
const browserPort = Number(port);
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${browserPort}`,
    `--user-data-dir=C:/Users/olive/Projects/koa/tmp/browser/${prefix}-profile`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

waitForBrowser(browserPort)
  .then(() => capture({ port: browserPort, url, prefix, width: Number(width), height: Number(height) }))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => chrome.kill());
