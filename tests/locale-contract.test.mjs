import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (...segments) => readFileSync(resolve(repositoryRoot, ...segments), "utf8");

function jsonKeys(name) {
  return Object.keys(JSON.parse(read("messages", name))).sort();
}

test("the canonical locale registry contains English, Thai, Burmese, and S'gaw Karen", () => {
  const i18n = read("components", "i18n.ts");

  assert.match(i18n, /languages\s*=\s*\[\s*["']en["']\s*,\s*["']th["']\s*,\s*["']my["']\s*,\s*["']ksw["']\s*\]\s*as const/);
  assert.match(i18n, /export const localeMeta/);
  for (const locale of ["en", "th", "my", "ksw"]) {
    assert.match(i18n, new RegExp(`\\b${locale}:\\s*\\{[^}]*htmlLang:\\s*["']${locale}["']`));
  }
});

test("every locale catalog has the same message shape as English", () => {
  const englishKeys = jsonKeys("en.json");

  for (const catalog of ["th.json", "my.json", "ksw.json"]) {
    assert.deepEqual(jsonKeys(catalog), englishKeys, `${catalog} must match en.json`);
  }
});

test("non-English locale catalogs remain proposals for human review", () => {
  const i18n = read("components", "i18n.ts");

  assert.match(i18n, /localeReviewStatus\s*=\s*\{[^}]*en:\s*["']source["'][^}]*th:\s*["']proposal["'][^}]*my:\s*["']proposal["'][^}]*ksw:\s*["']proposal["']/s);
  assert.doesNotMatch(i18n, /trainingApproved|approvedForTraining/);
});

test("root, static params, and sitemap share the canonical locale boundary", () => {
  const defaultRootPage = read("app", "(default)", "page.tsx");
  const defaultRootLayout = read("app", "(default)", "layout.tsx");
  const languageLayout = read("app", "[lang]", "layout.tsx");
  const sitemap = read("app", "sitemap.ts");

  assert.equal(existsSync(resolve(repositoryRoot, "app", "layout.tsx")), false);
  assert.equal(existsSync(resolve(repositoryRoot, "app", "page.tsx")), false);
  assert.match(defaultRootPage, /redirect\(["']\/en["']\)/);
  assert.doesNotMatch(defaultRootPage, /\/koa\//);
  assert.match(defaultRootLayout, /<html\s+lang=["']en["']/);
  assert.match(languageLayout, /import\s*\{[^}]*languages[^}]*localeMeta[^}]*\}\s*from\s*["']@\/components\/i18n["']/s);
  assert.match(languageLayout, /languages\.map\(\(lang\)\s*=>\s*\(\{\s*lang\s*\}\)\)/);
  assert.match(languageLayout, /<html\s+lang=\{localeMeta\[value\]\.htmlLang\}/);
  assert.doesNotMatch(languageLayout, /supportedLanguages\s*=/);
  assert.match(sitemap, /import\s*\{[^}]*languages[^}]*\}\s*from\s*["']@\/components\/i18n["']/);
  assert.match(sitemap, /languages\.flatMap/);
});

test("route-aware metadata is generated from one locale registry-backed helper", () => {
  const helper = read("lib", "locale-metadata.ts");

  assert.match(helper, /import\s*\{[^}]*languages[^}]*localeMeta[^}]*\}\s*from\s*["']@\/components\/i18n["']/s);
  assert.match(helper, /localizedAlternates/);
  assert.match(helper, /languages\.map\(/);

  for (const [route, file] of [
    ["", ["app", "[lang]", "page.tsx"]],
    ["about", ["app", "[lang]", "about", "page.tsx"]],
    ["services", ["app", "[lang]", "services", "page.tsx"]],
    ["community", ["app", "[lang]", "community", "page.tsx"]],
    ["contact", ["app", "[lang]", "contact", "page.tsx"]],
    ["dictionary", ["app", "[lang]", "dictionary", "page.tsx"]],
    ["contribute", ["app", "[lang]", "contribute", "page.tsx"]],
    ["translation", ["app", "[lang]", "translation", "page.tsx"]],
    ["collaborate", ["app", "[lang]", "collaborate", "page.tsx"]],
    ["community/board", ["app", "[lang]", "community", "board", "page.tsx"]],
    ["changelog", ["app", "[lang]", "changelog", "page.tsx"]],
    ["ai", ["app", "[lang]", "ai", "page.tsx"]],
    ["music", ["app", "[lang]", "music", "page.tsx"]],
  ]) {
    const page = read(...file);
    assert.match(page, /localizedPageMetadata/, `${route || "home"} must use localizedPageMetadata`);
    assert.match(page, new RegExp(`localizedPageMetadata\\(params,\\s*["']${route.replace("/", "\\/")}["']`));
  }
});

test("robots derives all locale roots and admin exclusions from the canonical registry", () => {
  const robots = read("app", "robots.ts");

  assert.match(robots, /import\s*\{[^}]*languages[^}]*\}\s*from\s*["']@\/components\/i18n["']/);
  assert.match(robots, /languages\.map\(/);
  assert.doesNotMatch(robots, /["']\/karen(?:\/admin)?["']/);
});

test("the language pivot exposes four accessible links and preserves the route remainder", () => {
  const toggle = read("components", "LanguageToggle.tsx");

  assert.match(toggle, /languages\.map\(/);
  assert.match(toggle, /localeMeta\[/);
  assert.match(toggle, /pathname\.replace\(localePrefix/);
  assert.match(toggle, /languages\.join\(["']\|["']\)/);
  assert.match(toggle, /aria-current=/);
});

test("public React navigation no longer links to the legacy /koa/ runtime", () => {
  const header = read("components", "Header.tsx");
  const languageLayout = read("app", "[lang]", "layout.tsx");

  assert.doesNotMatch(header, /href=["']\/koa\//);
  assert.doesNotMatch(languageLayout, /href=["']\/koa\//);
  assert.doesNotMatch(languageLayout, /preview-mode-bar|Bilingual preview mode/);
});

test("rendered checks exercise all four canonical locale routes", () => {
  const rendered = read("tests", "rendered-bilingual.test.mjs");

  assert.match(rendered, /\[\s*["']en["']\s*,\s*["']th["']\s*,\s*["']my["']\s*,\s*["']ksw["']\s*\]/);
  assert.doesNotMatch(rendered, /["']karen["']\.map/);
});
