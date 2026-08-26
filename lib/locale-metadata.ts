import type { Metadata } from "next";
import { isLang, languages, localeMeta, type Lang } from "@/components/i18n";

function routeSuffix(route: string) {
  const normalized = route.replace(/^\/+|\/+$/g, "");
  return normalized ? `/${normalized}` : "";
}

export function localizedPath(lang: Lang, route = "") {
  return `/${lang}${routeSuffix(route)}`;
}

export function localizedAlternates(lang: Lang, route = ""): Metadata["alternates"] {
  return {
    canonical: localizedPath(lang, route),
    languages: Object.fromEntries(
      languages.map((alternate) => [
        localeMeta[alternate].htmlLang,
        localizedPath(alternate, route),
      ]),
    ),
  };
}

export function withLocalizedMetadata(
  lang: Lang,
  route: string,
  metadata: Metadata,
): Metadata {
  return { ...metadata, alternates: localizedAlternates(lang, route) };
}

export async function localizedPageMetadata(
  params: Promise<{ lang: string }>,
  route: string,
  metadata: Metadata,
): Promise<Metadata> {
  const { lang: value } = await params;
  return withLocalizedMetadata(isLang(value) ? value : "en", route, metadata);
}
