import { ApiError, clientIp } from "@/lib/api";

type WindowState = { count: number; resetAt: number };
const windows = new Map<string, WindowState>();

export function enforceRateLimit(request: Request, bucket: string, limit: number, windowMs: number): void {
  const subject = request.headers.get("oai-authenticated-user-id") ?? clientIp(request);
  const key = `${bucket}:${subject}`;
  const now = Date.now();
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    prune(now);
    return;
  }
  if (current.count >= limit) throw new ApiError(429, "Too many requests. Please try again later.", { retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) });
  current.count += 1;
}

function prune(now: number) {
  if (windows.size < 5_000) return;
  for (const [key, value] of windows) if (value.resetAt <= now) windows.delete(key);
}
