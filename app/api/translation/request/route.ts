import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { interpreters, translationRequests } from "@/db/schema";
import { ApiError, emailField, enumField, handleApi, jsonOk, newId, pagination, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { optionalUser, requireAnyRole } from "@/lib/auth";
import { validateCommunityText } from "@/lib/moderation";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  return handleApi(request, async () => {
    enforceRateLimit(request, "translation-request", 5, 60 * 60_000);
    const user = await optionalUser(request);
    const body = await readJson(request);
    const serviceType = enumField(body.serviceType, "serviceType", ["document", "in_person", "phone", "video", "court"] as const);
    const submission = {
      id: newId("service"), requesterId: user?.id,
      requesterName: textField(body.requesterName, "requesterName", { required: true, max: 160 })!, email: emailField(body.email), phone: textField(body.phone, "phone", { max: 40 }), organization: textField(body.organization, "organization", { max: 200 }),
      serviceType, sourceLanguage: textField(body.sourceLanguage, "sourceLanguage", { required: true, max: 80 })!, targetLanguage: textField(body.targetLanguage, "targetLanguage", { required: true, max: 80 })!,
      requestedAt: body.requestedAt ? new Date(String(body.requestedAt)) : null, location: textField(body.location, "location", { max: 300 }), details: validateCommunityText(textField(body.details, "details", { required: true, max: 5_000 })!, "details"), isCourtRequest: serviceType === "court",
    };
    if (submission.requestedAt && Number.isNaN(submission.requestedAt.getTime())) throw new ApiError(400, "requestedAt must be a valid date");
    await getDb().insert(translationRequests).values(submission);
    await audit(request, { actor: user, action: "translation_request.create", entity: "translation_request", entityId: submission.id, after: submission });
    return jsonOk({ request: { id: submission.id, status: "submitted", isCourtRequest: submission.isCourtRequest } }, { status: 201 });
  });
}

export async function GET(request: Request) {
  return handleApi(request, async () => {
    await requireAnyRole(request, ["approved_translator", "moderator", "admin"]);
    const { limit, offset } = pagination(request.url, 100);
    const rows = await getDb().select().from(translationRequests).orderBy(desc(translationRequests.createdAt)).limit(limit).offset(offset);
    return jsonOk({ requests: rows, pagination: { limit, offset } });
  });
}

export async function PATCH(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["approved_translator", "moderator", "admin"]);
    const body = await readJson(request);
    const id = textField(body.id, "id", { required: true, max: 80 })!;
    const status = enumField(body.status, "status", ["submitted", "reviewing", "assigned", "completed", "cancelled"] as const);
    const assignedInterpreterId = body.assignedInterpreterId === undefined
      ? undefined
      : textField(body.assignedInterpreterId, "assignedInterpreterId", { max: 80 });
    if (status === "assigned" && !assignedInterpreterId) throw new ApiError(400, "assignedInterpreterId is required when assigning a request");
    if (assignedInterpreterId) {
      const [interpreter] = await getDb().select({ id: interpreters.id }).from(interpreters)
        .where(and(eq(interpreters.id, assignedInterpreterId), eq(interpreters.status, "active"))).limit(1);
      if (!interpreter) throw new ApiError(404, "Interpreter not found");
    }
    const update = assignedInterpreterId === undefined
      ? { status, updatedAt: new Date() }
      : { status, assignedInterpreterId, updatedAt: new Date() };
    const [item] = await getDb().update(translationRequests).set(update).where(eq(translationRequests.id, id)).returning();
    if (!item) throw new ApiError(404, "Translation request not found");
    await audit(request, { actor: user, action: "translation_request.update", entity: "translation_request", entityId: id, after: { status, assignedInterpreterId: item.assignedInterpreterId } });
    return jsonOk({ request: item });
  });
}
