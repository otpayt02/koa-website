import { getBindings } from "@/lib/cloudflare";

export async function GET() {
  const database = getBindings().DB;
  if (!database) {
    return Response.json({ status: "unavailable", database: "binding_missing" }, { status: 503 });
  }
  try {
    const row = await database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'contact_submissions'").first<{ name: string }>();
    if (!row) return Response.json({ status: "unavailable", database: "schema_missing" }, { status: 503 });
    return Response.json({ status: "ok", database: "ready" });
  } catch {
    return Response.json({ status: "unavailable", database: "query_failed" }, { status: 503 });
  }
}
