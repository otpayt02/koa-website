import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const html = read("public/koa/index.html");
const css = read("public/koa/storytelling.css");
const js = read("public/koa/storytelling.js");

test("hero reserves the O for the seal and hands it to an empty header slot", () => {
  assert.match(html, /class="home-cinema"/);
  assert.match(html, /data-brand-mark/);
  assert.match(html, /data-logo-flight/);
  assert.match(html, /data-hero-seal/);
  assert.match(js, /samplePoints\("K"/);
  assert.match(js, /samplePoints\("A"/);
  assert.doesNotMatch(js, /samplePoints\("KOA"/);
  assert.match(js, /getBoundingClientRect\(\)/);
  assert.match(js, /easeInOutQuint/);
});

test("film exposes Burmese chapter numerals and corner glyph anchors", () => {
  for (const numeral of ["၁", "၂", "၃", "၄", "၅"]) {
    assert.match(html, new RegExp(`<li><span>${numeral}</span></li>`));
  }
  assert.equal((html.match(/data-glyph-anchor=/g) || []).length, 5);
  assert.match(js, /cornerPoint/);
  assert.match(js, /formLoom\(num, false, anchor\)/);
});

test("the five animation techniques and reduced-motion fallback remain present", () => {
  assert.match(js, /window\.scrollY/); // scroll tracking
  assert.match(js, /IntersectionObserver/); // viewport detection
  assert.match(css, /position:\s*sticky/); // sticky positioning
  assert.match(css, /cubic-bezier/); // easing
  assert.match(js, /className = "aw"/); // text splitting/assembly
  assert.match(js, /MotionMath\.lerp/);
  assert.match(js, /createSeededRandom/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /body\[data-motion="off"\]/);
  assert.match(js, /settleMotionContent/);
});

test("phase 2 completes the glyph O, sunshine, reading, and numeral choreography", () => {
  assert.match(html, /data-glyph-o-stage/);
  assert.match(html, /data-reading-corridor/);
  assert.ok((html.match(/data-glyph-occlude/g) || []).length >= 12);
  for (const numeral of ["1", "2", "3", "4", "5"]) {
    assert.match(html, new RegExp(`data-arabic="${numeral}"`));
  }
  assert.match(js, /arrivalRole/);
  assert.match(js, /setArrivalOProgress/);
  assert.match(js, /smoothDirectionRetarget/);
  assert.match(js, /--ray-intensity/);
  assert.match(js, /updateReadingCorridor/);
  assert.match(js, /is-arabic-flash/);
  assert.match(js, /is-mission/);
  assert.match(css, /\.halo-sunshine/);
  assert.match(css, /\.reading-corridor/);
  assert.match(css, /\.chapter-bg-num::after/);
  assert.match(css, /body\[data-motion="off"\] \.chapter-bg-num::after/);
});

test("phase 3 slows the living-seal arrival and upgrades the woven identity frame", () => {
  assert.match(html, /data-seal-orbit/);
  assert.match(html, /data-wordmark-reference/);
  assert.doesNotMatch(html, /chapter-bg-num--prologue[^>]*>KOA</);
  assert.match(html, /Noto\+Serif\+Myanmar/);
  assert.match(js, /var motionOn = true/);
  assert.match(js, /SCROLL_LAG_MS = 3000/);
  assert.match(js, /readBufferedScrollTarget/);
  assert.match(js, /--seal-orbit/);
  assert.match(js, /--seal-scale/);
  assert.match(css, /\.seal-orbit-type/);
  assert.match(css, /\.header::before/);
  assert.match(css, /height:\s*520vh/);
  assert.match(css, /--red-bright/);
});

test("phase 4 gives the navigation cinematic and hover expansion states", () => {
  assert.match(html, /data-breathing-nav/);
  assert.ok((html.match(/class="nav-label"/g) || []).length >= 7);
  assert.ok((html.match(/class="nav-detail"/g) || []).length >= 7);
  assert.match(js, /is-cinematic-complete/);
  assert.match(js, /pa\s*>?=\s*0\.965/);
  assert.match(css, /\.header\.is-cinematic-complete\s+\.nav/);
  assert.match(css, /\.nav\[data-breathing-nav\]:hover/);
  assert.match(css, /\.nav a:hover \.nav-detail/);
  assert.match(css, /--ease-breath/);
});

test("phase 4 commitment loom is truthful, interactive, and reduced-motion safe", () => {
  assert.match(html, /data-commitment-loom/);
  assert.equal((html.match(/data-commitment-trigger/g) || []).length, 3);
  assert.equal((html.match(/data-commitment-panel/g) || []).length, 3);
  assert.match(html, /Declared/);
  assert.match(html, /In development/);
  assert.match(html, /Invitation open/);
  assert.match(js, /aria-expanded/);
  assert.match(js, /--loom-x/);
  assert.match(css, /\.commitment-loom/);
  assert.match(css, /\.commitment-item\.is-open/);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*\.commitment-loom/);
  assert.match(css, /body\[data-motion="off"\][\s\S]*\.commitment-loom/);
  assert.ok(
    js.indexOf('root.querySelectorAll("[data-reveal-stagger]")') <
      js.indexOf('var revealEls = root.querySelectorAll("[data-reveal]")'),
    "staggered children must be registered before reveal targets are collected",
  );
});

test("phase 5 renders a boundaryless bilingual living corona", () => {
  assert.match(html, /data-glyph-corona/);
  assert.match(html, /data-corona-rays/);
  assert.match(html, /seal-orbit-type__karen/);
  assert.match(html, /[\u1000-\u109f]/u);
  assert.match(js, /buildCoronaGlyphRays/);
  assert.match(css, /\.halo-glyph-rays/);
  assert.match(css, /radial-gradient[\s\S]*transparent/);
  assert.doesNotMatch(css, /\.halo-ring--1[\s\S]{0,180}border-top-color/);
});

test("phase 5 living-water field supports dither reveal and life-cycled schools", () => {
  assert.match(js, /cursorReveal/);
  assert.match(js, /ditherThreshold/);
  assert.match(js, /lifePhase/);
  assert.match(js, /schoolSpeed/);
  assert.match(js, /respawnAmbientGlyph/);
  assert.match(js, /isOccluded/);
});

test("phase 5 normalizes cinematic progress and gives chapter convergences a hold", () => {
  assert.match(js, /MAX_PROGRESS_PER_SECOND/);
  assert.match(js, /advanceNormalizedProgress/);
  assert.match(js, /CHAPTER_HOLD_MS/);
  assert.match(js, /chapterHoldUntil/);
  assert.match(js, /GlyphStage\.formLoom\(num, false, anchor\)/);
  assert.match(css, /\.film\s*\{\s*height:\s*1800vh/);
});
