import { and, desc, eq, gte, like } from "drizzle-orm";
import { getDb } from "@/db";
import { auditLogs } from "@/db/schema";
import { handleApi, jsonOk, pagination } from "@/lib/api";
import { requireAnyRole } from "@/lib/auth";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    await requireAnyRole(request, ["admin"]);
    const { limit, offset } = pagination(request.url, 500);
    const params = new URL(request.url).searchParams;
    const entity = params.get("entity")?.trim();
    const action = params.get("action")?.trim();
    const actorId = params.get("actorId")?.trim();
    const since = params.get("since") ? new Date(params.get("since")!) : null;
    const filters = [
      ...(entity ? [eq(auditLogs.entity, entity)] : []),
      ...(action ? [like(auditLogs.action, `${action}%`)] : []),
      ...(actorId ? [eq(auditLogs.actorId, actorId)] : []),
      ...(since && !Number.isNaN(since.getTime()) ? [gte(auditLogs.createdAt, since)] : []),
    ];
    const rows = await getDb().select().from(auditLogs).where(filters.length ? and(...filters) : undefined).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
    if (params.get("format") === "csv") {
      const header = "id,actorId,action,entity,entityId,requestId,createdAt";
      const csv = [header, ...rows.map((row) => [row.id, row.actorId, row.action, row.entity, row.entityId, row.requestId, row.createdAt.toISOString()].map(csvCell).join(","))].join("\n");
      return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=koa-audit-log.csv" } });
    }
    return jsonOk({ logs: rows, pagination: { limit, offset } });
  });
}

function csvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}
