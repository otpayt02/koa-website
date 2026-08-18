"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lang, Messages } from "./i18n";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function CinematicHome({ lang, messages }: { lang: Lang; messages: Messages }) {
  const filmRef = useRef<HTMLElement>(null);
  const [motionReduced, setMotionReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setPreferredMotion = () => setMotionReduced(media.matches);
    setPreferredMotion();
    media.addEventListener("change", setPreferredMotion);

    let frame = 0;
    const update = () => {
      frame = 0;
      const film = filmRef.current;
      if (!film) return;
      const bounds = film.getBoundingClientRect();
      const available = Math.max(1, bounds.height - window.innerHeight);
      const progress = clamp(-bounds.top / available);
      film.style.setProperty("--film-progress", progress.toFixed(4));
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    requestUpdate();
    return () => {
      media.removeEventListener("change", setPreferredMotion);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const goToChapter = (chapter: number) => {
    const film = filmRef.current;
    if (!film) return;
    const available = Math.max(1, film.offsetHeight - window.innerHeight);
    window.scrollTo({ top: film.offsetTop + available * chapter, behavior: "smooth" });
  };

  return (
    <section
      ref={filmRef}
      className="cinematic-film"
      data-motion={motionReduced ? "reduced" : "full"}
      aria-label="Karen Organization of America story"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--pointer-x", `${((event.clientX - bounds.left) / bounds.width - 0.5).toFixed(3)}`);
        event.currentTarget.style.setProperty("--pointer-y", `${((event.clientY - bounds.top) / bounds.height - 0.5).toFixed(3)}`);
      }}
    >
      <div className="cinematic-film__sticky">
        <div className="cinematic-film__vortex" aria-hidden="true"><i /><b /></div>
        <div className="cinematic-film__grain" aria-hidden="true" />

        <article className="cinematic-film__scene cinematic-film__scene--seal">
          <div className="cinematic-film__seal-wrap" aria-hidden="true">
            <div className="cinematic-film__seal-halo" />
            <img src="/koa/assets/koa-seal-white-lettering-v2.png" alt="" />
          </div>
          <div className="cinematic-film__copy">
            <p className="cinematic-film__kicker">Established 2018 · Omaha, Nebraska</p>
            <h1>{lang === "karen" ? "ကညီပှၤတဝၢလၢ အမဲရကၤ" : "Many places. One community."}</h1>
            <p>{lang === "karen" ? "ဆဲးကျိးလိာ်သး၊ ဒီသဒၢကညီကျိာ်၊ ဒီးတီခိၣ်ရိၣ်မဲခါဆူညါဃုာ်ဒီးလိာ်သး။" : "A national home for Karen people to connect, protect language, and lead the future together."}</p>
            <div className="cinematic-film__actions">
              <Link className="cinematic-film__button" href={`/${lang}/community`}>{messages.explore} {messages.community}</Link>
              <Link className="cinematic-film__button cinematic-film__button--ghost" href={`/${lang}/dictionary`}>{messages.searchDictionary}</Link>
            </div>
          </div>
        </article>

        <article className="cinematic-film__scene cinematic-film__scene--voice">
          <div className="cinematic-film__image"><img src="/koa/assets/fb-capitol-group-mobile-enhanced.png" alt="" /></div>
          <div className="cinematic-film__copy cinematic-film__copy--panel">
            <p className="cinematic-film__kicker">Chapter 02 · Civic voice</p>
            <h2>Knowledge becomes a voice in the room.</h2>
            <p>Community experience belongs in the places where decisions are made.</p>
            <Link className="cinematic-film__text-link" href={`/${lang}/services`}>Explore community programs <span>→</span></Link>
          </div>
        </article>

        <article className="cinematic-film__scene cinematic-film__scene--language">
          <div className="cinematic-film__image"><img src="/koa/assets/story-community-original.png" alt="" /></div>
          <div className="cinematic-film__copy cinematic-film__copy--panel">
            <p className="cinematic-film__kicker">Chapter 03 · Living language</p>
            <h2>Every word is a way home.</h2>
            <p>Share a definition, a recording, or a memory that helps Karen language travel forward.</p>
            <Link className="cinematic-film__text-link" href={`/${lang}/contribute`}>Contribute to the living dictionary <span>→</span></Link>
          </div>
        </article>

        <div className="cinematic-film__controls">
          <p>Film · <strong>2400</strong> frames</p>
          <div className="cinematic-film__chapter-buttons" aria-label="Story chapters">
            {[0, 0.42, 0.78].map((chapter, index) => <button key={chapter} type="button" aria-label={`Go to chapter ${index + 1}`} onClick={() => goToChapter(chapter)}>{String(index + 1).padStart(2, "0")}</button>)}
          </div>
          <button className="cinematic-film__motion" type="button" aria-pressed={motionReduced} onClick={() => setMotionReduced((value) => !value)}>{motionReduced ? "Motion off" : "Motion on"}</button>
        </div>
        <p className="cinematic-film__scroll-cue">Scroll to enter <span>↓</span></p>
      </div>
    </section>
  );
}
