import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { contentUnits, translationProposals } from "@/db/schema";
import { ApiError, newId } from "@/lib/api";
import {
  createProposalInput,
  isExportEligible,
  isTrainingEligible,
} from "@/lib/translation-policy.mjs";

export const reviewTransitions = ["approved", "rejected", "superseded"] as const;

export type ProposalLocale = "th" | "my" | "ksw";
export type ReviewTransition = (typeof reviewTransitions)[number];

type CreateEnglishRevisionInput = {
  route: string;
  section: string;
  frame: string;
  sourceText: string;
  provenanceNote: string | null;
  baseRevision: number;
  actorId: string;
};

type CreateTranslationProposalInput = {
  contentUnitId: string;
  sourceRevision: number;
  sourceLocale: "en";
  sourceProposalId?: string | null;
  locale: ProposalLocale;
  value: string;
  provider: string | null;
  modelVersion: string | null;
  confidence: number;
  status: "draft" | "pending_review";
  actorId: string;
};

export async function listLanguageStudioUnits() {
  const db = getDb();
  const revisions = await db.select().from(contentUnits).orderBy(
    asc(contentUnits.route),
    asc(contentUnits.section),
    asc(contentUnits.frame),
    desc(contentUnits.sourceRevision),
  );

  const latestByFrame = new Map<string, typeof contentUnits.$inferSelect>();
  for (const unit of revisions) {
    const key = frameKey(unit.route, unit.section, unit.frame);
    if (!latestByFrame.has(key)) latestByFrame.set(key, unit);
  }

  const units = Array.from(latestByFrame.values());
  const unitIds = units.map((unit) => unit.id);
  const proposals = unitIds.length
    ? await db.select().from(translationProposals)
      .where(inArray(translationProposals.contentUnitId, unitIds))
      .orderBy(desc(translationProposals.createdAt))
    : [];

  return units.map((unit) => ({
    ...unit,
    proposals: proposals
      .filter((proposal) => proposal.contentUnitId === unit.id)
      .map((proposal) => ({
        ...proposal,
        trainingEligible: isTrainingEligible(proposal, unit.sourceRevision),
        exportEligible: isExportEligible(proposal, unit.sourceRevision),
      })),
  }));
}

export async function createEnglishRevision(input: CreateEnglishRevisionInput) {
  const db = getDb();
  const [current] = await db.select().from(contentUnits).where(and(
    eq(contentUnits.route, input.route),
    eq(contentUnits.section, input.section),
    eq(contentUnits.frame, input.frame),
  )).orderBy(desc(contentUnits.sourceRevision)).limit(1);

  const currentRevision = current?.sourceRevision ?? 0;
  if (currentRevision !== input.baseRevision) {
    throw new ApiError(409, `English source changed. Current revision is ${currentRevision}.`);
  }

  const unit = {
    id: newId("content"),
    route: input.route,
    section: input.section,
    frame: input.frame,
    sourceRevision: currentRevision + 1,
    sourceText: input.sourceText,
    sourceProvenance: {
      sourceLocale: "en",
      authoredBy: input.actorId,
      note: input.provenanceNote,
      previousContentUnitId: current?.id ?? null,
    },
  };
  await db.insert(contentUnits).values(unit);
  return unit;
}

export async function createTranslationProposal(input: CreateTranslationProposalInput) {
  const normalized = createProposalInput(input);
  const db = getDb();
  const [unit] = await db.select().from(contentUnits).where(and(
    eq(contentUnits.id, normalized.contentUnitId),
    eq(contentUnits.sourceRevision, normalized.sourceRevision),
  )).limit(1);
  if (!unit) throw new ApiError(404, "English source revision not found");

  const proposal = {
    id: newId("proposal"),
    contentUnitId: normalized.contentUnitId,
    sourceRevision: normalized.sourceRevision,
    locale: normalized.locale as ProposalLocale,
    value: normalized.value,
    provider: normalized.provider,
    modelVersion: normalized.modelVersion,
    confidence: normalized.confidence,
    status: normalized.status as "draft" | "pending_review",
  };
  await db.insert(translationProposals).values(proposal);
  return {
    ...proposal,
    reviewerId: null,
    reviewNote: null,
    reviewedAt: null,
    supersedesProposalId: null,
    trainingEligible: false,
    exportEligible: false,
  };
}

export async function transitionTranslationProposal(input: {
  id: string;
  status: ReviewTransition;
  reviewerId: string;
  reviewNote: string | null;
}) {
  const db = getDb();
  const [before] = await db.select().from(translationProposals)
    .where(eq(translationProposals.id, input.id)).limit(1);
  if (!before) throw new ApiError(404, "Translation proposal not found");
  if (before.status === "superseded") throw new ApiError(409, "Superseded proposals cannot be reviewed again");

  const [source] = await db.select().from(contentUnits)
    .where(eq(contentUnits.id, before.contentUnitId)).limit(1);
  if (!source) throw new ApiError(409, "The proposal's English source revision no longer exists");

  const [current] = await db.select().from(contentUnits).where(and(
    eq(contentUnits.route, source.route),
    eq(contentUnits.section, source.section),
    eq(contentUnits.frame, source.frame),
  )).orderBy(desc(contentUnits.sourceRevision)).limit(1);

  if (input.status === "approved" && before.sourceRevision !== current?.sourceRevision) {
    throw new ApiError(409, "A stale proposal cannot be approved. Create a proposal for the current English revision.");
  }

  const reviewedAt = new Date();
  const [proposal] = await db.update(translationProposals).set({
    status: input.status,
    reviewerId: input.reviewerId,
    reviewNote: input.reviewNote,
    reviewedAt,
    updatedAt: reviewedAt,
  }).where(eq(translationProposals.id, input.id)).returning();

  return {
    before,
    proposal: {
      ...proposal,
      trainingEligible: isTrainingEligible(proposal, current?.sourceRevision),
      exportEligible: isExportEligible(proposal, current?.sourceRevision),
    },
  };
}

function frameKey(route: string, section: string, frame: string) {
  return `${route}\u0000${section}\u0000${frame}`;
}
