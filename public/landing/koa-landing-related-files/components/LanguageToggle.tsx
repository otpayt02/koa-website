"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { languages, localeMeta, type Lang, type Messages } from "./i18n";

export function LanguageToggle({ lang, messages }: { lang: Lang; messages: Messages }) {
  const pathname = usePathname();
  const localePrefix = new RegExp(`^/(${languages.join("|")})(?=/|$)`);
  const pathFor = (locale: Lang) =>
    localePrefix.test(pathname)
      ? pathname.replace(localePrefix, `/${locale}`)
      : `/${locale}${pathname === "/" ? "" : pathname}`;

  useEffect(() => {
    localStorage.setItem("koa-language", lang);
    document.cookie = `koa-language=${lang}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = localeMeta[lang].htmlLang;
  }, [lang]);

  return (
    <nav className="language-toggle" aria-label={messages.language}>
      {languages.map((locale) => {
        const meta = localeMeta[locale];
        return (
          <Link
            key={locale}
            href={pathFor(locale)}
            hrefLang={meta.htmlLang}
            lang={meta.htmlLang}
            aria-current={locale === lang ? "page" : undefined}
            aria-label={`${messages.language}: ${meta.label}`}
          >
            {meta.nativeLabel}
          </Link>
        );
      })}
    </nav>
  );
}
