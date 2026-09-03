import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => {
  const url = new URL(`../${path}`, import.meta.url);
  return existsSync(url) ? readFileSync(url, "utf8") : "";
};

const assembly = read("components/cinematic/SealAssembly.tsx");
const cinematic = read("components/CinematicHome.tsx");
const livingGlyphField = read("components/cinematic/LivingGlyphField.tsx");
const dictionaryEntry = read("components/DictionaryEntry.tsx");
const intro = read("components/KOALogoIntro.tsx");
const css = read("app/globals.css");

test("the seal core and annulus come from the one supplied KOA identity asset", () => {
  assert.match(assembly, /className="cinematic-seal"/);
  assert.match(assembly, /className="cinematic-seal__core"/);
  assert.match(assembly, /className="cinematic-seal__annulus"/);
  assert.equal(
    (assembly.match(/src="\/koa\/assets\/koa-seal-white-lettering-v2\.png"/g) || []).length,
    2,
  );
  assert.doesNotMatch(assembly, /src="(?!\/koa\/assets\/koa-seal-white-lettering-v2\.png)[^"]+"/);
});

test("the duplicate orbit copy is removed while one semantic KOA identity remains", () => {
  assert.match(cinematic, /<SealAssembly rotation=\{-360\} \/>/);
  assert.doesNotMatch(cinematic, /cinematic-film__glyph-rays|cinematic-film__ka-outline/);
  assert.doesNotMatch(cinematic, /<textPath\b/);
  assert.doesNotMatch(cinematic, /cinematic-film__orbit/);
  assert.doesNotMatch(cinematic, /KAREN ORGANIZATION OF AMERICA/);
  assert.equal((cinematic.match(/Karen Organization of America/g) || []).length, 1);
  assert.match(assembly, /aria-hidden="true"/);
});

test("co-centered complementary masks isolate the core and rotating annulus", () => {
  assert.match(css, /\.cinematic-seal\s*\{[\s\S]*?--seal-size:\s*100%/);
  assert.match(css, /\.cinematic-seal__core,\s*\.cinematic-seal__annulus\s*\{[\s\S]*?inset:\s*0[\s\S]*?width:\s*var\(--seal-size\)[\s\S]*?height:\s*var\(--seal-size\)[\s\S]*?transform-origin:\s*50% 50%/);
  assert.match(css, /\.cinematic-seal__core\s*\{[\s\S]*?radial-gradient\(circle,\s*#000 0 62%,\s*transparent 62\.5% 100%\)/);
  assert.match(css, /\.cinematic-seal__annulus\s*\{[\s\S]*?radial-gradient\(circle,\s*transparent 0 62%,\s*#000 62\.5% 100%\)/);

  const coreRule = [...css.matchAll(/\.cinematic-seal__core\s*\{([\s\S]*?)\}/g)]
    .map((match) => match[1])
    .find((rule) => rule.includes("mask-image")) ?? "";
  const annulusRule = [...css.matchAll(/\.cinematic-seal__annulus\s*\{([\s\S]*?)\}/g)]
    .map((match) => match[1])
    .find((rule) => rule.includes("--film-progress")) ?? "";
  assert.doesNotMatch(coreRule, /--film-progress|--seal-annulus-turn|rotate\(/);
  assert.match(annulusRule, /rotate\(calc\(var\(--seal-annulus-turn\) \* var\(--film-progress\)\)\)/);
});

test("the established K-seal-A formation identifiers remain intact", () => {
  // Chapters render through ChapterGlyphNumeral with SVG pattern IDs referenced by the numeral fill.
  for (const patternId of [
    "chapter-one-glyph-pattern",
    "chapter-two-glyph-pattern",
    "chapter-three-glyph-pattern",
  ]) {
    assert.match(cinematic, new RegExp(`id=\\{?["']${patternId}["']\\}?`));
    assert.match(cinematic, new RegExp(`url\\(#\\$\\{id\\}\\)`));
  }
  // The glyph-numeral component is what wires pattern id to text fill.
  assert.match(cinematic, /ChapterGlyphNumeral\(\{\s*numeral,\s*id\s*\}/);
  // Chapter 01 is the opening scene and must remain the first film article.
  assert.match(cinematic, /cinematic-film__scene cinematic-film__scene--seal/);
  assert.match(cinematic, /<SealAssembly rotation=\{-360\} \/>/);
  assert.match(intro, /LETTER_SHAPES\s*=\s*\{[\s\S]*?K:\s*\[/);
  assert.match(intro, /LETTER_SHAPES\s*=\s*\{[\s\S]*?A:\s*\[/);
});

test("the opening K/A field is a dense filled formation, not a visible guide outline", () => {
  assert.match(livingGlyphField, /K_SILHOUETTE/);
  assert.match(livingGlyphField, /A_SILHOUETTE/);
  assert.match(livingGlyphField, /filledLetterPoint/);
  assert.doesNotMatch(livingGlyphField, /K_POINTS|A_POINTS/);
  assert.match(livingGlyphField, /width < 720 \? 150 : width < 1024 \? 220 : 280/);
  assert.match(cinematic, /cinematic-film__mark-letters/);
  assert.doesNotMatch(cinematic, />O<|>0</);
});

test("the landing defaults to the cinematic only on capable devices and uses Burmese chapter marks", () => {
  assert.match(cinematic, /canPlayCinematicMotion/);
  assert.match(cinematic, /smoothlyFollowProgress/);
  assert.doesNotMatch(cinematic, /cinematic-film__chapter-buttons/);
  assert.match(css, /font-size:\s*clamp\(180px, 38vw, 480px\)/);
  assert.match(dictionaryEntry, /dictionary-card__identity/);
  assert.match(dictionaryEntry, /dictionary-card__definition/);
});

test("the opening K-seal-A mark stays in one shared viewport movement range", () => {
  assert.match(css, /cinematic-film__seal-wrap\s*\{[\s\S]*?var\(--film-progress\) \* 8vh[\s\S]*?\* \.18/);
  assert.match(css, /cinematic-film__mark-letters\s*\{[\s\S]*?var\(--film-progress\) \* 8vh[\s\S]*?\* \.18/);
});
