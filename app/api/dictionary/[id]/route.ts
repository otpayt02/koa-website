import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { audioPairs, dictionaryDiscussions, dictionaryEntries, dictionaryExamples, dictionaryRelations, dictionaryTranslations, dictionaryVersions } from "@/db/schema";
import { ApiError, enumField, handleApi, jsonOk, newId, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { canReview, optionalUser, requireAnyRole, requireUser } from "@/lib/auth";
import { normalizeSearch, validateCommunityText } from "@/lib/moderation";
import { enforceRateLimit } from "@/lib/rate-limit";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const user = await optionalUser(request);
    const db = getDb();
    const [entry] = await db.select().from(dictionaryEntries).where(eq(dictionaryEntries.id, id)).limit(1);
    if (!entry || (entry.status !== "approved" && entry.createdBy !== user?.id && (!user || !canReview(user)))) throw new ApiError(404, "Dictionary entry not found");
    const approvedOnly = entry.status === "approved" && (!user || !canReview(user));
    const [translations, examples, relations, versions, audio, discussion] = await Promise.all([
      db.select().from(dictionaryTranslations).where(and(eq(dictionaryTranslations.entryId, id), ...(approvedOnly ? [eq(dictionaryTranslations.status, "approved" as const)] : []))),
      db.select().from(dictionaryExamples).where(and(eq(dictionaryExamples.entryId, id), ...(approvedOnly ? [eq(dictionaryExamples.status, "approved" as const)] : []))),
      db.select().from(dictionaryRelations).where(and(eq(dictionaryRelations.entryId, id), ...(approvedOnly ? [eq(dictionaryRelations.status, "approved" as const)] : []))),
      db.select().from(dictionaryVersions).where(eq(dictionaryVersions.entryId, id)).orderBy(desc(dictionaryVersions.version)),
      db.select({ id: audioPairs.id, publicUrl: audioPairs.publicUrl, durationSeconds: audioPairs.durationSeconds, dialect: audioPairs.dialect, quality: audioPairs.quality }).from(audioPairs).where(and(eq(audioPairs.entryId, id), eq(audioPairs.status, "approved"))),
      db.select().from(dictionaryDiscussions).where(and(eq(dictionaryDiscussions.entryId, id), eq(dictionaryDiscussions.status, "visible"))).orderBy(desc(dictionaryDiscussions.createdAt)),
    ]);
    return jsonOk({ entry, translations, examples, relations, versions, audio, discussion });
  });
}

export async function POST(request: Request, context: Context) {
  return handleApi(request, async () => {
    enforceRateLimit(request, "dictionary-discussion", 20, 60 * 60_000);
    const user = await requireUser(request);
    const { id: entryId } = await context.params;
    const body = await readJson(request);
    const bodyText = validateCommunityText(textField(body.body, "body", { required: true, min: 2, max: 4_000 })!, "body");
    const db = getDb();
    const [entry] = await db.select({ id: dictionaryEntries.id }).from(dictionaryEntries).where(and(eq(dictionaryEntries.id, entryId), eq(dictionaryEntries.status, "approved"))).limit(1);
    if (!entry) throw new ApiError(404, "Dictionary entry not found");
    const discussion = { id: newId("comment"), entryId, authorId: user.id, parentId: textField(body.parentId, "parentId", { max: 80 }), body: bodyText };
    await db.insert(dictionaryDiscussions).values(discussion);
    await audit(request, { actor: user, action: "dictionary.discussion.create", entity: "dictionary_discussion", entityId: discussion.id, after: discussion });
    return jsonOk({ discussion: { ...discussion, status: "pending" }, moderation: "pending" }, { status: 201 });
  });
}

export async function PATCH(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser(request);
    const { id } = await context.params;
    const body = await readJson(request);
    const db = getDb();
    const [before] = await db.select().from(dictionaryEntries).where(eq(dictionaryEntries.id, id)).limit(1);
    if (!before) throw new ApiError(404, "Dictionary entry not found");
    const reviewing = body.status !== undefined;
    if (reviewing && !canReview(user)) throw new ApiError(403, "Reviewer access is required to change moderation status");
    if (!reviewing && before.createdBy !== user.id && !canReview(user)) throw new ApiError(403, "You can only edit your own submission");
    if (!reviewing && !["pending", "changes_requested"].includes(before.status)) throw new ApiError(409, "Published entries must be edited through a reviewed revision");
    const update: Partial<typeof dictionaryEntries.$inferInsert> = { updatedAt: new Date() };
    if (body.word !== undefined) { const word = validateCommunityText(textField(body.word, "word", { required: true, max: 160 })!, "word"); update.word = word; update.normalizedWord = normalizeSearch(word); }
    if (body.partOfSpeech !== undefined) update.partOfSpeech = textField(body.partOfSpeech, "partOfSpeech", { max: 80 });
    if (body.category !== undefined) update.category = textField(body.category, "category", { max: 80 });
    if (body.etymology !== undefined) update.etymology = textField(body.etymology, "etymology", { max: 2_000 });
    if (reviewing) {
      update.status = enumField(body.status, "status", ["pending", "changes_requested", "approved", "rejected", "archived"] as const);
      update.reviewNote = textField(body.reviewNote, "reviewNote", { max: 2_000 });
      update.reviewedBy = user.id;
      update.reviewedAt = new Date();
    }
    update.version = before.version + 1;
    const [entry] = await db.update(dictionaryEntries).set(update).where(eq(dictionaryEntries.id, id)).returning();
    await db.insert(dictionaryVersions).values({ id: newId("version"), entryId: id, version: entry.version, editorId: user.id, changeSummary: textField(body.changeSummary, "changeSummary", { max: 500 }) ?? (reviewing ? `Moderation status set to ${entry.status}` : "Contributor revision"), snapshot: entry });
    await audit(request, { actor: user, action: reviewing ? "dictionary.moderate" : "dictionary.update", entity: "dictionary_entry", entityId: id, before, after: entry });
    return jsonOk({ entry });
  });
}

export async function DELETE(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["moderator", "admin"]);
    const { id } = await context.params;
    const db = getDb();
    const [before] = await db.select().from(dictionaryEntries).where(eq(dictionaryEntries.id, id)).limit(1);
    if (!before) throw new ApiError(404, "Dictionary entry not found");
    const [entry] = await db.update(dictionaryEntries).set({ status: "archived", reviewedBy: user.id, reviewedAt: new Date(), updatedAt: new Date() }).where(eq(dictionaryEntries.id, id)).returning();
    await audit(request, { actor: user, action: "dictionary.archive", entity: "dictionary_entry", entityId: id, before, after: entry });
    return jsonOk({ entry });
  });
}
