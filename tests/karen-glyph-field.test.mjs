import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const field = readFileSync(new URL("../components/KarenGlyphField.tsx", import.meta.url), "utf8");
const hook = readFileSync(new URL("../hooks/useNormalizedScroll.ts", import.meta.url), "utf8");

test("KarenGlyphField is a bounded background canvas with S'gaw codepoints and a normalized scroll hook", () => {
  assert.match(field, /String\.fromCodePoint\(0xa9e0 \+ index\)/);
  assert.match(field, /const GLYPHS = \[\.\.\.KAREN_CODEPOINTS, "K", "O", "A"\]/);
  assert.match(field, /useNormalizedScroll/);
  assert.match(field, /className="karen-glyph-field"/);
  assert.doesNotMatch(field, /document\.createElement\("div"/);
  assert.match(hook, /window\.requestAnimationFrame/);
});

test("ambient motion stays dispersed, cursor-led, lifecycle-bound, adaptive, and forms sparse Burmese numerals", () => {
  assert.match(field, /const NUMERALS = \["၁", "၂", "၃", "၄"\]/);
  assert.match(field, /function sampleNumeral/);
  assert.match(field, /points\.filter\(\(_, index\) => index % 3 === 0\)/);
  assert.match(field, /20000 \+ seeded\(seed, 8\) \* 20000/);
  assert.match(field, /age \/ 2000/);
  assert.match(field, /particle\.lifeMs - age\) \/ 3000/);
  assert.match(field, /cursorDistance[\s\S]*?150/);
  assert.match(field, /tangentX/);
  assert.match(field, /perlinNoise2d/);
  assert.match(field, /easeOutQuint/);
  assert.match(field, /Math\.sin\(now \* 0\.0011\) \* 0\.02/);
  assert.match(field, /particleCap/);
  assert.match(field, /window\.devicePixelRatio.*42 : 60/);
  assert.match(field, /spawnRainColumn/);
  assert.match(field, /const rainLimit = width < 720 \? 4 : 7/);
  assert.match(field, /scrollVelocity > 3/);
  assert.match(field, /new ResizeObserver\(resize\)/);
  assert.match(field, /slowFrames > 45/);
  assert.match(field, /quality = Math\.max\(0\.54/);
  assert.match(field, /document\.hidden/);
});
