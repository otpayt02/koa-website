import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const output = path.join(root, "content", "translation-queue.generated.json");
const inventory = JSON.parse(fs.readFileSync(path.join(root, "content", "inventory.generated.json"), "utf8"));
const englishMessages = JSON.parse(fs.readFileSync(path.join(root, "messages", "en.json"), "utf8"));
const copyAttributes = new Set(["aria-label", "aria-description", "alt", "title", "placeholder", "label", "description", "intro", "eyebrow", "hint", "successMessage"]);
const copyProperties = new Set(["label", "title", "description", "detail", "intro", "eyebrow", "hint", "copy", "text", "question", "answer", "message", "placeholder", "successMessage", "errorMessage", "emptyMessage", "subtitle"]);
const records = [];
const seen = new Set();

function add(text, source, area, kind) {
  const cleaned = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!/[A-Za-z]/.test(cleaned) || cleaned.length < 2 || /^https?:|^mailto:|^\//.test(cleaned)) return;
  if ((cleaned.match(/[\u1000-\u109f\ua9e0-\ua9ff]/g) ?? []).length > (cleaned.match(/[A-Za-z]/g) ?? []).length) return;
  if (/^(en|th|my|ksw|karen|true|false|gold|green|red|blue|pending|approved)$/i.test(cleaned)) return;
  if (/\{[^}]*:[^}]*;|#[0-9a-f]{3,8}|\b(?:padding|background|display|font-size):/i.test(cleaned)) return;
  const identity = `${source}|${cleaned}`;
  if (seen.has(identity)) return;
  seen.add(identity);
  const id = crypto.createHash("sha256").update(identity).digest("hex").slice(0, 16);
  const tokens = [...cleaned.matchAll(/[A-Za-z]+(?:[’'-][A-Za-z]+)*/g)].map((match, index) => ({ index, en: match[0], offset: match.index }));
  records.push({ id, en: cleaned, source, area, kind, tokens, proposals: { ksw: null, th: null, my: null }, status: "unapproved", sourceStatus: "source_candidate" });
}

function areaFor(file, text) {
  const value = `${file} ${text}`.toLowerCase();
  if (/immigra|refugee|visa|asylum/.test(value)) return "immigration";
  if (/donat|gift|payment|fundrais/.test(value)) return "giving";
  if (/health|care|medical/.test(value)) return "health_and_care";
  if (/vote|civic|congress|policy|advocac|politic|democra/.test(value)) return "civic_life";
  if (/language|translat|dictionary|grammar|karen|burmese|thai/.test(value)) return "language_and_culture";
  if (/youth|school|learn|education/.test(value)) return "education_and_youth";
  if (/event|gather|calendar|community|volunteer/.test(value)) return "community_and_events";
  if (/contact|email|message|form|submit/.test(value)) return "contact_and_access";
  return "site_navigation_and_general";
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
}

function isPublic(file) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  return /\.(tsx|ts)$/.test(relative)
    && !/(^|\/)(admin|__tests__|test|tests)(\/|\.)/.test(relative)
    && !relative.endsWith(".d.ts")
    && !relative.includes("TranslationStudio")
    && !relative.includes("ReviewQueue");
}

function parentCopyContext(node) {
  let current = node.parent;
  while (current && !ts.isSourceFile(current)) {
    if (ts.isJsxAttribute(current)) return copyAttributes.has(current.name.text) ? "attribute" : null;
    if (ts.isPropertyAssignment(current)) {
      const name = current.name.getText().replace(/^['"]|['"]$/g, "");
      return copyProperties.has(name) ? "data_field" : null;
    }
    if (ts.isJsxExpression(current)) return "jsx_expression";
    current = current.parent;
  }
  return null;
}

function scan(file) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  const source = fs.readFileSync(file, "utf8");
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, relative.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function visit(node) {
    let value;
    let kind;
    if (ts.isJsxText(node)) { value = node.text; kind = "jsx_text"; }
    else if (ts.isStringLiteralLike(node)) {
      kind = parentCopyContext(node);
      if (node.parent && ts.isBinaryExpression(node.parent)) kind = null;
      if (kind) value = node.text;
    }
    if (value && kind) {
      const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
      add(value, `${relative}:${line}`, areaFor(relative, value), kind);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}

for (const [key, en] of Object.entries(englishMessages)) add(en, `messages/en.json#${key}`, areaFor(key, en), "message");
for (const item of inventory.definitions) add(item.en, `content/inventory.generated.json#${item.key}`, areaFor(`${item.route}/${item.section}`, item.en), "catalog");
for (const [relative, callName, argumentIndex] of [["content/catalog.ts", "define", 4], ["components/i18n.ts", "pageLabel", 0]]) {
  const source = fs.readFileSync(path.join(root, relative), "utf8");
  const ast = ts.createSourceFile(relative, source, ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === callName) {
      const value = node.arguments[argumentIndex];
      if (value && ts.isStringLiteralLike(value)) {
        const line = ast.getLineAndCharacterOfPosition(value.getStart(ast)).line + 1;
        add(value.text, `${relative}:${line}`, areaFor(relative, value.text), "catalog_source");
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}
for (const file of [...walk(path.join(root, "app", "[lang]")), ...walk(path.join(root, "components"))].filter(isPublic)) scan(file);

const words = new Map();
for (const sentence of records) {
  for (const token of sentence.tokens) {
    const word = token.en;
    const key = `${word.toLocaleLowerCase("en-US")}|${sentence.area}`;
    const item = words.get(key) ?? { en: word.toLocaleLowerCase("en-US"), area: sentence.area, proposals: { ksw: null, th: null, my: null }, status: "unapproved", occurrences: [] };
    item.occurrences.push({ sentenceId: sentence.id, tokenIndex: token.index, source: sentence.source, form: word });
    words.set(key, item);
  }
}

records.sort((a, b) => a.source.localeCompare(b.source) || a.en.localeCompare(b.en));
const payload = { version: 1, generatedFrom: "public source and existing catalog", policy: "Proposal queue only. No generated or dictionary-sourced text is approved for publication or training.", sentences: records, words: [...words.values()].sort((a, b) => a.area.localeCompare(b.area) || a.en.localeCompare(b.en)) };
const serialized = [
  "{",
  `"version":${payload.version},`,
  `"generatedFrom":${JSON.stringify(payload.generatedFrom)},`,
  `"policy":${JSON.stringify(payload.policy)},`,
  '"sentences":[',
  ...payload.sentences.map((entry, index) => `${JSON.stringify(entry)}${index < payload.sentences.length - 1 ? "," : ""}`),
  '],"words":[',
  ...payload.words.map((entry, index) => `${JSON.stringify(entry)}${index < payload.words.length - 1 ? "," : ""}`),
  "]}",
  "",
].join("\n");
if (process.argv.includes("--check")) {
  if (!fs.existsSync(output) || fs.readFileSync(output, "utf8") !== serialized) { console.error("Translation queue is stale; run npm run translation:queue."); process.exitCode = 1; }
  else console.log(`Translation queue current: ${records.length} text candidates, ${words.size} context-specific word pairs.`);
} else {
  fs.writeFileSync(output, serialized);
  console.log(`Queued ${records.length} text candidates and ${words.size} context-specific word pairs as unapproved.`);
}
