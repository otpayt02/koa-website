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

test("the post-assembly voice statement cycles inside the pinned scene", () => {
  assert.match(landing, /const voiceWords = \["Providing", "Combining", "Inviting"\]/);
  assert.match(landing, /koa-film__voice-line/);
  assert.match(css, /\.koa-film\[data-phase="release"\] \.koa-film__voice-line/);
  assert.match(css, /@keyframes koaVoiceWord/);
});
