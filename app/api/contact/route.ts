import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { ApiError, emailField, enumField, handleApi, jsonOk, newId, pagination, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { optionalUser, requireAnyRole } from "@/lib/auth";
import { validateCommunityText } from "@/lib/moderation";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  return handleApi(request, async () => {
    enforceRateLimit(request, "contact", 5, 60 * 60_000);
    const user = await optionalUser(request);
    const body = await readJson(request);
    const submission = { id: newId("contact"), userId: user?.id, name: textField(body.name, "name", { required: true, max: 160 })!, email: emailField(body.email), phone: textField(body.phone, "phone", { max: 40 }), subject: validateCommunityText(textField(body.subject, "subject", { required: true, max: 200 })!, "subject"), message: validateCommunityText(textField(body.message, "message", { required: true, min: 10, max: 5_000 })!, "message") };
    await getDb().insert(contactSubmissions).values(submission);
    await audit(request, { actor: user, action: "contact.create", entity: "contact_submission", entityId: submission.id, after: submission });
    return jsonOk({ submission: { id: submission.id, status: "new" } }, { status: 201 });
  });
}

export async function GET(request: Request) {
  return handleApi(request, async () => {
    await requireAnyRole(request, ["moderator", "admin"]);
    const { limit, offset } = pagination(request.url, 100);
    const rows = await getDb().select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(limit).offset(offset);
    return jsonOk({ submissions: rows, pagination: { limit, offset } });
  });
}

export async function PATCH(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["moderator", "admin"]);
    const body = await readJson(request);
    const id = textField(body.id, "id", { required: true, max: 80 })!;
    const status = enumField(body.status, "status", ["new", "in_progress", "resolved", "spam"] as const);
    const [submission] = await getDb().update(contactSubmissions).set({ status, updatedAt: new Date() }).where(eq(contactSubmissions.id, id)).returning();
    if (!submission) throw new ApiError(404, "Contact submission not found");
    await audit(request, { actor: user, action: "contact.update", entity: "contact_submission", entityId: id, after: { status } });
    return jsonOk({ submission });
  });
}
