import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const started = Date.now();
  const response = NextResponse.next();
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  response.headers.set("x-request-id", requestId);
  console.log(JSON.stringify({
    event: "http.request",
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    referrer: request.headers.get("referer") ?? undefined,
    authenticatedUserId: request.headers.get("oai-authenticated-user-id") ?? undefined,
    latencyMs: Date.now() - started,
    timestamp: new Date().toISOString(),
  }));
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
