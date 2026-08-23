import { and, desc, eq, like } from "drizzle-orm";
import { getDb } from "@/db";
import { interpreters } from "@/db/schema";
import { ApiError, emailField, enumField, handleApi, jsonOk, newId, pagination, readJson, stringArray, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { requireAnyRole, requireUser } from "@/lib/auth";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const { limit, offset } = pagination(request.url, 100);
    const params = new URL(request.url).searchParams;
    const area = params.get("area")?.trim();
    const rows = await getDb().select().from(interpreters).where(and(eq(interpreters.status, "active"), ...(area ? [like(interpreters.serviceAreas, `%${area}%`)] : []))).orderBy(desc(interpreters.rating), interpreters.name).limit(limit).offset(offset);
    const publicRows = rows.map((profile) => Object.fromEntries(Object.entries(profile).filter(([key]) => key !== "contactEmail" && key !== "contactPhone")));
    return jsonOk({ interpreters: publicRows, pagination: { limit, offset } });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser(request);
    const body = await readJson(request);
    const profile = {
      id: newId("interpreter"), userId: user.id,
      name: textField(body.name, "name", { required: true, max: 160 })!,
      languages: stringArray(body.languages, "languages"),
      dialects: stringArray(body.dialects ?? [], "dialects"),
      certifications: stringArray(body.certifications ?? [], "certifications"),
      serviceTypes: stringArray(body.serviceTypes, "serviceTypes"),
      serviceAreas: stringArray(body.serviceAreas, "serviceAreas"),
      availability: textField(body.availability, "availability", { max: 500 }), bio: textField(body.bio, "bio", { max: 3_000 }),
      contactEmail: body.contactEmail == null || body.contactEmail === "" ? null : emailField(body.contactEmail, "contactEmail"),
      contactPhone: textField(body.contactPhone, "contactPhone", { max: 40 }),
    };
    await getDb().insert(interpreters).values(profile);
    await audit(request, { actor: user, action: "interpreter.apply", entity: "interpreter", entityId: profile.id, after: profile });
    return jsonOk({ interpreter: { ...profile, contactEmail: undefined, contactPhone: undefined, status: "pending" }, moderation: "pending" }, { status: 201 });
  });
}

export async function PATCH(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["moderator", "admin"]);
    const body = await readJson(request);
    const id = textField(body.id, "id", { required: true, max: 80 })!;
    const status = enumField(body.status, "status", ["pending", "active", "inactive", "suspended"] as const);
    const [profile] = await getDb().update(interpreters).set({ status, updatedAt: new Date() }).where(eq(interpreters.id, id)).returning();
    if (!profile) throw new ApiError(404, "Interpreter not found");
    await audit(request, { actor: user, action: "interpreter.moderate", entity: "interpreter", entityId: id, after: { status } });
    return jsonOk({ interpreter: profile });
  });
}
