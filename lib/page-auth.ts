import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { chatGPTSignInPath } from "@/app/chatgpt-auth";
import { ApiError } from "@/lib/api";
import { requireAnyRole, type ApiUser } from "@/lib/auth";
import { ADMIN_STUDIO_ROLES } from "@/lib/authorization.mjs";

export async function requirePageAdmin(returnTo: string): Promise<ApiUser> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || requestHeaders.get("host") || "localhost";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || (host.startsWith("localhost") ? "http" : "https");
  const requestUrl = new URL(returnTo, `${protocol}://${host}`);
  const request = new Request(requestUrl, { headers: requestHeaders });

  try {
    return await requireAnyRole(request, ADMIN_STUDIO_ROLES);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(chatGPTSignInPath(returnTo));
    }
    if (error instanceof ApiError && error.status === 403) {
      notFound();
    }
    throw error;
  }
}
