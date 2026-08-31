import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(repositoryRoot, "content", "cinematic-frame-manifest.json");
const loaderPath = resolve(repositoryRoot, "lib", "cinema", "frame-manifest.ts");

const expectedFrameIds = [
  "home-arrival-seal",
  "home-seal-migration",
  "home-ka-resolve",
  "home-o-resolve",
  "home-copy-reveal",
  "home-scroll-invitation",
  "home-chapter-belonging",
  "home-chapter-language",
  "home-chapter-culture",
  "home-chapter-service",
  "home-chapter-future",
  "home-partner-handoff",
  "home-final-involvement",
];

async function loadValidator() {
  return import(pathToFileURL(loaderPath).href);
}

test("the canonical manifest preserves the complete chronological home story", () => {
  const raw = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.deepEqual(raw.frames.map((frame) => frame.id), expectedFrameIds);
  assert.equal(raw.cookbook, "docs/KOA-CINEMATIC-COOKBOOK.md");
});

test("the typed loader accepts ordered, non-overlapping documented frames", async () => {
  const { loadFrameManifest } = await loadValidator();
  const raw = JSON.parse(readFileSync(manifestPath, "utf8"));
  const result = loadFrameManifest(raw);

  assert.equal(result.ok, true, result.ok ? "" : result.errors.join("\n"));
  assert.equal(result.frames[0].entry.progress, 0);
  assert.equal(result.frames.at(-1).exit.progress, 1);
  for (const [index, frame] of result.frames.entries()) {
    assert.deepEqual(frame.locales, ["en", "th", "my", "ksw"]);
    assert.ok(frame.exit.progress > frame.entry.progress);
    assert.ok(frame.motionOff.summary.trim().length > 0);
    if (index > 0) assert.ok(frame.entry.progress >= result.frames[index - 1].exit.progress);
    for (const [name, tunable] of Object.entries(frame.tunables)) {
      assert.ok(tunable.description.trim(), `${frame.id}.${name} must explain its purpose`);
      assert.ok(tunable.min <= tunable.referenceWeight && tunable.referenceWeight <= tunable.max);
      assert.ok(tunable.min <= tunable.value && tunable.value <= tunable.max);
    }
  }
});

test("the typed loader rejects missing IDs, overlapping ranges, undocumented tunables, and absent Motion-off results", async () => {
  const { loadFrameManifest } = await loadValidator();
  const base = JSON.parse(readFileSync(manifestPath, "utf8"));
  const broken = structuredClone(base);
  delete broken.frames[0].id;
  broken.frames[1].entry.progress = broken.frames[0].entry.progress;
  broken.frames[2].tunables.opacity.description = "";
  broken.frames[3].motionOff = {};

  const result = loadFrameManifest(broken);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /id/i);
  assert.match(result.errors.join("\n"), /overlap/i);
  assert.match(result.errors.join("\n"), /description/i);
  assert.match(result.errors.join("\n"), /Motion-off/i);
});
