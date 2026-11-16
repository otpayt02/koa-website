"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Lang, Messages } from "./i18n";
import { LanguageToggle } from "./LanguageToggle";

const publicNavigation = ["about", "services", "community", "events", "commentary", "translation", "contact"] as const;

export function Header({ lang, messages }: { lang: Lang; messages: Messages }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  return (
    <header className="site-header" data-breathing-header>
      <Link className="brand" href={`/${lang}`} aria-label={`${messages.siteName} — ${messages.home}`} onClick={() => setOpen(false)}>
        <img src="/koa/assets/koa-seal-white-lettering-v2.png" alt="" width="52" height="52" />
        <span><strong>KOA</strong><small>{messages.siteName}</small></span>
      </Link>
      <div className="header-actions">
        <LanguageToggle lang={lang} messages={messages} />
        <button className="menu-button" type="button" aria-label={open ? messages.close : messages.menu}
          aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen((value) => !value)}>
          <span className="menu-lines" aria-hidden="true" />
          <span>{open ? messages.close : messages.menu}</span>
        </button>
      </div>
      <nav id="site-navigation" className="site-nav" aria-label="Primary navigation" data-open={open}>
        <div className="nav-grid">
          {publicNavigation.map((slug) => (
            <Link key={slug} href={`/${lang}/${slug}`} onClick={() => setOpen(false)}>{messages[slug]}</Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
