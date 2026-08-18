import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const workspace = process.cwd();
const catalogPath = path.join(workspace, "content", "catalog.ts");
const outputPath = path.join(workspace, "content", "inventory.generated.json");
const attributeNames = new Set(["aria-label", "placeholder", "title", "label", "description", "intro", "eyebrow", "hint", "successMessage"]);
const ignoredFiles = new Set([
  "components/TranslationStudio.tsx",
  "components/LogViewer.tsx",
  "components/ReviewQueue.tsx",
  "app/[lang]/admin/page.tsx",
  "app/[lang]/admin/translations/page.tsx",
]);

const manual = readManualDefinitions();
const files = ["app/[lang]", "components"].flatMap((root) => walk(path.join(workspace, root)))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => path.relative(workspace, file).replaceAll("\\", "/"))
  .filter((file) => !ignoredFiles.has(file));
const candidates = [];

for (const file of files) extractFile(file);

const definitions = [];
const bindings = [];
const seenDefinitionKeys = new Set(manual.map((entry) => entry.key));
const occurrences = new Map();
const definitionOccurrences = new Map();

for (const candidate of candidates) {
  const manualEntry = manual.find((entry) => (entry.route === candidate.route || entry.route === "*") && entry.en === candidate.en);
  const definitionOccurrenceKey = `${candidate.file}|${candidate.kind}|${candidate.attribute ?? ""}|${candidate.en}`;
  const definitionOccurrence = definitionOccurrences.get(definitionOccurrenceKey) ?? 0;
  definitionOccurrences.set(definitionOccurrenceKey, definitionOccurrence + 1);
  const key = manualEntry?.key ?? generatedKey(candidate, definitionOccurrence);
  if (!manualEntry && !seenDefinitionKeys.has(key)) {
    definitions.push({
      key,
      route: candidate.route,
      section: candidate.section,
      type: candidate.type,
      en: candidate.en,
      karen: candidate.karen,
    });
    seenDefinitionKeys.add(key);
  }
  const enOccurrenceKey = `${candidate.route}|${candidate.kind}|${candidate.attribute ?? ""}|en|${candidate.en}`;
  const karenBase = candidate.karen || candidate.en;
  const karenOccurrenceKey = `${candidate.route}|${candidate.kind}|${candidate.attribute ?? ""}|karen|${karenBase}`;
  const occurrence = {
    en: occurrences.get(enOccurrenceKey) ?? 0,
    karen: occurrences.get(karenOccurrenceKey) ?? 0,
  };
  occurrences.set(enOccurrenceKey, occurrence.en + 1);
  occurrences.set(karenOccurrenceKey, occurrence.karen + 1);
  bindings.push({ key, route: candidate.route, kind: candidate.kind, ...(candidate.attribute ? { attribute: candidate.attribute } : {}), en: candidate.en, karen: candidate.karen, occurrence });
}

const serialized = `${JSON.stringify({ version: 1, definitions, bindings }, null, 2)}\n`;
if (process.argv.includes("--check")) {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
  if (current !== serialized) {
    console.error("The bilingual content inventory is stale. Run npm run content:generate.");
    process.exitCode = 1;
  } else {
    console.log(`Bilingual content inventory is current (${definitions.length} generated definitions, ${bindings.length} bindings).`);
  }
} else {
  fs.writeFileSync(outputPath, serialized, "utf8");
  console.log(`Generated ${definitions.length} additional definitions and ${bindings.length} DOM bindings.`);
}

