import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const landing = read("components/CinematicLanding.tsx");
const css = read("app/cinematic-landing.css");

test("the active landing forms K and A with glyphs only", () => {
  assert.match(landing, /<KAGlyphField progress=\{progress\} reducedMotion=\{motionReduced\} \/>/);
  assert.doesNotMatch(landing, /koa-ka-outline/);
  assert.doesNotMatch(css, /\.koa-ka-outline/);
});

test("the supplied seal keeps its ring lettering above the core shadow", () => {
  const sealRule = css.match(/\.koa-film__seal\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  assert.doesNotMatch(sealRule, /filter:/);
  assert.match(css, /\.koa-film__seal \.cinematic-seal__core\s*\{[\s\S]*?filter:\s*drop-shadow/);
  assert.match(landing, /<SealAssembly rotation=\{progress \* 360\} \/>/);
});

test("the post-assembly voice statement cycles after the charter enters", () => {
  assert.match(landing, /const voiceWords = \["Uniting", "Providing", "Inviting", "Defining", "Aligning", "Deciding", "Refining", "Exciting", "Rewriting", "Applying", "Supplying", "Combining"\]/);
  assert.match(landing, /koa-film__voice-line/);
  assert.match(css, /\.koa-film\[data-phase="narrative"\] \.koa-film__voice-line/);
  assert.match(css, /@keyframes koaVoiceWord/);
});

test("the release canonical field uses bounded source particle caps and native scroll timing", () => {
  const field = read("components/cinematic/KAGlyphField.tsx");
  assert.match(field, /const count = width < 720 \? 60 : 150/);
  assert.match(field, /stiffness: 0\.045 \+ Math\.random\(\) \* 0\.05/);
  assert.match(field, /distance < 130/);
  assert.match(field, /\* 8\.5/);
  assert.match(field, /new ResizeObserver\(resize\)/);
  assert.match(field, /const rise = smooth\(\(sceneProgress - 0\.46\) \/ 0\.30\)/);
  assert.match(field, /const scatter = smooth\(\(sceneProgress - 0\.74\) \/ 0\.24\)/);
  assert.match(landing, /if \(progress < 0\.10\) return "arrival"/);
  assert.match(landing, /if \(progress < 0\.32\) return "form"/);
  assert.doesNotMatch(landing, /const landmarks = \[0\.05, 0\.50, 0\.78, 0\.88\]/);
  assert.match(css, /height: 620svh/);
});
