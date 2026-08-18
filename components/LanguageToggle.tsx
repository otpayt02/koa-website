"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { Lang, Messages } from "./i18n";

export function LanguageToggle({ lang, messages }: { lang: Lang; messages: Messages }) {
  const pathname = usePathname();

  function pathFor(target: Lang) {
    return pathname.replace(/^\/(en|karen)(?=\/|$)/, `/${target}`) || `/${target}`;
  }

  useEffect(() => {
    localStorage.setItem("koa-language", lang);
    document.cookie = `koa-language=${lang}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = lang === "karen" ? "ksw" : "en";
  }, [lang]);

  return (
    <nav className="language-toggle" aria-label={messages.language}>
      <Link href={pathFor("en")} hrefLang="en" lang="en" aria-current={lang === "en" ? "true" : undefined}>English</Link>
      <Link href={pathFor("karen")} hrefLang="ksw" lang="ksw" aria-current={lang === "karen" ? "true" : undefined}>ကညီကျိာ် <small lang="en">BETA</small></Link>
    </nav>
  );
}
