"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lang, Messages } from "./i18n";
import { AsciiDitherCanvas } from "./AsciiDitherCanvas";
import {
  LivingGlyphField,
  type CinematicPhase,
  type OcclusionRect,
} from "./cinematic/LivingGlyphField";
import { SealAssembly } from "./cinematic/SealAssembly";
import { PartnerMarquee } from "./cinematic/PartnerMarquee";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const clampSigned = (value: number) => Math.min(0.5, Math.max(-0.5, value));

// ============================================================================
// SCROLL NORMALIZATION - Ignores OS scroll speed settings
// ============================================================================
// The reference scene follows the native scroll position on the next frame;
// this short settle window keeps the React scene equally responsive without
// making a fast wheel gesture feel jagged.
const SCROLL_SMOOTHING_MS = 64;
const CHAPTER_BOUNDARIES = [0.35, 0.65, 0.92]; // More granular chapters
const TOTAL_FRAMES = 9600; // 2x frames for ultra-smooth cinematic (was 4800)

function smoothlyFollowProgress(current: number, target: number, deltaMs: number) {
  const easing = 1 - Math.exp(-Math.min(64, Math.max(1, deltaMs)) / SCROLL_SMOOTHING_MS);
  const next = current + (target - current) * easing;
  return Math.abs(target - next) < 0.00005 ? target : next;
}

function canPlayCinematicMotion() {
  const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (device.hardwareConcurrency ?? 4) >= 4 && (device.deviceMemory ?? 4) >= 4 && !device.connection?.saveData;
}

function shouldReduceMotionBeforeFirstPaint() {
  if (typeof window === "undefined") return false;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const previewRequestsMotionOff = new URLSearchParams(window.location.search).get("motion") === "off";
  return previewRequestsMotionOff || media.matches || !canPlayCinematicMotion();
}

