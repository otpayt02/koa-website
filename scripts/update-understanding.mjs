import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const START_MARKER = "<!-- BEGIN GENERATED REPOSITORY REGISTRY -->";
const END_MARKER = "<!-- END GENERATED REPOSITORY REGISTRY -->";

const sharedBoundary = "Local repository use; publishing, deployment, credentials, and rights-sensitive content require explicit approval.";

function record(path, purpose, owner, consumers, removalImpact, status, verification, boundary = sharedBoundary) {
  return { path, purpose, owner, consumers, removalImpact, status, verification, boundary };
}

const registry = [
  record(".claude", "Retains repository-local agent guidance and compatibility metadata.", "Maintainers; agent configuration.", "Claude-compatible local workflows.", "Those workflows lose repository-specific guidance.", "Manual", "git status --short -- .claude"),
  record(".codex-worktrees", "Records repository-local worktree coordination metadata.", "Codex worktree tooling.", "Isolated task worktrees.", "Local worktree coordination can become ambiguous.", "Tool-maintained", "git status --short -- .codex-worktrees", "Do not remove active worktree metadata without checking every worktree owner."),
  record(".github", "Defines repository automation and GitHub-facing configuration.", "Maintainers.", "GitHub checks and repository automation.", "Hosted automation or repository policy can stop applying.", "Manual", "git status --short -- .github", "Remote workflow or permission changes require explicit approval."),
  record(".gitignore", "Keeps dependencies, secrets, runtime state, and generated output out of commits.", "Maintainers.", "Git and every contributor.", "Sensitive or generated files can be committed accidentally.", "Manual", "git check-ignore -v .env.local node_modules dist"),
  record(".hermes", "Pins local Hermes integration metadata used by this workspace.", "Hermes tooling.", "Local assisted-development workflows.", "Hermes-specific local behavior may stop resolving.", "Tool-maintained", "git status --short -- .hermes"),
  record(".openai", "Stores repository-local OpenAI tool configuration.", "Maintainers; OpenAI tooling.", "Configured local agent workflows.", "Repository-specific tool behavior can be lost.", "Manual", "git status --short -- .openai", "Never place secrets in tracked configuration."),
  record(".vinext", "Contains tracked vinext compatibility material for the canonical runtime.", "Runtime maintainers.", "vinext development and build tooling.", "The canonical runtime may fail to start or build as expected.", "Tool-generated and reviewed", "npm.cmd run build"),
  record(".wrangler", "Contains tracked Cloudflare/Wrangler project metadata.", "Runtime maintainers; Wrangler.", "Worker build and local preview tooling.", "Worker tooling can lose project context.", "Tool-generated and reviewed", "git status --short -- .wrangler", "Deployment remains separately approval-gated."),
  record("IDEA.md", "Preserves the original product concept and requested direction.", "Product owner.", "Planning and historical review.", "Important intent and provenance are lost.", "Manual", "git diff --check -- IDEA.md"),
  record("README.md", "Provides the canonical project orientation, commands, links, and safety boundaries.", "Maintainers.", "Contributors and operators.", "New operators lose the supported entrypoint and approval rules.", "Manual", "node --test tests/documentation-sync.test.mjs"),
  record("UNDERSTANDING.md", "Explains the repository map and removal consequences while preserving human notes.", "Maintainers plus scripts/update-understanding.mjs for the marked section.", "Contributors, reviewers, and repository-sync skill.", "Repository changes become harder to assess safely.", "Manual shell with generated marked section", "node scripts/update-understanding.mjs --check"),
  record("Universal-Cinematic-Website-Production-Kit-KOA.docx", "Preserves the editable source kit supplied for the cinematic system.", "Product owner.", "Design and documentation reference work.", "The editable source reference is lost.", "Manual binary reference", "git status --short -- Universal-Cinematic-Website-Production-Kit-KOA.docx", "Do not publish or rewrite supplied source material without approval."),
  record("Universal-Cinematic-Website-Production-Kit-KOA.pdf", "Preserves a fixed-layout export of the supplied cinematic kit.", "Product owner.", "Design and documentation review.", "The fixed-layout reference is lost.", "Manual binary reference", "git status --short -- Universal-Cinematic-Website-Production-Kit-KOA.pdf", "Do not publish supplied source material without approval."),
  record("app", "Owns App Router pages, layouts, route handlers, and global styles.", "Frontend and backend maintainers.", "The public site, admin studios, and route APIs.", "The canonical application cannot render or serve its routes.", "Manual source", "npm.cmd exec tsc -- --noEmit --incremental false"),
  record("build", "Retains tracked build/runtime support assets required by this repository.", "Runtime maintainers.", "Build and packaging workflows.", "Supported packaging or runtime preparation can fail.", "Generated and reviewed", "git status --short -- build"),
  record("components", "Contains reusable React UI, cinematic, admin, and localization components.", "Frontend maintainers.", "App Router pages and layouts.", "Major interfaces and the cinematic home fail to render.", "Manual source", "npm.cmd exec tsc -- --noEmit --incremental false"),
  record("content", "Holds canonical reviewed local content and machine-readable manifests.", "Content and product maintainers.", "Public rendering, admin tools, and documentation generators.", "Frames, policies, or content sources become unavailable.", "Manual canonical data", "node --test tests/frame-manifest.test.mjs", "Content publication, translations, relationships, and rights remain review-gated."),
  record("db", "Defines database access and the application data schema.", "Backend maintainers.", "Admin workflows and persistence services.", "Content, translation, and review persistence fails.", "Manual source", "npm.cmd exec tsc -- --noEmit --incremental false", "Schema and data changes must preserve review provenance and private records."),
  record("design-qa.md", "Preserves design-quality observations and acceptance context.", "Design maintainers.", "Visual review and regression planning.", "Prior design findings and expectations are lost.", "Manual", "git diff --check -- design-qa.md"),
  record("docs", "Stores plans, decisions, progress, cinematic specifications, and operating records.", "Maintainers and product owner.", "Implementation, review, and handoff workflows.", "The project loses its durable source of decisions and proof context.", "Manual plus deterministic snapshots", "node --test tests/documentation-sync.test.mjs"),
  record("drizzle.config.ts", "Configures Drizzle schema generation and database paths.", "Backend maintainers.", "Drizzle Kit.", "Schema generation cannot locate its inputs or output.", "Manual configuration", "npm.cmd exec tsc -- --noEmit --incremental false"),
  record("drizzle", "Contains versioned database migrations.", "Backend maintainers.", "Database setup and upgrade workflows.", "Existing databases cannot be migrated reproducibly.", "Generated then reviewed", "git status --short -- drizzle", "Review migrations before applying them to non-demo data."),
  record("eslint.config.mjs", "Defines repository lint rules and exclusions.", "Maintainers.", "ESLint and contributors.", "Static quality checks become inconsistent or unavailable.", "Manual configuration", "npm.cmd run lint"),
  record("examples", "Preserves bounded examples used to understand or demonstrate repository behavior.", "Maintainers.", "Documentation and development workflows.", "Reusable examples and reference inputs disappear.", "Manual", "git status --short -- examples"),
  record("koa_universal_cinematic_website_kit.pdf", "Retains an additional fixed-layout cinematic reference artifact.", "Product owner.", "Design reference work.", "That source reference is lost.", "Manual binary reference", "git status --short -- koa_universal_cinematic_website_kit.pdf", "Do not publish supplied source material without approval."),
  record("lib", "Contains testable domain services, policies, persistence, and cinematic logic.", "Application maintainers.", "Routes, components, tests, and admin workflows.", "Shared business and cinematic behavior fails.", "Manual source", "npm.cmd exec tsc -- --noEmit --incremental false"),
  record("messages", "Stores locale catalogs loaded by the canonical application.", "Content maintainers and reviewers.", "Localized public and admin routes.", "Locale rendering falls back incorrectly or fails.", "Manual reviewed content", "node --test tests/translation-policy.test.mjs", "English is source; Thai, Burmese, and S'gaw Karen proposals require review before publication."),
  record("next.config.ts", "Configures Next-compatible application behavior consumed by vinext.", "Runtime maintainers.", "Development and production builds.", "Routes or runtime integration can build incorrectly.", "Manual configuration", "npm.cmd run build"),
  record("output", "Stores local proof and runtime evidence selected for review.", "Verification workflows.", "QA reviews and documented proof links.", "Historical visual/runtime evidence becomes unavailable.", "Generated evidence", "git status --short -- output", "Sanitize proof; never capture secrets or private user data."),
  record("package-lock.json", "Pins the exact JavaScript dependency graph.", "npm.", "Install, test, and build workflows.", "Installs become non-reproducible.", "Generated lockfile", "npm.cmd ci --dry-run"),
  record("package.json", "Declares the application, scripts, engines, and direct dependencies.", "Maintainers.", "npm, vinext, tests, and builds.", "The project cannot install or expose supported commands.", "Manual manifest", "npm.cmd test"),
  record("postcss.config.mjs", "Connects the CSS pipeline and Tailwind PostCSS plugin.", "Frontend maintainers.", "Stylesheet builds.", "Application styling may not compile.", "Manual configuration", "npm.cmd run build"),
  record("proxy.ts", "Defines request proxying and route-boundary behavior.", "Runtime maintainers.", "Canonical request handling.", "Protected or localized request flow can change or fail.", "Manual source", "npm.cmd exec tsc -- --noEmit --incremental false"),
  record("public", "Contains static assets and the temporary read-only KOA reference film.", "Content and frontend maintainers.", "React assets and parity review.", "Required media disappears and reference comparisons fail.", "Manual assets plus temporary reference", "git status --short -- public", "Rights-sensitive media and the static reference must not be published as new canonical behavior without approval."),
  record("qa", "Retains selected visual QA material and comparison artifacts.", "Verification maintainers.", "Design review and regression analysis.", "Prior visual evidence and comparisons are lost.", "Generated evidence and review notes", "git status --short -- qa", "Sanitize evidence before sharing."),
  record("scripts", "Provides deterministic generators, verification commands, and the canonical local runner.", "Maintainers.", "Operators, tests, and documentation workflows.", "Supported automation and one-command operation fail.", "Manual executable source", "node --test tests/documentation-sync.test.mjs"),
  record("skills", "Contains repository-local reusable operating workflows.", "Maintainers using Skill Creator.", "Codex project tasks.", "Repeatable project safeguards and handoffs are lost.", "Manual validated skills", "python C:/Users/olive/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/repo-understanding-sync", "Skills do not authorize deployment, publication, account creation, or approval of review-gated content."),
  record("tests", "Defines source, policy, generator, and behavior contracts.", "Maintainers.", "Development and review workflows.", "Regressions lose deterministic detection.", "Manual test source", "node --test tests/documentation-sync.test.mjs"),
  record("tsconfig.json", "Defines strict TypeScript compilation for the application.", "Maintainers.", "TypeScript, editors, and builds.", "Type safety and module resolution become inconsistent.", "Manual configuration", "npm.cmd exec tsc -- --noEmit --incremental false"),
  record("tsconfig.tsbuildinfo", "Caches TypeScript project state for faster local checks.", "TypeScript.", "Incremental compiler runs.", "Checks become slower but source behavior remains intact.", "Generated cache", "git status --short -- tsconfig.tsbuildinfo"),
  record("vite.config.ts", "Configures Vite, vinext, React, and Cloudflare build integration.", "Runtime maintainers.", "Development, build, and preview commands.", "The canonical app cannot compile with its supported runtime.", "Manual configuration", "npm.cmd run build"),
  record("worker", "Contains Cloudflare worker entrypoints and runtime integration.", "Runtime maintainers.", "Worker builds and hosted runtime preparation.", "Worker-targeted execution fails.", "Manual source", "npm.cmd exec tsc -- --noEmit --incremental false", "Deployment remains separately approval-gated."),
];

