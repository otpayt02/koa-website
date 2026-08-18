import { headers } from "next/headers";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { ApiError } from "@/lib/api";
import { requireAnyRole, type ApiUser } from "@/lib/auth";

export async function requireAdminPage(returnTo: string): Promise<ApiUser | null> {
  await requireChatGPTUser(returnTo);
  const requestHeaders = await headers();
  const request = new Request(new URL(returnTo, "https://koa.local"), { headers: requestHeaders });
  try {
    return await requireAnyRole(request, ["admin"]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) return null;
    throw error;
  }
}
