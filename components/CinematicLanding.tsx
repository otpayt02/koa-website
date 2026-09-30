"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { Lang, Messages } from "./i18n";
import { KAGlyphField } from "./cinematic/KAGlyphField";
import KarenGlyphField from "./KarenGlyphField";
import { PartnerMarquee } from "./cinematic/PartnerMarquee";
import { SealAssembly } from "./cinematic/SealAssembly";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smoothStep = (value: number) => {
  const clamped = clamp(value);
  return clamped * clamped * (3 - 2 * clamped);
};
// GSAP gives the scene a 130ms scroll destination. Formed K/A glyphs breathe
// in place beside the supplied seal, and all three marks rise together.
// Motion off restores native scrolling and the complete static composition.
const voiceWords = ["Uniting", "Providing", "Inviting", "Defining", "Aligning", "Deciding", "Refining", "Exciting", "Rewriting", "Applying", "Supplying", "Combining"] as const;

const missionCards = [
  {
    number: "01",
    title: "Policy advocacy",
    body: "Engage Congress and federal agencies on policy affecting Myanmar/Burma and the Karen people.",
    image: "/koa/assets/fb-capitol-group-mobile-enhanced.png",
    href: "services",
  },
  {
    number: "02",
    title: "Language & culture",
    body: "Support Karen literacy, language classes, cultural events, and civic participation across generations.",
    image: "/koa/assets/cultural-community.jpg",
    href: "dictionary",
  },
  {
    number: "03",
    title: "Resettlement support",
    body: "Help Karen families navigate life in a new country, from early arrival needs to community connection.",
    image: "/koa/assets/humanitarian-assistance.jpg",
    href: "community",
  },
  {
    number: "04",
    title: "Youth advocacy",
    body: "NYAP connects young Karen Americans with history, advocacy skills, and civic networks.",
    image: "/koa/assets/community-engagement.jpg",
    href: "collaborate",
  },
  {
    number: "05",
    title: "Education training",
    body: "Offer guidance on college readiness, job preparation, citizenship testing, and English literacy.",
    image: "/koa/assets/fb-outdoor-gathering-mobile-enhanced.png",
    href: "community",
  },
];

function phaseFor(progress: number) {
  if (progress < 0.78) return "hold";
  return "narrative";
}

