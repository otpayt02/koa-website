import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readRequired = (...segments) => {
  const path = resolve(repositoryRoot, ...segments);
  assert.ok(existsSync(path), `${segments.join("/")} must exist`);
  return readFileSync(path, "utf8");
};

test("partner records expose the complete reviewable provenance shape", () => {
  const partners = readRequired("content", "partners.ts");
  for (const field of [
    "id",
    "name",
    "relationshipStatus",
    "logoPath",
    "logoSource",
    "logoPermission",
    "url",
    "reviewStatus",
  ]) {
    assert.match(partners, new RegExp(`\\b${field}\\??\\s*:`), `PartnerRecord must declare ${field}`);
  }
  assert.match(partners, /export\s+const\s+partners\s*:\s*PartnerRecord\[\]/);
});

test("the public policy requires all three independent approval gates", () => {
  const partners = readRequired("content", "partners.ts");
  assert.match(partners, /relationshipStatus\s*===\s*["']verified["']/);
  assert.match(partners, /logoPermission\s*===\s*["']approved["']/);
  assert.match(partners, /reviewStatus\s*===\s*["']approved["']/);
  assert.match(partners, /publicPartners\s*=\s*partners\.filter\s*\(\s*isPublicPartner\s*\)/);
});

test("the public boundary renders only eligible records and hides loop duplicates", () => {
  const component = readRequired("components", "cinematic", "PartnerMarquee.tsx");
  const home = readRequired("components", "CinematicHome.tsx");
  assert.match(component, /publicPartners\.length\s*===\s*0/);
  assert.match(component, /return\s+null/);
  assert.match(component, /direction=["']forward["']/);
  assert.match(component, /direction=["']reverse["']/);
  assert.match(component, /data-partner-row=\{direction\}/);
  assert.match(component, /<PartnerSequence\s+records=\{records\}\s+duplicate\s*\/>/);
  assert.match(component, /aria-hidden=\{duplicate\s*\?\s*["']true["']/);
  assert.doesNotMatch(component, /from\s+["']motion\//);
  assert.match(home, /import\s*\{\s*PartnerMarquee\s*\}/);
  assert.match(home, /<PartnerMarquee\b[^>]*\/>/);
});

test("partner motion is autonomous, opposite, pausable, and static when motion is reduced", () => {
  const styles = readRequired("app", "globals.css");
  assert.match(styles, /@keyframes\s+partner-marquee-forward/);
  assert.match(styles, /@keyframes\s+partner-marquee-reverse/);
  assert.match(styles, /\[data-partner-row=["']forward["']\][\s\S]*animation:\s*partner-marquee-forward/);
  assert.match(styles, /\[data-partner-row=["']reverse["']\][\s\S]*animation:\s*partner-marquee-reverse/);
  assert.match(styles, /partner-marquee[^,{]*:(?:hover|focus-within)[\s\S]*animation-play-state:\s*paused/);
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*partner-marquee/);
  assert.match(styles, /\.cinematic-film\[data-motion=["']reduced["']\][\s\S]*partner-marquee/);
  assert.match(styles, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(styles, /@media\s*\(max-width:[^)]+\)[\s\S]*grid-template-columns:\s*1fr/);
});

test("Design Studio explains the public empty state without inventing partners", () => {
  const studio = readRequired("components", "admin", "DesignStudio.tsx");
  assert.match(studio, /Partner review/i);
  assert.match(studio, /No partner records are ready for public display/i);
  assert.match(studio, /verified relationship/i);
  assert.match(studio, /approved logo-use permission/i);
});
