// Creates a local, pointer-based KOA version catalog without copying or deleting source files.
// Run: node .\scripts\build-koa-version-catalog.mjs --canonical-ref origin/main
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultOutput = path.join(repo, 'versions', 'koa-website');
const ignoredDirectories = new Set(['.git', '.next', '.vinext', 'node_modules']);
const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);
const mediaExtensions = new Set([...imageExtensions, '.mp4', '.webm']);
const sourceRoots = [
  ['koa-website', repo],
  ['sons-of-kawthoolei-v5', 'C:\\Users\\olive\\Projects\\sons_of_kawthoolei\\KOA\\koa-sites'],
  ['koa-url-clone', 'C:\\Users\\olive\\Projects\\koa-url-clone'],
  ['koa-sites-reference-release', 'C:\\Users\\olive\\Projects\\koa-sites-reference-release'],
  ['koa-sites-publish-snapshot', 'C:\\Users\\olive\\Projects\\koa-website-sites-publish-min-20260904-161735'],
].filter(([, root]) => fs.existsSync(root));

function readArgument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1] ?? fallback;
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function normalPath(value) {
  return value.split(path.sep).join('/');
}

function markdown(value) {
  return String(value).replace(/[\\`*_{}[\]<>()#+.!|-]/g, '\\$&');
}

function scan(rootIndex, root, directory = root, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) scan(rootIndex, root, path.join(directory, entry.name), files);
    if (!entry.isFile()) continue;
    const absolute = path.join(directory, entry.name);
    const extension = path.extname(entry.name).toLowerCase();
    if (!mediaExtensions.has(extension) && extension !== '.html') continue;
    files.push({
      rootIndex,
      root,
      absolute,
      relative: normalPath(path.relative(root, absolute)),
      extension,
      size: fs.statSync(absolute).size,
      hash: sha256(absolute),
    });
  }
  return files;
}

function localAssetReferences(htmlFile, assetsByAbsolutePath) {
  const source = fs.readFileSync(htmlFile.absolute, 'utf8');
  const references = new Set();
  const attribute = /(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi;
  for (const match of source.matchAll(attribute)) {
    const raw = match[1].trim();
    if (!raw || /^(?:https?:|data:|mailto:|#|\/\/)/i.test(raw)) continue;
    const pathname = raw.split(/[?#]/, 1)[0];
    const absolute = path.resolve(path.dirname(htmlFile.absolute), pathname.replace(/^\//, ''));
    const asset = assetsByAbsolutePath.get(absolute);
    if (asset) references.add(asset.hash);
  }
  return [...references].sort();
}

function canonicalAsset(candidates) {
  return [...candidates].sort((left, right) => {
    const leftWeight = left.rootIndex === 0 && left.relative.startsWith('public/') ? 0 : left.rootIndex === 0 ? 1 : 2;
    const rightWeight = right.rootIndex === 0 && right.relative.startsWith('public/') ? 0 : right.rootIndex === 0 ? 1 : 2;
    return leftWeight - rightWeight || left.relative.localeCompare(right.relative);
  })[0];
}

function writeFile(root, relative, content) {
  const destination = path.join(root, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, content, 'utf8');
}

function versionLaunchers() {
  const directory = path.join(repo, 'scripts', 'versions');
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter((name) => /^launch-[a-z0-9-]+\.ps1$/i.test(name))
    .map((name) => {
      const source = fs.readFileSync(path.join(directory, name), 'utf8');
      const ref = source.match(/^\$ref\s*=\s*'([^']+)'/m)?.[1];
      if (!ref) return null;
      let commit = null;
      try { commit = execFileSync('git', ['-C', repo, 'rev-parse', '--verify', `${ref}^{commit}`], { encoding: 'utf8' }).trim(); }
      catch { /* Retain the pointer even if the local ref is no longer reachable. */ }
      return { id: name.slice(7, -4), ref, commit, launcher: normalPath(path.relative(repo, path.join(directory, name))) };
    })
    .filter(Boolean)
    .sort((left, right) => left.id.localeCompare(right.id));
}

function safeOrigin() {
  try { return execFileSync('git', ['-C', repo, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim().replace(/^(https?:\/\/)[^@]+@/i, '$1'); }
  catch { return 'origin remote unavailable'; }
}

const output = path.resolve(readArgument('--output', defaultOutput));
const canonicalRef = readArgument('--canonical-ref', 'origin/main');
if (fs.existsSync(output)) throw new Error(`Refusing to overwrite existing catalog: ${output}`);
const canonicalCommit = execFileSync('git', ['-C', repo, 'rev-parse', '--verify', `${canonicalRef}^{commit}`], { encoding: 'utf8' }).trim();
const rootParent = path.dirname(output);
const staging = path.join(rootParent, `.koa-website-staging-${process.pid}-${Date.now()}`);
fs.mkdirSync(staging, { recursive: true });

try {
  const files = sourceRoots.flatMap(([, root], rootIndex) => scan(rootIndex, root));
  const htmlFiles = files.filter((file) => file.extension === '.html');
  const assets = files.filter((file) => mediaExtensions.has(file.extension));
  const assetsByAbsolutePath = new Map(assets.map((asset) => [asset.absolute, asset]));
  const assetsByHash = Map.groupBy(assets, (asset) => asset.hash);
  const htmlByHash = Map.groupBy(htmlFiles, (file) => file.hash);
  const assetRegistry = [...assetsByHash].sort(([left], [right]) => left.localeCompare(right)).map(([hash, candidates]) => {
    const canonical = canonicalAsset(candidates);
    return {
      hash,
      kind: imageExtensions.has(canonical.extension) ? 'image' : 'video',
      bytes: canonical.size,
      canonical: { source: sourceRoots[canonical.rootIndex][0], path: canonical.relative },
      occurrences: candidates.sort((left, right) => left.rootIndex - right.rootIndex || left.relative.localeCompare(right.relative)).map((asset) => ({ source: sourceRoots[asset.rootIndex][0], path: asset.relative })),
    };
  });
  const assetByHash = new Map(assetRegistry.map((asset) => [asset.hash, asset]));
  const htmlVersions = [...htmlByHash].sort(([left], [right]) => left.localeCompare(right)).map(([hash, candidates]) => {
    const primary = canonicalAsset(candidates);
    return {
      id: hash.slice(0, 12), hash,
      bytes: primary.size,
      primary: { source: sourceRoots[primary.rootIndex][0], path: primary.relative },
      occurrences: candidates.sort((left, right) => left.rootIndex - right.rootIndex || left.relative.localeCompare(right.relative)).map((file) => ({ source: sourceRoots[file.rootIndex][0], path: file.relative })),
      assets: localAssetReferences(primary, assetsByAbsolutePath).map((assetHash) => ({ hash: assetHash, canonical: assetByHash.get(assetHash)?.canonical ?? null })),
    };
  });
  const launchers = versionLaunchers();
  const catalog = {
    schema: 1,
    generatedAt: new Date().toISOString(),
    canonical: { source: 'origin/main', requestedRef: canonicalRef, commit: canonicalCommit, route: 'app/[lang]/page.tsx -> components/CinematicLanding.tsx', remote: safeOrigin() },
    sourceRoots: sourceRoots.map(([id, root]) => ({ id, path: root })),
    counts: { htmlPaths: htmlFiles.length, uniqueHtmlVersions: htmlVersions.length, assetPaths: assets.length, uniqueAssets: assetRegistry.length, duplicateAssetPaths: assets.length - assetRegistry.length, gitLaunchers: launchers.length },
    htmlVersions,
    gitVersions: launchers,
  };
  writeFile(staging, 'index.json', `${JSON.stringify(catalog, null, 2)}\n`);
  writeFile(staging, 'assets/registry.json', `${JSON.stringify(assetRegistry, null, 2)}\n`);
  writeFile(staging, 'canonical/CANONICAL.md', `# Canonical KOA source\n\n- **Remote ref:** \`${canonicalRef}\`\n- **Commit:** \`${canonicalCommit}\`\n- **Runtime route:** \`app/[lang]/page.tsx -> components/CinematicLanding.tsx\`\n- **Remote:** ${safeOrigin()}\n\nThis pointer is the only canonical source entry in this catalog. Every historical HTML or Git version is a reference, not an editing target.\n`);
  writeFile(staging, 'README.md', `# KOA version catalog\n\nGenerated locally by \`scripts/build-koa-version-catalog.mjs\`; it does not copy, move, delete, publish, or rewrite a website asset.\n\n- \`canonical/CANONICAL.md\` is the one authoritative source pointer.\n- \`html/<id>/VERSION.md\` is one folder per distinct HTML file hash; duplicates point back to it.\n- \`git/<id>/VERSION.md\` is one folder per recoverable branch launcher.\n- \`assets/registry.json\` is the running hash registry. Each HTML version points to a single canonical asset occurrence by hash.\n\nRebuild into a new empty destination with:\n\n\`node .\\scripts\\build-koa-version-catalog.mjs --canonical-ref origin/main\`\n`);
  for (const version of htmlVersions) {
    const occurrences = version.occurrences.map((item) => `- \`${item.source}/${item.path}\``).join('\n');
    const assetsUsed = version.assets.length ? version.assets.map((asset) => `- \`${asset.hash.slice(0, 12)}\` -> \`${asset.canonical?.source ?? 'unresolved'}/${asset.canonical?.path ?? 'unresolved'}\``).join('\n') : '- No locally resolved image/video references.';
    writeFile(staging, `html/${version.id}/VERSION.md`, `# HTML version ${version.id}\n\n- **SHA-256:** \`${version.hash}\`\n- **Primary source:** \`${version.primary.source}/${version.primary.path}\`\n- **Bytes:** ${version.bytes}\n\n## Identical occurrences\n\n${occurrences}\n\n## Canonical asset references\n\n${assetsUsed}\n`);
  }
  for (const version of launchers) {
    writeFile(staging, `git/${version.id}/VERSION.md`, `# Git version ${markdown(version.id)}\n\n- **Ref:** \`${version.ref}\`\n- **Commit:** ${version.commit ? `\`${version.commit}\`` : 'not currently resolvable'}\n- **Existing launcher:** \`${version.launcher}\`\n\nThis is a pointer. Use the existing launcher to create a temporary detached worktree; do not edit this historical version in place.\n`);
  }
  // Windows may reject a directory rename into a newly observed parent even though
  // the destination is absent. Copy first, then remove only this run's known staging folder.
  fs.cpSync(staging, output, { recursive: true, errorOnExist: true });
  fs.rmSync(staging, { recursive: true, force: true });
  console.log(JSON.stringify({ output, canonical: catalog.canonical, counts: catalog.counts }, null, 2));
} catch (error) {
  fs.rmSync(staging, { recursive: true, force: true });
  throw error;
}
