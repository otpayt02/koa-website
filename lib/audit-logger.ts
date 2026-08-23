import { getDb } from "@/db";
import { auditLogs } from "@/db/schema";
import type { ApiUser } from "@/lib/auth";
import { clientIp, newId, requestId } from "@/lib/api";

export async function audit(request: Request, input: {
  actor?: ApiUser | null;
  action: string;
  entity: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
}): Promise<void> {
  const ipHash = await hashIp(clientIp(request));
  await getDb().insert(auditLogs).values({
    id: newId("audit"),
    actorId: input.actor?.id,
    actorExternalId: input.actor?.externalAuthId,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId,
    before: redact(input.before),
    after: redact(input.after),
    requestId: requestId(request),
    ipHash,
    userAgent: request.headers.get("user-agent")?.slice(0, 500),
  });
}

async function hashIp(ip: string): Promise<string | null> {
  if (ip === "unknown") return null;
  const bytes = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function redact(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redact);
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [
    key,
    /email|phone|token|secret|password|audio/i.test(key) ? "[redacted]" : redact(item),
  ]));
}
