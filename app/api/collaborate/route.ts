import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { featureRequests } from "@/db/schema";
import { ApiError, emailField, enumField, handleApi, jsonOk, newId, pagination, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { optionalUser, requireAnyRole } from "@/lib/auth";
import { validateCommunityText } from "@/lib/moderation";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const { limit, offset } = pagination(request.url, 100);
    const rows = await getDb().select({ id: featureRequests.id, type: featureRequests.type, title: featureRequests.title, description: featureRequests.description, status: featureRequests.status, createdAt: featureRequests.createdAt, updatedAt: featureRequests.updatedAt })
      .from(featureRequests).where(and(eq(featureRequests.status, "done"))).orderBy(desc(featureRequests.updatedAt)).limit(limit).offset(offset);
    return jsonOk({ requests: rows, pagination: { limit, offset } });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    enforceRateLimit(request, "collaborate", 8, 60 * 60_000);
    const user = await optionalUser(request);
    const body = await readJson(request);
    const item = {
      id: newId("request"), submitterId: user?.id,
      submitterName: textField(body.submitterName, "submitterName", { required: true, max: 160 })!, submitterEmail: emailField(body.submitterEmail, "submitterEmail"),
      type: enumField(body.type, "type", ["feature", "service", "collaboration"] as const), title: validateCommunityText(textField(body.title, "title", { required: true, max: 200 })!, "title"),
      description: validateCommunityText(textField(body.description, "description", { required: true, min: 10, max: 5_000 })!, "description"), organization: textField(body.organization, "organization", { max: 200 }),
    };
    await getDb().insert(featureRequests).values(item);
    await audit(request, { actor: user, action: "collaboration.create", entity: "feature_request", entityId: item.id, after: item });
    return jsonOk({ request: { id: item.id, type: item.type, status: "proposed" } }, { status: 201 });
  });
}

export async function PATCH(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["moderator", "admin"]);
    const body = await readJson(request);
    const id = textField(body.id, "id", { required: true, max: 80 })!;
    const status = enumField(body.status, "status", ["proposed", "under_review", "approved", "in_progress", "done", "rejected"] as const);
    const [item] = await getDb().update(featureRequests).set({ status, moderationNote: textField(body.moderationNote, "moderationNote", { max: 2_000 }), updatedAt: new Date() }).where(eq(featureRequests.id, id)).returning();
    if (!item) throw new ApiError(404, "Request not found");
    await audit(request, { actor: user, action: "collaboration.moderate", entity: "feature_request", entityId: id, after: { status } });
    return jsonOk({ request: item });
  });
}