export function CinematicLanding({ lang, messages }: { lang: Lang; messages: Messages }) {
  const filmRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const animationContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const phaseRef = useRef("hold");
  const [phase, setPhase] = useState("hold");
  const [motionReduced, setMotionReduced] = useState(false);
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [displayCards, setDisplayCards] = useState(missionCards);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const query = new URLSearchParams(window.location.search);
    // `?motion=on` is an explicit preview override for motion QA; normal visits
    // still honor the operating system's reduced-motion preference.
    const requestedMotion = query.get("motion");
    const sync = () => setMotionReduced(
      requestedMotion === "off" || (requestedMotion !== "on" && media.matches),
    );
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const film = filmRef.current;
    const animationContainer = animationContainerRef.current;
    if (!film || !animationContainer) return;

    const renderProgress = (value: number) => {
      const next = clamp(value);
      progressRef.current = next;
      film.style.setProperty("--koa-progress", next.toFixed(5));
      // The stationary K/A targets and supplied seal share this eased rise.
      film.style.setProperty("--koa-rise", smoothStep((next - 0.55) / 0.16).toFixed(5));
      const nextPhase = phaseFor(next);
      if (nextPhase !== phaseRef.current) {
        phaseRef.current = nextPhase;
        setPhase(nextPhase);
      }
      // Reveal the document's text after the mark has had its opening read.
      film.dataset.titleVisible = next >= 0.985 ? "true" : "false";
      film.dataset.translationVisible = next >= 0.85 ? "true" : "false";
      film.dataset.charterVisible = next >= 0.997 ? "true" : "false";
      film.dataset.annulusVisible = "true";
    };

    if (motionReduced) {
      renderProgress(0.99);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    // Real elapsed time keeps scrub/Lenis aligned even after a dropped frame.
    gsap.ticker.lagSmoothing(0);
    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.22,
      smoothWheel: true,
      // Native touch inertia remains immediate; only the entrance has a short follow.
      syncTouch: false,
      anchors: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (seconds: number) => lenis.raf(seconds * 1000);
    gsap.ticker.add(tick);

    const context = gsap.context(() => {
      const playhead = { value: 0 };
      gsap.set(animationContainer, { y: 8, transformOrigin: "50% 48%" });
      const setY = gsap.quickSetter(animationContainer, "y", "px");
      // The container follows just behind the spring-driven glyph targets on both scroll directions.
      const render = () => {
        renderProgress(playhead.value);
        setY(8 * (1 - smoothStep(playhead.value / 0.55)));
      };
      // One reusable tween retargets immediately, without queuing wheel events or timelines.
      const follow = gsap.quickTo(playhead, "value", { duration: 0.13, ease: "power3.out", onUpdate: render });
      ScrollTrigger.create({
        trigger: film,
        start: "top top",
        end: () => `+=${Math.max(1, film.offsetHeight - window.innerHeight)}`,
        onUpdate: (self) => follow(self.progress),
        // Reloads, resizing and restored scroll positions must show the correct frame immediately.
        onRefresh: (self) => {
          follow.tween.pause();
          playhead.value = self.progress;
          render();
        },
      });
    }, film);
    let disposed = false;
    const refresh = () => { if (!disposed) { lenis.resize(); ScrollTrigger.refresh(); } };
    void document.fonts.ready.then(refresh);

    return () => {
      disposed = true;
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      context.revert();
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [motionReduced]);

  useEffect(() => {
    if (motionReduced || phase !== "narrative") {
      setVoiceIndex(0);
      return;
    }

    const cycle = window.setInterval(() => {
      setVoiceIndex((index) => (index + 1) % voiceWords.length);
    }, 2600);
    return () => window.clearInterval(cycle);
  }, [motionReduced, phase]);

  useEffect(() => {
    if (motionReduced) return;
    let slot = 0;
    const cycle = window.setInterval(() => {
      setDisplayCards((cards) => cards.map((card, index) => {
        if (index !== slot) return card;
        const current = missionCards.findIndex((candidate) => candidate.number === card.number);
        return missionCards[(current + 1) % missionCards.length];
      }));
      slot = (slot + 1) % missionCards.length;
    }, 6000);
    return () => window.clearInterval(cycle);
  }, [motionReduced]);

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;

    const revealables = Array.from(story.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (motionReduced) {
      story.removeAttribute("data-motion");
      revealables.forEach((element) => element.removeAttribute("data-revealed"));
      return;
    }

    // Reveal chapters once on arrival, leaving the hero as the single continuous film system.
    story.dataset.motion = "full";
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute("data-revealed", "true");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10%", threshold: 0.12 });

    revealables.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      story.removeAttribute("data-motion");
    };
  }, [motionReduced]);

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
          <div className="koa-film__landscape" aria-hidden="true"><span className="koa-film__sun" /><span className="koa-film__ridge koa-film__ridge--far" /><span className="koa-film__ridge koa-film__ridge--near" /></div>
          <KarenGlyphField reducedMotion={motionReduced} />
          <div ref={animationContainerRef} className="koa-film__mark" aria-hidden="true">
            <KAGlyphField progress={progressRef} reducedMotion={motionReduced} />
            <div className="koa-film__seal">
              <div className="koa-film__seal-glow" />
              <SealAssembly rotation={0} />
            </div>
          </div>

          <div className="koa-film__narrative">
            <p className="koa-film__narrative-label">Karen Organization of America</p>
            <p className="koa-film__narrative-translation" lang="ksw">ကညီအတၢ်ကရၢကရိလၢကီၢ်အမဲရကၤ</p>
            <p className="koa-film__charter">
              <span>Standing with the Karen community in America,</span>
              <span>here and beyond borders.</span>
              <span>Preserving Karen language, cultural identity, and a voice in Washington.</span>
            </p>
          </div>

          <p className="koa-film__voice-line" aria-live="polite">
            <span className="koa-film__voice-word" key={voiceWords[voiceIndex]}>{voiceWords[voiceIndex]}</span>{" "}
            <span>a voice</span>
          </p>

          <div className="koa-film__phase-label" aria-hidden="true">
            <span>Language</span>
            <span>Identity</span>
            <span>Community</span>
          </div>

          <p className="koa-film__scroll-cue" aria-hidden="true">Scroll to explore <span>↓</span></p>

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

      <main ref={storyRef} className="koa-story" id="main-content">
        <section className="koa-chapter koa-chapter--split" aria-labelledby="koa-chapter-one">
          <div className="koa-chapter__media koa-chapter__media--portrait" data-reveal="media">
            <img src="/koa/assets/fb-capitol-group-mobile-enhanced.png" alt="Karen community advocates gathered during a visit to the United States Capitol" />
          </div>
          <div className="koa-chapter__copy" data-reveal>
            <p className="koa-chapter__eyebrow">Chapter 01 · Civic voice</p>
            <h2 id="koa-chapter-one">Carrying Karen voices into U.S. policy.</h2>
            <p>KOA engages Congress and federal agencies on legislation and policy affecting Myanmar/Burma and the Karen people.</p>
            <Link className="koa-chapter__link" href={`/${lang}/services`}>Explore community programs <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="koa-chapter koa-chapter--full" aria-labelledby="koa-chapter-two">
          <img className="koa-chapter__full-image" src="/koa/assets/fb-community-group-mobile-enhanced.png" alt="Karen community members gathering together" />
          <div className="koa-chapter__full-shade" aria-hidden="true" />
          <div className="koa-chapter__full-copy" data-reveal>
            <p className="koa-chapter__eyebrow">Chapter 02 · Living language</p>
            <h2 id="koa-chapter-two">Preserving Karen language across generations.</h2>
            <p>Cultural events, language classes, and civic programs help Karen Americans stay connected to their heritage.</p>
            <Link className="koa-chapter__link" href={`/${lang}/dictionary`}>Enter the living dictionary <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="koa-chapter koa-chapter--split koa-chapter--reverse" aria-labelledby="koa-chapter-three">
          <div className="koa-chapter__copy" data-reveal>
            <p className="koa-chapter__eyebrow">Chapter 03 · Belonging</p>
            <h2 id="koa-chapter-three">Support that meets people where they are.</h2>
            <p>From early resettlement needs to long-term community connection, KOA supports Karen families in the U.S.</p>
            <Link className="koa-chapter__link" href={`/${lang}/community`}>Find the community hub <span aria-hidden="true">→</span></Link>
          </div>
          <div className="koa-chapter__media koa-chapter__media--wide" data-reveal="media">
            <img src="/koa/assets/fb-outdoor-gathering-mobile-enhanced.png" alt="Karen community members gathered outdoors" />
          </div>
        </section>

        <section className="koa-mission" aria-labelledby="koa-mission-title">
          <header className="koa-mission__header" data-reveal>
            <p className="koa-chapter__eyebrow">Chapter 04 · Why KOA exists</p>
            <h2 id="koa-mission-title">Rooted in community, built for the long term.</h2>
          </header>

          <div className="koa-mission__carnival" data-reveal="media">
            {displayCards.map((card, index) => (
              <article className="koa-mission-card" key={`slot-${index}`}>
                <div className="koa-mission-card__swap" key={card.number}>
                <div className="koa-mission-card__image"><img src={card.image} alt="" /></div>
                <div className="koa-mission-card__body">
                  <span>{card.number}</span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <Link href={`/${lang}/${card.href}`}>Explore <span aria-hidden="true">↗</span></Link>
                </div>
                </div>
              </article>
            ))}
          </div>

          <div className="koa-mission__statement" data-reveal>
            <p className="koa-mission__statement-label">Our mission</p>
            <p className="koa-mission__statement-text">
              Support Karen families, strengthen cultural continuity, and carry community voices into national policy regarding Myanmar/Burma.
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
