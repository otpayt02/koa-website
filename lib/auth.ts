import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users, type UserRole } from "@/db/schema";
import { ApiError } from "@/lib/api";
import { ADMIN_STUDIO_ROLES, canAccessAdminStudio } from "@/lib/authorization.mjs";
import { getBindings } from "@/lib/cloudflare";

export type ApiUser = typeof users.$inferSelect;

const roleRank: Record<UserRole, number> = {
  public: 0,
  contributor: 1,
  reviewer: 2,
  approved_translator: 2,
  moderator: 3,
  admin: 4,
};

export async function optionalUser(request: Request): Promise<ApiUser | null> {
  const externalAuthId = request.headers.get("oai-authenticated-user-id");
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (!externalAuthId || !email) return null;
  const fullNameHeader = request.headers.get("oai-authenticated-user-full-name");
  const fullName = request.headers.get("oai-authenticated-user-full-name-encoding") === "percent-encoded-utf-8"
    ? safeDecode(fullNameHeader)
    : fullNameHeader;
  const displayName = fullName?.trim() || email;
  const db = getDb();
  const [existing] = await db.select().from(users).where(eq(users.externalAuthId, externalAuthId)).limit(1);
  if (existing) {
    if (existing.status !== "active") throw new ApiError(403, "This account is not active");
    if (existing.email !== email || existing.displayName !== displayName) {
      const [updated] = await db.update(users).set({ email, displayName, updatedAt: new Date() }).where(eq(users.id, existing.id)).returning();
      return updated;
    }
    return existing;
  }
  const role = isBootstrapAdmin(externalAuthId, email) ? "admin" : "contributor";
  const [created] = await db.insert(users).values({ id: `user_${crypto.randomUUID().replaceAll("-", "")}`, externalAuthId, email, displayName, role }).returning();
  return created;
}

export async function requireUser(request: Request, minimumRole: UserRole = "contributor"): Promise<ApiUser> {
  const user = await optionalUser(request);
  if (!user) throw new ApiError(401, "Sign in with ChatGPT to continue");
  if (roleRank[user.role] < roleRank[minimumRole]) throw new ApiError(403, "You do not have permission to perform this action");
  return user;
}

export async function requireAnyRole(request: Request, allowed: readonly UserRole[]): Promise<ApiUser> {
  const user = await requireUser(request);
  const usesAdminStudioPolicy = allowed.length === ADMIN_STUDIO_ROLES.length
    && allowed.every((role, index) => role === ADMIN_STUDIO_ROLES[index]);
  const hasAllowedRole = usesAdminStudioPolicy
    ? canAccessAdminStudio(user.role)
    : allowed.includes(user.role);
  if (!hasAllowedRole) throw new ApiError(403, "You do not have permission to perform this action");
  return user;
}

export function canReview(user: ApiUser): boolean {
  return ["reviewer", "approved_translator", "moderator", "admin"].includes(user.role);
}

function isBootstrapAdmin(userId: string, email: string): boolean {
  const bindings = getBindings();
  const ids = csv(bindings.KOA_ADMIN_USER_IDS);
  const emails = csv(bindings.KOA_ADMIN_EMAILS).map((item) => item.toLowerCase());
  return ids.includes(userId) || emails.includes(email);
}

function csv(value?: string): string[] {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

function safeDecode(value: string | null): string | null {
  if (!value) return null;
  try { return decodeURIComponent(value); } catch { return null; }
}
