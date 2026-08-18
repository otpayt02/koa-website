import { ApiError, handleApi, jsonOk, readJson } from "@/lib/api";
import { requireAnyRole } from "@/lib/auth";
import {
  backupExport,
  corpusExport,
  loadStudio,
  publishEntries,
  saveDraftPair,
} from "@/lib/translation-studio";
import type { PublishEntryInput, SaveDraftInput } from "@/content/studio-types";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["admin"]);
    const format = new URL(request.url).searchParams.get("export");
    if (format === "backup") {
      return Response.json(await backupExport(user), {
        headers: { "content-disposition": "attachment; filename=koa-bilingual-backup.json" },
      });
    }
    if (format === "corpus") {
      return new Response(await corpusExport(), {
        headers: {
          "content-type": "application/x-ndjson; charset=utf-8",
          "content-disposition": "attachment; filename=koa-verified-en-ksw-corpus.jsonl",
        },
      });
    }
    return jsonOk(await loadStudio(user));
  });
}

export async function PUT(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["admin"]);
    const body = await readJson(request, 80_000);
    const input = parseSave(body);
    return jsonOk({ entry: await saveDraftPair(request, user, input) });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["admin"]);
    const body = await readJson(request, 128_000);
    if (body.action !== "publish") throw new ApiError(400, "Unsupported translation action");
    if (!Array.isArray(body.entries)) throw new ApiError(400, "entries must be an array");
    const entries = body.entries.map(parsePublishEntry);
    return jsonOk(await publishEntries(request, user, entries));
  });
}

function parseSave(body: Record<string, unknown>): SaveDraftInput {
  if (typeof body.key !== "string" || typeof body.en !== "string" || typeof body.karen !== "string") {
    throw new ApiError(400, "key, en, and karen are required text fields");
  }
  if (!body.expected || typeof body.expected !== "object" || Array.isArray(body.expected)) {
    throw new ApiError(400, "expected revision identifiers are required");
  }
  const expected = body.expected as Record<string, unknown>;
  if (!nullableString(expected.en) || !nullableString(expected.karen)) {
    throw new ApiError(400, "expected revision identifiers must be text or null");
  }
  return {
    key: body.key,
    en: body.en,
    karen: body.karen,
    expected: { en: expected.en as string | null, karen: expected.karen as string | null },
    imported: body.imported === true,
  };
}

function parsePublishEntry(value: unknown): PublishEntryInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError(400, "Each publication entry must be an object");
  const entry = value as Record<string, unknown>;
  if (typeof entry.key !== "string" || typeof entry.enRevisionId !== "string" || typeof entry.karenRevisionId !== "string") {
    throw new ApiError(400, "Each publication entry needs key, enRevisionId, and karenRevisionId");
  }
  return { key: entry.key, enRevisionId: entry.enRevisionId, karenRevisionId: entry.karenRevisionId };
}

function nullableString(value: unknown): boolean {
  return value === null || typeof value === "string";
}
