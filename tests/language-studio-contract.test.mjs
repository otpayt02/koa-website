import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readRequired = (...segments) => {
  const path = resolve(repositoryRoot, ...segments);
  assert.ok(existsSync(path), `${segments.join("/")} must exist`);
  return readFileSync(path, "utf8");
};

test("Language Studio has a service, two admin APIs, and a client work surface", () => {
  for (const segments of [
    ["lib", "translation-service.ts"],
    ["app", "api", "admin", "content-units", "route.ts"],
    ["app", "api", "admin", "translation-proposals", "route.ts"],
    ["components", "admin", "LanguageStudio.tsx"],
  ]) {
    readRequired(...segments);
  }
});

test("every Language Studio API handler uses the shared admin-only API boundary", () => {
  const contentApi = readRequired("app", "api", "admin", "content-units", "route.ts");
  const proposalApi = readRequired("app", "api", "admin", "translation-proposals", "route.ts");

  assert.match(contentApi, /export async function GET\(request: Request\)/);
  assert.match(contentApi, /export async function POST\(request: Request\)/);
  assert.match(proposalApi, /export async function POST\(request: Request\)/);
  assert.match(proposalApi, /export async function PATCH\(request: Request\)/);

  for (const [name, source, count] of [
    ["content API", contentApi, 2],
    ["proposal API", proposalApi, 2],
  ]) {
    assert.equal(
      source.match(/requireAnyRole\(request,\s*\["admin"\]\)/g)?.length,
      count,
      `${name} must authorize every handler`,
    );
  }

  const APIs = `${contentApi}\n${proposalApi}`;
  for (const helper of ["handleApi", "readJson", "enumField", "numberField", "textField"]) {
    assert.match(APIs, new RegExp(`\\b${helper}\\b`), `admin APIs must use ${helper}`);
  }
});

test("the service keeps English revision ownership and review transitions auditable", () => {
  const service = readRequired("lib", "translation-service.ts");
  const proposalApi = readRequired("app", "api", "admin", "translation-proposals", "route.ts");

  assert.match(service, /contentUnits/);
  assert.match(service, /translationProposals/);
  assert.match(service, /sourceRevision/);
  assert.match(service, /sourceText/);
  assert.match(service, /sourceProvenance/);
  assert.match(service, /createProposalInput/);
  assert.match(service, /approved[\s\S]*rejected[\s\S]*superseded|\[\s*"approved"\s*,\s*"rejected"\s*,\s*"superseded"\s*\]/);
  assert.match(proposalApi, /await audit\(/);
  assert.match(proposalApi, /reviewerId/);
  assert.match(service, /reviewedAt/);
});

test("the protected page renders a functional, source-led Language Studio", () => {
  const page = readRequired("app", "[lang]", "admin", "language-studio", "page.tsx");
  const studio = readRequired("components", "admin", "LanguageStudio.tsx");

  assert.ok(page.indexOf("await requirePageAdmin(") < page.indexOf("return ("));
  assert.match(page, /<LanguageStudio/);
  assert.match(studio, /^\s*["']use client["'];/);
  assert.match(studio, /\/api\/admin\/content-units/);
  assert.match(studio, /\/api\/admin\/translation-proposals/);

  for (const locale of ["English", "Thai", "Burmese", "S'gaw Karen"]) {
    assert.match(studio, new RegExp(locale.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const control of ["Save draft", "Approve", "Reject", "Supersede"]) {
    assert.match(studio, new RegExp(control));
  }
  for (const state of [
    "Loading content units",
    "No content units yet",
    "Proposal saved",
    "Permission denied",
    "could not load",
  ]) {
    assert.match(studio, new RegExp(state, "i"));
  }
  assert.match(studio, /not training data/i);
  assert.match(studio, /provider/i);
  assert.match(studio, /model/i);
  assert.match(studio, /confidence/i);
  assert.match(studio, /provenance/i);
});

test("the studio uses dense aligned rows and responsive locale columns without AI calls", () => {
  const studio = readRequired("components", "admin", "LanguageStudio.tsx");
  const styles = readRequired("app", "globals.css");
  const implementation = `${studio}\n${readRequired("lib", "translation-service.ts")}\n${readRequired("app", "api", "admin", "translation-proposals", "route.ts")}`;

  assert.match(styles, /\.language-studio__locale-grid/);
  assert.match(styles, /grid-template-columns/);
  assert.match(styles, /\.language-studio__unit-row/);
  assert.match(styles, /@media\s*\(max-width:/);
  assert.doesNotMatch(implementation, /openai|anthropic|generateText|streamText|chat\.completions/i);
});
