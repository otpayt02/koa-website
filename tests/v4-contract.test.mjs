import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fromRoot = (...segments) => join(repositoryRoot, ...segments);
const read = (...segments) => readFileSync(fromRoot(...segments), "utf8");

function listFiles(directory) {
  const absoluteDirectory = fromRoot(directory);
  if (!existsSync(absoluteDirectory)) return [];

  return readdirSync(absoluteDirectory).flatMap((name) => {
    const absolutePath = join(absoluteDirectory, name);
    const repositoryPath = relative(repositoryRoot, absolutePath).replaceAll("\\", "/");
    return statSync(absolutePath).isDirectory()
      ? listFiles(repositoryPath)
      : [repositoryPath];
  });
}

function assertFile(path) {
  assert.ok(existsSync(fromRoot(path)), `Missing required file: ${path}`);
}

function exportedHandlers(source) {
  const handlers = new Set();
  const patterns = [
    /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b/g,
    /export\s+const\s+(GET|POST|PUT|PATCH|DELETE)\s*=/g,
    /export\s*\{([^}]+)\}/g,
  ];

  for (const match of source.matchAll(patterns[0])) handlers.add(match[1]);
  for (const match of source.matchAll(patterns[1])) handlers.add(match[1]);
  for (const match of source.matchAll(patterns[2])) {
    for (const name of match[1].split(",").map((part) => part.trim().split(/\s+as\s+/).at(-1))) {
      if (/^(GET|POST|PUT|PATCH|DELETE)$/.test(name)) handlers.add(name);
    }
  }

  return handlers;
}

function keyPaths(value, prefix = "") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

test("all 14 committed pages live under the bilingual route segment", () => {
  const committedPageFiles = [
    "app/[lang]/page.tsx",
    "app/[lang]/about/page.tsx",
    "app/[lang]/services/page.tsx",
    "app/[lang]/community/page.tsx",
    "app/[lang]/contact/page.tsx",
    "app/[lang]/dictionary/page.tsx",
    "app/[lang]/dictionary/[id]/page.tsx",
    "app/[lang]/contribute/page.tsx",
    "app/[lang]/translation/page.tsx",
    "app/[lang]/collaborate/page.tsx",
    "app/[lang]/u/[username]/page.tsx",
    "app/[lang]/admin/page.tsx",
    "app/[lang]/changelog/page.tsx",
    "app/[lang]/community/board/page.tsx",
  ];

  for (const path of committedPageFiles) assertFile(path);
  assert.equal(
    committedPageFiles.length,
    14,
    "The contract must continue to enumerate SPEC v4's 14 committed pages",
  );

  assertFile("app/[lang]/layout.tsx");
  const languageLayout = read("app", "[lang]", "layout.tsx");
  assert.match(languageLayout, /\ben\b/);
  assert.match(languageLayout, /\bkaren\b/);
});

test("English and Karen message catalogs expose the same translated keys", () => {
  assertFile("messages/en.json");
  assertFile("messages/karen.json");

  const english = JSON.parse(read("messages", "en.json"));
  const karen = JSON.parse(read("messages", "karen.json"));
  const englishKeys = keyPaths(english).sort();
  const karenKeys = keyPaths(karen).sort();

  assert.ok(englishKeys.length > 0, "English message catalog must not be empty");
  assert.deepEqual(karenKeys, englishKeys, "Message catalogs have mismatched keys");
  assert.match(
    JSON.stringify(karen),
    /[\u1000-\u109f]/u,
    "Karen catalog must contain Karen/Myanmar Unicode text",
  );
});

test("SPEC v4 API routes exist and export the required HTTP methods", () => {
  const apiContract = {
    "app/api/dictionary/route.ts": ["GET", "POST"],
    "app/api/dictionary/[id]/route.ts": ["GET", "PATCH", "DELETE"],
    "app/api/contribute/route.ts": ["POST"],
    "app/api/audio/upload/route.ts": ["POST"],
    "app/api/translation/request/route.ts": ["POST"],
    "app/api/translation/interpreters/route.ts": ["GET"],
    "app/api/collaborate/route.ts": ["POST"],
    "app/api/donations/route.ts": ["POST"],
    "app/api/logs/route.ts": ["GET"],
    "app/api/contact/route.ts": ["POST"],
    "app/api/training/pair/route.ts": ["POST"],
    "app/api/training/feedback/route.ts": ["POST"],
  };

  for (const [path, methods] of Object.entries(apiContract)) {
    assertFile(path);
    const handlers = exportedHandlers(read(...path.split("/")));
    for (const method of methods) {
      assert.ok(handlers.has(method), `${path} must export ${method}`);
    }
  }
});

