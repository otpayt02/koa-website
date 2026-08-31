import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const catalog = JSON.parse(read("content/koa-home-copy.json"));
const header = read("components/Header.tsx");
const buildPage = read("app/[lang]/build/page.tsx");
const studio = read("components/admin/DesignStudio.tsx");
const styles = read("app/globals.css");

test("Round 2 keeps the approved mission and action order", () => {
  assert.equal(catalog.en.intro.title, "America's home for the Karen community.");
  assert.equal(catalog.en.intro.body, "Providing, combining, and inviting a national Karen voice.");
  assert.equal(catalog.en.intro.primaryLabel, "Find your way to contribute");
  assert.equal(catalog.en.intro.primaryHref, "/{lang}/contribute");
  assert.equal(catalog.en.intro.secondaryLabel, "Why KOA matters");
  assert.equal(catalog.en.intro.secondaryHref, "/{lang}/about");
});

test("Round 2 navigation exposes the five launch sections plus Build", () => {
  for (const label of ["About", "Programs", "Stories", "Impact", "Contact", "Build"]) {
    assert.match(header, new RegExp(`label: "${label}"`));
  }
  assert.match(header, /"nav-banner--single-row"/);
  assert.match(header, /coming soon/);
  assert.match(header, /#impact/);
});

test("Build is a review-gated coming-soon page with contribution routes", () => {
  assert.match(buildPage, /Coming soon · Build with KOA/);
  assert.match(buildPage, /details are ready for community review/);
  assert.match(buildPage, /Tell us what to build/);
  assert.match(buildPage, /\$\{lang\}\/contribute/);
});

test("Design Studio offers ordered temporary viewport presets", () => {
  for (const preset of ["390 × 844", "393 × 852", "768 × 1024", "1280 × 800", "1440 × 900", "Full width"]) {
    assert.match(studio, new RegExp(preset.replace("×", "×")));
  }
  assert.match(studio, /<select value=\{viewportId\}/);
  assert.match(styles, /\.nav-banner\.nav-banner--single-row/);
});
