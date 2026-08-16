import { and, count, desc, eq, sum } from "drizzle-orm";
import { getDb } from "@/db";
import { audioPairs, dictionaryEntries, dictionaryExamples, dictionaryTranslations, trainingRuns } from "@/db/schema";
import { ApiError, enumField, handleApi, jsonOk, newId, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { requireAnyRole } from "@/lib/auth";
import { datasetReadiness } from "@/lib/training";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    await requireAnyRole(request, ["reviewer", "approved_translator", "moderator", "admin"]);
    const db = getDb();
    const [stats] = await db.select({ approvedItems: count(audioPairs.id), validatedSeconds: sum(audioPairs.durationSeconds) }).from(audioPairs).where(and(eq(audioPairs.status, "approved"), eq(audioPairs.quality, "validated"), eq(audioPairs.consentGranted, true)));
    const runs = await db.select().from(trainingRuns).orderBy(desc(trainingRuns.createdAt)).limit(20);
    return jsonOk({ readiness: datasetReadiness({ approvedItems: stats.approvedItems, validatedSeconds: Number(stats.validatedSeconds ?? 0) }), runs });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["reviewer", "approved_translator", "moderator", "admin"]);
    const body = await readJson(request);
    const action = body.action ?? "dictionary_pair";
    const db = getDb();
    if (action === "queue_export") {
      const taskType = enumField(body.taskType, "taskType", ["stt", "tts", "translation", "llm"] as const);
      const [stats] = await db.select({ items: count(audioPairs.id), seconds: sum(audioPairs.durationSeconds) }).from(audioPairs).where(and(eq(audioPairs.status, "approved"), eq(audioPairs.quality, "validated"), eq(audioPairs.consentGranted, true)));
      if (!stats.items) throw new ApiError(409, "There are no validated, consented audio pairs to export");
      const run = { id: newId("run"), taskType, datasetVersion: new Date().toISOString(), datasetItems: stats.items, datasetDurationSeconds: Number(stats.seconds ?? 0), requestedBy: user.id, statusMessage: "Queued for reviewed dataset export; no model training provider is configured by this application." };
      await db.insert(trainingRuns).values(run);
      await audit(request, { actor: user, action: "training.export.queue", entity: "training_run", entityId: run.id, after: run });
      return jsonOk({ run: { ...run, status: "queued" }, notice: "This queues a dataset export only. It does not claim or start model training." }, { status: 202 });
    }
    if (action !== "dictionary_pair") throw new ApiError(400, "action must be dictionary_pair or queue_export");
    const entryId = textField(body.entryId, "entryId", { max: 80 });
    const [row] = await db.select({ entryId: dictionaryEntries.id, word: dictionaryEntries.word, karen: dictionaryExamples.karen, english: dictionaryExamples.english })
      .from(dictionaryExamples).innerJoin(dictionaryEntries, eq(dictionaryEntries.id, dictionaryExamples.entryId))
      .where(and(eq(dictionaryEntries.status, "approved"), eq(dictionaryExamples.status, "approved"), ...(entryId ? [eq(dictionaryEntries.id, entryId)] : []))).orderBy(desc(dictionaryExamples.createdAt)).limit(1);
    if (!row) throw new ApiError(404, "No approved bilingual example is available");
    const translations = await db.select({ language: dictionaryTranslations.language, text: dictionaryTranslations.text, context: dictionaryTranslations.context }).from(dictionaryTranslations).where(and(eq(dictionaryTranslations.entryId, row.entryId), eq(dictionaryTranslations.status, "approved")));
    return jsonOk({ pair: { id: newId("pair"), ...row, translations, source: "approved_dictionary", synthetic: false }, notice: "This is a deterministic export of human-reviewed dictionary data, not AI-generated or model-trained output." });
  });
}
