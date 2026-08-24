import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { generateSnapshot } from "../scripts/snapshot-cinematic-spec.mjs";
import { updateUnderstanding } from "../scripts/update-understanding.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const understandingPath = resolve(repositoryRoot, "UNDERSTANDING.md");
const manifestPath = resolve(repositoryRoot, "content", "cinematic-frame-manifest.json");
const snapshotJsonPath = resolve(
  repositoryRoot,
  "docs",
  "cinematic",
  "versions",
  "v0007-phase7.json",
);
const snapshotMarkdownPath = resolve(
  repositoryRoot,
  "docs",
  "cinematic",
  "versions",
  "v0007-phase7.md",
);
const generatorArguments = [
  "scripts/snapshot-cinematic-spec.mjs",
  "--version",
  "v0007-phase7",
  "--commit",
  "c827016",
  "--evidence-dir",
  "output/playwright",
];

function runNode(arguments_) {
  execFileSync(process.execPath, arguments_, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: "pipe",
  });
}

function read(path) {
  return readFileSync(path, "utf8");
}

test("UNDERSTANDING lists every tracked first-party top-level path with operating context", () => {
  const understanding = read(understandingPath);
  const trackedTopLevelPaths = execFileSync(
    "git",
    ["ls-tree", "--name-only", "HEAD"],
    { cwd: repositoryRoot, encoding: "utf8" },
  )
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);

  assert.match(understanding, /<!-- BEGIN GENERATED REPOSITORY REGISTRY -->/);
  assert.match(understanding, /<!-- END GENERATED REPOSITORY REGISTRY -->/);
  assert.match(understanding, /Purpose/);
  assert.match(understanding, /Contents and owner/);
  assert.match(understanding, /Consumers/);
  assert.match(understanding, /Removal impact/);
  assert.match(understanding, /Generated or manual/);
  assert.match(understanding, /Verification/);
  assert.match(understanding, /Approval or privacy boundary/);

  for (const path of [...trackedTopLevelPaths, "UNDERSTANDING.md"]) {
    assert.ok(
      understanding.includes(`| \`${path}\` |`),
      `missing repository registry entry for ${path}`,
    );
  }
});

test("versioned JSON preserves the canonical frame manifest in chronological order", () => {
  const manifest = JSON.parse(read(manifestPath));
  const snapshot = JSON.parse(read(snapshotJsonPath));

  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.version, "v0007-phase7");
  assert.equal(snapshot.commit, "c827016");
  assert.equal(snapshot.route, manifest.route);
  assert.deepEqual(snapshot.locales, manifest.frames[0].locales);
  assert.equal(snapshot.frames.length, manifest.frames.length);

  snapshot.frames.forEach((frame, index) => {
    const source = manifest.frames[index];
    assert.equal(frame.order, index + 1);
    assert.equal(frame.id, source.id);
    assert.equal(frame.route, source.route);
    assert.deepEqual(frame.entry, source.entry);
    assert.deepEqual(frame.exit, source.exit);
    assert.deepEqual(frame.content.foreground, source.foreground);
    assert.deepEqual(frame.content.background, source.background);
    assert.deepEqual(frame.motion.features, source.motionFeatures);
    assert.deepEqual(frame.motion.motionOff, source.motionOff);
    assert.deepEqual(frame.tunables, source.tunables);
    assert.deepEqual(frame.evidence.items, source.evidence);
    assert.equal(frame.rationale, source.why);
  });
});

test("versioned Markdown records commit, route, locales, frames, motion, tunables, evidence, and rationale", () => {
  const manifest = JSON.parse(read(manifestPath));
  const markdown = read(snapshotMarkdownPath);

  for (const requiredText of [
    "Commit",
    "Route",
    "Locales",
    "Frame order",
    "Content",
    "Motion",
    "Tunables",
    "Evidence",
    "Rationale",
  ]) {
    assert.match(markdown, new RegExp(requiredText, "i"));
  }

  manifest.frames.forEach((frame, index) => {
    assert.match(markdown, new RegExp(`${index + 1}\\. ${frame.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    assert.match(markdown, new RegExp(frame.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(markdown, new RegExp(frame.why.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
});

test("documentation generators are idempotent on a second run", () => {
  runNode(["scripts/update-understanding.mjs"]);
  runNode(generatorArguments);
  const afterFirstRun = {
    understanding: read(understandingPath),
    json: read(snapshotJsonPath),
    markdown: read(snapshotMarkdownPath),
  };

  runNode(["scripts/update-understanding.mjs"]);
  runNode(generatorArguments);
  const afterSecondRun = {
    understanding: read(understandingPath),
    json: read(snapshotJsonPath),
    markdown: read(snapshotMarkdownPath),
  };

  assert.deepEqual(afterSecondRun, afterFirstRun);
});

test("understanding sync preserves manual context outside its marked section", () => {
  const temporaryDirectory = mkdtempSync(resolve(tmpdir(), "koa-understanding-"));
  const temporaryFile = resolve(temporaryDirectory, "UNDERSTANDING.md");
  const manualBefore = "# Manual title\n\nOwner note that must remain exact.\n\n";
  const manualAfter = "\n\nClosing note that must remain exact.\n";
  writeFileSync(
    temporaryFile,
    `${manualBefore}<!-- BEGIN GENERATED REPOSITORY REGISTRY -->\nstale\n<!-- END GENERATED REPOSITORY REGISTRY -->${manualAfter}`,
    "utf8",
  );

  try {
    updateUnderstanding(temporaryFile);
    const updated = read(temporaryFile);
    assert.ok(updated.startsWith(manualBefore));
    assert.ok(updated.endsWith(manualAfter));
    assert.doesNotMatch(updated, /stale/);
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});

test("snapshot finalization rejects stale generated output without rewriting it", () => {
  const temporaryDirectory = mkdtempSync(resolve(tmpdir(), "koa-snapshot-"));
  const options = {
    version: "v0007-phase7",
    commit: "c827016",
    evidenceDirectory: "output/playwright",
    outputDirectory: temporaryDirectory,
  };

  try {
    const generated = generateSnapshot(options);
    generateSnapshot({ ...options, finalize: true });
    writeFileSync(generated.jsonPath, `${read(generated.jsonPath)}stale\n`, "utf8");
    assert.throws(
      () => generateSnapshot({ ...options, finalize: true }),
      /Generated snapshot is unclean/,
    );
    assert.ok(read(generated.jsonPath).endsWith("stale\n"));
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});

for (const skillName of [
  "koa-mobile-preview",
  "koa-translation-mapper",
  "koa-frame-story-spec",
  "repo-understanding-sync",
]) {
  test(`${skillName} exposes a focused reviewable operating contract`, () => {
    const skill = read(resolve(repositoryRoot, "skills", skillName, "SKILL.md"));

    assert.match(skill, /^---\nname: [a-z0-9-]+\ndescription: .+\n---/);
    for (const heading of [
      "Trigger",
      "Inputs",
      "Workflow",
      "Output",
      "Verification",
      "Approval boundary",
    ]) {
      assert.match(skill, new RegExp(`^## ${heading}$`, "m"));
    }
    assert.match(skill, /approval|review/i);
  });
}
