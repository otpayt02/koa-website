export const proposalLocales = ["th", "my", "ksw"];

/**
 * Normalize a translation proposal while preserving English as its only source.
 * S'gaw Karen enters human review immediately; the other locales may remain drafts.
 *
 * @param {{
 *   contentUnitId: unknown;
 *   sourceRevision: unknown;
 *   sourceLocale?: unknown;
 *   sourceProposalId?: unknown;
 *   locale: unknown;
 *   value: unknown;
 *   provider?: unknown;
 *   modelVersion?: unknown;
 *   confidence?: unknown;
 *   status?: unknown;
 * }} input
 */
export function createProposalInput(input) {
  const contentUnitId = requiredText(input.contentUnitId, "contentUnitId");
  if (!Number.isInteger(input.sourceRevision) || input.sourceRevision < 1) {
    throw new Error("sourceRevision must be a positive integer");
  }
  const sourceRevision = /** @type {number} */ (input.sourceRevision);
  if ((input.sourceLocale ?? "en") !== "en") {
    throw new Error("English is the only source locale");
  }
  if (input.sourceProposalId !== undefined && input.sourceProposalId !== null) {
    throw new Error("A locale proposal cannot cite another proposal as its source");
  }
  if (typeof input.locale !== "string" || !proposalLocales.includes(input.locale)) {
    throw new Error("Unsupported proposal locale");
  }

  const value = requiredText(input.value, "value");
  const confidence = optionalConfidence(input.confidence);
  const requestedStatus = input.status ?? "draft";
  if (!["draft", "pending_review"].includes(String(requestedStatus))) {
    throw new Error("A new proposal must begin as draft or pending_review");
  }

  return {
    contentUnitId,
    sourceRevision,
    sourceLocale: "en",
    locale: input.locale,
    value,
    provider: optionalText(input.provider),
    modelVersion: optionalText(input.modelVersion),
    confidence,
    status: input.locale === "ksw" ? "pending_review" : requestedStatus,
  };
}

export function isTrainingEligible(proposal, currentSourceRevision) {
  return isReviewedCurrentApproval(proposal, currentSourceRevision);
}

export function isExportEligible(proposal, currentSourceRevision) {
  return isReviewedCurrentApproval(proposal, currentSourceRevision);
}

function isReviewedCurrentApproval(proposal, currentSourceRevision) {
  return proposal?.status === "approved"
    && Boolean(proposal.reviewerId)
    && Number.isInteger(currentSourceRevision)
    && proposal.sourceRevision === currentSourceRevision;
}

function requiredText(value, name) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${name} is required`);
  return value.trim();
}

function optionalText(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new Error("Proposal provenance values must be text");
  return value.trim() || null;
}

function optionalConfidence(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error("confidence must be between 0 and 1");
  }
  return value;
}
