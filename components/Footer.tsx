"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { KAGlyphField } from "./cinematic/KAGlyphField";
import { SealAssembly } from "./cinematic/SealAssembly";
import type { Lang, Messages } from "./i18n";

const ease = (value: number) => {
  const x = Math.min(1, Math.max(0, value));
  return x * x * (3 - 2 * x);
};

export function Footer({ lang, messages }: { lang: Lang; messages: Messages }) {
  const footerRef = useRef<HTMLElement>(null);
  const glyphProgress = useRef(1);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches || new URLSearchParams(window.location.search).get("motion") === "off");
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    if (reduced) {
      glyphProgress.current = 1;
      footer.style.setProperty("--footer-form", "1");
      footer.style.setProperty("--footer-name", "1");
      footer.style.setProperty("--footer-translation", "1");
      footer.style.setProperty("--footer-links", "1");
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const update = (progress: number) => {
      const form = ease(progress / .55);
      glyphProgress.current = form;
      footer.style.setProperty("--footer-form", form.toFixed(4));
      footer.style.setProperty("--footer-name", ease((progress - .42) / .28).toFixed(4));
      footer.style.setProperty("--footer-translation", ease((progress - .52) / .25).toFixed(4));
      footer.style.setProperty("--footer-links", ease((progress - .64) / .25).toFixed(4));
    };
    const trigger = ScrollTrigger.create({
      trigger: footer,
      start: "top bottom",
      end: "bottom bottom",
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => update(self.progress),
    });
    return () => trigger.kill();
  }, [reduced]);

  return (
    <footer ref={footerRef} className="site-footer koa-unified-footer">
      <div className="koa-footer__stage">
        <nav className="koa-footer__side koa-footer__side--left" aria-label="Footer navigation">
          <Link href={`/${lang}/about`}>{messages.about}</Link>
          <Link href={`/${lang}/services`}>{messages.services}</Link>
          <Link href={`/${lang}/community`}>{messages.community}</Link>
          <Link href={`/${lang}/events`}>{messages.events}</Link>
        </nav>
        <div className="koa-footer__center">
          <div className="koa-footer__mark" aria-hidden="true">
            <KAGlyphField progress={glyphProgress} reducedMotion={reduced} hero scatterProgress={glyphProgress} />
            <div className="koa-footer__seal"><SealAssembly rotation={0} /></div>
          </div>
          <div className="koa-footer__names">
            <strong>Karen Organization of America</strong>
            <span lang="ksw">ကညီအတၢ်ကရၢကရိလၢကီၢ်အမဲရကၤ</span>
          </div>
        </div>
        <div className="koa-footer__side koa-footer__side--right">
          <nav aria-label="More KOA pages">
            <Link href={`/${lang}/commentary`}>{messages.commentary}</Link>
            <Link href={`/${lang}/translation`}>{messages.translation}</Link>
            <Link href={`/${lang}/contact`}>{messages.contact}</Link>
            <Link href={`/${lang}/collaborate`}>{messages.collaborate}</Link>
          </nav>
          <div className="koa-footer__meta">
            <a href="https://www.facebook.com/koamerica" target="_blank" rel="noreferrer">Facebook ↗</a>
            <small>© {new Date().getFullYear()} KOA</small>
          </div>
        </div>
      </div>
    </footer>
  );
}
