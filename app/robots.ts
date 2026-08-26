import type { MetadataRoute } from "next";
import { languages } from "@/components/i18n";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: languages.map((lang) => `/${lang}`),
      disallow: ["/admin", ...languages.map((lang) => `/${lang}/admin`), "/api/"],
    }],
    sitemap: "https://karen-organization-of-america.oliverp789.chatgpt.site/sitemap.xml",
  };
}
