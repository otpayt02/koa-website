// Local-only KOA review library. Run with: node .\scripts\koa-version-library.mjs
// It inventories existing HTML, opens allowlisted Git refs in disposable worktrees, and never publishes.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roots = [
  ['KOA website', repo],
  ['Sons of Kawthoolei V5', 'C:\\Users\\olive\\Projects\\sons_of_kawthoolei\\KOA\\koa-sites'],
  ['URL clone', 'C:\\Users\\olive\\Projects\\koa-url-clone'],
  ['Sites reference release', 'C:\\Users\\olive\\Projects\\koa-sites-reference-release'],
  ['Sites publish snapshot', 'C:\\Users\\olive\\Projects\\koa-website-sites-publish-min-20260904-161735'],
].filter(([, location]) => fs.existsSync(location));
const host = '127.0.0.1';
const port = 8765;
const base = `http://${host}:${port}`;
const worktreeRoot = path.join(repo, 'output', 'version-library-worktrees');
const logRoot = path.join(repo, 'output', 'version-library-logs');
const skipped = new Set(['node_modules', '.git', '.next', '.vinext']);
const servedTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.wasm': 'application/wasm' };
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (mark) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[mark]);

function listHtml(location, rootIndex, directory = location, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !skipped.has(entry.name)) listHtml(location, rootIndex, path.join(directory, entry.name), result);
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(location, absolute).split(path.sep).join('/');
      const hash = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
      result.push({ rootIndex, relative, absolute, hash, size: fs.statSync(absolute).size });
    }
  }
  return result;
}

