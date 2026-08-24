"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Lang, Messages } from "./i18n";
import { KOALogoIntro } from "./KOALogoIntro";
import { AsciiDitherCanvas } from "./AsciiDitherCanvas";
import {
  LivingGlyphField,
  type CinematicPhase,
  type OcclusionRect,
} from "./cinematic/LivingGlyphField";
import { SealAssembly } from "./cinematic/SealAssembly";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const clampSigned = (value: number) => Math.min(0.5, Math.max(-0.5, value));

// ============================================================================
// SCROLL NORMALIZATION - Ignores OS scroll speed settings
// ============================================================================
const SCROLL_DELAY_MS = 3200; // Increased delay for slower, more cinematic feel
const MAX_PROGRESS_PER_SECOND = 0.035; // Slower max speed (was 0.045)
const CHAPTER_HOLD_MS = 2000; // Longer hold at chapter boundaries (was 1500)
const CHAPTER_BOUNDARIES = [0.35, 0.65, 0.92]; // More granular chapters
const TOTAL_FRAMES = 9600; // 2x frames for ultra-smooth cinematic (was 4800)

function advanceNormalizedProgress(current: number, target: number, deltaMs: number) {
  // Normalize: cap progress per frame regardless of OS scroll speed
  const maximumStep = MAX_PROGRESS_PER_SECOND * Math.min(64, Math.max(1, deltaMs)) / 1000;
  const distance = target - current;
  if (Math.abs(distance) <= maximumStep) return target;
  return current + Math.sign(distance) * maximumStep;
}

function phaseForProgress(progress: number, reducedMotion: boolean): CinematicPhase {
  if (reducedMotion) return "motion-off";
  if (progress < 0.018) return "arrival";
  if (progress < 0.065) return "seal-flight";
  if (progress < 0.12) return "glyph-o";
  if (progress < CHAPTER_BOUNDARIES[0]) return "chapter-1";
  if (progress < CHAPTER_BOUNDARIES[1]) return "chapter-2";
  if (progress < CHAPTER_BOUNDARIES[2]) return "chapter-3";
  return "chapter-4";
}

