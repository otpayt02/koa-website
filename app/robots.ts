import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/en", "/ksw", "/th", "/my"], disallow: ["/admin", "/en/admin", "/ksw/admin", "/th/admin", "/my/admin", "/api/"] }],
    sitemap: "https://www.koamerica.org/sitemap.xml",
  };
}
