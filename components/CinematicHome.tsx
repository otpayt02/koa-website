"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Lang, Messages } from "./i18n";
import { PremiumHeader } from "./PremiumHeader";
import { KarenGlyphField } from "./KarenGlyphField";
import { KOALogoIntro } from "./KOALogoIntro";
import { LoomWeave } from "./LoomWeave";
import { ParallaxTextReveal } from "./ParallaxTextReveal";
import { SunshineRays } from "./SunshineRays";

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smoothstep = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const smootherstep = (value: number) => { const t = clamp(value); return t * t * t * (t * (t * 6 - 15) + 10); };

// Particle burst for micro-interactions
function createParticleBurst(x: number, y: number, color: string = "#E8C85A", count: number = 12) {
  if (typeof window === "undefined") return;
  const particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; size: number }> = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 0.8 + Math.random() * 1.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      size: 2 + Math.random() * 4,
    });
  }
  
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;top:0;left:0;pointer-events:none;z-index:9999;";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; // gravity
      p.life -= 0.015;
      if (p.life > 0) {
        alive++;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    if (alive > 0) requestAnimationFrame(animate);
    else canvas.remove();
  };
  animate();
}

export type CinematicHomeCopy = { ariaLabel: string; established: string; title: string; intro: string };

export function CinematicHome({ lang, messages, copy }: { lang: Lang; messages: Messages; copy?: CinematicHomeCopy }) {
  const filmRef = useRef<HTMLElement>(null);
  const glyphCanvasRef = useRef<HTMLCanvasElement>(null);
  const loomCanvasRef = useRef<HTMLCanvasElement>(null);
  const logoCanvasRef = useRef<HTMLCanvasElement>(null);
  const sunshineCanvasRef = useRef<HTMLCanvasElement>(null);
  const [motionReduced, setMotionReduced] = useState(false);
  const [logoComplete, setLogoComplete] = useState(false);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const lastScrollYRef = useRef(0);
  const cursorRef = useRef({ x: 0.5, y: 0.5 });
  const sceneRefs = useRef<Array<HTMLElement>>([]);
  const lastBurstRef = useRef(0);

  // Scroll velocity tracking
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setScrollVelocity((currentY - lastScrollYRef.current) * 0.5);
          lastScrollYRef.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      const rawProgress = clamp(-bounds.top / available);
      /* Cinematic progress with opening hold — matches public/koa storytelling engine */
      const openingHold = 0.05;
      const progress = smoothstep(clamp((rawProgress - openingHold) / (1 - openingHold)));
      film.style.setProperty("--film-progress", progress.toFixed(5));

      /* Momentum indicator */
      const momentum = Math.abs(rawProgress - parseFloat(film.dataset.rawProgress || "0")) * 16;
      film.style.setProperty("--momentum", String(clamp(momentum, 0, 0.35)));
      film.dataset.rawProgress = String(rawProgress);

      /* Update cursor-driven pointer vars */
      film.style.setProperty("--pointer-x", cursorRef.current.x.toFixed(4));
      film.style.setProperty("--pointer-y", cursorRef.current.y.toFixed(4));
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    const handlePointerMove = (e: PointerEvent) => {
      const film = filmRef.current;
      if (!film) return;
      const rect = film.getBoundingClientRect();
      const relX = clamp((e.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
      const relY = clamp((e.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);
      cursorRef.current.x += (relX - cursorRef.current.x) * 0.06;
      cursorRef.current.y += (relY - cursorRef.current.y) * 0.06;
    };

    // Micro-interaction: particle burst on scene enter
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !motionReduced) {
          const now = Date.now();
          if (now - lastBurstRef.current > 800) {
            const rect = entry.target.getBoundingClientRect();
            createParticleBurst(rect.left + rect.width / 2, rect.top + rect.height * 0.3, "#D84A4D", 8);
            lastBurstRef.current = now;
          }
        }
      });
    }, { threshold: 0.15 });

    const filmEl = filmRef.current;
    if (filmEl) filmEl.addEventListener("pointermove", handlePointerMove);
    
    // Observe scenes for entrance effects
    setTimeout(() => {
      sceneRefs.current.forEach(el => observer.observe(el));
    }, 100);

    requestUpdate();

    return () => {
      media.removeEventListener("change", setPreferredMotion);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (filmEl) filmEl.removeEventListener("pointermove", handlePointerMove);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [motionReduced]);

  const goToChapter = (progress: number) => {
    const film = filmRef.current;
    if (!film) return;
    const available = Math.max(1, film.offsetHeight - window.innerHeight);
    window.scrollTo({ top: film.offsetTop + available * progress, behavior: motionReduced ? "auto" : "smooth" });
  };

  const ariaLabel = copy?.ariaLabel ?? messages.filmAriaLabel ?? "KOA opening scroll story";
    const established = copy?.established ?? messages.founded;
    const title = copy?.title ?? (lang === "karen" ? "ကညီပှၤတဝၢလၢ အမဲရကၤ" : "Many places. One community.");
    const intro = copy?.intro ?? (lang === "karen"
      ? "ဆဲးကျိးလိာ်သး၊ ဒီသဒၢကညီကျိာ်၊ ဒီးတီခိၣ်ရိၣ်မဲခါဆူညါဃုာ်ဒီးလိာ်သး။"
      : "A national home for Karen people to connect, protect language, and lead the future together.");

  return (
      <>
        {/* Loom Weave - Diamond pattern background */}
        <canvas
        ref={loomCanvasRef}
        className="loom-weave-canvas"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Sunshine Rays - Scroll-correlated */}
      <canvas
        ref={sunshineCanvasRef}
        className="sunshine-rays-canvas"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Karen Glyph Field - The Loom */}
      <canvas
        ref={glyphCanvasRef}
        className="karen-glyph-canvas"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* KOA Logo Intro - The Beacon */}
      {!logoComplete && (
        <div
          className="koa-logo-intro-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <canvas
            ref={logoCanvasRef}
            aria-hidden="true"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}

      {/* Main Cinematic Film */}
      <section
        ref={filmRef}
        className="cinematic-film"
        data-motion={motionReduced ? "reduced" : "full"}
        aria-label={ariaLabel}
        onPointerMove={(event) => {
          const target = event.currentTarget;
          const rect = target.getBoundingClientRect();
          const relX = clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
          const relY = clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);
          target.style.setProperty("--pointer-x", relX.toFixed(4));
          target.style.setProperty("--pointer-y", relY.toFixed(4));
        }}
      >
        <div className="cinematic-film__sticky">
          <div className="cinematic-film__vortex" aria-hidden="true"><i /><b /></div>
          <div className="cinematic-film__grain" aria-hidden="true" />

          {/* Scene 1: Seal / National home - Enhanced with ParallaxTextReveal */}
          <article ref={(el) => registerScene(el, 0)} className="cinematic-film__scene cinematic-film__scene--seal">
            <div className="cinematic-film__seal-wrap" aria-hidden="true">
              <div className="cinematic-film__seal-halo" />
              <img src="/koa/assets/koa-logo.png" alt="" width="1024" height="1024" fetchPriority="high" />
              <img src="/koa/assets/koa-logo.png" alt="" aria-hidden="true" className="cinematic-film__outer-light" width="1024" height="1024" />
            </div>
            <div className="cinematic-film__copy">
              <p className="cinematic-film__kicker">{established}</p>
              <h1>{title}</h1>
              <p>{intro}</p>
              <div className="cinematic-film__actions">
                <Link className="cinematic-film__button" href={`/${lang}/community`}>{messages.explore} {messages.community}</Link>
                <Link className="cinematic-film__button cinematic-film__button--ghost" href={`/${lang}/dictionary`}>{messages.searchDictionary}</Link>
              </div>
            </div>
          </article>

          {/* Hero Crowd with Flags - Front and Center Immersive */}
          <article ref={(el) => registerScene(el, 1)} className="cinematic-film__scene cinematic-film__scene--hero-crowd">
            <div className="hero-crowd-flags">
              <img 
                src="/koa/assets/fb-capitol-flags-mobile-enhanced.png" 
                alt="Karen community gathered with flags across the grass, a sea of red and blue banners"
                fetchPriority="high"
              />
            </div>
            <div className="cinematic-film__copy cinematic-film__copy--panel">
              <p className="cinematic-film__kicker">Many places. One community.</p>
              <h2>Wherever we stand, we stand together.</h2>
              <p>From the heartland to the coast, Karen voices rise as one.</p>
              <Link className="cinematic-film__text-link" href={`/${lang}/community`}>Join the gathering <span>→</span></Link>
            </div>
          </article>

          {/* Scene 2: Civic voice */}
          <article ref={(el) => registerScene(el, 2)} className="cinematic-film__scene cinematic-film__scene--voice">
            <div className="cinematic-film__image image-immersive"><img src="/koa/assets/fb-capitol-group-mobile-enhanced.png" alt="Karen advocates visiting the United States Capitol" fetchPriority="high" /></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel">
              <p className="cinematic-film__kicker">Chapter 02 · Civic voice</p>
              <h2>Knowledge becomes a voice in the room.</h2>
              <p>Community experience belongs in the places where decisions are made.</p>
              <Link className="cinematic-film__text-link" href={`/${lang}/services`}>Explore community programs <span>→</span></Link>
            </div>
          </article>

          {/* Scene 3: Living language */}
          <article ref={(el) => registerScene(el, 3)} className="cinematic-film__scene cinematic-film__scene--language">
            <div className="cinematic-film__image image-immersive"><img src="/koa/assets/story-community-original.png" alt="Community members sharing language and stories" /></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel">
              <p className="cinematic-film__kicker">Chapter 03 · Living language</p>
              <h2>Every word is a way home.</h2>
              <p>Share a definition, a recording, or a memory that helps Karen language travel forward.</p>
              <Link className="cinematic-film__text-link" href={`/${lang}/contribute`}>Contribute to the living dictionary <span>→</span></Link>
            </div>
          </article>

          {/* Scene 4: Cultural celebration */}
          <article ref={(el) => registerScene(el, 4)} className="cinematic-film__scene cinematic-film__scene--culture">
            <div className="cinematic-film__image image-immersive"><img src="/koa/assets/cultural-community.jpg" alt="Traditional Karen cultural celebration with music and dance" /></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel">
              <p className="cinematic-film__kicker">Chapter 04 · Cultural heartbeat</p>
              <h2>Tradition lives when we carry it forward.</h2>
              <p>Festivals, music, sport, and ceremony—the threads that bind generations.</p>
              <Link className="cinematic-film__text-link" href={`/${lang}/community`}>Celebrate with us <span>→</span></Link>
            </div>
          </article>

          {/* Scene 5: Humanitarian solidarity */}
          <article ref={(el) => registerScene(el, 5)} className="cinematic-film__scene cinematic-film__scene--humanitarian">
            <div className="cinematic-film__image image-immersive"><img src="/koa/assets/humanitarian-assistance.jpg" alt="Humanitarian aid reaching Karen communities in need" /></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel">
              <p className="cinematic-film__kicker">Chapter 05 · Solidarity in action</p>
              <h2>Practical care across borders.</h2>
              <p>Food, water, shelter, education—delivered by community, for community.</p>
              <Link className="cinematic-film__text-link" href={`/${lang}/collaborate`}>Support the work <span>→</span></Link>
            </div>
          </article>

          {/* Controls */}
          <div className="cinematic-film__controls">
            <p>Film · <strong>2400</strong> frames</p>
            <div className="cinematic-film__chapter-buttons" aria-label="Story chapters">
              {[0, 0.42, 0.78].map((chapter, index) => (
                <button
                  key={chapter}
                  type="button"
                  aria-label={`Go to chapter ${index + 1}`}
                  onClick={() => goToChapter(chapter)}
                >
                  {String(index + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
            <button
              className="cinematic-film__motion"
              type="button"
              aria-pressed={motionReduced}
              onClick={() => setMotionReduced((value) => !value)}
            >
              {motionReduced ? "Motion off" : "Motion on"}
            </button>
          </div>
          <p className="cinematic-film__scroll-cue">Scroll to enter <span>↓</span></p>
        </div>
      </section>

      {/* Parallax Text Reveal Section - Below the fold */}
      <section className="parallax-text-section" style={{ position: "relative", zIndex: 10 }}>
        <div className="container">
          <ParallaxTextReveal
            text={lang === "karen"
              ? "ကညီပှၤတဝၢလၢ အမဲရကၤ ကညီကျိာ်လံာ်ခီယ့ၣ် လၢဖိးစိတ် သးၣ်သံ ကိုထံဖျါ သးၣ်ပံးလိၣ်ခီၣ်ထံးလဲၤ ပှၤတဝၢအီၤ။ ဒီးတီခိၣ်ရိၣ်မဲ ခါဆူညါဃုာ်ဒီးလိာ်သး။"
              : "A national home for Karen communities to connect, protect language, and lead the future together. Every word carried forward strengthens the fabric of belonging."
            }
            lang={lang}
            speed={1.2}
            stagger={100}
            fontSize={1.4}
            lineHeight={1.6}
            color="#F8F3E8"
          />
        </div>
      </section>

      {/* Initialize canvas effects */}
      <KarenGlyphField
        canvasRef={glyphCanvasRef}
        isReducedMotion={motionReduced}
        formationTriggers={[]}
        chapterNumber={0}
        showChapterNumber={false}
        occlusionElements={[]}
      />
      <LoomWeave
        canvasRef={loomCanvasRef}
        isReducedMotion={motionReduced}
        opacity={0.035}
        color="#E8C85A"
      />
      <KOALogoIntro
        canvasRef={logoCanvasRef}
        onComplete={() => setLogoComplete(true)}
        isReducedMotion={motionReduced}
      />
      <SunshineRays
        canvasRef={sunshineCanvasRef}
        scrollVelocity={scrollVelocity}
        isReducedMotion={motionReduced}
        opacity={0.02}
        color="#E8C85A"
        rayCount={7}
      />
    </>
  );
}
