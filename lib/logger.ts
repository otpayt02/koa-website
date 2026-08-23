import { clientIp, requestId } from "@/lib/api";

export async function withRequestLog(request: Request, handler: () => Promise<Response>): Promise<Response> {
  const started = Date.now();
  const id = requestId(request);
  try {
    const response = await handler();
    write(request, id, response.status, Date.now() - started);
    response.headers.set("x-request-id", id);
    return response;
  } catch (error) {
    write(request, id, 500, Date.now() - started, error instanceof Error ? error.message : "Unknown error");
    throw error;
  }
}

function write(request: Request, id: string, status: number, latencyMs: number, error?: string) {
  const url = new URL(request.url);
  console.log(JSON.stringify({
    level: error ? "error" : "info",
    event: "http.request",
    requestId: id,
    method: request.method,
    path: url.pathname,
    status,
    latencyMs,
    authenticatedUserId: request.headers.get("oai-authenticated-user-id") ?? undefined,
    ipPresent: clientIp(request) !== "unknown",
    referrer: request.headers.get("referer") ?? undefined,
    timestamp: new Date().toISOString(),
    error,
  }));
}