function phaseForProgress(progress: number, reducedMotion: boolean): CinematicPhase {
  if (reducedMotion) return "motion-off";
  if (progress < 0.16) return "mark-formation";
  if (progress < 0.36) return "hero-copy";
  if (progress < CHAPTER_BOUNDARIES[0]) return "chapter-1";
  if (progress < CHAPTER_BOUNDARIES[1]) return "chapter-2";
  if (progress < CHAPTER_BOUNDARIES[2]) return "chapter-3";
  return "chapter-4";
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
// MAIN CINEMATIC HOME COMPONENT
// ============================================================================
export function CinematicHome({ lang, messages }: { lang: Lang; messages: Messages }) {
  const filmRef = useRef<HTMLElement>(null);
  const ditherCanvasRef = useRef<HTMLCanvasElement>(null);
  const [motionReduced, setMotionReduced] = useState(shouldReduceMotionBeforeFirstPaint);
  const [cinematicPhase, setCinematicPhase] = useState<CinematicPhase>("mark-formation");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [occlusionRects, setOcclusionRects] = useState<OcclusionRect[]>([]);
  const targetProgressRef = useRef(0);
  const visualProgressRef = useRef(0);

  // Reduced motion
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setPreferredMotion = () => setMotionReduced(shouldReduceMotionBeforeFirstPaint());
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

    const measure = () => {
      const bounds = film.getBoundingClientRect();
      const available = Math.max(1, bounds.height - window.innerHeight);
      return clamp(-bounds.top / available);
    };

    const queueTarget = () => {
      const value = measure();
      targetProgressRef.current = value;
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
      } else {
        // A short exponential follow keeps progress continuous in both
        // directions without the former delayed queue or hard chapter stops.
        visualProgressRef.current = smoothlyFollowProgress(visualProgressRef.current, targetProgressRef.current, delta);
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

      const stillMoving = Math.abs(targetProgressRef.current - progress) > 0.0001;
      if (stillMoving && !frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", queueTarget, { passive: true });
    window.addEventListener("resize", queueTarget);
    targetProgressRef.current = measure();
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
        .filter((element) => {
          const scene = element.closest<HTMLElement>(".cinematic-film__scene");
          const elementOpacity = Number.parseFloat(window.getComputedStyle(element).opacity);
          const sceneOpacity = scene ? Number.parseFloat(window.getComputedStyle(scene).opacity) : 1;
          return elementOpacity > 0.05 && sceneOpacity > 0.05;
        })
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
              <SealAssembly rotation={-360} />
            </div>
            <div className="cinematic-film__copy" data-glyph-occlusion>
              <p className="cinematic-film__kicker">{messages.founded}</p>
              <h1>{lang === "ksw" ? "ကညီပှၤတဝၢလၢ အမဲရကၤ" : "Many places. One community."}</h1>
              {lang === "en" ? <p className="cinematic-film__cycle" aria-label="Providing voices">
                <span aria-hidden="true"><b>Providing voices</b><b>Combining voices</b><b>Inviting voices</b></span>
              </p> : null}
              <p>{lang === "ksw" ? "ဆဲးကျိးလိာ်သး၊ ဒီသဒၢကညီကျိာ်၊ ဒီးတီခိၣ်ရိၣ်မဲခါဆူညါဃုာ်ဒီးလိာ်သး။" : "A national home for Karen people to connect, protect language, and lead the future together."}</p>
              <div className="cinematic-film__actions">
                <Link className="cinematic-film__button" href={`/${lang}/community`}>{messages.explore} {messages.community}</Link>
                <Link className="cinematic-film__button cinematic-film__button--ghost" href={`/${lang}/dictionary`}>{messages.searchDictionary}</Link>
              </div>
            </div>
          </article>

          {/* Scene 2: Civic voice - Chapter 02 */}
          <article className="cinematic-film__scene cinematic-film__scene--voice">
            <ChapterGlyphNumeral numeral="၁" id="chapter-one-glyph-pattern" />
            <div className="cinematic-film__image" data-glyph-occlusion><img src="/koa/assets/fb-capitol-group-mobile-enhanced.png" alt="" fetchPriority="high" /></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel" data-glyph-occlusion>
              <p className="cinematic-film__kicker">Chapter 01 · Civic voice</p>
              <h2>Knowledge becomes a voice in the room.</h2>
              <p>Community experience belongs in the places where decisions are made.</p>
              <Link className="cinematic-film__text-link" href={`/${lang}/services`}>Explore community programs <span>→</span></Link>
            </div>
          </article>

          {/* Scene 3: Living language - Chapter 03 */}
          <article className="cinematic-film__scene cinematic-film__scene--language">
            <ChapterGlyphNumeral numeral="၂" id="chapter-two-glyph-pattern" />
            <div className="cinematic-film__image" data-glyph-occlusion><img src="/koa/assets/story-community-original.png" alt="" /></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel" data-glyph-occlusion>
              <p className="cinematic-film__kicker">Chapter 02 · Living language</p>
              <h2>Every word is a way home.</h2>
              <p>Share a definition, a recording, or a memory that helps Karen language travel forward.</p>
              <Link className="cinematic-film__text-link" href={`/${lang}/contribute`}>Contribute to the living dictionary <span>→</span></Link>
            </div>
          </article>

          {/* Scene 4: Community - Chapter 04 */}
          <article className="cinematic-film__scene cinematic-film__scene--community">
            <ChapterGlyphNumeral numeral="၃" id="chapter-three-glyph-pattern" />
            <div className="cinematic-film__image" data-glyph-occlusion><img src="/koa/assets/fb-outdoor-gathering-mobile-enhanced.png" alt="" /></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel" data-glyph-occlusion>
              <p className="cinematic-film__kicker">Chapter 03 · Community</p>
              <h2>Culture, care, and courage—connected.</h2>
              <p>KOA&apos;s programs move between public voice, community belonging, and practical support.</p>
              <Link className="cinematic-film__text-link" href={`/${lang}/programs`}>Explore our programs <span>→</span></Link>
            </div>
          </article>

          {/* Controls */}
          <div className="cinematic-film__controls" data-glyph-occlusion>
            <button className="cinematic-film__motion" type="button" aria-pressed={motionReduced} onClick={() => setMotionReduced((value) => !value)}>
              <span aria-hidden="true" />{motionReduced ? "Motion off" : "Motion on"}
            </button>
          </div>
          <p className="cinematic-film__scroll-cue">Scroll to enter <span>↓</span></p>
        </div>
      </section>

      <PartnerMarquee motionReduced={motionReduced} />
    </>
  );
}

export default CinematicHome;
