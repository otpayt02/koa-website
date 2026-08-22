import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { grammarAnnotations, grammarRules } from "@/db/schema";
import { ApiError, enumField, handleApi, jsonOk, newId, numberField, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { requireUser } from "@/lib/auth";
import { validateCommunityText } from "@/lib/moderation";
import { enforceRateLimit } from "@/lib/rate-limit";

// GET /api/grammar/annotations?text=<karen sentence> or ?entity=&entityId=
// Returns approved annotations with their governing rule embedded — this is
// what the highlight tool renders: hover a span → see the rule card.
export async function GET(request: Request) {
  return handleApi(request, async () => {
    const url = new URL(request.url);
    const text = url.searchParams.get("text")?.trim();
    const entity = url.searchParams.get("entity");
    const entityId = url.searchParams.get("entityId");
    if (!text && !(entity && entityId)) throw new ApiError(400, "Provide ?text= or ?entity=&entityId=");
    const db = getDb();
    const rows = text
      ? await db.select().from(grammarAnnotations).where(and(eq(grammarAnnotations.karenText, text), eq(grammarAnnotations.status, "approved")))
      : await db.select().from(grammarAnnotations).where(and(eq(grammarAnnotations.entity, entity!), eq(grammarAnnotations.entityId, entityId!), eq(grammarAnnotations.status, "approved")));
    const ruleIds = [...new Set(rows.map((row) => row.ruleId).filter((id): id is string => Boolean(id)))];
    const rules = ruleIds.length
      ? await db.select().from(grammarRules).where(and(inArray(grammarRules.id, ruleIds), eq(grammarRules.status, "approved")))
      : [];
    const ruleById = new Map(rules.map((rule) => [rule.id, rule]));
    return jsonOk({
      annotations: rows.map((row) => ({
        ...row,
        rule: row.ruleId ? ruleById.get(row.ruleId) ?? null : null,
      })),
    });
  });
}

// POST /api/grammar/annotations — members attach a grammar rule to a span of
// Karen text. Offsets are UTF-16 code-unit indexes into karenText. Agent
// proposals arrive with source:"agent" and land in the same review queue.
export async function POST(request: Request) {
  return handleApi(request, async () => {
    enforceRateLimit(request, "grammar-annotations", 40, 60 * 60_000);
    const user = await requireUser(request);
    const body = await readJson(request);
    const karenText = validateCommunityText(textField(body.karenText, "karenText", { required: true, max: 2000 })!, "karenText");
    const startOffset = numberField(body.startOffset, "startOffset", 0, karenText.length);
    const endOffset = numberField(body.endOffset, "endOffset", startOffset + 1, karenText.length);
    const ruleId = textField(body.ruleId, "ruleId", { max: 80 });
    const confidence = body.confidence == null ? null : numberField(body.confidence, "confidence", 0, 1);
    const source = body.source == null ? "member" : enumField(body.source, "source", ["agent", "member"] as const);
    const entity = textField(body.entity, "entity", { max: 80 });
    const entityId = textField(body.entityId, "entityId", { max: 80 });
    if (source === "agent" && confidence == null) throw new ApiError(400, "Agent annotations must carry a confidence score");
    const db = getDb();
    if (ruleId) {
      const [rule] = await db.select().from(grammarRules).where(eq(grammarRules.id, ruleId)).limit(1);
      if (!rule) throw new ApiError(404, "Grammar rule not found");
    }
    const id = newId("annot");
    await db.insert(grammarAnnotations).values({
      id, karenText, startOffset, endOffset, ruleId, confidence, source, entity, entityId,
      contributorId: user.id, status: "pending",
    });
    await audit(request, { actor: user, action: "grammar.annotation.create", entity: "grammar_annotations", entityId: id, after: { karenText, startOffset, endOffset, ruleId, source } });
    return jsonOk({ annotation: { id, status: "pending" } }, { status: 201 });
  });
}
