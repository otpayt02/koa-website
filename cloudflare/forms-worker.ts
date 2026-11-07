/**
 * KOA website — standalone forms API (Cloudflare Worker).
 *
 * Endpoints (JSON in, JSON out):
 *   GET  /health                       → { ok: true }
 *   POST /api/contact                  → contact_submissions
 *   POST /api/donate-intake            → donation_intakes (intake ONLY —
 *                                        no payment is processed or stored)
 *   POST /api/training-contributions   → training_contributions, always
 *                                        saved with status 'unreviewed'
 *
 * Design rules:
 * - Submissions are stored in the D1 database bound as `DB` (schema:
 *   cloudflare/migrations/0001_forms.sql).
 * - Training contributions are community-supplied S'gaw Karen material.
 *   This worker never generates, completes, or "corrects" Karen text; it
 *   stores exactly what the contributor sent, marked unreviewed, until a
 *   human approves it.
 * - A hidden honeypot field (`website`) silently accepts bot submissions
 *   without storing them.
 * - CORS is limited to the production site origins below; update
 *   ALLOWED_ORIGINS during setup if a staging origin is added.
 */

interface Env {
  DB: D1Database;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
}

const ALLOWED_ORIGINS = [
  "https://koamerica.org",
  "https://www.koamerica.org",
];

const MAX_BODY_BYTES = 64 * 1024;

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") ?? "";
  const headers: Record<string, string> = { Vary: "Origin" };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return headers;
}

function json(
  request: Request,
  status: number,
  body: Record<string, unknown>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request),
    },
  });
}

/** Trim a value to a string with a length cap; empty → null. */
function field(
  data: Record<string, unknown>,
  name: string,
  maxLength: number,
  required = false,
): string | null {
  const raw = data[name];
  if (typeof raw !== "string") return null;
  const value = raw.trim().slice(0, maxLength);
  if (required && value.length === 0) return null;
  return value.length === 0 ? null : value;
}

function isEmail(value: string | null): boolean {
  return !!value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function readJson(
  request: Request,
): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) return null;
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/** Honeypot: bots fill the hidden `website` field; humans never see it. */
function isBot(data: Record<string, unknown>): boolean {
  const trap = data["website"];
  return typeof trap === "string" && trap.trim().length > 0;
}

async function handleContact(
  request: Request,
  env: Env,
  data: Record<string, unknown>,
): Promise<Response> {
  const name = field(data, "name", 200, true);
  const email = field(data, "email", 320, true);
  const message = field(data, "message", 5000, true);
  if (!name || !isEmail(email) || !message) {
    return json(request, 400, {
      ok: false,
      error: "name, a valid email, and message are required",
    });
  }
  await env.DB.prepare(
    `INSERT INTO contact_submissions (name, email, phone, subject, message)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(
      name,
      email,
      field(data, "phone", 50),
      field(data, "subject", 200),
      message,
    )
    .run();
  return json(request, 201, { ok: true });
}

async function handleDonateIntake(
  request: Request,
  env: Env,
  data: Record<string, unknown>,
): Promise<Response> {
  const name = field(data, "name", 200, true);
  const email = field(data, "email", 320, true);
  if (!name || !isEmail(email)) {
    return json(request, 400, {
      ok: false,
      error: "name and a valid email are required",
    });
  }
  // Intended amount arrives as dollars (number or string) and is stored as
  // integer cents. This is an intake only — no charge is made here.
  let amountCents: number | null = null;
  const rawAmount = data["amount"];
  if (typeof rawAmount === "number" && rawAmount > 0) {
    amountCents = Math.round(rawAmount * 100);
  } else if (typeof rawAmount === "string" && rawAmount.trim() !== "") {
    const parsed = Number.parseFloat(rawAmount);
    if (Number.isFinite(parsed) && parsed > 0) {
      amountCents = Math.round(parsed * 100);
    }
  }
  const frequency =
    field(data, "frequency", 20) === "monthly" ? "monthly" : "one_time";
  await env.DB.prepare(
    `INSERT INTO donation_intakes (name, email, phone, amount_cents, frequency, message)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      name,
      email,
      field(data, "phone", 50),
      amountCents,
      frequency,
      field(data, "message", 2000),
    )
    .run();
  return json(request, 201, { ok: true });
}

async function handleTrainingContribution(
  request: Request,
  env: Env,
  data: Record<string, unknown>,
): Promise<Response> {
  const types = [
    "audio_recording",
    "transcript",
    "translation",
    "recording_with_transcript",
  ];
  const rawType = field(data, "contribution_type", 40);
  const contributionType =
    rawType && types.includes(rawType) ? rawType : "recording_with_transcript";

  const englishText = field(data, "english_text", 10000);
  const karenText = field(data, "karen_text", 10000);
  const transcriptText = field(data, "transcript_text", 20000);
  const audioUrl = field(data, "audio_url", 2000);
  if (!englishText && !karenText && !transcriptText && !audioUrl) {
    return json(request, 400, {
      ok: false,
      error:
        "a contribution needs at least one of: english_text, karen_text, transcript_text, audio_url",
    });
  }
  const email = field(data, "contributor_email", 320);
  if (email && !isEmail(email)) {
    return json(request, 400, { ok: false, error: "invalid contributor_email" });
  }
  // Status is hard-coded 'unreviewed' by the schema default and is never
  // settable through this public endpoint.
  await env.DB.prepare(
    `INSERT INTO training_contributions
       (contributor_name, contributor_email, contribution_type, english_text,
        karen_text, transcript_text, audio_url, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      field(data, "contributor_name", 200),
      email,
      contributionType,
      englishText,
      karenText,
      transcriptText,
      audioUrl,
      field(data, "notes", 2000),
    )
    .run();
  return json(request, 201, { ok: true, status: "unreviewed" });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }
    if (request.method === "GET" && url.pathname === "/health") {
      return json(request, 200, { ok: true });
    }
    if (request.method !== "POST") {
      return json(request, 404, { ok: false, error: "not found" });
    }

    const data = await readJson(request);
    if (!data) {
      return json(request, 400, { ok: false, error: "invalid JSON body" });
    }
    // Silently accept bot submissions without storing anything.
    if (isBot(data)) {
      return json(request, 201, { ok: true });
    }

    try {
      switch (url.pathname) {
        case "/api/contact":
          return await handleContact(request, env, data);
        case "/api/donate-intake":
          return await handleDonateIntake(request, env, data);
        case "/api/training-contributions":
          return await handleTrainingContribution(request, env, data);
        default:
          return json(request, 404, { ok: false, error: "not found" });
      }
    } catch {
      return json(request, 500, { ok: false, error: "storage failed" });
    }
  },
};