function readManualDefinitions() {
  const source = fs.readFileSync(catalogPath, "utf8");
  const file = ts.createSourceFile(catalogPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const entries = [];
  visit(file, (node) => {
    if (!ts.isCallExpression(node) || !ts.isIdentifier(node.expression) || node.expression.text !== "define") return;
    const [key, route, , , en, karen] = node.arguments;
    if (![key, route, en].every((item) => item && ts.isStringLiteralLike(item))) return;
    entries.push({ key: key.text, route: route.text, en: decode(en.text), karen: karen && ts.isStringLiteralLike(karen) ? decode(karen.text) : "" });
  });
  const enMessages = JSON.parse(fs.readFileSync(path.join(workspace, "messages", "en.json"), "utf8"));
  const karenMessages = JSON.parse(fs.readFileSync(path.join(workspace, "messages", "karen.json"), "utf8"));
  for (const [key, en] of Object.entries(enMessages)) entries.push({ key: `shell.${key}`, route: "*", en, karen: karenMessages[key] ?? "" });
  return entries;
}

function extractFile(relativeFile) {
  const absolute = path.join(workspace, relativeFile);
  const source = fs.readFileSync(absolute, "utf8");
  const file = ts.createSourceFile(absolute, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const route = routeFor(relativeFile);
  const section = relativeFile.startsWith("components/") ? path.basename(relativeFile, ".tsx") : route === "/" ? "Home" : route;

  function scan(node) {
    if (ts.isConditionalExpression(node) && /\blang\b/.test(node.condition.getText(file))) {
      const whenTrue = literalText(node.whenTrue);
      const whenFalse = literalText(node.whenFalse);
      if (whenTrue && whenFalse) {
        const attribute = jsxAttributeAncestor(node);
        addCandidate(node, whenFalse, whenTrue, attribute);
        return;
      }
    }
    if (ts.isJsxText(node)) addCandidate(node, node.text, "", undefined);
    if (ts.isJsxAttribute(node) && attributeNames.has(node.name.text) && node.initializer && ts.isStringLiteral(node.initializer)) {
      addCandidate(node, node.initializer.text, "", node.name.text);
    }
    ts.forEachChild(node, scan);
  }

  function addCandidate(node, english, karen, attribute) {
    const en = normalize(english);
    const ksw = normalize(karen);
    if (!isContent(en, node)) return;
    const normalizedAttribute = ["aria-label", "placeholder", "title"].includes(attribute) ? attribute : undefined;
    const tag = jsxTag(node);
    candidates.push({
      file: relativeFile,
      route,
      section,
      en,
      karen: ksw,
      kind: normalizedAttribute ? "attribute" : "text",
      attribute: normalizedAttribute,
      type: contentType(tag, attribute),
      position: node.getStart(file),
    });
  }

  scan(file);
}

function isContent(text, node) {
  if (!text || text.length < 2 || !/[A-Za-z]/.test(text)) return false;
  if (/^(true|false|full|reduced|green|gold|blue|red|pending|approved)$/i.test(text)) return false;
  if (/^https?:|^\/|^[\w.-]+@[\w.-]+$/.test(text)) return false;
  const tag = jsxTag(node);
  if (tag === "time" || tag === "code") return false;
  return true;
}

function generatedKey(candidate, occurrence) {
  const route = candidate.route === "/" ? "home" : candidate.route.replaceAll(/[\[\]\/]+/g, ".").replace(/^\.|\.$/g, "");
  const semantic = candidate.en.toLocaleLowerCase().replaceAll(/[^a-z0-9]+/g, " ").trim().split(" ").slice(0, 6).map((word, index) => index ? word[0].toUpperCase() + word.slice(1) : word).join("") || "content";
  const hash = crypto.createHash("sha1").update(`${candidate.file}|${candidate.kind}|${candidate.attribute ?? ""}|${occurrence}|${candidate.en}`).digest("hex").slice(0, 8);
  return `auto.${route}.${semantic}.${hash}`;
}

function routeFor(file) {
  if (file.startsWith("components/")) return "*";
  const route = file.replace(/^app\/\[lang\]/, "").replace(/\/page\.tsx$/, "").replace(/^page\.tsx$/, "");
  return route ? `/${route}` : "/";
}

function contentType(tag, attribute) {
  if (attribute === "aria-label" || attribute === "title") return "tooltip";
  if (attribute === "label" || attribute === "placeholder" || attribute === "eyebrow" || tag === "label" || tag === "option") return "label";
  if (/^h[1-6]$/.test(tag)) return "heading";
  if (tag === "button" || tag === "a") return "action";
  if (tag === "small" || tag === "strong" || tag === "span") return "label";
  return "paragraph";
}

function jsxTag(node) {
  let current = node.parent;
  while (current) {
    if (ts.isJsxElement(current)) return current.openingElement.tagName.getText();
    if (ts.isJsxSelfClosingElement(current)) return current.tagName.getText();
    current = current.parent;
  }
  return "";
}

function jsxAttributeAncestor(node) {
  let current = node.parent;
  while (current && !ts.isJsxAttribute(current)) current = current.parent;
  return current && ts.isJsxAttribute(current) ? current.name.text : undefined;
}

function literalText(node) {
  return ts.isStringLiteralLike(node) ? node.text : undefined;
}

function normalize(value) {
  return decode(String(value ?? "").replace(/\s+/g, " ").trim());
}

function decode(value) {
  return value.replaceAll("&apos;", "'").replaceAll("&quot;", '"').replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
}

function visit(node, callback) {
  callback(node);
  ts.forEachChild(node, (child) => visit(child, callback));
}
