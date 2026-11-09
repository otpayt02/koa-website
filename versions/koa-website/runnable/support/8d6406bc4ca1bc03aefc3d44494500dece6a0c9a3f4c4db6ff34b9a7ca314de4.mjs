import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schema = readFileSync(resolve(repositoryRoot, "db", "schema.ts"), "utf8");

test("translation content uses the four canonical locales and explicit review states", () => {
  assert.match(
    schema,
    /export const contentLocales\s*=\s*\[\s*["']en["']\s*,\s*["']th["']\s*,\s*["']my["']\s*,\s*["']ksw["']\s*\]\s*as const/,
  );
  assert.match(
    schema,
    /export const proposalStatuses\s*=\s*\[\s*["']draft["']\s*,\s*["']pending_review["']\s*,\s*["']approved["']\s*,\s*["']rejected["']\s*,\s*["']superseded["']\s*\]\s*as const/,
  );
});

test("content units retain canonical source revisions and provenance", () => {
  const declaration = schema.match(
    /export const contentUnits\s*=\s*sqliteTable\([\s\S]*?\n\}\s*,\s*\(table\)\s*=>\s*\[[\s\S]*?\]\s*\);/,
  )?.[0];

  assert.ok(declaration, "contentUnits table declaration must exist");
  for (const field of [
    "route",
    "section",
    "frame",
    "sourceRevision",
    "sourceText",
    "sourceProvenance",
  ]) {
    assert.match(declaration, new RegExp(`\\b${field}\\s*:`), `${field} must be retained`);
  }
  assert.match(declaration, /content_unit_revision_(?:idx|unique)/);
});

test("translation proposals retain provider, review, and supersession history", () => {
  const declaration = schema.match(
    /export const translationProposals\s*=\s*sqliteTable\([\s\S]*?\n\}\s*,\s*\(table\)\s*=>\s*\[[\s\S]*?\]\s*\);/,
  )?.[0];

  assert.ok(declaration, "translationProposals table declaration must exist");
  for (const field of [
    "contentUnitId",
    "sourceRevision",
    "locale",
    "value",
    "provider",
    "modelVersion",
    "confidence",
    "status",
    "reviewerId",
    "reviewNote",
    "reviewedAt",
    "supersedesProposalId",
  ]) {
    assert.match(declaration, new RegExp(`\\b${field}\\s*:`), `${field} must be retained`);
  }
  assert.match(declaration, /translation_proposal_unit_revision_idx/);
  assert.match(declaration, /translation_proposal_status_locale_idx/);
});

test("published compatibility accepts canonical locales only after approval", () => {
  const declaration = schema.match(
    /export const contentTranslations\s*=\s*sqliteTable\([\s\S]*?\n\}\s*,\s*\(table\)\s*=>\s*\[[\s\S]*?\]\s*\);/,
  )?.[0];

  assert.ok(declaration, "contentTranslations compatibility table must remain");
  assert.match(declaration, /language:\s*text\([^\n]*enum:\s*contentLocales/);
  assert.match(schema, /Only approved translation proposals may sync into contentTranslations\./);
  assert.doesNotMatch(schema, /pending_review[^\n]*(?:training|sync)|(?:training|sync)[^\n]*pending_review/i);
});
