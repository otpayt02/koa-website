"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Lang, Messages } from "./i18n";
import { LanguageToggle } from "./LanguageToggle";

const navItems = [
  ["about", "about"],
  ["services", "services"],
  ["community", "community"],
  ["dictionary", "dictionary"],
  ["translation", "translation"],
  ["contribute", "contribute"],
  ["contact", "contact"]
] as const;

export function Header({ lang, messages }: { lang: Lang; messages: Messages }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  return (
    <header className="site-header">
      <Link className="brand" href={`/${lang}`} aria-label={`${messages.siteName} — ${messages.home}`}>
        {/* Existing KOA asset; intentionally left unmodified. */}
        <img src="/koa/assets/koa-logo.png" alt="" width="52" height="52" />
        <span><strong>KOA</strong><small>{messages.siteName}</small></span>
      </Link>
      <div className="header-actions">
        <Link className="experience-switch" href="/koa/">Cinematic site</Link>
        <LanguageToggle lang={lang} messages={messages} />
        <button className="menu-button" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen((value) => !value)}>
          <span className="menu-lines" aria-hidden="true" />
          <span>{open ? messages.close : messages.menu}</span>
        </button>
      </div>
      <nav id="site-navigation" className="site-nav" aria-label="Primary navigation" data-open={open}>
        <div className="nav-lead">
          <p className="eyebrow">{messages.explore} KOA</p>
          <p>{messages.tagline}</p>
        </div>
        <div className="nav-grid">
          <Link href={`/${lang}`}><span>01</span>{messages.home}</Link>
          {navItems.map(([slug, key], index) => (
            <Link key={slug} href={`/${lang}/${slug}`}>
              <span>{String(index + 2).padStart(2, "0")}</span>{messages[key]}
            </Link>
          ))}
          <Link href={`/${lang}/collaborate`}><span>09</span>{messages.collaborate}</Link>
        </div>
      </nav>
    </header>
  );
}
