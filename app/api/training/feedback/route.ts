import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { trainingFeedback } from "@/db/schema";
import { ApiError, enumField, handleApi, jsonOk, newId, numberField, pagination, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { requireAnyRole, requireUser } from "@/lib/auth";
import { validateCommunityText } from "@/lib/moderation";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  return handleApi(request, async () => {
    enforceRateLimit(request, "training-feedback", 30, 60 * 60_000);
    const user = await requireUser(request);
    const body = await readJson(request);
    const item = {
      id: newId("feedback"), userId: user.id,
      taskType: enumField(body.taskType, "taskType", ["stt", "tts", "translation", "llm"] as const),
      input: validateCommunityText(textField(body.input, "input", { required: true, max: 10_000 })!, "input"), output: validateCommunityText(textField(body.output, "output", { required: true, max: 10_000 })!, "output"), correction: body.correction == null ? null : validateCommunityText(textField(body.correction, "correction", { max: 10_000 }) ?? "", "correction"),
      rating: body.rating == null ? null : Math.round(numberField(body.rating, "rating", 1, 5)), modelVersion: textField(body.modelVersion, "modelVersion", { max: 160 }),
    };
    if (!item.correction && item.rating == null) throw new ApiError(400, "correction or rating is required");
    await getDb().insert(trainingFeedback).values(item);
    await audit(request, { actor: user, action: "training.feedback.create", entity: "training_feedback", entityId: item.id, after: item });
    return jsonOk({ feedback: { id: item.id, status: "pending" } }, { status: 201 });
  });
}

export async function GET(request: Request) {
  return handleApi(request, async () => {
    await requireAnyRole(request, ["reviewer", "approved_translator", "moderator", "admin"]);
    const { limit, offset } = pagination(request.url, 100);
    const rows = await getDb().select().from(trainingFeedback).orderBy(desc(trainingFeedback.createdAt)).limit(limit).offset(offset);
    return jsonOk({ feedback: rows, pagination: { limit, offset } });
  });
}

export async function PATCH(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["reviewer", "approved_translator", "moderator", "admin"]);
    const body = await readJson(request);
    const id = textField(body.id, "id", { required: true, max: 80 })!;
    const status = enumField(body.status, "status", ["pending", "accepted", "rejected"] as const);
    const [item] = await getDb().update(trainingFeedback).set({ status }).where(eq(trainingFeedback.id, id)).returning();
    if (!item) throw new ApiError(404, "Feedback not found");
    await audit(request, { actor: user, action: "training.feedback.moderate", entity: "training_feedback", entityId: id, after: { status } });
    return jsonOk({ feedback: item });
  });
}
