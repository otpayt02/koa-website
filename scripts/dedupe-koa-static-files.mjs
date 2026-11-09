// Collapses byte-identical static review files into NTFS hard links without changing their paths.
// Default is a plan only. Apply explicitly with: node .\scripts\dedupe-koa-static-files.mjs --apply
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogRoot = path.join(repo, 'versions', 'koa-website');
const reportPath = path.join(catalogRoot, 'deduplication-report.json');
const ignoredDirectories = new Set(['.agents', '.claude', '.git', '.github', '.hermes', '.next', '.vinext', '.vscode', 'node_modules', 'scripts', 'tests']);
const extensions = new Set(['.avif', '.css', '.gif', '.html', '.jpeg', '.jpg', '.js', '.mjs', '.mp4', '.png', '.svg', '.ttf', '.webm', '.webp', '.woff', '.woff2']);
const shouldApply = process.argv.includes('--apply');

function hash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function isPublishedStaticArtifact(rootId, relative) {
  if (rootId === 'runnable-library') return true;
  if (rootId === 'koa-website') return relative.startsWith('public/');
  return relative.startsWith('dist/') || relative.startsWith('public/');
}

function walk(rootId, root, directory = root, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) walk(rootId, root, path.join(directory, entry.name), result);
    if (!entry.isFile()) continue;
    const absolute = path.join(directory, entry.name);
    const extension = path.extname(entry.name).toLowerCase();
    if (!extensions.has(extension)) continue;
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    if (!isPublishedStaticArtifact(rootId, relative)) continue;
    result.push({ rootId, root, absolute, relative, extension, bytes: fs.statSync(absolute).size, hash: hash(absolute) });
  }
  return result;
}

function chooseRetained(candidates) {
  return [...candidates].sort((left, right) => {
    const rank = (candidate) => candidate.rootId === 'koa-website' && candidate.relative.startsWith('public/') ? 0 : candidate.rootId === 'koa-website' ? 1 : candidate.rootId === 'runnable-library' ? 3 : 2;
    return rank(left) - rank(right) || left.absolute.localeCompare(right.absolute);
  })[0];
}

function sameLink(left, right) {
  const leftStat = fs.statSync(left);
  const rightStat = fs.statSync(right);
  return leftStat.dev === rightStat.dev && leftStat.ino === rightStat.ino;
}

function isToolingPath(absolute) {
  return /\\(?:\.agents|\.claude|\.github|\.hermes|\.vscode|node_modules|scripts|tests)\\/i.test(absolute);
}

function breakHardLink(absolute) {
  const contents = fs.readFileSync(absolute);
  fs.unlinkSync(absolute);
  fs.writeFileSync(absolute, contents);
}

function repairPreviouslyLinkedTooling() {
  if (!shouldApply || !fs.existsSync(reportPath)) return [];
  const previous = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const paths = new Set();
  for (const action of previous.actions ?? []) {
    if (!['hard-linked', 'already-hard-linked'].includes(action.status)) continue;
    if (!isToolingPath(action.retained) && !isToolingPath(action.duplicate)) continue;
    paths.add(action.retained);
    paths.add(action.duplicate);
  }
  const repairs = [];
  for (const absolute of paths) {
    if (!fs.existsSync(absolute)) continue;
    breakHardLink(absolute);
    repairs.push({ path: absolute, status: 'restored-independent-copy' });
  }
  return repairs;
}

if (!fs.existsSync(path.join(catalogRoot, 'index.json'))) throw new Error(`Version catalog missing: ${catalogRoot}`);
const catalog = JSON.parse(fs.readFileSync(path.join(catalogRoot, 'index.json'), 'utf8'));
const roots = [
  ...catalog.sourceRoots.map(({ id, path: root }) => ({ id, root })),
  { id: 'runnable-library', root: path.join(catalogRoot, 'runnable') },
].filter(({ root }) => fs.existsSync(root));
const repairs = repairPreviouslyLinkedTooling();
const files = roots.flatMap(({ id, root }) => walk(id, root));
const groups = Map.groupBy(files, (file) => file.hash);
const duplicateGroups = [...groups.values()].filter((group) => group.length > 1).map((group) => {
  const retained = chooseRetained(group);
  return { hash: retained.hash, bytes: retained.bytes, retained, duplicates: group.filter((file) => file.absolute !== retained.absolute) };
});
const actions = [];
if (shouldApply) {
  for (const group of duplicateGroups) {
    for (const duplicate of group.duplicates) {
      const action = { hash: group.hash, retained: group.retained.absolute, duplicate: duplicate.absolute, status: 'planned' };
      if (path.parse(group.retained.absolute).root.toLowerCase() !== path.parse(duplicate.absolute).root.toLowerCase()) action.status = 'skipped-different-volume';
      else if (sameLink(group.retained.absolute, duplicate.absolute)) action.status = 'already-hard-linked';
      else if (hash(group.retained.absolute) !== hash(duplicate.absolute)) action.status = 'skipped-rehash-mismatch';
      else {
        // Unlink only after confirming identical content; on a link failure, restore a byte-identical file.
        fs.unlinkSync(duplicate.absolute);
        try { fs.linkSync(group.retained.absolute, duplicate.absolute); action.status = 'hard-linked'; }
        catch (error) { fs.copyFileSync(group.retained.absolute, duplicate.absolute); action.status = `restored-copy:${error.code ?? 'unknown'}`; }
      }
      actions.push(action);
    }
  }
}
const report = {
  schema: 1,
  generatedAt: new Date().toISOString(),
  mode: shouldApply ? 'applied' : 'plan',
  roots,
  summary: {
    filesScanned: files.length,
    duplicateHashGroups: duplicateGroups.length,
    duplicatePathOccurrences: duplicateGroups.reduce((total, group) => total + group.duplicates.length, 0),
    physicalStoragePolicy: 'One retained path plus NTFS hard links for every exact duplicate path on the same volume.',
  },
  groups: duplicateGroups.map((group) => ({ hash: group.hash, bytes: group.bytes, retained: { root: group.retained.rootId, path: group.retained.relative }, duplicates: group.duplicates.map((file) => ({ root: file.rootId, path: file.relative })) })),
  actions,
  repairs,
};
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report.summary, null, 2));
