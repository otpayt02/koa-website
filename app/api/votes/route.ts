import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { votes } from "@/db/schema";
import { ApiError, enumField, handleApi, jsonOk, newId, readJson, textField } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";

// POST /api/votes — one upvote per user per entity. Re-posting removes it
// (toggle), so the UI can support un-voting.
export async function POST(request: Request) {
  return handleApi(request, async () => {
    enforceRateLimit(request, "vote-toggle", 60, 60 * 60_000);
    const user = await requireUser(request);
    const body = await readJson(request);
    const entity = enumField(body.entity, "entity", ["lexicon_request", "dictionary_entry", "dictionary_translation", "grammar_rule"] as const);
    const entityId = textField(body.entityId, "entityId", { required: true, max: 80 })!;
    const db = getDb();
    const [existing] = await db.select().from(votes)
      .where(and(eq(votes.entity, entity), eq(votes.entityId, entityId), eq(votes.userId, user.id)))
      .limit(1);
    if (existing) {
      await db.delete(votes).where(eq(votes.id, existing.id));
      return jsonOk({ voted: false });
    }
    const id = newId("vote");
    await db.insert(votes).values({ id, entity, entityId, userId: user.id });
    return jsonOk({ voted: true }, { status: 201 });
  });
}