function escapeCell(value) {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function trackedTopLevelPaths() {
  return execFileSync("git", ["ls-tree", "--name-only", "HEAD"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  })
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
}

export function renderRepositoryRegistry() {
  const requiredPaths = [...new Set([...trackedTopLevelPaths(), "UNDERSTANDING.md"])].sort();
  const recordsByPath = new Map(registry.map((item) => [item.path, item]));
  const missing = requiredPaths.filter((path) => !recordsByPath.has(path));
  if (missing.length > 0) {
    throw new Error(`Add curated UNDERSTANDING registry entries for: ${missing.join(", ")}`);
  }

  const header = [
    "## Generated repository registry",
    "",
    "This table is regenerated from a curated registry. Edit the registry in `scripts/update-understanding.mjs`; keep human context outside the markers.",
    "",
    "| Path | Purpose | Contents and owner | Consumers | Removal impact | Generated or manual | Verification | Approval or privacy boundary |",
    "|---|---|---|---|---|---|---|---|",
  ];
  const rows = requiredPaths.map((path) => {
    const item = recordsByPath.get(path);
    return `| \`${path}\` | ${[
      item.purpose,
      item.owner,
      item.consumers,
      item.removalImpact,
      item.status,
      `\`${item.verification}\``,
      item.boundary,
    ].map(escapeCell).join(" | ")} |`;
  });
  return [...header, ...rows].join("\n");
}

function defaultDocument() {
  return [
    "# Repository understanding",
    "",
    "This guide explains the canonical KOA repository at an operating level. The React App Router is the sole product runtime; `public/koa` is a temporary read-only parity reference.",
    "",
    "## Human-maintained context",
    "",
    "Keep architectural rationale, temporary exceptions, and cross-project context here. The generator must preserve this section and every other note outside its markers.",
    "",
    START_MARKER,
    END_MARKER,
    "",
  ].join("\n");
}

export function updateUnderstanding(filePath = resolve(repositoryRoot, "UNDERSTANDING.md"), { check = false } = {}) {
  let current;
  try {
    current = readFileSync(filePath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    current = defaultDocument();
  }

  const start = current.indexOf(START_MARKER);
  const end = current.indexOf(END_MARKER);
  if (start < 0 || end < 0 || end < start) {
    throw new Error(`Expected ${START_MARKER} and ${END_MARKER} in ${filePath}`);
  }

  const before = current.slice(0, start + START_MARKER.length);
  const after = current.slice(end);
  const next = `${before}\n${renderRepositoryRegistry()}\n${after}`;
  if (check) {
    if (next !== current) throw new Error(`${filePath} has an unclean generated repository registry`);
    return false;
  }
  if (next !== current) writeFileSync(filePath, next, "utf8");
  return next !== current;
}

function parseArguments(arguments_) {
  const options = { check: false, filePath: resolve(repositoryRoot, "UNDERSTANDING.md") };
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--check") options.check = true;
    else if (argument === "--file") options.filePath = resolve(repositoryRoot, arguments_[++index]);
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = parseArguments(process.argv.slice(2));
  const changed = updateUnderstanding(options.filePath, options);
  console.log(options.check ? "UNDERSTANDING generated section is clean." : changed ? "Updated UNDERSTANDING generated section." : "UNDERSTANDING generated section already current.");
}
