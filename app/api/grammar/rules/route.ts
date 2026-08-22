import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { grammarRuleExamples, grammarRules } from "@/db/schema";
import { ApiError, enumField, handleApi, jsonOk, newId, pagination, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { requireUser } from "@/lib/auth";
import { validateCommunityText } from "@/lib/moderation";
import { enforceRateLimit } from "@/lib/rate-limit";

const SCOPES = ["phonology", "tone", "syllable", "word_order", "particles", "negation", "questions", "verbs", "nouns", "numerals", "discourse", "other"] as const;

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const url = new URL(request.url);
    const { limit, offset } = pagination(request.url, 50);
    const scopeParam = url.searchParams.get("scope");
    const db = getDb();
    const where = scopeParam
      ? and(eq(grammarRules.status, "approved"), eq(grammarRules.scope, enumField(scopeParam, "scope", SCOPES)))
      : eq(grammarRules.status, "approved");
    const rules = await db
      .select()
      .from(grammarRules)
      .where(where)
      .orderBy(desc(grammarRules.updatedAt))
      .limit(limit)
      .offset(offset);
    const examples = rules.length
      ? await db.select().from(grammarRuleExamples).where(inArray(grammarRuleExamples.ruleId, rules.map((rule) => rule.id))).orderBy(grammarRuleExamples.createdAt)
      : [];
    return jsonOk({
      rules: rules.map((rule) => ({
        ...rule,
        examples: examples.filter((example) => example.ruleId === rule.id && example.status === "approved"),
      })),
      pagination: { limit, offset },
    });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    enforceRateLimit(request, "grammar-rules", 20, 60 * 60_000);
    const user = await requireUser(request);
    const body = await readJson(request);
    const titleEn = validateCommunityText(textField(body.titleEn, "titleEn", { required: true, max: 200 })!, "titleEn");
    const explanation = validateCommunityText(textField(body.explanation, "explanation", { required: true, max: 5000 })!, "explanation");
    const titleKaren = textField(body.titleKaren, "titleKaren", { max: 200 });
    const summary = textField(body.summary, "summary", { max: 500 });
    const scope = body.scope == null ? null : enumField(body.scope, "scope", SCOPES);
    const source = body.source == null ? "community" : enumField(body.source, "source", ["community", "grammar_book", "scraped"] as const);
    if (source !== "community" && !textField(body.provenanceUrl ?? body.provenancePage, "provenance", { max: 500 })) {
      throw new ApiError(400, "Non-community sources need a provenance URL or page reference");
    }
    const rawExamples = Array.isArray(body.examples) ? body.examples : [];
    if (rawExamples.length > 10) throw new ApiError(400, "At most 10 examples per rule");

    const db = getDb();
    const ruleId = newId("rule");
    await db.insert(grammarRules).values({
      id: ruleId, titleEn, titleKaren, summary, explanation, scope, source,
      provenanceUrl: textField(body.provenanceUrl, "provenanceUrl", { max: 500 }),
      provenancePage: textField(body.provenancePage, "provenancePage", { max: 160 }),
      status: "pending", contributorId: user.id,
    });
    for (const raw of rawExamples) {
      const karen = textField(raw?.karen, "examples.karen", { max: 500 });
      const english = textField(raw?.english, "examples.english", { max: 500 });
      if (!karen && !english) continue;
      await db.insert(grammarRuleExamples).values({
        id: newId("rulex"), ruleId,
        karen: karen ? validateCommunityText(karen, "examples.karen") : null,
        english: english ? validateCommunityText(english, "examples.english") : null,
        note: textField(raw?.note, "examples.note", { max: 300 }),
        contributorId: user.id, status: "pending",
      });
    }
    await audit(request, { actor: user, action: "grammar.rule.create", entity: "grammar_rules", entityId: ruleId, after: { titleEn, scope, source } });
    return jsonOk({ rule: { id: ruleId, status: "pending" } }, { status: 201 });
  });
}
