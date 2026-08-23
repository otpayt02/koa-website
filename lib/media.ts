import { ApiError } from "@/lib/api";
import { getBindings } from "@/lib/cloudflare";

const allowedAudio = new Set(["audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav", "audio/webm", "audio/x-m4a"]);
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

export function validateAudio(file: File): void {
  if (!allowedAudio.has(file.type)) throw new ApiError(415, "Audio must be MP3, M4A, OGG, WAV, or WebM");
  if (file.size <= 0 || file.size > MAX_AUDIO_BYTES) throw new ApiError(413, "Audio must be between 1 byte and 25 MB");
}

export async function storeAudio(file: File, id: string, contributorId: string): Promise<{ storageKey: string; publicUrl: string | null }> {
  const bindings = getBindings();
  if (!bindings.MEDIA) throw new ApiError(503, "Media storage is not configured");
  const extension = extensionFor(file.type);
  const storageKey = `audio/${new Date().toISOString().slice(0, 10).replaceAll("-", "/")}/${id}.${extension}`;
  await bindings.MEDIA.put(storageKey, file.stream(), {
    httpMetadata: { contentType: file.type, cacheControl: "private, max-age=0" },
    customMetadata: { contributorId, originalName: safeFilename(file.name) },
  });
  const base = bindings.MEDIA_PUBLIC_BASE_URL?.replace(/\/$/, "");
  return { storageKey, publicUrl: base ? `${base}/${storageKey}` : null };
}

export async function deleteAudio(storageKey: string): Promise<void> {
  await getBindings().MEDIA?.delete(storageKey);
}

function safeFilename(value: string): string {
  return value.normalize("NFKC").replace(/[^\p{L}\p{N}._-]/gu, "_").slice(0, 120) || "recording";
}

function extensionFor(type: string): string {
  return ({ "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/ogg": "ogg", "audio/wav": "wav", "audio/webm": "webm" } as Record<string, string>)[type] ?? "bin";
}
