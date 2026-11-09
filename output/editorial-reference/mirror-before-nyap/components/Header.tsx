"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Lang, Messages } from "./i18n";
import { LanguageToggle } from "./LanguageToggle";

// The content draft is the public navigation contract; every entry has a mounted route.
const navigation = [
  { slug: "", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "services", label: "Programs" },
  { slug: "news", label: "News" },
  { slug: "contact", label: "Contact" },
  { slug: "events", label: "Upcoming" },
] as const;

export function Header({ lang, messages }: { lang: Lang; messages: Messages }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(navigation.length);
  // Measure actual link widths: only overflow links enter the drawer, at any viewport size.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const fit = () => {
      const brand = header.querySelector<HTMLElement>(".brand")!;
      const actions = header.querySelector<HTMLElement>(".header-actions")!;
      const menu = header.querySelector<HTMLElement>(".menu-button")!;
      const style = getComputedStyle(header);
      const gap = parseFloat(style.columnGap) || 12;
      const links = Array.from(probeRef.current?.children || []) as HTMLElement[];
      const linkGap = 14;
      const widths = links.map(link => link.getBoundingClientRect().width);
      const fixedActions = Array.from(actions.children).filter(el => el !== menu).reduce((sum, el) => sum + el.getBoundingClientRect().width, 0) + 8;
      const room = header.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - brand.getBoundingClientRect().width - fixedActions - gap * 2;
      const total = widths.reduce((sum, w) => sum + w, 0) + linkGap * (widths.length - 1);
      if (total <= room) { setVisibleCount(navigation.length); return; }
      const remaining = room - Math.max(menu.getBoundingClientRect().width, 74) - 8;
      let used = 0, count = 0;
      for (const width of widths) { const next = used + width + (count ? linkGap : 0); if (next > remaining) break; used = next; count++; }
      setVisibleCount(count);
    };
    const observer = new ResizeObserver(fit);
    observer.observe(header);
    window.addEventListener("resize", fit);
    document.fonts.ready.then(fit);
    fit();
    return () => { observer.disconnect(); window.removeEventListener("resize", fit); };
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header ref={headerRef} className="site-header" data-overflow={visibleCount < navigation.length}>
      <div ref={probeRef} className="nav-width-probe" aria-hidden="true" inert>{navigation.map(item => <span key={item.slug}>{item.label}</span>)}</div>
      <Link className="brand" href={`/${lang}`} prefetch={false} aria-label={`${messages.siteName} — ${messages.home}`}>
        <span className="brand-emblem"><img src="/koa/assets/koa-logo.png" alt="" width="54" height="54" /></span>
        <span className="brand-wordmark"><strong>KOA</strong><small>{messages.siteName}</small></span>
      </Link>
      <nav className="site-nav-desktop" aria-label="Primary navigation">
        {navigation.slice(0, visibleCount).map(({ slug, label }) => {
          const href = `/${lang}${slug ? `/${slug}` : ""}`;
          return <Link key={slug} href={href} prefetch={false} aria-current={pathname === href ? "page" : undefined}>{label}</Link>;
        })}
      </nav>
      <div className="header-actions">
        <Link className="header-donate" href={`/${lang}/donate`} prefetch={false} aria-current={pathname === `/${lang}/donate` ? "page" : undefined}>Donate</Link>
        <LanguageToggle lang={lang} messages={messages} />
        <button className="menu-button" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen((value) => !value)}>
          <span className="menu-lines" aria-hidden="true" />
          <span>{open ? messages.close : messages.menu}</span>
        </button>
      </div>
      <nav id="site-navigation" className="site-nav" aria-label="Small screen navigation" data-open={open} inert={!open}>
        <div className="nav-lead"><p className="eyebrow">{messages.explore} KOA</p></div>
        <div className="nav-grid">
          {navigation.slice(visibleCount).map(({ slug, label }, index) => {
            const href = `/${lang}${slug ? `/${slug}` : ""}`;
            return <Link key={slug} href={href} prefetch={false} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}><span>{String(index + 1).padStart(2, "0")}</span>{label}</Link>;
          })}
        </div>
      </nav>
    </header>
  );
}
