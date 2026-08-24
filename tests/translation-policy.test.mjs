import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policyPath = resolve(repositoryRoot, "lib", "translation-policy.mjs");
const policy = existsSync(policyPath) ? await import(pathToFileURL(policyPath)) : null;

test("English is the only source locale for translation proposals", () => {
  assert.ok(policy, "lib/translation-policy.mjs must exist");
  assert.deepEqual(policy.proposalLocales, ["th", "my", "ksw"]);

  assert.throws(
    () => policy.createProposalInput(baseInput({ locale: "en" })),
    /Unsupported proposal locale/,
  );
  assert.throws(
    () => policy.createProposalInput(baseInput({ sourceLocale: "th" })),
    /English is the only source locale/,
  );
});

test("all locale proposals independently reference one English unit revision", () => {
  assert.ok(policy, "lib/translation-policy.mjs must exist");

  const proposals = policy.proposalLocales.map((locale) =>
    policy.createProposalInput(baseInput({ locale, value: `${locale} proposal` })),
  );

  for (const proposal of proposals) {
    assert.equal(proposal.contentUnitId, "content_home_hero_title");
    assert.equal(proposal.sourceRevision, 7);
    assert.equal(proposal.sourceLocale, "en");
    assert.equal("sourceProposalId" in proposal, false);
  }

  assert.throws(
    () => policy.createProposalInput(baseInput({ sourceProposalId: "proposal_th_old" })),
    /cannot cite another proposal/i,
  );
});

test("S'gaw Karen proposals always begin pending review", () => {
  assert.ok(policy, "lib/translation-policy.mjs must exist");

  const proposal = policy.createProposalInput(
    baseInput({ locale: "ksw", status: "draft" }),
  );

  assert.equal(proposal.status, "pending_review");
});

test("proposal input rejects incomplete provenance and invalid confidence", () => {
  assert.ok(policy, "lib/translation-policy.mjs must exist");

  assert.throws(
    () => policy.createProposalInput(baseInput({ contentUnitId: "" })),
    /contentUnitId is required/,
  );
  assert.throws(
    () => policy.createProposalInput(baseInput({ sourceRevision: 0 })),
    /positive integer/,
  );
  assert.throws(
    () => policy.createProposalInput(baseInput({ value: "  " })),
    /value is required/,
  );
  assert.throws(
    () => policy.createProposalInput(baseInput({ confidence: 1.2 })),
    /confidence must be between 0 and 1/,
  );
});

test("training and export eligibility require current reviewed approval", () => {
  assert.ok(policy, "lib/translation-policy.mjs must exist");
  const eligible = {
    status: "approved",
    reviewerId: "user_reviewer",
    sourceRevision: 7,
  };

  assert.equal(policy.isTrainingEligible(eligible, 7), true);
  assert.equal(policy.isExportEligible(eligible, 7), true);

  for (const proposal of [
    { ...eligible, status: "pending_review" },
    { ...eligible, reviewerId: null },
    { ...eligible, sourceRevision: 6 },
  ]) {
    assert.equal(policy.isTrainingEligible(proposal, 7), false);
    assert.equal(policy.isExportEligible(proposal, 7), false);
  }
});

function baseInput(overrides = {}) {
  return {
    contentUnitId: "content_home_hero_title",
    sourceRevision: 7,
    sourceLocale: "en",
    locale: "th",
    value: "A proposal",
    provider: "human",
    modelVersion: "manual",
    confidence: 0.86,
    ...overrides,
  };
}
