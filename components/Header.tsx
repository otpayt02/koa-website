"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Lang, Messages } from "./i18n";
import { LanguageToggle } from "./LanguageToggle";

const navCategories = [
  {
    label: "Language + AI",
    slug: "language-ai",
    items: [
      { slug: "mango", label: "S'gaw Mango" },
      { slug: "translate", label: "Translate" },
      { slug: "tutor", label: "Tutor" },
      { slug: "dictionary", label: "Dictionary" },
      { isDivider: true },
      { slug: "ocr", label: "OCR" },
      { slug: "vision", label: "Vision" },
      { slug: "corpus", label: "Corpus Discovery" },
    ]
  },
  {
    label: "Community Knowledge",
    slug: "community-knowledge",
    items: [
      { slug: "contributions", label: "Contributions" },
      { slug: "voices", label: "Voices" },
      { slug: "translation", label: "Translation" },
      { slug: "verification", label: "Verification" },
      { slug: "provenance", label: "Provenance" },
    ]
  },
  {
    label: "National Community",
    slug: "national-community",
    items: [
      { slug: "churches", label: "Churches" },
      { slug: "businesses", label: "Businesses" },
      { slug: "restaurants", label: "Restaurants" },
      { slug: "organizations", label: "Organizations" },
      { slug: "resources", label: "Resources" },
    ]
  },
  {
    label: "Culture",
    slug: "culture",
    items: [
      { slug: "podcast", label: "Podcast" },
      { slug: "music", label: "Music" },
      { slug: "recipes", label: "Recipes" },
      { slug: "stories", label: "Stories" },
    ]
  },
  {
    label: "Events",
    slug: "events",
    items: [
      { slug: "sepak-takraw", label: "Sepak Takraw" },
      { slug: "soccer", label: "Soccer" },
      { slug: "volleyball", label: "Volleyball" },
      { slug: "community-events", label: "Community Events" },
    ]
  },
  {
    label: "History + Resources",
    slug: "history-resources",
    items: [
      { slug: "karen-history", label: "Karen History" },
      { slug: "koa-history", label: "KOA History" },
      { slug: "advocacy", label: "Advocacy" },
      { slug: "news", label: "News" },
      { slug: "practical-resources", label: "Practical Resources" },
    ]
  }
] as const;

export function Header({ lang, messages }: { lang: Lang; messages: Messages }) {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  const closeDropdown = () => setOpenDropdown(null);

  return (
    <header className="site-header">
      <Link className="brand" href={`/${lang}`} aria-label={`${messages.siteName} — ${messages.home}`}>
        <img src="/koa/assets/koa-logo.png" alt="" width="52" height="52" />
        <span><strong>KOA</strong><small>{messages.siteName}</small></span>
      </Link>
      <div className="header-actions">
        <Link className="experience-switch" href="/koa/">
          <span>↗</span> Cinematic site
        </Link>
        <LanguageToggle lang={lang} messages={messages} />
        <button
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => setOpen((value) => !value)}
        >
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
          {navCategories.map((category, catIndex) => (
            <div key={category.slug} className="nav-dropdown">
              <button
                className="nav-dropdown__trigger"
                aria-haspopup="true"
                aria-expanded={openDropdown === category.slug}
                onClick={() => setOpenDropdown(openDropdown === category.slug ? null : category.slug)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpenDropdown(openDropdown === category.slug ? null : category.slug);
                  }
                }}
              >
                {category.label}
              </button>
              <div className="nav-dropdown__menu" role="menu">
                {category.items.map((item, itemIndex) => (
                  item.isDivider ? (
                    <hr key={`divider-${catIndex}-${itemIndex}`} />
                  ) : (
                    <Link
                      key={item.slug}
                      href={`/${lang}/${item.slug}`}
                      role="menuitem"
                      onClick={closeDropdown}
                    >
                      {item.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
          ))}
          <Link href={`/${lang}/collaborate`}><span>09</span>{messages.collaborate}</Link>
        </div>
      </nav>
    </header>
  );
}