const htmlFiles = roots.flatMap(([, location], index) => listHtml(location, index));
const hashCounts = new Map();
for (const file of htmlFiles) hashCounts.set(file.hash, (hashCounts.get(file.hash) ?? 0) + 1);
const launchers = fs.readdirSync(path.join(repo, 'scripts', 'versions'))
  .filter((name) => /^launch-[a-z0-9-]+\.ps1$/i.test(name))
  .map((name) => {
    const source = fs.readFileSync(path.join(repo, 'scripts', 'versions', name), 'utf8');
    const ref = source.match(/^\$ref\s*=\s*'([^']+)'/m)?.[1];
    if (!ref) return null;
    let commit = '';
    try { commit = execFileSync('git', ['-C', repo, 'rev-parse', '--verify', `${ref}^{commit}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
    catch { return null; }
    return { id: name.slice(7, -4), ref, commit };
  }).filter(Boolean);
const commitCounts = new Map();
for (const launcher of launchers) commitCounts.set(launcher.commit, (commitCounts.get(launcher.commit) ?? 0) + 1);
let active = null;
let lastMessage = '';

function fileUrl(file) {
  return `/file/${file.rootIndex}/${file.relative.split('/').map(encodeURIComponent).join('/')}`;
}

function category(file) {
  const p = file.absolute.toLowerCase();
  if (p.endsWith('rebuilding-koa-website-cinematic.html')) return 'Design brief';
  if (p.includes(`${path.sep}.hermes${path.sep}`)) return 'Brochure reference';
  if (p.includes('koa-sites-v5')) return 'Sites V5 export';
  if (p.includes('koa-sites-v7')) return 'Sites V7 export';
  if (p.includes('koa-v5')) return 'Dedicated V5';
  if (p.includes('koa-url-clone')) return 'URL clone';
  if (p.includes('index-enhanced')) return 'Enhanced static film';
  if (p.includes(`${path.sep}public${path.sep}koa${path.sep}`)) return 'Static story source';
  if (p.includes(`${path.sep}dist${path.sep}`)) return 'Built snapshot';
  return 'HTML reference';
}

function commandFor(file) {
  return `Set-Location '${repo}'; Start-Process '${base}${fileUrl(file)}'`;
}

function page() {
  let currentUrl = '';
  try {
    const recorded = JSON.parse(fs.readFileSync(path.join(repo, '.koa-runtime.json'), 'utf8'));
    if (/^http:\/\/127\.0\.0\.1:\d+\/en$/.test(recorded.url)) currentUrl = recorded.url;
  } catch { /* A current preview has not been recorded. */ }
  const groups = new Map();
  for (const file of htmlFiles) {
    const name = category(file);
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(file);
  }
  const sections = [...groups].map(([name, files]) => `<section><h2>${escapeHtml(name)} <small>${files.length}</small></h2><div class="grid">${files.map((file) => `<article>
    <div class="tag">${escapeHtml(roots[file.rootIndex][0])}${hashCounts.get(file.hash) > 1 ? ` · ${hashCounts.get(file.hash)} identical copies` : ''}</div>
    <h3>${escapeHtml(path.basename(file.relative))}</h3><p class="path">${escapeHtml(file.relative)}</p>
    <a class="action" href="${fileUrl(file)}" target="_blank" rel="noopener">Open HTML ↗</a>
    <details><summary>PowerShell command</summary><code>${escapeHtml(commandFor(file))}</code></details>
    </article>`).join('')}</div></section>`).join('');
  const refCards = launchers.map((item) => `<article><div class="tag">${escapeHtml(item.commit.slice(0, 8))}${commitCounts.get(item.commit) > 1 ? ' · same commit as another launcher' : ''}</div>
    <h3>${escapeHtml(item.ref)}</h3><p class="path">Historical React checkout</p>
    <form action="/launch/${encodeURIComponent(item.id)}" method="post"><button class="action" type="submit">Run and open ↗</button></form>
    <details><summary>PowerShell command</summary><code>${escapeHtml(`Set-Location '${repo}'; node .\\scripts\\koa-version-library.mjs --launch ${item.id}`)}</code></details></article>`).join('');
  const status = active ? `${escapeHtml(active.ref)} · ${escapeHtml(active.status)}${active.url ? ` · <a href="${active.url}" target="_blank">Open running version ↗</a>` : ''}` : escapeHtml(lastMessage || 'No historical React version running.');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KOA version library</title><style>
    :root{color-scheme:dark;font:16px/1.5 system-ui,sans-serif;background:#0b1422;color:#e8ecf1}*{box-sizing:border-box}body{margin:0}main{max-width:1280px;margin:auto;padding:clamp(20px,4vw,60px)}h1{font:clamp(2.3rem,6vw,5rem)/1.04 Georgia,serif;max-width:850px;margin:24px 0}h2{font:2rem Georgia,serif;margin:0 0 22px}h3{font-size:1.07rem;margin:10px 0 4px}p{max-width:800px}.intro{color:#b7c5d6}.eyebrow,.tag,small{font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:#b6d0af}.count{font-size:.9rem;color:#b7c5d6}section{border-top:1px solid #314358;padding:34px 0}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}article{border:1px solid #32465a;background:#122237;padding:18px;min-width:0}.path{color:#a7b5c6;font-size:.83rem;overflow-wrap:anywhere;min-height:40px}.action{display:inline-block;background:#cbd9b6;color:#10251c;border:0;padding:9px 14px;font:600 .9rem system-ui,sans-serif;text-decoration:none;cursor:pointer}form{display:inline}a{color:#cbd9b6}details{margin-top:13px;color:#b7c5d6}summary{cursor:pointer}code{display:block;white-space:pre-wrap;overflow-wrap:anywhere;background:#0a1728;padding:10px;font-size:.74rem;margin-top:8px}.status{padding:12px 16px;border-left:3px solid #cbd9b6;background:#14273a}.meta{margin:20px 0 32px}
    </style></head><body><main><div class="eyebrow">Local review only · no publishing</div><h1>Every KOA HTML, one place.</h1>
    <p class="intro">Open any saved HTML directly. Historical React branches start in a temporary checkout and open when ready. Built exports and duplicate copies remain visible so you can trace where each file came from.</p>
    <p class="count">${htmlFiles.length} HTML paths · ${hashCounts.size} distinct file hashes · ${launchers.length} historical branch launchers</p>
    <p><a href="/review">Read the comparison and deployment-base recommendation ↗</a></p><div class="status">${status}</div>
    <section><h2>Recommended base</h2><article><div class="tag">Current working tree · canonical React site</div><h3>KOA application</h3><p class="path">app/[lang]/page.tsx → components/CinematicLanding.tsx</p>
    <form action="/current" method="post"><button class="action" type="submit">Run and open current site ↗</button></form>
    ${currentUrl ? `<p><a href="${currentUrl}" target="_blank">Open recorded current preview ↗</a></p>` : ''}
    <details><summary>PowerShell start and stop commands</summary><code>${escapeHtml(`Set-Location '${repo}'; powershell -NoProfile -ExecutionPolicy Bypass -File '.\\scripts\\run-koa.ps1'`)}</code><code>${escapeHtml(`Set-Location '${repo}'; powershell -NoProfile -ExecutionPolicy Bypass -File '.\\scripts\\stop-koa.ps1'`)}</code></details></article></section>
    ${active ? '<form action="/stop" method="post"><button class="action" type="submit">Stop historical version</button></form>' : ''}
    <section class="meta"><h2>Historical React branches</h2><p class="intro">Launching an older branch may need a fresh free local dependency install. Only one branch starts at a time; the status appears above. Your active checkout is untouched.</p><div class="grid">${refCards}</div></section>${sections}</main></body></html>`;
}

function respond(res, status, body, contentType = 'text/html; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}

function openBrowser(url) {
  const child = spawn('powershell.exe', ['-NoProfile', '-Command', `Start-Process '${url}'`], { windowsHide: true, stdio: 'ignore' });
  child.unref();
}

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, host, () => { const selected = probe.address().port; probe.close(() => resolve(selected)); });
  });
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? resolve(output) : reject(new Error(`${command} exited ${code}: ${output.slice(-1000)}`)));
  });
}

