import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(repositoryRoot, "content", "cinematic-frame-manifest.json");

function parseArguments(arguments_) {
  const options = { finalize: false };
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--version") options.version = arguments_[++index];
    else if (argument === "--commit") options.commit = arguments_[++index];
    else if (argument === "--evidence-dir") options.evidenceDirectory = arguments_[++index];
    else if (argument === "--finalize") options.finalize = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!/^v\d{4}-[a-z0-9-]+$/.test(options.version ?? "")) {
    throw new Error("--version must use vNNNN-lowercase-slug format");
  }
  if (!/^[0-9a-f]{7,40}$/i.test(options.commit ?? "")) {
    throw new Error("--commit must be a 7-40 character Git commit SHA");
  }
  if (!options.evidenceDirectory) throw new Error("--evidence-dir is required");
  const resolvedEvidence = resolve(repositoryRoot, options.evidenceDirectory);
  const relativeEvidence = relative(repositoryRoot, resolvedEvidence);
  if (relativeEvidence.startsWith("..") || relativeEvidence === "") {
    throw new Error("--evidence-dir must be a repository-relative directory");
  }
  options.evidenceDirectory = relativeEvidence.split(sep).join("/");
  return options;
}

function assertManifest(manifest) {
  if (!Number.isInteger(manifest.version) || typeof manifest.route !== "string" || !Array.isArray(manifest.frames)) {
    throw new Error("Canonical frame manifest must include version, route, and frames");
  }
  if (manifest.frames.length === 0) throw new Error("Canonical frame manifest contains no frames");
  let previousExit = 0;
  for (const [index, frame] of manifest.frames.entries()) {
    for (const key of ["id", "title", "route", "entry", "exit", "foreground", "background", "staticFeatures", "motionFeatures", "tunables", "locales", "motionOff", "why", "evidence"]) {
      if (!(key in frame)) throw new Error(`Frame ${index + 1} is missing ${key}`);
    }
    if (frame.entry.progress < previousExit || frame.exit.progress <= frame.entry.progress) {
      throw new Error(`Frame ${frame.id} is not in chronological progress order`);
    }
    previousExit = frame.exit.progress;
  }
}

function createSnapshot(manifest, options) {
  return {
    schemaVersion: 1,
    version: options.version,
    commit: options.commit,
    generatedFrom: "content/cinematic-frame-manifest.json",
    canonicalManifestVersion: manifest.version,
    route: manifest.route,
    locales: [...manifest.frames[0].locales],
    evidenceDirectory: options.evidenceDirectory,
    rationale: "Phase 7 records the canonical one-app frame story before browser finalization; evidence remains reviewable and does not imply deployment or publication.",
    frames: manifest.frames.map((frame, index) => ({
      order: index + 1,
      id: frame.id,
      title: frame.title,
      route: frame.route,
      locales: [...frame.locales],
      entry: frame.entry,
      exit: frame.exit,
      content: {
        foreground: [...frame.foreground],
        background: [...frame.background],
        staticFeatures: [...frame.staticFeatures],
      },
      motion: {
        features: [...frame.motionFeatures],
        motionOff: frame.motionOff,
      },
      tunables: frame.tunables,
      evidence: {
        directory: options.evidenceDirectory,
        items: [...frame.evidence],
      },
      rationale: frame.why,
    })),
  };
}

function bullets(items) {
  return items.map((item) => `  - ${item}`).join("\n");
}

function evidenceReference(directory, item) {
  return /\.[a-z0-9]+$/i.test(item) ? `${directory}/${item}` : item;
}

