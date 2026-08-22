import { and, count, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { dictionaryEntries, lexiconRequests, votes } from "@/db/schema";
import { ApiError, enumField, handleApi, jsonOk, newId, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { optionalUser } from "@/lib/auth";
import { normalizeSearch, validateCommunityText } from "@/lib/moderation";
import { enforceRateLimit } from "@/lib/rate-limit";

// GET /api/dictionary/requests?status=open|claimed|fulfilled|all
// Returns the requests board with vote counts + lexicon stats.
export async function GET(request: Request) {
  return handleApi(request, async () => {
    const db = getDb();
    const params = new URL(request.url).searchParams;
    const status = params.get("status") ?? "open";
    const statusCondition =
      status === "all"
        ? undefined
        : eq(lexiconRequests.status, enumField(status, "status", ["open", "claimed", "fulfilled", "dismissed"] as const));
    const requests = await db.select().from(lexiconRequests).where(statusCondition).orderBy(lexiconRequests.createdAt);
    const voteCounts = await db
      .select({ entityId: votes.entityId, n: count(votes.id) })
      .from(votes)
      .where(eq(votes.entity, "lexicon_request"))
      .groupBy(votes.entityId);
    const countsById = new Map(voteCounts.map((v) => [v.entityId, v.n]));
    const [approved] = await db.select({ n: count() }).from(dictionaryEntries).where(eq(dictionaryEntries.status, "approved"));
    const [pending] = await db.select({ n: count() }).from(dictionaryEntries).where(eq(dictionaryEntries.status, "pending"));
    return jsonOk({
      requests: requests.map((r) => ({ ...r, votes: countsById.get(r.id) ?? 0 })),
      stats: {
        approvedEntries: approved?.n ?? 0,
        pendingEntries: pending?.n ?? 0,
        openRequests: requests.filter((r) => r.status === "open").length,
      },
    });
  });
}

// POST /api/dictionary/requests — anyone (signed-in or not) can flag a word
// or sentence that has no translation yet. Duplicates fold into the existing
// open request so upvotes accumulate on one item.
export async function POST(request: Request) {
  return handleApi(request, async () => {
    enforceRateLimit(request, "lexicon-request-create", 20, 60 * 60_000);
    const user = await optionalUser(request);
    const body = await readJson(request);
    const term = validateCommunityText(textField(body.term, "term", { required: true, max: 240 })!, "term");
    const contextRaw = textField(body.context, "context", { max: 500 });
    const context = contextRaw ? validateCommunityText(contextRaw, "context") : null;
    const detectedLanguage = enumField(body.detectedLanguage ?? "unknown", "detectedLanguage", ["karen", "en", "my", "th", "unknown"] as const);
    const db = getDb();
    const normalized = normalizeSearch(term);
    const [existing] = await db.select().from(lexiconRequests)
      .where(and(eq(lexiconRequests.normalizedTerm, normalized), inArray(lexiconRequests.status, ["open", "claimed"])))
      .limit(1);
    if (existing) return jsonOk({ request: existing, duplicate: true });
    const id = newId("request");
    const row = {
      id,
      term,
      normalizedTerm: normalized,
      detectedLanguage,
      context,
      requesterId: user?.id ?? null,
      requesterName: textField(body.requesterName ?? body.name, "requesterName", { max: 120 }),
      status: "open" as const,
    };
    await db.insert(lexiconRequests).values(row);
    if (user) {
      await audit(request, { actor: user, action: "lexicon.request", entity: "lexicon_request", entityId: id, after: row });
    }
    return jsonOk({ request: row }, { status: 201 });
  });
}
