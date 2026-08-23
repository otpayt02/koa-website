import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { dictionaryEntries, dictionaryExamples, dictionaryRelations, dictionaryTranslations } from "@/db/schema";
import { ApiError, enumField, handleApi, jsonOk, newId, pagination, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { requireAnyRole, requireUser } from "@/lib/auth";
import { validateCommunityText } from "@/lib/moderation";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    await requireAnyRole(request, ["reviewer", "approved_translator", "moderator", "admin"]);
    const { limit, offset } = pagination(request.url, 100);
    const db = getDb();
    const [entries, translations, examples, relations] = await Promise.all([
      db.select().from(dictionaryEntries).where(eq(dictionaryEntries.status, "pending")).orderBy(desc(dictionaryEntries.createdAt)).limit(limit).offset(offset),
      db.select().from(dictionaryTranslations).where(eq(dictionaryTranslations.status, "pending")).orderBy(desc(dictionaryTranslations.createdAt)).limit(limit).offset(offset),
      db.select().from(dictionaryExamples).where(eq(dictionaryExamples.status, "pending")).orderBy(desc(dictionaryExamples.createdAt)).limit(limit).offset(offset),
      db.select().from(dictionaryRelations).where(eq(dictionaryRelations.status, "pending")).orderBy(desc(dictionaryRelations.createdAt)).limit(limit).offset(offset),
    ]);
    return jsonOk({ queue: { entries, translations, examples, relations }, pagination: { limit, offset } });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    enforceRateLimit(request, "contribute", 30, 60 * 60_000);
    const user = await requireUser(request);
    const body = await readJson(request);
    const type = enumField(body.type, "type", ["translation", "example", "relation"] as const);
    const entryId = textField(body.entryId, "entryId", { required: true, max: 80 })!;
    const db = getDb();
    const [entry] = await db.select({ id: dictionaryEntries.id }).from(dictionaryEntries).where(and(eq(dictionaryEntries.id, entryId), eq(dictionaryEntries.status, "approved"))).limit(1);
    if (!entry) throw new ApiError(404, "Approved dictionary entry not found");
    let submission: Record<string, unknown>;
    if (type === "translation") {
      submission = { id: newId("translation"), entryId, language: enumField(body.language, "language", ["en", "karen"] as const), text: validateCommunityText(textField(body.text, "text", { required: true, max: 500 })!, "text"), context: textField(body.context, "context", { max: 240 }), dialect: textField(body.dialect, "dialect", { max: 80 }), contributorId: user.id };
      await db.insert(dictionaryTranslations).values(submission as typeof dictionaryTranslations.$inferInsert);
    } else if (type === "example") {
      submission = { id: newId("example"), entryId, karen: validateCommunityText(textField(body.karen, "karen", { required: true, max: 1_000 })!, "karen"), english: validateCommunityText(textField(body.english, "english", { required: true, max: 1_000 })!, "english"), contributorId: user.id };
      await db.insert(dictionaryExamples).values(submission as typeof dictionaryExamples.$inferInsert);
    } else {
      const relatedEntryId = textField(body.relatedEntryId, "relatedEntryId", { max: 80 });
      const relatedText = textField(body.relatedText, "relatedText", { max: 160 });
      if (!relatedEntryId && !relatedText) throw new ApiError(400, "relatedEntryId or relatedText is required");
      submission = { id: newId("relation"), entryId, relation: enumField(body.relation, "relation", ["synonym", "antonym", "related"] as const), relatedEntryId, relatedText, contributorId: user.id };
      await db.insert(dictionaryRelations).values(submission as typeof dictionaryRelations.$inferInsert);
    }
    await audit(request, { actor: user, action: `contribution.${type}.create`, entity: `dictionary_${type}`, entityId: String(submission.id), after: submission });
    return jsonOk({ submission: { ...submission, type, status: "pending" }, moderation: "pending" }, { status: 201 });
  });
}

export async function PATCH(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["reviewer", "approved_translator", "moderator", "admin"]);
    const body = await readJson(request);
    const type = enumField(body.type, "type", ["translation", "example", "relation"] as const);
    const id = textField(body.id, "id", { required: true, max: 80 })!;
    const status = enumField(body.status, "status", ["pending", "approved", "rejected"] as const);
    const db = getDb();
    let result: unknown;
    if (type === "translation") [result] = await db.update(dictionaryTranslations).set({ status, reviewerId: user.id, updatedAt: new Date() }).where(eq(dictionaryTranslations.id, id)).returning();
    if (type === "example") [result] = await db.update(dictionaryExamples).set({ status, reviewerId: user.id, updatedAt: new Date() }).where(eq(dictionaryExamples.id, id)).returning();
    if (type === "relation") [result] = await db.update(dictionaryRelations).set({ status }).where(eq(dictionaryRelations.id, id)).returning();
    if (!result) throw new ApiError(404, "Contribution not found");
    await audit(request, { actor: user, action: `contribution.${type}.moderate`, entity: `dictionary_${type}`, entityId: id, after: result });
    return jsonOk({ submission: result });
  });
}
