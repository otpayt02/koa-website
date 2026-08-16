import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/en", "/karen"], disallow: ["/admin", "/en/admin", "/karen/admin", "/api/"] }],
    sitemap: "https://karen-organization-of-america.oliverp789.chatgpt.site/sitemap.xml",
  };
}
