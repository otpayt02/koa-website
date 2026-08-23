import { ApiError } from "@/lib/api";
import { getBindings } from "@/lib/cloudflare";

export function validateCommunityText(value: string, field = "content"): string {
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) throw new ApiError(400, `${field} contains unsupported control characters`);
  const links = value.match(/https?:\/\//gi)?.length ?? 0;
  if (links > 5) throw new ApiError(400, `${field} contains too many links`);
  const blocked = getBindings().KOA_BLOCKED_TERMS?.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean) ?? [];
  if (blocked.some((term) => value.toLowerCase().includes(term))) throw new ApiError(422, `${field} requires moderator review before submission`);
  return value;
}

export function normalizeSearch(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase();
}
