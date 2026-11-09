// Materializes the pointer catalog as local HTML that works through a static server.
// Every unique resource is copied once; every distinct HTML hash is rewritten to that shared library.
// Run after the catalog: node .\scripts\build-koa-runnable-html-library.mjs
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogRoot = path.join(repo, 'versions', 'koa-website');
const output = path.join(catalogRoot, 'runnable');
const ignoredDirectories = new Set(['.git', '.next', '.vinext', 'node_modules']);
const mediaExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.mp4', '.png', '.svg', '.webm', '.webp']);
const supportExtensions = new Set(['.css', '.js', '.mjs', '.ttf', '.woff', '.woff2']);
const supportedExtensions = new Set([...mediaExtensions, ...supportExtensions, '.html']);
const missingResources = new Map();

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function scan(rootIndex, root, directory = root, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) scan(rootIndex, root, path.join(directory, entry.name), files);
    if (!entry.isFile()) continue;
    const absolute = path.join(directory, entry.name);
    const extension = path.extname(entry.name).toLowerCase();
    if (!supportedExtensions.has(extension)) continue;
    files.push({ rootIndex, root, absolute, extension, hash: sha256(absolute) });
  }
  return files;
}

function chooseCanonical(candidates) {
  return [...candidates].sort((left, right) => {
    const leftWeight = left.rootIndex === 0 && left.absolute.includes(`${path.sep}public${path.sep}`) ? 0 : left.rootIndex === 0 ? 1 : 2;
    const rightWeight = right.rootIndex === 0 && right.absolute.includes(`${path.sep}public${path.sep}`) ? 0 : right.rootIndex === 0 ? 1 : 2;
    return leftWeight - rightWeight || left.absolute.localeCompare(right.absolute);
  })[0];
}

