import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { audioPairs, dictionaryEntries } from "@/db/schema";
import { ApiError, handleApi, jsonOk, newId, pagination, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { requireAnyRole, requireUser } from "@/lib/auth";
import { deleteAudio, MAX_AUDIO_BYTES, storeAudio, validateAudio } from "@/lib/media";
import { validateCommunityText } from "@/lib/moderation";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser(request);
    const { limit, offset } = pagination(request.url, 100);
    const rows = await getDb().select().from(audioPairs)
      .where(["reviewer", "approved_translator", "moderator", "admin"].includes(user.role) ? undefined : eq(audioPairs.contributorId, user.id))
      .orderBy(desc(audioPairs.createdAt)).limit(limit).offset(offset);
    const publicRows = rows.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => key !== "storageKey")));
    return jsonOk({ audioPairs: publicRows, pagination: { limit, offset } });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    enforceRateLimit(request, "audio-upload", 10, 60 * 60_000);
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > MAX_AUDIO_BYTES + 64_000) throw new ApiError(413, "Upload is too large");
    const user = await requireUser(request);
    const form = await request.formData();
    const file = form.get("audio");
    if (!(file instanceof File)) throw new ApiError(400, "audio file is required");
    validateAudio(file);
    if (form.get("consentGranted") !== "true") throw new ApiError(400, "Explicit audio training license consent is required");
    const transcription = validateCommunityText(textField(form.get("transcription"), "transcription", { required: true, max: 5_000 })!, "transcription");
    const entryId = textField(form.get("entryId"), "entryId", { max: 80 });
    if (entryId) {
      const [entry] = await getDb().select({ id: dictionaryEntries.id }).from(dictionaryEntries)
        .where(eq(dictionaryEntries.id, entryId)).limit(1);
      if (!entry) throw new ApiError(404, "Dictionary entry not found");
    }
    const id = newId("audio");
    const stored = await storeAudio(file, id, user.id);
    const pair = {
      id,
      entryId,
      ...stored,
      mimeType: file.type,
      byteSize: file.size,
      durationSeconds: form.get("durationSeconds") ? Number(form.get("durationSeconds")) : null,
      transcription,
      translation: textField(form.get("translation"), "translation", { max: 5_000 }),
      language: "karen",
      dialect: textField(form.get("dialect"), "dialect", { max: 80 }) ?? "sgaw",
      contributorId: user.id,
      consentGranted: true,
      licenseVersion: textField(form.get("licenseVersion"), "licenseVersion", { max: 40 }) ?? "koa-audio-training-v1",
    };
    if (pair.durationSeconds !== null && (!Number.isFinite(pair.durationSeconds) || pair.durationSeconds <= 0 || pair.durationSeconds > 7_200)) {
      await deleteAudio(stored.storageKey);
      throw new ApiError(400, "durationSeconds must be between 0 and 7200");
    }
    try { await getDb().insert(audioPairs).values(pair); } catch (error) { await deleteAudio(stored.storageKey); throw error; }
    await audit(request, { actor: user, action: "audio.upload", entity: "audio_pair", entityId: id, after: { ...pair, storageKey: "[redacted]" } });
    return jsonOk({ audioPair: { ...pair, storageKey: undefined, status: "pending", quality: "unreviewed" }, moderation: "pending" }, { status: 201 });
  });
}

export async function PATCH(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["reviewer", "approved_translator", "moderator", "admin"]);
    const body = await request.json() as Record<string, unknown>;
    const id = textField(body.id, "id", { required: true, max: 80 })!;
    const status = body.status;
    if (!["pending", "changes_requested", "approved", "rejected"].includes(String(status))) throw new ApiError(400, "Invalid status");
    const quality = body.quality;
    if (!["unreviewed", "usable", "validated", "rejected"].includes(String(quality))) throw new ApiError(400, "Invalid quality");
    if (status === "approved" && quality !== "validated") throw new ApiError(400, "Approved audio must have validated quality");
    const [pair] = await getDb().update(audioPairs).set({ status: status as "approved", quality: quality as "validated", reviewerId: user.id, reviewedAt: new Date(), updatedAt: new Date() }).where(eq(audioPairs.id, id)).returning();
    if (!pair) throw new ApiError(404, "Audio pair not found");
    await audit(request, { actor: user, action: "audio.moderate", entity: "audio_pair", entityId: id, after: { status, quality } });
    return jsonOk({ audioPair: { ...pair, storageKey: undefined } });
  });
}
