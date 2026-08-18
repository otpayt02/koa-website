import { and, asc, desc, eq, inArray, like, or } from "drizzle-orm";
import { getDb } from "@/db";
import { dictionaryEntries, dictionaryTranslations, dictionaryVersions } from "@/db/schema";
import { enumField, handleApi, jsonOk, newId, pagination, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { requireUser } from "@/lib/auth";
import { normalizeSearch, validateCommunityText } from "@/lib/moderation";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const db = getDb();
    const { limit, offset } = pagination(request.url, 50);
    const params = new URL(request.url).searchParams;
    const query = normalizeSearch(params.get("q") ?? "");
    const category = params.get("category")?.trim();
    const conditions = [eq(dictionaryEntries.status, "approved")];
    if (category) conditions.push(eq(dictionaryEntries.category, category));
    if (query) conditions.push(or(like(dictionaryEntries.normalizedWord, `%${query}%`), like(dictionaryTranslations.text, `%${query}%`))!);
    const entries = await db.selectDistinct({ entry: dictionaryEntries }).from(dictionaryEntries)
      .leftJoin(dictionaryTranslations, and(eq(dictionaryTranslations.entryId, dictionaryEntries.id), eq(dictionaryTranslations.status, "approved")))
      .where(and(...conditions)).orderBy(asc(dictionaryEntries.normalizedWord), desc(dictionaryEntries.updatedAt)).limit(limit).offset(offset);
    const ids = entries.map(({ entry }) => entry.id);
    const translations = ids.length ? await db.select().from(dictionaryTranslations).where(and(inArray(dictionaryTranslations.entryId, ids), eq(dictionaryTranslations.status, "approved"))) : [];
    return jsonOk({ entries: entries.map(({ entry }) => ({ ...entry, translations: translations.filter((item) => item.entryId === entry.id) })), pagination: { limit, offset } });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    enforceRateLimit(request, "dictionary-create", 10, 60 * 60_000);
    const user = await requireUser(request);
    const body = await readJson(request);
    const word = validateCommunityText(textField(body.word, "word", { required: true, max: 160 })!, "word");
    const translation = validateCommunityText(textField(body.translation, "translation", { required: true, max: 500 })!, "translation");
    const translationLanguage = enumField(body.translationLanguage ?? "en", "translationLanguage", ["en", "karen"] as const);
    const id = newId("entry");
    const entry = { id, word, normalizedWord: normalizeSearch(word), partOfSpeech: textField(body.partOfSpeech, "partOfSpeech", { max: 80 }), category: textField(body.category, "category", { max: 80 }), etymology: textField(body.etymology, "etymology", { max: 2_000 }), source: "community" as const, createdBy: user.id };
    const db = getDb();
    await db.batch([
      db.insert(dictionaryEntries).values(entry),
      db.insert(dictionaryTranslations).values({ id: newId("translation"), entryId: id, language: translationLanguage, text: translation, context: textField(body.context, "context", { max: 240 }), dialect: textField(body.dialect, "dialect", { max: 80 }), contributorId: user.id }),
      db.insert(dictionaryVersions).values({ id: newId("version"), entryId: id, version: 1, editorId: user.id, changeSummary: "Initial community submission", snapshot: entry }),
    ]);
    await audit(request, { actor: user, action: "dictionary.create", entity: "dictionary_entry", entityId: id, after: entry });
    return jsonOk({ entry: { ...entry, status: "pending", version: 1 }, moderation: "pending" }, { status: 201 });
  });
}