function makeDirectory(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function writeText(file, text) {
  makeDirectory(file);
  fs.writeFileSync(file, text, 'utf8');
}

function localTarget(raw, sourceFile, byAbsolute, byBasename) {
  if (!raw || /^(?:https?:|data:|mailto:|#|\/\/)/i.test(raw)) return null;
  const pathname = raw.split(/[?#]/, 1)[0];
  const absolute = path.resolve(path.dirname(sourceFile.absolute), pathname.replace(/^\//, ''));
  const exact = byAbsolute.get(absolute);
  if (exact) return exact;
  const candidates = byBasename.get(path.basename(pathname).toLowerCase()) ?? [];
  const sameSource = candidates.find((candidate) => candidate.rootIndex === sourceFile.rootIndex);
  if (sameSource) return sameSource;
  if (candidates.length) return chooseCanonical(candidates);
  const extension = path.extname(pathname).toLowerCase();
  const outputExtension = mediaExtensions.has(extension) ? '.svg' : extension || '.txt';
  const missing = { missing: true, hash: crypto.createHash('sha256').update(`${sourceFile.absolute}:${raw}`).digest('hex'), extension: outputExtension, original: raw };
  missingResources.set(`${missing.hash}${missing.extension}`, missing);
  return missing;
}

function replaceUrl(raw, sourceFile, byAbsolute, byBasename, htmlIds, from) {
  const target = localTarget(raw, sourceFile, byAbsolute, byBasename);
  if (!target) return raw;
  const suffixStart = raw.search(/[?#]/);
  const suffix = suffixStart === -1 ? '' : raw.slice(suffixStart);
  if (target.missing) return `${from.missing(target)}${suffix}`;
  if (target.extension === '.html') return `${from.html(target)}${suffix}`;
  return `${from.resource(target)}${suffix}`;
}

function rewriteHtml(sourceFile, byAbsolute, byBasename, htmlIds) {
  const from = {
    html: (target) => `../${htmlIds.get(target.absolute)}/index.html`,
    resource: (target) => `../../${mediaExtensions.has(target.extension) ? 'assets' : 'support'}/${target.hash}${target.extension}`,
    missing: (target) => `../../missing/${target.hash}${target.extension}`,
  };
  let text = fs.readFileSync(sourceFile.absolute, 'utf8');
  text = text.replace(/((?:src|href|poster)\s*=\s*["'])([^"']+)(["'])/gi, (all, prefix, raw, suffix) => `${prefix}${replaceUrl(raw, sourceFile, byAbsolute, byBasename, htmlIds, from)}${suffix}`);
  return text.replace(/url\((["']?)([^"')]+)\1\)/gi, (all, quote, raw) => `url(${quote}${replaceUrl(raw, sourceFile, byAbsolute, byBasename, htmlIds, from)}${quote})`);
}

function rewriteCss(sourceFile, byAbsolute, byBasename, htmlIds) {
  const from = {
    html: (target) => `../html/${htmlIds.get(target.absolute)}/index.html`,
    resource: (target) => `./${target.hash}${target.extension}`,
    missing: (target) => `../missing/${target.hash}${target.extension}`,
  };
  const text = fs.readFileSync(sourceFile.absolute, 'utf8');
  return text.replace(/url\((["']?)([^"')]+)\1\)/gi, (all, quote, raw) => `url(${quote}${replaceUrl(raw, sourceFile, byAbsolute, byBasename, htmlIds, from)}${quote})`);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

if (!fs.existsSync(path.join(catalogRoot, 'index.json'))) throw new Error(`Catalog missing: ${catalogRoot}`);
const replace = process.argv.includes('--replace');
if (fs.existsSync(output) && !replace) throw new Error(`Refusing to overwrite runnable library: ${output}`);
if (fs.existsSync(output) && replace) {
  // The caller must opt in, and the target must be this generator's own output.
  if (!fs.existsSync(path.join(output, 'index.html')) || !fs.existsSync(path.join(output, 'README.md'))) throw new Error(`Runnable library marker missing: ${output}`);
  fs.rmSync(output, { recursive: true, force: true });
}

const catalog = JSON.parse(fs.readFileSync(path.join(catalogRoot, 'index.json'), 'utf8'));
const sourceRoots = catalog.sourceRoots.map(({ id, path: sourcePath }) => [id, sourcePath]);
const records = sourceRoots.flatMap(([, root], rootIndex) => scan(rootIndex, root));
const byAbsolute = new Map(records.map((record) => [record.absolute, record]));
const byBasename = Map.groupBy(records, (record) => path.basename(record.absolute).toLowerCase());
const htmlIds = new Map();
for (const version of catalog.htmlVersions) {
  for (const occurrence of version.occurrences) {
    const root = sourceRoots.find(([id]) => id === occurrence.source)?.[1];
    if (root) htmlIds.set(path.resolve(root, occurrence.path), version.id);
  }
}

const resources = records.filter((record) => record.extension !== '.html');
const resourcesByHash = Map.groupBy(resources, (record) => record.hash);
fs.mkdirSync(output, { recursive: true });
for (const [, candidates] of resourcesByHash) {
  const source = chooseCanonical(candidates);
  const folder = mediaExtensions.has(source.extension) ? 'assets' : 'support';
  const destination = path.join(output, folder, `${source.hash}${source.extension}`);
  makeDirectory(destination);
  if (source.extension === '.css') fs.writeFileSync(destination, rewriteCss(source, byAbsolute, byBasename, htmlIds), 'utf8');
  else fs.copyFileSync(source.absolute, destination);
}

for (const version of catalog.htmlVersions) {
  const sourceRoot = sourceRoots.find(([id]) => id === version.primary.source)?.[1];
  const source = byAbsolute.get(path.resolve(sourceRoot, version.primary.path));
  if (!source) throw new Error(`Missing HTML source for ${version.id}`);
  writeText(path.join(output, 'html', version.id, 'index.html'), rewriteHtml(source, byAbsolute, byBasename, htmlIds));
}

for (const missing of missingResources.values()) {
  const destination = path.join(output, 'missing', `${missing.hash}${missing.extension}`);
  if (missing.extension === '.svg') {
    writeText(destination, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 360" role="img" aria-label="Missing archived KOA asset"><rect width="100%" height="100%" fill="#07101f"/><path d="M0 300 190 120l135 115 110-80 285 145" fill="none" stroke="#b9cea7" stroke-width="8"/><text x="48" y="320" fill="#ecf3fb" font-family="system-ui" font-size="26">Missing archived asset — retained as a review marker</text></svg>`);
  } else if (missing.extension === '.css') writeText(destination, `/* Missing archived stylesheet: ${missing.original} */\n`);
  else if (missing.extension === '.js' || missing.extension === '.mjs') writeText(destination, `// Missing archived script: ${missing.original}\n`);
  else writeText(destination, '');
}

const cards = catalog.htmlVersions.map((version) => `<article><a href="html/${version.id}/index.html"><strong>${version.id}</strong><span>${escapeHtml(version.primary.source)}/${escapeHtml(version.primary.path)}</span></a><small>Unique compiled version</small></article>`).join('');
writeText(path.join(output, 'index.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KOA runnable version library</title><style>body{margin:0;background:#07101f;color:#ecf3fb;font:16px/1.5 system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:32px}h1{font:clamp(2rem,6vw,4.5rem)/1.04 Georgia,serif;margin:.2em 0}.eyebrow,small{color:#b9cea7;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin-top:28px}article{border:1px solid #30445b;background:#10233a}a{display:block;padding:18px;color:inherit;text-decoration:none}a:hover{background:#183252}strong,span{display:block}span{margin-top:8px;color:#b9c8d9;overflow-wrap:anywhere;font-size:.85rem}small{display:block;padding:0 18px 16px}</style><main><div class="eyebrow">Local static library · canonical source ${catalog.canonical.commit.slice(0, 12)}</div><h1>Every distinct KOA HTML version, runnable.</h1><p>Each page uses the shared hash-addressed asset and support libraries in this folder. Byte-identical source pages are compiled only once; their provenance remains in the machine-readable catalog.</p><div class="grid">${cards}</div></main></html>`);
writeText(path.join(output, 'README.md'), `# Runnable KOA HTML library\n\nOpen \`index.html\` through a local static server. Every \`html/<id>/index.html\` is a runnable, rewritten version that uses one shared copy of each local asset/support file.\n\nThe authoritative source pointer remains at \`../canonical/CANONICAL.md\`; this library is for review, not editing or publication.\n`);
console.log(JSON.stringify({ output, runnableHtml: catalog.htmlVersions.length, sharedResources: resourcesByHash.size }, null, 2));