// Seeded random for consistent glyph patterns
function seeded(index: number, salt: number) {
  // Integer hashing is exactly reproducible in SSR and the browser. A sine
  // hash differs at floating-point tail precision across runtimes and causes
  // React to reject the otherwise-identical corona styles during hydration.
  let value = Math.imul(index + 1, 374761393) ^ Math.imul(salt + 1, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

// ============================================================================
// CHAPTER GLYPH NUMERAL - Converging Burmese numerals
// ============================================================================
function ChapterGlyphNumeral({ numeral, id }: { numeral: string; id: string }) {
  return (
    <svg className="cinematic-film__chapter-convergence" viewBox="0 0 420 520" aria-hidden="true">
      <defs>
        <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse">
          <text x="1" y="18" fontSize="16" fontFamily="Noto Sans Myanmar">ကညီ</text>
        </pattern>
      </defs>
      <text className="cinematic-film__chapter-numeral" x="210" y="390" textAnchor="middle" fill={`url(#${id})`}>{numeral}</text>
    </svg>
  );
}

// ============================================================================
// CORONA RAYS - Karen glyph rays spiraling from seal
// ============================================================================
const coronaRays = Array.from({ length: 84 }, (_, index) => ({
  char: "ကခဂဃငစဆဇညတထဒဓနပဖဗဘမယရလဝသဟအ"[index % 25],
  style: {
    "--ray-angle": `${index * 4.2857}deg`,
    "--ray-radius": `${21 + seeded(index, 31) * 19}vmin`,
    "--ray-alpha": `${0.012 + seeded(index, 32) * 0.035}`,
    "--ray-size": `${4 + seeded(index, 33) * 6}px`,
    "--ray-delay": `${-seeded(index, 34) * 38}s`,
  } as CSSProperties,
}));

// ============================================================================
// MAIN CINEMATIC HOME COMPONENT
// ============================================================================
export function CinematicHome({ lang, messages }: { lang: Lang; messages: Messages }) {
  const filmRef = useRef<HTMLElement>(null);
  const logoCanvasRef = useRef<HTMLCanvasElement>(null);
  const ditherCanvasRef = useRef<HTMLCanvasElement>(null);
  const [motionReduced, setMotionReduced] = useState(false);
  const [logoComplete, setLogoComplete] = useState(false);
  const [cinematicPhase, setCinematicPhase] = useState<CinematicPhase>("arrival");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [occlusionRects, setOcclusionRects] = useState<OcclusionRect[]>([]);
  const targetProgressRef = useRef(0);
  const visualProgressRef = useRef(0);
  const chapterHoldUntilRef = useRef(0);
  const heldBoundaryRef = useRef(-1);

  // Reduced motion
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const previewRequestsMotionOff = new URLSearchParams(window.location.search).get("motion") === "off";
    const setPreferredMotion = () => setMotionReduced(previewRequestsMotionOff || media.matches);
    setPreferredMotion();
    media.addEventListener("change", setPreferredMotion);
    return () => media.removeEventListener("change", setPreferredMotion);
  }, []);

  // ============================================================================
  // NORMALIZED SCROLL ENGINE - Ignores OS scroll speed settings
  // ============================================================================
  useEffect(() => {
    const film = filmRef.current;
    if (!film) return;
    let frame = 0;
    let lastFrame = performance.now();
    const queue: Array<{ at: number; value: number }> = [];

    const measure = () => {
      const bounds = film.getBoundingClientRect();
      const available = Math.max(1, bounds.height - window.innerHeight);
      return clamp(-bounds.top / available);
    };

    const queueTarget = () => {
      const value = measure();
      const previous = queue.at(-1);
      if (!previous || Math.abs(previous.value - value) > 0.0001) {
        queue.push({ at: performance.now(), value });
      }
      if (motionReduced) update(performance.now());
      else if (!frame) frame = window.requestAnimationFrame(update);
    };

    const update = (now: number) => {
      frame = 0;
      const delta = now - lastFrame;
      lastFrame = now;
      const direct = measure();

      if (motionReduced) {
        targetProgressRef.current = direct;
        visualProgressRef.current = direct;
        queue.length = 0;
      } else {
        // Delayed scroll processing - ignores OS scroll speed
        const cutoff = now - SCROLL_DELAY_MS;
        while (queue.length && queue[0].at <= cutoff) {
          targetProgressRef.current = queue.shift()!.value;
        }

        // Chapter hold logic
        if (now >= chapterHoldUntilRef.current) {
          let next = advanceNormalizedProgress(visualProgressRef.current, targetProgressRef.current, delta);
          
          // Detect chapter boundary crossing
          if (targetProgressRef.current > visualProgressRef.current) {
            const crossed = CHAPTER_BOUNDARIES.findIndex(
              (boundary) => visualProgressRef.current < boundary && next >= boundary,
            );
            if (crossed >= 0 && heldBoundaryRef.current !== crossed) {
              heldBoundaryRef.current = crossed;
              chapterHoldUntilRef.current = now + CHAPTER_HOLD_MS;
              // Pause just before boundary for cinematic hold
              next = CHAPTER_BOUNDARIES[crossed] - 0.0002;
            } else if (crossed < 0) {
              heldBoundaryRef.current = -1;
            }
          } else {
            heldBoundaryRef.current = -1;
          }
          visualProgressRef.current = next;
        }
      }

      const progress = visualProgressRef.current;
      film.style.setProperty("--film-progress", progress.toFixed(5));
      film.style.setProperty("--film-frame", String(Math.round(progress * TOTAL_FRAMES)));
      
      const nextChapter = progress < CHAPTER_BOUNDARIES[0]
        ? 1
        : progress < CHAPTER_BOUNDARIES[1]
          ? 2
          : progress < CHAPTER_BOUNDARIES[2]
            ? 3
            : 4;
      const nextPhase = phaseForProgress(progress, motionReduced);
      setCurrentChapter((chapter) => chapter === nextChapter ? chapter : nextChapter);
      setCinematicPhase((phase) => phase === nextPhase ? phase : nextPhase);

      const stillMoving = Math.abs(targetProgressRef.current - progress) > 0.0001 || 
                          queue.length > 0 || 
                          now < chapterHoldUntilRef.current;
      if (stillMoving && !frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", queueTarget, { passive: true });
    window.addEventListener("resize", queueTarget);
    queue.push({ at: performance.now() - SCROLL_DELAY_MS, value: measure() });
    if (motionReduced) update(performance.now());
    else frame = window.requestAnimationFrame(update);
    return () => {
      window.removeEventListener("scroll", queueTarget);
      window.removeEventListener("resize", queueTarget);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [motionReduced]);

  useEffect(() => {
    const film = filmRef.current;
    if (!film) return;
    const measureOcclusion = () => {
      const rectangles = Array.from(film.querySelectorAll<HTMLElement>("[data-glyph-occlusion]"))
        .map((element) => element.getBoundingClientRect())
        .filter((rectangle) => rectangle.width > 0 && rectangle.height > 0)
        .map((rectangle) => ({
          x: rectangle.left - 12,
          y: rectangle.top - 12,
          width: rectangle.width + 24,
          height: rectangle.height + 24,
        }));
      setOcclusionRects(rectangles);
    };
    measureOcclusion();
    window.addEventListener("resize", measureOcclusion);
    return () => window.removeEventListener("resize", measureOcclusion);
  }, [cinematicPhase, currentChapter, motionReduced]);

  const goToChapter = (progress: number) => {
    const film = filmRef.current;
    if (!film) return;
    const available = Math.max(1, film.offsetHeight - window.innerHeight);
    window.scrollTo({ top: film.offsetTop + available * progress, behavior: motionReduced ? "auto" : "smooth" });
  };

  return (
    <>
      {/* ASCII Dither Canvas - Deep background texture */}
      <AsciiDitherCanvas
        canvasRef={ditherCanvasRef}
        isReducedMotion={motionReduced}
        cursorReveal={true}
        revealRadius={300}
        density={0.4}
        lang={lang}
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
        data-cinematic-phase={cinematicPhase}
        data-cinematic-chapter={currentChapter}
        aria-label={messages.filmAriaLabel}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty("--pointer-x", clampSigned((event.clientX - rect.left) / rect.width - 0.5).toFixed(4));
          event.currentTarget.style.setProperty("--pointer-y", clampSigned((event.clientY - rect.top) / rect.height - 0.5).toFixed(4));
        }}
      >
        <div className="cinematic-film__sticky">
          <canvas ref={ditherCanvasRef} className="cinematic-film__glyph-field cinematic-film__glyph-field--dither" aria-hidden="true" />
          <LivingGlyphField
            phase={cinematicPhase}
            chapter={currentChapter}
            reducedMotion={motionReduced}
            occlusionRects={occlusionRects}
          />
          <div className="cinematic-film__vortex" aria-hidden="true"><i /><b /></div>
          <div className="cinematic-film__grain" aria-hidden="true" />

          {/* Scene 1: Seal / National home */}
          <article className="cinematic-film__scene cinematic-film__scene--seal">
            <div className="cinematic-film__seal-wrap" data-glyph-occlusion>
              <span className="cinematic-film__seal-name">Karen Organization of America</span>
              <div className="cinematic-film__seal-halo" aria-hidden="true" />
              <span className="cinematic-film__glyph-rays" aria-hidden="true">
                {coronaRays.map((ray, index) => <i key={index} style={ray.style}>{ray.char}</i>)}
              </span>
              <SealAssembly rotation={360} />
            </div>
            <div className="cinematic-film__copy" data-glyph-occlusion>
              <p className="cinematic-film__kicker">{messages.founded}</p>
              <h1>{lang === "ksw" ? "ကညီပှၤတဝၢလၢ အမဲရကၤ" : "Many places. One community."}</h1>
              <p>{lang === "ksw" ? "ဆဲးကျိးလိာ်သး၊ ဒီသဒၢကညီကျိာ်၊ ဒီးတီခိၣ်ရိၣ်မဲခါဆူညါဃုာ်ဒီးလိာ်သး။" : "A national home for Karen people to connect, protect language, and lead the future together."}</p>
              <div className="cinematic-film__actions">
                <Link className="cinematic-film__button" href={`/${lang}/community`}>{messages.explore} {messages.community}</Link>
                <Link className="cinematic-film__button cinematic-film__button--ghost" href={`/${lang}/dictionary`}>{messages.searchDictionary}</Link>
              </div>
            </div>
          </article>

          {/* Scene 2: Civic voice - Chapter 02 */}
          <article className="cinematic-film__scene cinematic-film__scene--voice">
            <ChapterGlyphNumeral numeral="၂" id="chapter-two-glyph-pattern" />
            <div className="cinematic-film__image" data-glyph-occlusion><img src="/koa/assets/fb-capitol-group-mobile-enhanced.png" alt="" fetchPriority="high" /></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel" data-glyph-occlusion>
              <p className="cinematic-film__kicker">Chapter 02 · Civic voice</p>
              <h2>Knowledge becomes a voice in the room.</h2>
              <p>Community experience belongs in the places where decisions are made.</p>
              <Link className="cinematic-film__text-link" href={`/${lang}/services`}>Explore community programs <span>→</span></Link>
            </div>
          </article>

          {/* Scene 3: Living language - Chapter 03 */}
          <article className="cinematic-film__scene cinematic-film__scene--language">
            <ChapterGlyphNumeral numeral="၃" id="chapter-three-glyph-pattern" />
            <div className="cinematic-film__image" data-glyph-occlusion><img src="/koa/assets/story-community-original.png" alt="" /></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel" data-glyph-occlusion>
              <p className="cinematic-film__kicker">Chapter 03 · Living language</p>
              <h2>Every word is a way home.</h2>
              <p>Share a definition, a recording, or a memory that helps Karen language travel forward.</p>
              <Link className="cinematic-film__text-link" href={`/${lang}/contribute`}>Contribute to the living dictionary <span>→</span></Link>
            </div>
          </article>

          {/* Scene 4: Community - Chapter 04 */}
          <article className="cinematic-film__scene cinematic-film__scene--community">
            <ChapterGlyphNumeral numeral="၄" id="chapter-four-glyph-pattern" />
            <div className="cinematic-film__image" data-glyph-occlusion><img src="/koa/assets/fb-outdoor-gathering-mobile-enhanced.png" alt="" /></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel" data-glyph-occlusion>
              <p className="cinematic-film__kicker">Chapter 04 · Community</p>
              <h2>Culture, care, and courage—connected.</h2>
              <p>KOA&apos;s programs move between public voice, community belonging, and practical support.</p>
              <Link className="cinematic-film__text-link" href={`/${lang}/programs`}>Explore our programs <span>→</span></Link>
            </div>
          </article>

          {/* Controls */}
          <div className="cinematic-film__controls" data-glyph-occlusion>
            <p>Film · <strong>{TOTAL_FRAMES}</strong> frames</p>
            <div className="cinematic-film__chapter-buttons" aria-label="Story chapters">
              {CHAPTER_BOUNDARIES.map((chapter, index) => (
                <button
                  key={chapter}
                  type="button"
                  aria-label={`Go to chapter ${index + 1}`}
                  onClick={() => goToChapter(chapter)}
                >
                  {String(index + 1).padStart(2, "0")}
                </button>
              ))}
              <button type="button" aria-label={`Go to chapter ${CHAPTER_BOUNDARIES.length + 1}`} onClick={() => goToChapter(1)}>
                {String(CHAPTER_BOUNDARIES.length + 1).padStart(2, "0")}
              </button>
            </div>
            <button className="cinematic-film__motion" type="button" aria-pressed={motionReduced} onClick={() => setMotionReduced((value) => !value)}>
              {motionReduced ? "Motion off" : "Motion on"}
            </button>
          </div>
          <p className="cinematic-film__scroll-cue">Scroll to enter <span>↓</span></p>
        </div>
      </section>

      {/* Initialize canvas effects */}
      <KOALogoIntro
        canvasRef={logoCanvasRef}
        onComplete={() => setLogoComplete(true)}
        isReducedMotion={motionReduced}
        lang={lang}
      />
    </>
  );
}

export default CinematicHome;
