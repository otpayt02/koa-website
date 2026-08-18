import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  auditLogs,
  contentTranslationPublications,
  contentTranslationRevisions,
  translationPublicationBatches,
} from "@/db/schema";
import { contentCatalog, contentCatalogVersion, getContentDefinition } from "@/content/catalog";
import type { PublishEntryInput, SaveDraftInput, StudioEntry, StudioResponse } from "@/content/studio-types";
import type { ApiUser } from "@/lib/auth";
import { ApiError, newId } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { getBindings } from "@/lib/cloudflare";

type Revision = typeof contentTranslationRevisions.$inferSelect;
type Publication = typeof contentTranslationPublications.$inferSelect;

export async function loadStudio(user: ApiUser): Promise<StudioResponse> {
  const { revisions, publications } = await loadTranslationRows();
  return {
    catalogVersion: contentCatalogVersion,
    user: { id: user.id, displayName: user.displayName, email: user.email },
    entries: buildStudioEntries(revisions, publications),
  };
}

export async function saveDraftPair(request: Request, user: ApiUser, input: SaveDraftInput): Promise<StudioEntry> {
  const definition = getContentDefinition(input.key);
  const en = validateValue(input.en, "English counterpart", true);
  const karen = validateValue(input.karen, "S'gaw Karen counterpart", false);
  const db = getDb();
  const current = await db.select().from(contentTranslationRevisions)
    .where(eq(contentTranslationRevisions.contentKey, input.key))
    .orderBy(desc(contentTranslationRevisions.version));
  const latestEn = latest(current, "en");
  const latestKaren = latest(current, "karen");

  assertExpected("English", input.expected.en, latestEn?.id ?? null);
  assertExpected("S'gaw Karen", input.expected.karen, latestKaren?.id ?? null);

  const enRevision = revisionValues(input.key, "en", en, latestEn, user.id, Boolean(input.imported));
  const karenRevision = revisionValues(input.key, "karen", karen, latestKaren, user.id, Boolean(input.imported));
  const binding = requireD1();

  try {
    await binding.batch([
      binding.prepare("INSERT INTO content_translation_revisions (id, content_key, language, value, version, base_revision_id, author_id, imported, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(enRevision.id, enRevision.contentKey, enRevision.language, enRevision.value, enRevision.version, enRevision.baseRevisionId, enRevision.authorId, enRevision.imported ? 1 : 0, enRevision.createdAt.getTime()),
      binding.prepare("INSERT INTO content_translation_revisions (id, content_key, language, value, version, base_revision_id, author_id, imported, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(karenRevision.id, karenRevision.contentKey, karenRevision.language, karenRevision.value, karenRevision.version, karenRevision.baseRevisionId, karenRevision.authorId, karenRevision.imported ? 1 : 0, karenRevision.createdAt.getTime()),
    ]);
  } catch (error) {
    if (/unique|constraint/i.test(error instanceof Error ? error.message : String(error))) {
      throw new ApiError(409, "This entry changed while you were editing. Reload it and compare both versions.");
    }
    throw error;
  }

  await audit(request, {
    actor: user,
    action: input.imported ? "content_translation.imported" : "content_translation.draft_saved",
    entity: "content_translation",
    entityId: input.key,
    before: { en: latestEn?.value ?? definition.en, karen: latestKaren?.value ?? definition.karen },
    after: { en, karen, enRevisionId: enRevision.id, karenRevisionId: karenRevision.id },
  });

  const { revisions, publications } = await loadTranslationRows(input.key);
  return buildStudioEntries(revisions, publications).find((entry) => entry.key === input.key)!;
}

export async function publishEntries(request: Request, user: ApiUser, entries: PublishEntryInput[]): Promise<{ batchId: string; published: number }> {
  if (!entries.length) throw new ApiError(400, "Select at least one changed entry to publish");
  if (entries.length > contentCatalog.length) throw new ApiError(400, "Publication selection is too large");
  const uniqueKeys = new Set(entries.map((entry) => entry.key));
  if (uniqueKeys.size !== entries.length) throw new ApiError(400, "Publication selection contains duplicate keys");

  const db = getDb();
  const selected: Array<{ input: PublishEntryInput; en: Revision; karen: Revision }> = [];
  for (const input of entries) {
    getContentDefinition(input.key);
    const revisions = await db.select().from(contentTranslationRevisions)
      .where(eq(contentTranslationRevisions.contentKey, input.key))
      .orderBy(desc(contentTranslationRevisions.version));
    const en = latest(revisions, "en");
    const karen = latest(revisions, "karen");
    if (!en || !karen || en.id !== input.enRevisionId || karen.id !== input.karenRevisionId) {
      throw new ApiError(409, `${input.key} changed after the publication review opened`);
    }
    if (!en.value.trim() || !karen.value.trim()) {
      throw new ApiError(400, `${input.key} needs both counterparts before it can be verified and published`);
    }
    selected.push({ input, en, karen });
  }

  const batchId = newId("translation_batch");
  const now = Date.now();
  const binding = requireD1();
  const statements = [
    binding.prepare("INSERT INTO translation_publication_batches (id, published_by, entry_count, created_at) VALUES (?, ?, ?, ?)")
      .bind(batchId, user.id, selected.length, now),
    ...selected.map(({ input, en, karen }) => binding.prepare(
      "INSERT INTO content_translation_publications (content_key, english_revision_id, karen_revision_id, publication_batch_id, published_by, published_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(content_key) DO UPDATE SET english_revision_id = excluded.english_revision_id, karen_revision_id = excluded.karen_revision_id, publication_batch_id = excluded.publication_batch_id, published_by = excluded.published_by, published_at = excluded.published_at",
    ).bind(input.key, en.id, karen.id, batchId, user.id, now)),
  ];
  await binding.batch(statements);

  await audit(request, {
    actor: user,
    action: "content_translation.session_published",
    entity: "translation_publication_batch",
    entityId: batchId,
    after: selected.map(({ input, en, karen }) => ({ key: input.key, enRevisionId: en.id, karenRevisionId: karen.id })),
  });
  return { batchId, published: selected.length };
}

export async function backupExport(user: ApiUser) {
  const db = getDb();
  const [revisions, publications, batches, audits] = await Promise.all([
    db.select().from(contentTranslationRevisions).orderBy(contentTranslationRevisions.contentKey, contentTranslationRevisions.language, contentTranslationRevisions.version),
    db.select().from(contentTranslationPublications).orderBy(contentTranslationPublications.contentKey),
    db.select().from(translationPublicationBatches).orderBy(translationPublicationBatches.createdAt),
    db.select().from(auditLogs).where(eq(auditLogs.entity, "content_translation")).orderBy(auditLogs.createdAt),
  ]);
  return {
    format: "koa-bilingual-backup",
    version: 1,
    catalogVersion: contentCatalogVersion,
    exportedAt: new Date().toISOString(),
    exportedBy: user.id,
    catalog: contentCatalog,
    revisions,
    publications,
    publicationBatches: batches,
    audit: audits,
  };
}

export async function corpusExport(): Promise<string> {
  const { revisions, publications } = await loadTranslationRows();
  const revisionById = new Map(revisions.map((revision) => [revision.id, revision]));
  return publications.map((publication) => {
    const definition = getContentDefinition(publication.contentKey);
    const en = revisionById.get(publication.englishRevisionId);
    const karen = revisionById.get(publication.karenRevisionId);
    if (!en?.value || !karen?.value) return null;
    return JSON.stringify({
      key: publication.contentKey,
      route: definition.route,
      section: definition.section,
      contentType: definition.type,
      en: en.value,
      ksw: karen.value,
      verifiedAt: publication.publishedAt.toISOString(),
      publicationBatchId: publication.publicationBatchId,
    });
  }).filter(Boolean).join("\n");
}

async function loadTranslationRows(contentKey?: string): Promise<{ revisions: Revision[]; publications: Publication[] }> {
  const db = getDb();
  if (contentKey) {
    const [revisions, publications] = await Promise.all([
      db.select().from(contentTranslationRevisions).where(eq(contentTranslationRevisions.contentKey, contentKey)).orderBy(desc(contentTranslationRevisions.version)),
      db.select().from(contentTranslationPublications).where(eq(contentTranslationPublications.contentKey, contentKey)),
    ]);
    return { revisions, publications };
  }
  const [revisions, publications] = await Promise.all([
    db.select().from(contentTranslationRevisions).orderBy(desc(contentTranslationRevisions.version)),
    db.select().from(contentTranslationPublications),
  ]);
  return { revisions, publications };
}

function buildStudioEntries(revisions: Revision[], publications: Publication[]): StudioEntry[] {
  const revisionsByKey = new Map<string, Revision[]>();
  for (const revision of revisions) {
    const bucket = revisionsByKey.get(revision.contentKey) ?? [];
    bucket.push(revision);
    revisionsByKey.set(revision.contentKey, bucket);
  }
  const publicationByKey = new Map(publications.map((publication) => [publication.contentKey, publication]));
  const revisionById = new Map(revisions.map((revision) => [revision.id, revision]));

  return contentCatalog.map((definition) => {
    const bucket = revisionsByKey.get(definition.key) ?? [];
    const enRevision = latest(bucket, "en");
    const karenRevision = latest(bucket, "karen");
    const publication = publicationByKey.get(definition.key);
    const publishedEn = publication ? revisionById.get(publication.englishRevisionId) : undefined;
    const publishedKaren = publication ? revisionById.get(publication.karenRevisionId) : undefined;
    const enValue = enRevision?.value ?? definition.en;
    const karenValue = karenRevision?.value ?? definition.karen;
    const verified = Boolean(publication && enRevision?.id === publication.englishRevisionId && karenRevision?.id === publication.karenRevisionId);
    const status = verified ? "verified" : (enRevision || karenRevision) ? "draft" : karenValue ? "unverified" : "missing";
    return {
      ...definition,
      status,
      enState: {
        value: enValue,
        revisionId: enRevision?.id ?? null,
        version: enRevision?.version ?? 0,
        publishedValue: publishedEn?.value ?? null,
        publishedRevisionId: publication?.englishRevisionId ?? null,
      },
      karenState: {
        value: karenValue,
        revisionId: karenRevision?.id ?? null,
        version: karenRevision?.version ?? 0,
        publishedValue: publishedKaren?.value ?? null,
        publishedRevisionId: publication?.karenRevisionId ?? null,
      },
    };
  });
}

function latest(revisions: Revision[], language: "en" | "karen"): Revision | undefined {
  return revisions.filter((revision) => revision.language === language).sort((a, b) => b.version - a.version)[0];
}

function assertExpected(label: string, expected: string | null, actual: string | null) {
  if (expected !== actual) throw new ApiError(409, `${label} changed while you were editing. Compare the latest revision before saving.`);
}

function validateValue(value: unknown, label: string, required: boolean): string {
  if (typeof value !== "string") throw new ApiError(400, `${label} must be text`);
  const normalized = value.replaceAll("\r\n", "\n").trim();
  if (required && !normalized) throw new ApiError(400, `${label} is required`);
  if (normalized.length > 20_000) throw new ApiError(400, `${label} must be at most 20,000 characters`);
  return normalized;
}

function revisionValues(contentKey: string, language: "en" | "karen", value: string, previous: Revision | undefined, authorId: string, imported: boolean) {
  return {
    id: newId("content_revision"),
    contentKey,
    language,
    value,
    version: (previous?.version ?? 0) + 1,
    baseRevisionId: previous?.id ?? null,
    authorId,
    imported,
    createdAt: new Date(),
  } as const;
}

function requireD1(): D1Database {
  const binding = getBindings().DB;
  if (!binding) throw new ApiError(503, "The translation database is not configured");
  return binding;
}
