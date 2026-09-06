"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lang, Messages } from "./i18n";
import { KAGlyphField } from "./cinematic/KAGlyphField";
import { PartnerMarquee } from "./cinematic/PartnerMarquee";
import { SealAssembly } from "./cinematic/SealAssembly";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const voiceWords = ["Providing", "Combining", "Inviting"] as const;

const missionCards = [
  {
    number: "01",
    title: "Civic voice",
    body: "Help Karen communities understand public systems, organize around priorities, and speak where decisions are made.",
    image: "/koa/assets/fb-capitol-group-mobile-enhanced.png",
    href: "services",
  },
  {
    number: "02",
    title: "Living language",
    body: "Preserve S’gaw Karen through community-reviewed words, recordings, translation, and intergenerational learning.",
    image: "/koa/assets/cultural-community.jpg",
    href: "dictionary",
  },
  {
    number: "03",
    title: "Community care",
    body: "Connect people to practical support, trusted community relationships, and ways to help one another.",
    image: "/koa/assets/humanitarian-assistance.jpg",
    href: "community",
  },
  {
    number: "04",
    title: "Youth leadership",
    body: "Make room for the next generation to learn, build, organize, and lead with confidence.",
    image: "/koa/assets/community-engagement.jpg",
    href: "collaborate",
  },
  {
    number: "05",
    title: "Culture in motion",
    body: "Keep identity visible through gathering, sport, music, food, storytelling, and shared public life.",
    image: "/koa/assets/fb-outdoor-gathering-mobile-enhanced.png",
    href: "community",
  },
];

function phaseFor(progress: number) {
  if (progress < 0.045) return "arrival";
  if (progress < 0.22) return "converge";
  if (progress < 0.38) return "hold";
  if (progress < 0.54) return "scatter";
  return "release";
}

