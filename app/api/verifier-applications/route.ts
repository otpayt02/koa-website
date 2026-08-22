import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users, verifierApplications } from "@/db/schema";
import { ApiError, enumField, handleApi, jsonOk, newId, pagination, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { optionalUser, requireAnyRole, requireUser } from "@/lib/auth";

const PLACE_TYPES = ["camp", "city", "state", "province", "other"] as const;
const REVIEW_ROLES = ["moderator", "admin"] as const;

// POST: submit a verifier application (signed-in members only — the dialect
// profile attaches to a real account). One open application per user.
// GET: pending queue for moderators/admins.
export async function GET(request: Request) {
  return handleApi(request, async () => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? "pending";
    // Members may view their own application; only moderators/admins see the queue.
    const me = await optionalUser(request);
    const isReviewerQueue = me && ["moderator", "admin"].includes(me.role);
    if (status !== "pending" || !isReviewerQueue) {
      if (!me) throw new ApiError(401, "Sign in with ChatGPT to continue");
      const [mine] = await getDb().select().from(verifierApplications)
        .where(eq(verifierApplications.userId, me.id)).orderBy(desc(verifierApplications.createdAt)).limit(1);
      return jsonOk({ application: mine ?? null });
    }
    const { limit, offset } = pagination(request.url, 50);
    const db = getDb();
    const applications = await db.select().from(verifierApplications)
      .where(eq(verifierApplications.status, "pending"))
      .orderBy(verifierApplications.createdAt).limit(limit).offset(offset);
    return jsonOk({ applications, limit, offset });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser(request);
    const db = getDb();
    const [existing] = await db.select().from(verifierApplications)
      .where(eq(verifierApplications.userId, user.id)).limit(1);
    if (existing) {
      throw new ApiError(409, existing.status === "pending"
        ? "You already have an application under review."
        : `Your previous application was ${existing.status}. Contact KOA to reapply.`);
    }
    const body = await readJson(request);
    const application = {
      id: newId("verapp"),
      userId: user.id,
      displayName: textField(body.displayName || user.displayName, "displayName", { required: true, max: 120 })!,
      email: textField(body.email || user.email, "email", { required: true, max: 254 })!,
      grewUpCountry: textField(body.grewUpCountry, "grewUpCountry", { required: true, max: 120 })!,
      grewUpRegion: textField(body.grewUpRegion, "grewUpRegion", { required: true, max: 200 })!,
      learnedKarenPlaceType: enumField(body.learnedKarenPlaceType, "learnedKarenPlaceType", PLACE_TYPES),
      learnedKarenPlace: textField(body.learnedKarenPlace, "learnedKarenPlace", { required: true, max: 200 })!,
      dialectSelfNamed: textField(body.dialectSelfNamed, "dialectSelfNamed", { max: 200 }),
      motivation: textField(body.motivation, "motivation", { max: 2000 }),
      status: "pending" as const,
    };
    await db.insert(verifierApplications).values(application);
    await audit(request, { actor: user, action: "verifier.application.submit", entity: "verifier_applications", entityId: application.id, after: { grewUpCountry: application.grewUpCountry, grewUpRegion: application.grewUpRegion, learnedKarenPlaceType: application.learnedKarenPlaceType } });
    return jsonOk({ application: { id: application.id, status: "pending" } }, { status: 201 });
  });
}

// PATCH: moderate — approve promotes the applicant to `reviewer` and copies
// the dialect profile onto their user record (every future approval carries
// geographic/demographic context). Reject keeps the record for accountability.
export async function PATCH(request: Request) {
  return handleApi(request, async () => {
    const reviewer = await requireAnyRole(request, REVIEW_ROLES);
    const body = await readJson(request);
    const id = textField(body.id, "id", { required: true, max: 80 })!;
    const decision = enumField(body.decision, "decision", ["approved", "rejected"] as const);
    const reviewNote = textField(body.note, "note", { max: 1000 });
    const db = getDb();
    const [application] = await db.select().from(verifierApplications).where(eq(verifierApplications.id, id)).limit(1);
    if (!application) throw new ApiError(404, "Application not found");
    if (application.status !== "pending") throw new ApiError(409, "This application has already been reviewed");
    const [updated] = await db.update(verifierApplications).set({
      status: decision, reviewerId: reviewer.id, reviewNote, reviewedAt: new Date(), updatedAt: new Date(),
    }).where(eq(verifierApplications.id, id)).returning();
    if (decision === "approved" && application.userId) {
      await db.update(users).set({
        role: "reviewer",
        grewUpCountry: application.grewUpCountry,
        grewUpRegion: application.grewUpRegion,
        learnedKarenPlaceType: application.learnedKarenPlaceType,
        learnedKarenPlace: application.learnedKarenPlace,
        dialectSelfNamed: application.dialectSelfNamed,
        updatedAt: new Date(),
      }).where(eq(users.id, application.userId));
    }
    await audit(request, { actor: reviewer, action: `verifier.application.${decision}`, entity: "verifier_applications", entityId: id, after: { decision, note: reviewNote ?? null } });
    return jsonOk({ application: { id, status: decision } });
  });
}
