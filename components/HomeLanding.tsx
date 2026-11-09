"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getMessages, pageLabels, type Lang } from "./i18n";
import { KAGlyphField } from "./cinematic/KAGlyphField";
import { SealAssembly } from "./cinematic/SealAssembly";

const priorities = ["home", "about", "services", "community", "dictionary", "contribute", "translation", "collaborate", "board", "changelog", "ai", "music", "contact"] as const;
const previews = {
  services: { image: "/koa/assets/programs-community-mobile-generated.png", label: pageLabels.services, detail: pageLabels.translation },
  collaborate: { image: "/koa/assets/fb-capitol-flags-mobile-enhanced.png", label: pageLabels.collaborate, detail: pageLabels.contribute },
  contact: { image: "/koa/assets/hero-community-mobile-enhanced.png", label: pageLabels.contact, detail: pageLabels.community },
} as const;
type Preview = keyof typeof previews;

/** A complete first-screen introduction; other journeys begin through explicit links. */
export function HomeLanding({ lang }: { lang: Lang }) {
  const messages = getMessages(lang);
  const markProgress = useRef(0);
  const sealTilt = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(true);
  const [line, setLine] = useState(0);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Preview | null>(null);

  useEffect(() => {
    if (!preview) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setPreview(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [preview]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !sealTilt.current) return;
      const bounds = sealTilt.current.getBoundingClientRect();
      const dx = Math.max(-1, Math.min(1, (event.clientX - bounds.left - bounds.width / 2) / (window.innerWidth / 2)));
      const dy = Math.max(-1, Math.min(1, (event.clientY - bounds.top - bounds.height / 2) / (window.innerHeight / 2)));
      sealTilt.current.style.setProperty("--tilt-x", `${(-dy * 6).toFixed(2)}deg`);
      sealTilt.current.style.setProperty("--tilt-y", `${(dx * 6).toFixed(2)}deg`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 2600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => setLine((current) => (current + 1) % priorities.length), 4200);
    return () => window.clearInterval(timer);
  }, [reduced]);

  return (
    <section className="koa-home" data-preview={preview || undefined} data-styleseed-recipe="public-service" aria-labelledby="koa-home-title">
      <div className="koa-home__photo" aria-hidden="true">
        <img src="/koa/assets/hero-community-mobile-enhanced.png" alt="" />
      </div>
      <div className="koa-home__veil" aria-hidden="true" />
      {loading && <div className="koa-home__loader" aria-hidden="true">
        <KAGlyphField progress={markProgress} reducedMotion={false} hero loading />
      </div>}
      <div className="koa-home__content">
        <div className="koa-home__mark" aria-hidden="true">
          <KAGlyphField progress={markProgress} reducedMotion={false} hero />
          <div className="koa-home__seal"><div className="koa-home__seal-arrival"><div className="koa-home__seal-tilt" ref={sealTilt}><SealAssembly rotation={0} /></div></div></div>
        </div>
        <div className="koa-home__names">
          <h1 id="koa-home-title" lang={lang === "ksw" ? "en" : lang}>{lang === "th" || lang === "my" ? messages.siteName : "Karen Organization of America"}</h1>
          <p className="koa-home__karen" lang="ksw">ကညီအတၢ်ကရၢကရိလၢကီၢ်အမဲရကၤ</p>
        </div>
        <p className="koa-home__subheading" lang={lang}>{pageLabels.home[lang]}</p>
        <div className="koa-home__cycle" aria-label={messages.explore} lang={lang}>
          {!reduced && <span className="koa-home__cycle-index" aria-hidden="true">{String(line + 1).padStart(2, "0")} / {priorities.length}</span>}
          <p key={line}>{pageLabels[priorities[reduced ? 0 : line]][lang]}</p>
        </div>
        <nav className="koa-home__actions" aria-label={messages.explore} lang={lang}>
          <button type="button" className="koa-home__action koa-home__action--primary" onClick={() => setPreview("services")}>{messages.explore} {messages.services} <span aria-hidden="true">↗</span></button>
          <button type="button" className="koa-home__action" onClick={() => setPreview("collaborate")}>{messages.collaborate} <span aria-hidden="true">↗</span></button>
          <button type="button" className="koa-home__action" onClick={() => setPreview("contact")}>{messages.contact} <span aria-hidden="true">↗</span></button>
        </nav>
      </div>
      {preview && <div className="koa-home__preview" role="region" aria-label={previews[preview].label[lang]}>
        <div className="koa-home__preview-image" style={{ backgroundImage: `url(${previews[preview].image})` }} aria-hidden="true" />
        <div className="koa-home__preview-copy" lang={lang}>
          <button className="koa-home__preview-close" type="button" autoFocus onClick={() => setPreview(null)} aria-label={messages.close}>×</button>
          <h2>{previews[preview].label[lang]}</h2>
          <p>{previews[preview].detail[lang]}</p>
          <Link className="koa-home__action" href={`/${lang}/${preview}`}>{messages.learnMore} <span aria-hidden="true">↗</span></Link>
        </div>
      </div>}
    </section>
  );
}
