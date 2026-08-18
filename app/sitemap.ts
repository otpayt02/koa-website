import type { MetadataRoute } from "next";

const baseUrl = "https://karen-organization-of-america.oliverp789.chatgpt.site";
const routes = ["", "about", "services", "community", "contact", "dictionary", "contribute", "translation", "collaborate", "community/board", "changelog"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ["en", "karen"].flatMap((lang) =>
    routes.map((route) => ({
      url: `${baseUrl}/${lang}${route ? `/${route}` : ""}`,
      lastModified: new Date("2026-08-14T00:00:00Z"),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
  );
}
