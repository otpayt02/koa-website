export class ApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly details?: unknown) {
    super(message);
  }
}

export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, init);
}

export function jsonError(error: unknown, requestId?: string): Response {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message, details: error.details, requestId }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Unexpected error";
  console.error(JSON.stringify({ level: "error", event: "api.unhandled", requestId, message }));
  return Response.json({ error: "Internal server error", requestId }, { status: 500 });
}

export async function readJson(request: Request, maxBytes = 64_000): Promise<Record<string, unknown>> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > maxBytes) throw new ApiError(413, "Request body is too large");
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError(400, "Request body must be an object");
  return value as Record<string, unknown>;
}

export function requestId(request: Request): string {
  return request.headers.get("cf-ray") ?? request.headers.get("x-request-id") ?? crypto.randomUUID();
}

export function clientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export function pagination(url: string, maximum = 100) {
  const params = new URL(url).searchParams;
  const limit = Math.min(maximum, Math.max(1, Number.parseInt(params.get("limit") ?? "20", 10) || 20));
  const offset = Math.max(0, Number.parseInt(params.get("offset") ?? "0", 10) || 0);
  return { limit, offset };
}

export function textField(value: unknown, name: string, options: { required?: boolean; min?: number; max?: number } = {}): string | null {
  if (value === undefined || value === null) {
    if (options.required) throw new ApiError(400, `${name} is required`);
    return null;
  }
  if (typeof value !== "string") throw new ApiError(400, `${name} must be text`);
  const result = value.trim();
  if (options.required && !result) throw new ApiError(400, `${name} is required`);
  if (options.min && result.length < options.min) throw new ApiError(400, `${name} must be at least ${options.min} characters`);
  if (options.max && result.length > options.max) throw new ApiError(400, `${name} must be at most ${options.max} characters`);
  return result || null;
}

export function emailField(value: unknown, name = "email"): string {
  const email = textField(value, name, { required: true, max: 254 })!.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, `${name} must be a valid email address`);
  return email;
}

export function enumField<const T extends readonly string[]>(value: unknown, name: string, choices: T): T[number] {
  if (typeof value !== "string" || !choices.includes(value)) throw new ApiError(400, `${name} must be one of: ${choices.join(", ")}`);
  return value as T[number];
}

export function stringArray(value: unknown, name: string, maxItems = 20): string[] {
  if (!Array.isArray(value) || value.length > maxItems) throw new ApiError(400, `${name} must be an array with at most ${maxItems} items`);
  return value.map((item, index) => textField(item, `${name}[${index}]`, { required: true, max: 120 })!);
}

export function booleanField(value: unknown, name: string): boolean {
  if (typeof value !== "boolean") throw new ApiError(400, `${name} must be true or false`);
  return value;
}

export function numberField(value: unknown, name: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new ApiError(400, `${name} must be between ${min} and ${max}`);
  return value;
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

export async function handleApi(request: Request, callback: () => Promise<Response>): Promise<Response> {
  const id = requestId(request);
  const started = Date.now();
  try {
    const response = await callback();
    response.headers.set("x-request-id", id);
    console.log(JSON.stringify({ event: "api.request", requestId: id, method: request.method, path: new URL(request.url).pathname, status: response.status, latencyMs: Date.now() - started }));
    return response;
  } catch (error) {
    const response = jsonError(error, id);
    console.log(JSON.stringify({ event: "api.request", requestId: id, method: request.method, path: new URL(request.url).pathname, status: response.status, latencyMs: Date.now() - started }));
    return response;
  }
}
