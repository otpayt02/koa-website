import type { MetadataRoute } from "next";
import { languages, localeMeta } from "@/components/i18n";

const baseUrl = "https://karen-organization-of-america.oliverp789.chatgpt.site";
const routes = ["", "about", "services", "community", "contact", "dictionary", "contribute", "translation", "collaborate", "community/board", "changelog"];

function localizedUrl(lang: string, route: string) {
  return `${baseUrl}/${lang}${route ? `/${route}` : ""}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return languages.flatMap((lang) =>
    routes.map((route) => ({
      url: localizedUrl(lang, route),
      lastModified: new Date("2026-08-14T00:00:00Z"),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          languages.map((alternate) => [localeMeta[alternate].htmlLang, localizedUrl(alternate, route)]),
        ),
      },
    })),
  );
}
