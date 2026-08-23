"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { Lang, Messages } from "./i18n";

export function LanguageToggle({ lang, messages }: { lang: Lang; messages: Messages }) {
  const pathname = usePathname();
  const nextLang = lang === "en" ? "karen" : "en";
  const nextPath = pathname.replace(/^\/(en|karen)(?=\/|$)/, `/${nextLang}`);

  useEffect(() => {
    localStorage.setItem("koa-language", lang);
    document.cookie = `koa-language=${lang}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = lang === "karen" ? "ksw" : "en";
  }, [lang]);

  return (
    <Link className="language-toggle" href={nextPath || `/${nextLang}`} hrefLang={nextLang === "karen" ? "ksw" : "en"} aria-label={`${messages.language}: ${nextLang === "en" ? messages.english : messages.karen}`}>
      <span aria-hidden="true">{lang === "en" ? "EN" : "ကညီ"}</span>
      <span>{nextLang === "en" ? messages.english : messages.karen}</span>
    </Link>
  );
}