test("standalone IDEAS features are not implemented as routes", () => {
  const pageFiles = listFiles("app/[lang]").filter((path) => path.endsWith("/page.tsx"));
  const forbiddenSegments = ["music", "podcast", "ai-education", "ai_education", "keyboard"];

  for (const path of pageFiles) {
    const normalizedSegments = path.toLowerCase().split("/");
    for (const segment of forbiddenSegments) {
      assert.ok(
        !normalizedSegments.includes(segment),
        `Unapproved standalone IDEAS route found: ${path}`,
      );
    }
  }
});

test("all 50 grilling questions remain traceable as unconfirmed assumptions", () => {
  const answers = read("docs", "answers.md");
  const numberedAnswers = [...answers.matchAll(/^([1-9]|[1-4][0-9]|50)\. \*\*/gm)].map(
    (match) => Number(match[1]),
  );

  assert.deepEqual(
    numberedAnswers,
    Array.from({ length: 50 }, (_, index) => index + 1),
    "docs/answers.md must answer SPEC §14 in order without omissions",
  );
  assert.match(answers, /UNCONFIRMED/);
  assert.match(answers, /Production gate/i);
  assert.match(read("docs", "answers-needed.md"), /source permissions/i);
  assert.match(read("docs", "answers-needed.md"), /approved translator/i);
  assert.match(read("docs", "answers-needed.md"), /court/i);
  assert.match(read("docs", "answers-needed.md"), /payment processor/i);
});

test("the bilingual shell exposes baseline accessibility signals", () => {
  const relevantFiles = [
    "app/layout.tsx",
    "app/[lang]/layout.tsx",
    ...listFiles("components").filter((path) => [".tsx", ".ts"].includes(extname(path))),
  ];
  const source = relevantFiles.map((path) => read(...path.split("/"))).join("\n");
  const css = read("app", "globals.css");

  assert.match(source, /href=["'{]+#main-content/);
  assert.match(source, /<main\b[^>]*\bid=["'{]+main-content/);
  assert.match(source, /<header\b/);
  assert.match(source, /<nav\b/);
  assert.match(source, /<footer\b/);
  assert.match(source, /aria-(?:label|labelledby)=/);
  assert.match(source, /aria-live=/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("technical SEO includes metadata, language alternates, sitemap, robots, and structured data", () => {
  assertFile("app/sitemap.ts");
  assertFile("app/robots.ts");

  const seoSource = [
    "app/layout.tsx",
    "app/[lang]/layout.tsx",
    "app/sitemap.ts",
    "app/robots.ts",
    ...listFiles("app/[lang]").filter((path) => path.endsWith("page.tsx")),
  ]
    .map((path) => read(...path.split("/")))
    .join("\n");

  assert.match(seoSource, /\bmetadata\b|generateMetadata/);
  assert.match(seoSource, /\btitle\b/);
  assert.match(seoSource, /\bdescription\b/);
  assert.match(seoSource, /\balternates\b/);
  assert.match(seoSource, /\blanguages\b|hreflang/i);
  assert.match(seoSource, /application\/ld\+json|schema\.org/i);
  assert.match(read("app", "sitemap.ts"), /export\s+default/);
  assert.match(read("app", "robots.ts"), /export\s+default/);
  assert.match(read("app", "robots.ts"), /admin/);
});

test("Drizzle schema declares every committed v4 table", () => {
  const schema = read("db", "schema.ts");
  const expectedTables = [
    "users",
    "dictionary_entries",
    "dictionary_versions",
    "audio_pairs",
    "interpreters",
    "content_translations",
    "audit_log",
    "donations",
    "feature_requests",
  ];

  for (const table of expectedTables) {
    assert.match(
      schema,
      new RegExp(`[\\"'\\\`]${table}[\\"'\\\`]`),
      `db/schema.ts must declare storage table ${table}`,
    );
  }

  for (const requiredDomainField of [
    "status",
    "dialect",
    "provenance",
    "transcription",
    "consent",
    "certifications",
    "amount",
    "action",
  ]) {
    assert.match(
      schema,
      new RegExp(`\\b${requiredDomainField}[A-Za-z]*\\b`, "i"),
      `Schema must model the ${requiredDomainField} domain concern`,
    );
  }
});

test("a SQL migration creates every committed v4 table", () => {
  const migrationFiles = listFiles("drizzle").filter((path) => path.endsWith(".sql"));
  assert.ok(migrationFiles.length > 0, "No generated SQL migration exists in drizzle/");
  const migrations = migrationFiles.map((path) => read(...path.split("/"))).join("\n");

  for (const table of [
    "users",
    "dictionary_entries",
    "dictionary_versions",
    "audio_pairs",
    "interpreters",
    "content_translations",
    "audit_log",
    "donations",
    "feature_requests",
  ]) {
    assert.match(
      migrations,
      new RegExp(`CREATE\\s+TABLE(?:\\s+IF\\s+NOT\\s+EXISTS)?\\s+[\\"'\\\`]${table}[\\"'\\\`]`, "i"),
      `Migration must create ${table}`,
    );
  }
});