async function waitForPage(origin, child) {
  for (let i = 0; i < 90; i++) {
    if (child.exitCode !== null) throw new Error(`Preview process exited ${child.exitCode}.`);
    for (const route of ['/en', '/koa/', '/']) {
      try { const response = await fetch(origin + route, { signal: AbortSignal.timeout(1200) }); if (response.ok) return origin + route; }
      catch { /* The preview is still starting. */ }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('Preview did not respond within 90 seconds.');
}

async function launch(item) {
  if (active) throw new Error(`Stop ${active.ref} before launching another historical version.`);
  const drive = execFileSync('powershell.exe', ['-NoProfile', '-Command', `(Get-PSDrive -Name '${path.parse(repo).root[0]}').Free`], { encoding: 'utf8' }).trim();
  if (Number(drive) < 2_000_000_000 || os.freemem() < 500_000_000) {
    lastMessage = 'Historical launch paused: at least 2 GB free on the local drive and 500 MB free RAM are required.';
    throw new Error(lastMessage);
  }
  fs.mkdirSync(worktreeRoot, { recursive: true });
  fs.mkdirSync(logRoot, { recursive: true });
  const directory = path.join(worktreeRoot, `${item.id}-${crypto.randomBytes(4).toString('hex')}`);
  const logPath = path.join(logRoot, `${item.id}-${Date.now()}.log`);
  const session = { ref: item.ref, status: 'preparing temporary checkout', directory, logPath, child: null, url: null };
  active = session;
  lastMessage = '';
  let created = false;
  try {
    await run('git', ['-C', repo, 'worktree', 'add', '--detach', directory, item.commit]);
    created = true;
    if (!fs.existsSync(path.join(directory, 'node_modules', 'vinext', 'dist', 'cli.js'))) {
      session.status = 'installing locked dependencies';
      await run('cmd.exe', ['/d', '/s', '/c', 'npm.cmd', 'ci'], { cwd: directory });
    }
    const selectedPort = await freePort();
    const origin = `http://${host}:${selectedPort}`;
    const out = fs.openSync(logPath, 'a');
    const child = spawn(process.execPath, [path.join(directory, 'node_modules', 'vinext', 'dist', 'cli.js'), 'dev', '--hostname', host, '--port', String(selectedPort)], { cwd: directory, windowsHide: true, stdio: ['ignore', out, out] });
    fs.closeSync(out);
    session.child = child;
    session.status = 'starting preview';
    child.once('close', () => { if (active === session) { session.status = 'stopped'; active = null; } cleanup(session).catch(() => {}); });
    const url = await waitForPage(origin, child);
    session.url = url;
    session.status = 'ready';
    openBrowser(url);
    return url;
  } catch (error) {
    session.status = `failed: ${error.message}`;
    lastMessage = `${item.ref}: ${session.status}. Log: ${logPath}`;
    if (session.child) session.child.kill();
    if (!session.child && created) await cleanup(session);
    if (active === session) active = null;
    throw error;
  }
}

async function cleanup(session) {
  const absolute = path.resolve(session.directory);
  if (!absolute.startsWith(path.resolve(worktreeRoot) + path.sep)) return;
  try { await run('git', ['-C', repo, 'worktree', 'remove', absolute]); }
  catch { console.error(`Retained temporary checkout for review: ${absolute}`); }
}

function serveFile(req, res, pathname) {
  const match = pathname.match(/^\/file\/(\d+)\/(.*)$/);
  if (!match) return false;
  const root = roots[Number(match[1])]?.[1];
  if (!root) { respond(res, 404, 'Unknown root'); return true; }
  let relative;
  try { relative = match[2].split('/').map(decodeURIComponent).join(path.sep); }
  catch { respond(res, 400, 'Invalid path'); return true; }
  const absolute = path.resolve(root, relative);
  const permitted = absolute.startsWith(path.resolve(root) + path.sep) &&
    relative.split(path.sep).every((part) => part && (!part.startsWith('.') || part === '.openai' || part === '.hermes') && !skipped.has(part)) &&
    Object.hasOwn(servedTypes, path.extname(absolute).toLowerCase()) &&
    fs.existsSync(absolute) && fs.statSync(absolute).isFile() &&
    fs.realpathSync(absolute).startsWith(fs.realpathSync(root) + path.sep);
  if (!permitted) {
    respond(res, 404, 'File unavailable'); return true;
  }
  res.writeHead(200, { 'Content-Type': servedTypes[path.extname(absolute).toLowerCase()], 'X-Content-Type-Options': 'nosniff' });
  fs.createReadStream(absolute).pipe(res);
  return true;
}

async function startServer() {
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, base).pathname;
    if (req.headers.host !== `${host}:${port}`) return respond(res, 403, 'Wrong host');
    if (req.method === 'POST' && req.headers.origin !== base) return respond(res, 403, 'Open the local library to launch a version.');
    if (req.method === 'GET' && pathname === '/') return respond(res, 200, page());
    if (req.method === 'GET' && pathname === '/review') {
      const source = fs.readFileSync(path.join(repo, 'docs', 'koa-version-library-review.md'), 'utf8');
      return respond(res, 200, `<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>KOA review</title><style>body{max-width:900px;margin:30px auto;padding:20px;background:#0b1422;color:#e8ecf1;font:16px/1.55 system-ui}a{color:#cbd9b6}pre{white-space:pre-wrap}</style></head><body><a href="/">← Library</a><pre>${escapeHtml(source)}</pre></body></html>`);
    }
    if (req.method === 'GET' && pathname.startsWith('/file/')) return serveFile(req, res, pathname);
    if (req.method === 'GET' && pathname.startsWith('/koa/')) return serveFile(req, res, `/file/0/public${pathname}`);
    if (req.method === 'POST' && pathname === '/current') {
      respond(res, 202, '<html><meta http-equiv="refresh" content="3;url=/"><body>Starting the current KOA site. It opens automatically when ready.</body></html>');
      run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(repo, 'scripts', 'run-koa.ps1')])
        .then(() => { lastMessage = 'Current KOA site opened using the canonical runner.'; })
        .catch((error) => { lastMessage = `Current KOA launch failed: ${error.message}`; });
      return;
    }
    if (req.method === 'POST' && pathname.startsWith('/launch/')) {
      const item = launchers.find((entry) => entry.id === decodeURIComponent(pathname.slice(8)));
      if (!item) return respond(res, 404, 'Unknown historical version');
      respond(res, 202, `<html><meta http-equiv="refresh" content="3;url=/"><body style="background:#0b1422;color:white;font:18px system-ui;padding:40px">Preparing ${escapeHtml(item.ref)}. The version opens automatically when ready. <a style="color:#cbd9b6" href="/">Return to library</a>.</body></html>`);
      launch(item).catch((error) => console.error(`Could not launch ${item.ref}: ${error.message}`));
      return;
    }
    if (req.method === 'POST' && pathname === '/stop') {
      active?.child?.kill();
      return respond(res, 200, '<html><meta http-equiv="refresh" content="2;url=/"><body>Stopping preview…</body></html>');
    }
    respond(res, 404, 'Not found');
  });
  server.listen(port, host, () => { console.log(`KOA version library: ${base}`); openBrowser(base); });
  process.on('SIGINT', () => { active?.child?.kill(); server.close(() => process.exit(0)); });
}

const direct = process.argv.indexOf('--launch');
if (direct >= 0) {
  const item = launchers.find((entry) => entry.id === process.argv[direct + 1]);
  if (!item) throw new Error('Unknown launcher ID. Open the library to see available commands.');
  console.log(`Preparing ${item.ref}…`);
  await launch(item);
  console.log(`Running ${item.ref} at ${active.url}. Press Ctrl+C to stop.`);
  process.on('SIGINT', () => active?.child?.kill());
} else await startServer();
