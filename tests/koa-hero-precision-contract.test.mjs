import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const intro = read("components/cinematic/ScrollScrubIntro.tsx");
const header = read("components/Header.tsx");
const css = read("app/globals.css");
const numeral = read("components/cinematic/NumeralConvergence.tsx");

test("the hero uses one authentic orbit instead of reconstructed type arcs", () => {
  assert.match(intro, /className="koa-intro__authentic-orbit-image"/);
  assert.equal((intro.match(/koa-seal-white-lettering-v2\.png/g) ?? []).length, 2);
  assert.doesNotMatch(intro, /<textPath|koa-intro__orbit-label/);
  assert.match(intro, /rotate\(-360 0 0\)/);
  assert.match(intro, /addSpin\(0\.84, 0\.16, -360, "power4\.out"\)/);
});

test("the foreground K and A remain fine, precise glyph fields", () => {
  assert.match(intro, /buildMiniGlyphs\("k"\)/);
  assert.match(intro, /buildMiniGlyphs\("a"\)/);
  assert.match(intro, /count = 156/);
  assert.match(intro, /\* 12/);
  assert.match(intro, /\? 16 : spec\.variant === 1 \? 20 : 24/);
  assert.match(css, /\.koa-intro__mini-glyph[\s\S]*?stroke-width: \.12px/);
});

test("halo and ray motion stays feathered and scroll-owned", () => {
  assert.match(intro, /koa-intro-ray-blur/);
  assert.match(intro, /feGaussianBlur stdDeviation="24"/);
  assert.match(intro, /ref=\{glareRef\}/);
  assert.match(intro, /ref=\{eclipseRef\}/);
  assert.doesNotMatch(css, /animation:\s*koa-intro-ray-drift/);
});

test("the seal banner stays one row and locale routes remain prefixed", () => {
  assert.match(css, /\.nav-banner\.nav-banner--seal\s*\{[\s\S]*?flex-wrap:\s*nowrap/);
  assert.match(css, /\.nav-banner\.nav-banner--seal \.nav-banner__strip\s*\{[\s\S]*?overflow-x:\s*auto/);
  assert.match(header, /href=\{`\/\$\{lang\}\$\{tab\.href === "\/" \? "" : tab\.href\}`\}/);
  assert.match(header, /event\.currentTarget\.scrollLeft \+= event\.deltaY/);
});

test("the global chapter numeral never overlays the home hero", () => {
  assert.match(numeral, /if \(routePath === "\/"\) return/);
});
