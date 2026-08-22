import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { grammarAnnotations, grammarRuleExamples, grammarRules } from "@/db/schema";
import { ApiError, enumField, handleApi, jsonOk, pagination, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { requireAnyRole } from "@/lib/auth";

const REVIEW_ROLES = ["reviewer", "approved_translator", "moderator", "admin"] as const;

// GET /api/grammar/moderate — reviewer queue: pending rules with their examples
export async function GET(request: Request) {
  return handleApi(request, async () => {
    await requireAnyRole(request, REVIEW_ROLES);
    const { limit, offset } = pagination(request.url, 50);
    const db = getDb();
    const rules = await db
      .select()
      .from(grammarRules)
      .where(eq(grammarRules.status, "pending"))
      .orderBy(asc(grammarRules.createdAt))
      .limit(limit)
      .offset(offset);
    const ruleIds = rules.map((rule) => rule.id);
    const examples = ruleIds.length
      ? await db.select().from(grammarRuleExamples).where(inArray(grammarRuleExamples.ruleId, ruleIds)).orderBy(grammarRuleExamples.createdAt)
      : [];
    const annotations = await db
      .select()
      .from(grammarAnnotations)
      .where(eq(grammarAnnotations.status, "pending"))
      .orderBy(asc(grammarAnnotations.createdAt))
      .limit(limit);
    return jsonOk({
      rules: rules.map((rule) => ({ ...rule, examples: examples.filter((example) => example.ruleId === rule.id) })),
      annotations,
      pagination: { limit, offset },
    });
  });
}

// PATCH /api/grammar/moderate { id, kind: "rule" | "example", decision, note }
// Reviewers approve or reject a rule (or a single example). Approving a rule
// does NOT auto-approve its examples — each example is judged on its own.
export async function PATCH(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, REVIEW_ROLES);
    const body = await readJson(request);
    const id = textField(body.id, "id", { required: true, max: 80 })!;
    const kind = enumField(body.kind, "kind", ["rule", "example", "annotation"] as const);
    const reviewNote = textField(body.note, "note", { max: 1000 });
    const db = getDb();

    if (kind === "rule") {
      const decision = enumField(body.decision, "decision", ["approved", "rejected", "changes_requested"] as const);
      const [rule] = await db
        .update(grammarRules)
        .set({ status: decision, reviewerId: user.id, reviewNote, reviewedAt: new Date(), updatedAt: new Date() })
        .where(eq(grammarRules.id, id))
        .returning();
      if (!rule) throw new ApiError(404, "Grammar rule not found");
      await audit(request, { actor: user, action: `grammar.rule.${decision}`, entity: "grammar_rules", entityId: id, after: { status: decision, note: reviewNote } });
      return jsonOk({ rule: { id, status: decision } });
    }

    if (kind === "annotation") {
      const decision = enumField(body.decision, "decision", ["approved", "rejected"] as const);
      const [annotation] = await db
        .update(grammarAnnotations)
        .set({ status: decision, updatedAt: new Date() })
        .where(eq(grammarAnnotations.id, id))
        .returning();
      if (!annotation) throw new ApiError(404, "Grammar annotation not found");
      await audit(request, { actor: user, action: `grammar.annotation.${decision}`, entity: "grammar_annotations", entityId: id, after: { status: decision } });
      return jsonOk({ annotation: { id, status: decision } });
    }

    // Examples have a simpler lifecycle: approved or rejected, nothing in between.
    const decision = enumField(body.decision, "decision", ["approved", "rejected"] as const);
    const [example] = await db
      .update(grammarRuleExamples)
      .set({ status: decision })
      .where(eq(grammarRuleExamples.id, id))
      .returning();
    if (!example) throw new ApiError(404, "Grammar example not found");
    await audit(request, { actor: user, action: `grammar.example.${decision}`, entity: "grammar_rule_examples", entityId: id, after: { status: decision } });
    return jsonOk({ example: { id, status: decision } });
  });
}