export function CinematicLanding({ lang, messages }: { lang: Lang; messages: Messages }) {
  const filmRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [motionReduced, setMotionReduced] = useState(false);
  const [voiceIndex, setVoiceIndex] = useState(0);
  const phase = phaseFor(progress);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const query = new URLSearchParams(window.location.search);
    const sync = () => setMotionReduced(media.matches || query.get("motion") === "off");
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const film = filmRef.current;
    if (!film) return;

    if (motionReduced) {
      film.style.setProperty("--koa-progress", "0.30");
      setProgress(0.30);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = film.getBoundingClientRect();
      const available = Math.max(1, film.offsetHeight - window.innerHeight);
      const next = clamp(-rect.top / available);
      film.style.setProperty("--koa-progress", next.toFixed(5));
      setProgress((current) => Math.abs(current - next) > 0.001 ? next : current);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [motionReduced]);

  useEffect(() => {
    if (motionReduced || progress < 0.54) {
      setVoiceIndex(0);
      return;
    }

    const cycle = window.setInterval(() => {
      setVoiceIndex((index) => (index + 1) % voiceWords.length);
    }, 2600);
    return () => window.clearInterval(cycle);
  }, [motionReduced, progress]);

  return (
    <>
      <section
        ref={filmRef}
        className="koa-film"
        data-phase={phase}
        data-motion={motionReduced ? "reduced" : "full"}
        aria-labelledby="koa-film-title"
      >
        <div className="koa-film__sticky">
          <h1 id="koa-film-title" className="koa-sr-only">
            {lang === "ksw" ? "ကညီအတၢ်ကရၢကရိလၢကီၢ်အမဲရကၤ" : "Karen Organization of America"}
          </h1>

          <div className="koa-film__atmosphere" aria-hidden="true" />
          <KAGlyphField progress={progress} reducedMotion={motionReduced} />

          <div className="koa-film__seal" aria-hidden="true">
            <div className="koa-film__seal-glow" />
            <SealAssembly rotation={progress * 360} />
          </div>

          <div className="koa-film__identity" aria-hidden="true">
            <span>Karen Organization</span>
            <span>of America</span>
          </div>

          <p className="koa-film__voice-line" aria-live="polite">
            <span className="koa-film__voice-word" key={voiceWords[voiceIndex]}>{voiceWords[voiceIndex]}</span>{" "}
            <span>voices</span>
          </p>

          <div className="koa-film__phase-label" aria-hidden="true">
            <span>Language</span>
            <span>Identity</span>
            <span>Community</span>
          </div>

          <p className="koa-film__scroll-cue" aria-hidden="true">Scroll to assemble <span>↓</span></p>

          <button
            className="koa-film__motion-toggle"
            type="button"
            aria-pressed={motionReduced}
            onClick={() => setMotionReduced((value) => !value)}
          >
            {motionReduced ? "Motion off" : "Motion on"}
          </button>
        </div>
      </section>

      <main className="koa-story" id="main-content">
        <section className="koa-chapter koa-chapter--split" aria-labelledby="koa-chapter-one">
          <div className="koa-chapter__media koa-chapter__media--portrait">
            <img src="/koa/assets/fb-capitol-group-mobile-enhanced.png" alt="Karen community advocates gathered during a visit to the United States Capitol" />
          </div>
          <div className="koa-chapter__copy">
            <p className="koa-chapter__eyebrow">Chapter 01 · Civic voice</p>
            <h2 id="koa-chapter-one">Knowledge becomes a voice in the room.</h2>
            <p>KOA helps Karen leaders and young people understand public systems, speak to decision-makers, and bring what they learn back into community life.</p>
            <Link className="koa-chapter__link" href={`/${lang}/services`}>Explore community programs <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="koa-chapter koa-chapter--full" aria-labelledby="koa-chapter-two">
          <img className="koa-chapter__full-image" src="/koa/assets/story-community-original.png" alt="Karen community members gathering together" />
          <div className="koa-chapter__full-shade" aria-hidden="true" />
          <div className="koa-chapter__full-copy">
            <p className="koa-chapter__eyebrow">Chapter 02 · Living language</p>
            <h2 id="koa-chapter-two">Every word is a way home.</h2>
            <p>Language survives because people use it, record it, correct it, teach it, and carry it into the next generation.</p>
            <Link className="koa-chapter__link" href={`/${lang}/dictionary`}>Enter the living dictionary <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="koa-chapter koa-chapter--split koa-chapter--reverse" aria-labelledby="koa-chapter-three">
          <div className="koa-chapter__copy">
            <p className="koa-chapter__eyebrow">Chapter 03 · Belonging</p>
            <h2 id="koa-chapter-three">Culture, care, and courage—connected.</h2>
            <p>From community gatherings to practical support, KOA builds connective tissue between Karen people across cities, generations, and experiences.</p>
            <Link className="koa-chapter__link" href={`/${lang}/community`}>Find the community hub <span aria-hidden="true">→</span></Link>
          </div>
          <div className="koa-chapter__media koa-chapter__media--wide">
            <img src="/koa/assets/fb-outdoor-gathering-mobile-enhanced.png" alt="Karen community members gathered outdoors" />
          </div>
        </section>

        <section className="koa-mission" aria-labelledby="koa-mission-title">
          <header className="koa-mission__header">
            <p className="koa-chapter__eyebrow">Chapter 04 · Why KOA exists</p>
            <h2 id="koa-mission-title">A national organization should feel as alive as the people it serves.</h2>
          </header>

          <div className="koa-mission__carnival">
            {missionCards.map((card) => (
              <article className="koa-mission-card" key={card.number}>
                <div className="koa-mission-card__image"><img src={card.image} alt="" /></div>
                <div className="koa-mission-card__body">
                  <span>{card.number}</span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <Link href={`/${lang}/${card.href}`}>Explore <span aria-hidden="true">↗</span></Link>
                </div>
              </article>
            ))}
          </div>

          <div className="koa-mission__statement">
            <p className="koa-mission__statement-label">Our mission</p>
            <p className="koa-mission__statement-text">
              Strengthen unity, protect Karen rights and language, and build practical pathways for people to participate, contribute, and lead—wherever they call home in America.
            </p>
            <div className="koa-mission__actions">
              <Link href={`/${lang}/collaborate`}>Get involved</Link>
              <Link href={`/${lang}/contribute`}>Contribute language</Link>
            </div>
          </div>
        </section>
      </main>

      <PartnerMarquee motionReduced={motionReduced} />
    </>
  );
}

export default CinematicLanding;