function renderMarkdown(snapshot) {
  const lines = [
    `# Cinematic frame story: ${snapshot.version}`,
    "",
    "This file is deterministic output from the canonical frame manifest. Edit `content/cinematic-frame-manifest.json`, then rerun the generator; do not hand-edit this snapshot.",
    "",
    "## Snapshot metadata",
    "",
    "| Field | Value |",
    "|---|---|",
    `| Commit | \`${snapshot.commit}\` |`,
    `| Route | \`${snapshot.route}\` |`,
    `| Locales | ${snapshot.locales.map((locale) => `\`${locale}\``).join(", ")} |`,
    `| Frame order | ${snapshot.frames.map((frame) => `\`${frame.order}:${frame.id}\``).join(" → ")} |`,
    `| Evidence directory | \`${snapshot.evidenceDirectory}\` |`,
    `| Source | \`${snapshot.generatedFrom}\` (manifest version ${snapshot.canonicalManifestVersion}) |`,
    "",
    "## Version rationale",
    "",
    snapshot.rationale,
    "",
  ];

  for (const frame of snapshot.frames) {
    lines.push(
      `## ${frame.order}. ${frame.title}`,
      "",
      `- ID: \`${frame.id}\``,
      `- Route: \`${frame.route}\``,
      `- Locales: ${frame.locales.map((locale) => `\`${locale}\``).join(", ")}`,
      `- Entry: progress \`${frame.entry.progress}\``,
      `- Exit: progress \`${frame.exit.progress}\``,
      "",
      "### Content",
      "",
      "Foreground:",
      bullets(frame.content.foreground),
      "",
      "Background:",
      bullets(frame.content.background),
      "",
      "Static features:",
      bullets(frame.content.staticFeatures),
      "",
      "### Motion",
      "",
      bullets(frame.motion.features),
      "",
      `Motion off: ${frame.motion.motionOff.summary}`,
      bullets(frame.motion.motionOff.result),
      "",
      "### Tunables",
      "",
      "| Name | Value | Min | Max | Step | Unit | Reference weight | Description |",
      "|---|---:|---:|---:|---:|---|---:|---|",
    );
    for (const [name, tunable] of Object.entries(frame.tunables)) {
      lines.push(`| \`${name}\` | ${tunable.value} | ${tunable.min} | ${tunable.max} | ${tunable.step} | ${tunable.unit} | ${tunable.referenceWeight} | ${tunable.description} |`);
    }
    lines.push(
      "",
      "### Evidence",
      "",
      ...frame.evidence.items.map((item) => `- \`${evidenceReference(frame.evidence.directory, item)}\``),
      "",
      "### Rationale",
      "",
      frame.rationale,
      "",
    );
  }
  return lines.join("\n");
}

function assertClean(existing, expected, path) {
  if (existing !== expected) {
    throw new Error(`Generated snapshot is unclean: ${relative(repositoryRoot, path)} differs from canonical output`);
  }
}

export function generateSnapshot(options) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assertManifest(manifest);
  const snapshot = createSnapshot(manifest, options);
  const json = `${JSON.stringify(snapshot, null, 2)}\n`;
  const markdown = renderMarkdown(snapshot);
  const outputDirectory = options.outputDirectory ?? resolve(repositoryRoot, "docs", "cinematic", "versions");
  const jsonPath = resolve(outputDirectory, `${options.version}.json`);
  const markdownPath = resolve(outputDirectory, `${options.version}.md`);

  if (options.finalize) {
    let existingJson;
    let existingMarkdown;
    try {
      existingJson = readFileSync(jsonPath, "utf8");
      existingMarkdown = readFileSync(markdownPath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") throw new Error("Generated snapshot is unclean: finalized output is missing");
      throw error;
    }
    assertClean(existingJson, json, jsonPath);
    assertClean(existingMarkdown, markdown, markdownPath);
    return { jsonPath, markdownPath, changed: false };
  }

  mkdirSync(outputDirectory, { recursive: true });
  let changed = false;
  for (const [path, contents] of [[jsonPath, json], [markdownPath, markdown]]) {
    let current = "";
    try {
      current = readFileSync(path, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (current !== contents) {
      writeFileSync(path, contents, "utf8");
      changed = true;
    }
  }
  return { jsonPath, markdownPath, changed };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = parseArguments(process.argv.slice(2));
  const result = generateSnapshot(options);
  console.log(options.finalize ? "Generated snapshot is clean for finalization." : result.changed ? `Generated ${options.version} snapshot.` : `${options.version} snapshot already current.`);
}
