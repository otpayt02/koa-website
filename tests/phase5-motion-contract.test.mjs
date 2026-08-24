import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => {
  const url = new URL(`../${path}`, import.meta.url);
  return existsSync(url) ? readFileSync(url, "utf8") : "";
};
const cinematic = read("components/CinematicHome.tsx");
const sealAssembly = read("components/cinematic/SealAssembly.tsx");
const header = read("components/Header.tsx");
const css = read("app/globals.css");

test("bilingual hero shares the boundaryless Karen glyph corona", () => {
  assert.match(cinematic, /cinematic-film__glyph-rays/);
  assert.match(cinematic, /SealAssembly/);
  assert.match(sealAssembly, /koa-seal-white-lettering-v2\.png/);
  assert.match(cinematic, /[\u1000-\u109f]/u);
  assert.match(css, /\.cinematic-film__glyph-rays/);
  assert.match(css, /\.cinematic-seal__annulus/);
});

test("bilingual cinematic uses normalized delayed progress instead of raw wheel distance", () => {
  assert.match(cinematic, /MAX_PROGRESS_PER_SECOND/);
  assert.match(cinematic, /SCROLL_DELAY_MS/);
  assert.match(cinematic, /advanceNormalizedProgress/);
  assert.match(cinematic, /targetProgressRef/);
  assert.match(cinematic, /chapterHoldUntilRef/);
  assert.match(css, /height:\s*1000vh/);
});

test("bilingual background has cursor-revealed, life-cycled Karen glyphs", () => {
  assert.match(cinematic, /LivingGlyphField/);
  assert.match(cinematic, /lifePhase/);
  assert.match(cinematic, /ditherThreshold/);
  assert.match(cinematic, /schoolSpeed/);
  assert.match(css, /\.cinematic-film__glyph-field/);
});

test("bilingual header breathes and expands labels without replacing menu behavior", () => {
  assert.match(header, /data-breathing-header/);
  assert.match(header, /nav-dropdown__detail/);
  assert.match(css, /\.site-header\[data-breathing-header\]/);
  assert.match(css, /\.nav-dropdown__trigger:hover[\s\S]*\.nav-dropdown__detail/);
});
