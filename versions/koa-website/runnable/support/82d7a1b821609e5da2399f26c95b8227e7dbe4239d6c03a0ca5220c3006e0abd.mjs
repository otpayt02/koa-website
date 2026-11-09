import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

test("the private Translation Studio is server-authorized and exposes no client secret gate", () => {
  const page = read("app", "[lang]", "admin", "translations", "page.tsx");
  const api = read("app", "api", "admin", "translations", "route.ts");
  const auth = read("lib", "auth.ts");
  const client = read("components", "TranslationStudio.tsx");

  assert.match(page, /requireAdminPage/);
  assert.match(api, /requireAnyRole\(request, \["admin"\]\)/g);
  assert.match(auth, /KOA_ADMIN_USER_IDS/);
  assert.match(auth, /KOA_ADMIN_EMAILS/);
  assert.doesNotMatch(client, /KOA_ADMIN_|query-string token|shared password/i);
});

test("the content inventory covers rendered legacy copy with stable, unique keys", () => {
  const inventory = JSON.parse(read("content", "inventory.generated.json"));
  const catalog = read("content", "catalog.ts");
  const englishMessages = JSON.parse(read("messages", "en.json"));
  const manualKeys = new Set([...catalog.matchAll(/define\("([^"]+)"/g)].map((match) => match[1]));
  for (const key of Object.keys(englishMessages)) manualKeys.add(`shell.${key}`);
  const generatedKeys = inventory.definitions.map((entry) => entry.key);
  const allKeys = new Set([...manualKeys, ...generatedKeys]);

  assert.ok(inventory.definitions.length >= 250, "Expected a comprehensive generated content inventory");
  assert.ok(inventory.bindings.length >= 250, "Expected DOM bindings for legacy visitor-facing copy");
  assert.equal(new Set(generatedKeys).size, generatedKeys.length, "Generated content keys must be unique");
  for (const binding of inventory.bindings) {
    assert.ok(allKeys.has(binding.key), `Binding references missing content key ${binding.key}`);
    assert.ok(["text", "attribute"].includes(binding.kind));
  }
  assert.ok(inventory.bindings.some((binding) => binding.kind === "attribute" && binding.attribute === "aria-label"));
  assert.ok(inventory.bindings.some((binding) => binding.kind === "attribute" && binding.attribute === "placeholder"));
});

test("drafts use immutable revisions and publication uses a D1 batch", () => {
  const schema = read("db", "schema.ts");
  const service = read("lib", "translation-studio.ts");
  const migrations = read("drizzle", "0001_slippery_roulette.sql");

  for (const table of ["content_translation_revisions", "content_translation_publications", "translation_publication_batches"]) {
    assert.match(schema, new RegExp(`["']${table}["']`));
    assert.ok(migrations.includes("CREATE TABLE `" + table + "`"), `Migration must create ${table}`);
  }
  assert.match(service, /binding\.batch\(statements\)/);
  assert.match(service, /changed after the publication review opened/);
  assert.match(service, /needs both counterparts before it can be verified and published/);
  assert.match(service, /content_translation\.session_published/);
});

test("keyboard authoring saves on Tab, preserves Enter, and keeps an explicit accessible edit path", () => {
  const studio = read("components", "TranslationStudio.tsx");
  assert.match(studio, /event\.key === "Tab"/);
  assert.match(studio, /event\.shiftKey \? -1 : 1/);
  assert.doesNotMatch(studio, /event\.key === "Enter"[\s\S]{0,120}saveEntry/);
  assert.match(studio, /onDoubleClick=\{\(\) => openEntry\(entry\)\}/);
  assert.match(studio, />Edit<\/button>/);
  assert.match(studio, /"Save & next"/);
});

test("reader language controls use the S'gaw endonym, beta label, preference cookie, and ksw document tag", () => {
  const toggle = read("components", "LanguageToggle.tsx");
  const home = read("app", "page.tsx");
  const proxy = read("proxy.ts");
  const layout = read("app", "layout.tsx");

  assert.match(toggle, /ကညီကျိာ်/u);
  assert.match(toggle, />BETA</);
  assert.match(toggle, /koa-language/);
  assert.match(home, /cookies\(\)/);
  assert.match(home, /preference === "karen"/);
  assert.match(proxy, /x-koa-document-language/);
  assert.match(layout, /language.*=== "ksw"/);
});

test("exports separate complete backups from verified clean corpora and imports require preview", () => {
  const service = read("lib", "translation-studio.ts");
  const studio = read("components", "TranslationStudio.tsx");
  assert.match(service, /koa-bilingual-backup/);
  assert.match(service, /publicationBatchId/);
  assert.match(service, /contentTranslationPublications/);
  assert.match(studio, /Import comparison/);
  assert.match(studio, /It never silently publishes or overwrites work/);
  assert.match(studio, /Import as drafts/);
});
