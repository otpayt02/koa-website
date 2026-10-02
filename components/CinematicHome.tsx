"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lang, Messages } from "./i18n";
import homeCopyCatalog from "../content/koa-home-copy.json";
import { AsciiDitherCanvas } from "./AsciiDitherCanvas";
import type { CinematicPhase, OcclusionRect } from "./cinematic/LivingGlyphField";
import { CursorGlyphHalo } from "./cinematic/CursorGlyphHalo";
import { PartnerMarquee } from "./cinematic/PartnerMarquee";
import { SealAssembly } from "./cinematic/SealAssembly";
import { ScrollReveal } from "./ui/ScrollReveal";
import { MagneticButton } from "./ui/MagneticButton";
import { ScrollScrubIntro } from "./cinematic/ScrollScrubIntro";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const clampSigned = (value: number) => Math.min(0.5, Math.max(-0.5, value));

// ============================================================================
// SCROLL NORMALIZATION - Ignores OS scroll speed settings
// ============================================================================
// Keep the cinematic easing without making input feel buffered.
// A short V4-style replay buffer lets each new scene load into a readable
// corridor, while the higher visual rate keeps the React version responsive
// on trackpads and slower devices.
const SCROLL_DELAY_MS = 120;
const MAX_PROGRESS_PER_SECOND = 0.34;
const CHAPTER_HOLD_MS = 480;
const CHAPTER_BOUNDARIES = [0.35, 0.65, 0.92]; // More granular chapters
const TOTAL_FRAMES = 9600; // 2x frames for ultra-smooth cinematic (was 4800)
const SCENE_RANGES = [
  { start: 0.04, end: 0.36 },
  { start: 0.32, end: 0.68 },
  { start: 0.64, end: 0.98 },
] as const;
const STORY_CHAPTERS = [
  { label: "Arrival", progress: 0.02 },
  { label: "Voice", progress: 0.35 },
  { label: "Language", progress: 0.65 },
  { label: "Belonging", progress: 0.93 },
] as const;
const BURMESE_DIGITS = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];

function toBurmese(value: number) {
  return String(value).split("").map((digit) => BURMESE_DIGITS[Number(digit)] ?? digit).join("");
}

function easeInOutSine(value: number) {
  const t = clamp(value);
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function easeOutCubic(value: number) {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
}

function advanceNormalizedProgress(current: number, target: number, deltaMs: number) {
  // Normalize: cap progress per frame regardless of OS scroll speed
  const maximumStep = MAX_PROGRESS_PER_SECOND * Math.min(64, Math.max(1, deltaMs)) / 1000;
  const distance = target - current;
  if (Math.abs(distance) <= maximumStep) return target;
  return current + Math.sign(distance) * maximumStep;
}

function phaseForProgress(progress: number, reducedMotion: boolean): CinematicPhase {
  if (reducedMotion) return "motion-off";
  // The pinned intro owns the only K–seal–A animation. The film begins with
  // chapter one's ambient numeral field instead of replaying another logo.
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

// Retained only as a migration reference for older visual-audit tooling. The
// legacy seal scene is never mounted; ScrollScrubIntro is the sole live hero.
const haloRays: Array<{ x2: number; y2: number; width: number; color: string }> = [];

// ============================================================================
// MAIN CINEMATIC HOME COMPONENT
// ============================================================================
export function CinematicHome({ lang, messages }: { lang: Lang; messages: Messages }) {
  const homeCopy = lang === "ksw" ? homeCopyCatalog.ksw : homeCopyCatalog.en;
  const filmRef = useRef<HTMLElement>(null);
  const ditherCanvasRef = useRef<HTMLCanvasElement>(null);
  const [motionReduced, setMotionReduced] = useState(false);
  const [cinematicPhase, setCinematicPhase] = useState<CinematicPhase>("chapter-1");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapterTransition, setChapterTransition] = useState<"hidden" | "burmese" | "arabic">("hidden");
  const [occlusionRects, setOcclusionRects] = useState<OcclusionRect[]>([]);
  const targetProgressRef = useRef(0);
  const visualProgressRef = useRef(0);
  const chapterHoldUntilRef = useRef(0);
  const heldBoundaryRef = useRef(-1);
  const firstChapterRef = useRef(true);
  const lastChapterRef = useRef(1);
  const lastPhaseRef = useRef<CinematicPhase>("chapter-1");

  // Reduced motion
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const previewRequestsMotionOff = new URLSearchParams(window.location.search).get("motion") === "off";
    const setPreferredMotion = () => setMotionReduced(previewRequestsMotionOff || media.matches);
    setPreferredMotion();
    media.addEventListener("change", setPreferredMotion);
    return () => media.removeEventListener("change", setPreferredMotion);
  }, []);

  // V4-style chapter card: Burmese is the readable state, with a short
  // Arabic confirmation flash so visitors can orient without turning the
  // transition into a strobe.
  useEffect(() => {
    if (firstChapterRef.current) {
      firstChapterRef.current = false;
      return;
    }
    if (motionReduced) {
      setChapterTransition("hidden");
      return;
    }
    setChapterTransition("burmese");
    const flashTimer = window.setTimeout(() => setChapterTransition("arabic"), 320);
    const settleTimer = window.setTimeout(() => setChapterTransition("hidden"), 780);
    return () => {
      window.clearTimeout(flashTimer);
      window.clearTimeout(settleTimer);
    };
  }, [currentChapter, motionReduced]);

  // ============================================================================
  // NORMALIZED SCROLL ENGINE - Ignores OS scroll speed settings
  // ============================================================================
  useEffect(() => {
    const film = filmRef.current;
    if (!film) return;
    let frame = 0;
    let lastFrame = performance.now();
    const queue: Array<{ at: number; value: number }> = [];
    let parallaxEls: HTMLElement[] | null = null;
    let parallaxBounds = new Map<HTMLElement, DOMRect>();
    let lastParallaxMeasure = 0;
    let sceneEls: HTMLElement[] | null = null;
    let visible = true;

    // Pause rAF loop when film is off-screen
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !frame) frame = window.requestAnimationFrame(update);
      },
      { threshold: 0 }
    );
    io.observe(film);

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
      if (!visible) return;
      const delta = now - lastFrame;
      lastFrame = now;
      // Normalized progress is already queued from scroll events; avoid a
      // forced layout read on every animation frame. Reduced-motion keeps the
      // direct read so keyboard/page jumps settle immediately.
      const direct = motionReduced ? measure() : 0;

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
      film.style.setProperty("--story-progress", progress.toFixed(5));

      // V4-style reading corridor transport: each chapter owns a narrow local
      // window, enters blurred, holds in the readable centre, and clears before
      // the next chapter takes over. Only transforms/opacity are touched here,
      // so the browser can keep the scene paint on the compositor.
      if (!sceneEls) {
        sceneEls = Array.from(film.querySelectorAll<HTMLElement>(".cinematic-film__scene:not(.cinematic-film__scene--seal)"));
      }
      sceneEls.forEach((scene, index) => {
        const range = SCENE_RANGES[index] ?? SCENE_RANGES[SCENE_RANGES.length - 1];
        const local = clamp((progress - range.start) / (range.end - range.start));
        const enter = easeInOutSine((local - 0.02) / 0.22);
        const exit = 1 - easeInOutSine((local - 0.78) / 0.22);
        const opacity = Math.min(enter, exit);
        const corridor = easeInOutSine((local - 0.16) / 0.68);
        const copyOpacity = Math.min(
          easeOutCubic((local - 0.03) / 0.18),
          1 - easeInOutSine((local - 0.77) / 0.23),
        );
        scene.style.setProperty("--scene-progress", local.toFixed(4));
        scene.style.setProperty("--scene-opacity", opacity.toFixed(4));
        scene.style.setProperty("--scene-blur", `${((1 - opacity) * 8).toFixed(2)}px`);
        scene.style.setProperty("--scene-y", `${(6 - corridor * 12).toFixed(2)}vh`);
        scene.style.setProperty("--scene-copy-opacity", copyOpacity.toFixed(4));
        scene.style.setProperty("--scene-copy-blur", `${((1 - copyOpacity) * 10).toFixed(2)}px`);
        scene.style.setProperty("--scene-copy-y", `${(18 - corridor * 18).toFixed(1)}px`);
        scene.dataset.sceneActive = opacity > 0.006 ? "true" : "false";
      });

      // The pinned intro owns the only seal/K/A choreography. The film keeps
      // its own transport focused on chapter copy, imagery, and numerals.
      film.style.setProperty("--hero-copy-opacity", "0");
      film.style.setProperty("--ray-intensity", "0.04");
      film.dataset.heroPhase = "done";

      // Parallax: use cached element list to avoid per-frame querySelectorAll
      if (!parallaxEls) {
        parallaxEls = Array.from(film.querySelectorAll<HTMLElement>("[data-parallax-speed]"));
      }
      if (now - lastParallaxMeasure > 90) {
        parallaxBounds = new Map(parallaxEls.map((el) => [el, el.getBoundingClientRect()]));
        lastParallaxMeasure = now;
      }
      for (const el of parallaxEls) {
        const speed = parseFloat(el.dataset.parallaxSpeed || "0");
        const rect = parallaxBounds.get(el);
        if (!rect) continue;
        const offset = (rect.top - window.innerHeight * 0.5) * speed;
        el.style.setProperty("--parallax-y", `${offset.toFixed(1)}px`);
      }
      
      const nextChapter = progress < CHAPTER_BOUNDARIES[0]
        ? 1
        : progress < CHAPTER_BOUNDARIES[1]
          ? 2
          : progress < CHAPTER_BOUNDARIES[2]
            ? 3
            : 4;
      const nextPhase = phaseForProgress(progress, motionReduced);
      if (nextChapter !== lastChapterRef.current) {
        lastChapterRef.current = nextChapter;
        setCurrentChapter(nextChapter);
      }
      if (nextPhase !== lastPhaseRef.current) {
        lastPhaseRef.current = nextPhase;
        setCinematicPhase(nextPhase);
      }

      const stillMoving = Math.abs(targetProgressRef.current - progress) > 0.0001 || 
                          queue.length > 0 || 
                          now < chapterHoldUntilRef.current;
      if (stillMoving && visible && !frame) frame = window.requestAnimationFrame(update);
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
      io.disconnect();
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
      <ScrollScrubIntro reducedMotion={motionReduced} lang={lang} copy={homeCopy.intro} />

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
          <nav className="cinematic-film__timeline" data-glyph-occlusion aria-label="Film timeline">
            <div className="cinematic-film__timeline-heading">
              <span className="cinematic-film__timeline-kicker">KOA / STORY</span>
              <span className="cinematic-film__timeline-current">
                {toBurmese(currentChapter)} <span aria-hidden="true">·</span> {STORY_CHAPTERS[currentChapter - 1]?.label ?? "Arrival"}
              </span>
            </div>
            <div className="cinematic-film__timeline-track" aria-hidden="true">
              <span className="cinematic-film__timeline-progress" />
            </div>
            <div className="cinematic-film__timeline-markers" role="list">
              {STORY_CHAPTERS.map((chapter, index) => (
                <button
                  key={chapter.label}
                  type="button"
                  role="listitem"
                  className="cinematic-film__timeline-marker"
                  data-active={currentChapter === index + 1 ? "true" : "false"}
                  aria-current={currentChapter === index + 1 ? "step" : undefined}
                  aria-label={`Go to ${chapter.label} chapter`}
                  onClick={() => goToChapter(chapter.progress)}
                >
                  <span className="cinematic-film__timeline-number" aria-hidden="true">{toBurmese(index + 1)}</span>
                  <span className="cinematic-film__timeline-label">{chapter.label}</span>
                </button>
              ))}
            </div>
          </nav>
          <aside className="cinematic-film__story-rail" data-glyph-occlusion aria-label="Story sequence">
            <span className="cinematic-film__story-rail-title">Sequence</span>
            <ol>
              {STORY_CHAPTERS.map((chapter, index) => (
                <li key={chapter.label} data-active={currentChapter === index + 1 ? "true" : "false"}>
                  <button type="button" onClick={() => goToChapter(chapter.progress)} aria-label={`Jump to ${chapter.label}`}>
                    <span className="cinematic-film__story-rail-dot" aria-hidden="true" />
                    <span className="cinematic-film__story-rail-label"><b>{toBurmese(index + 1)}</b>{chapter.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
          <canvas ref={ditherCanvasRef} className="cinematic-film__glyph-field cinematic-film__glyph-field--dither" aria-hidden="true" />
          <CursorGlyphHalo reducedMotion={motionReduced} />
          <div className="cinematic-film__fish-layer" aria-hidden="true">
            <span className="cinematic-film__fish cinematic-film__fish--one" />
            <span className="cinematic-film__fish cinematic-film__fish--two" />
            <span className="cinematic-film__fish cinematic-film__fish--three" />
            <span className="cinematic-film__fish cinematic-film__fish--four" />
          </div>
          <div className="cinematic-film__vortex" aria-hidden="true"><i /><b /></div>
          <div className="cinematic-film__grain" aria-hidden="true" />
          {chapterTransition !== "hidden" && (
            <div className="cinematic-film__chapter-transition" aria-hidden="true">
              <span className={chapterTransition === "arabic" ? "is-arabic" : undefined}>
                {chapterTransition === "arabic" ? currentChapter : toBurmese(currentChapter)}
              </span>
            </div>
          )}

          {false ? (
          /* Legacy duplicate hero retained only for audit history; never mounted. */
          <>
          {/* Scene 1: Seal / National home */}
          <article className="cinematic-film__scene cinematic-film__scene--seal cinematic-film__scene--full cinematic-film__scene--hero">
            <div className="cinematic-film__hero-group">
              <div className="cinematic-film__seal-wrap" data-glyph-occlusion aria-hidden="true">
                <span className="cinematic-film__seal-name">Karen Organization of America</span>
                {/* Revolving text orbit — replaces the annulus ring text from the seal image */}
                <svg className="cinematic-film__seal-orbit-text" viewBox="0 0 200 200" aria-hidden="true">
                  <defs>
                    <path id="cinematic-seal-orbit-upper" d="M24 104 A76 76 0 0 1 176 104" />
                    <path id="cinematic-seal-orbit-lower" d="M24 104 A76 76 0 0 0 176 104" />
                  </defs>
                  <circle className="cinematic-film__seal-orbit-guide" cx="100" cy="100" r="82" />
                  <g className="cinematic-film__seal-orbit-labels">
                    <text className="cinematic-film__seal-orbit-text-label">
                      <textPath href="#cinematic-seal-orbit-upper" startOffset="50%" textAnchor="middle">
                        KAREN ORGANIZATION OF AMERICA {' \u00B7 '} 2018
                      </textPath>
                    </text>
                    <text className="cinematic-film__seal-orbit-text-label cinematic-film__seal-orbit-text-label--karen" lang="ksw">
                      <textPath href="#cinematic-seal-orbit-lower" startOffset="50%" textAnchor="middle">
                        ကညီပှၤတဝၢလၢ အမဲရကၤ {' \u00B7 '} တၢ်ဃူတၢ်ဖိး
                      </textPath>
                    </text>
                  </g>
                </svg>
                <div className="cinematic-film__seal-halo" aria-hidden="true" />
                <div className="cinematic-film__seal-glow" aria-hidden="true" />
                <svg className="cinematic-film__seal-rays cinematic-film__glyph-rays" viewBox="0 0 100 100" aria-hidden="true" style={{ filter: 'blur(1px)' }}>
                  {haloRays.map((ray, i) => (
                    <line
                      key={i}
                      x1="50" y1="50"
                      x2={ray.x2}
                      y2={ray.y2}
                      stroke={ray.color}
                      strokeWidth={ray.width}
                      strokeLinecap="round"
                    />
                  ))}
                </svg>
                <SealAssembly rotation={360} />
              </div>
              <div className="cinematic-film__copy cinematic-film__hero-text" data-glyph-occlusion>
                <p className="cinematic-film__kicker">{messages.founded}</p>
                <h1>{lang === "ksw" ? "ကညီပှၤတဝၢလၢ အမဲရကၤ" : "Many places. One community."}</h1>
                <p>{lang === "ksw" ? "ဆဲးကျိးလိာ်သး၊ ဒီသဒၢကညီကျိာ်၊ ဒီးတီခိၣ်ရိၣ်မဲခါဆူညါဃုာ်ဒီးလိာ်သး။" : "A national home for Karen people to connect, protect language, and lead the future together."}</p>
                <div className="cinematic-film__actions">
                  <MagneticButton className="cinematic-film__button-wrap">
                    <Link className="cinematic-film__button" href={`/${lang}/community`}>{messages.explore} {messages.community}</Link>
                  </MagneticButton>
                  <MagneticButton className="cinematic-film__button-wrap">
                    <Link className="cinematic-film__button cinematic-film__button--ghost" href={`/${lang}/dictionary`}>{messages.searchDictionary}</Link>
                  </MagneticButton>
                </div>
              </div>
            </div>
          </article>
          </>
          ) : null}

          {/* Scene 1: Civic voice - Chapter 02. The pinned intro above owns the only logo animation. */}
          <article className="cinematic-film__scene cinematic-film__scene--voice cinematic-film__scene--split cinematic-film__scene--split-right">
            <ChapterGlyphNumeral numeral={homeCopy.chapters[0].number} id="chapter-two-glyph-pattern" />
            <div className="cinematic-film__image" data-parallax-speed="0.15"><div data-glyph-occlusion><img src="/koa/assets/fb-capitol-group-mobile-enhanced.png" alt={homeCopy.chapters[0].imageAlt} loading="lazy" decoding="async" /></div></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel" data-glyph-occlusion>
              <ScrollReveal className="cinematic-film__kicker">{homeCopy.chapters[0].kicker}</ScrollReveal>
              <ScrollReveal><h2>{homeCopy.chapters[0].title}</h2></ScrollReveal>
              <ScrollReveal><p>{homeCopy.chapters[0].body}</p></ScrollReveal>
              <ScrollReveal delay={0.08}><Link className="cinematic-film__text-link" href={homeCopy.chapters[0].href.replace("{lang}", lang)}>{homeCopy.chapters[0].linkLabel} <span>→</span></Link></ScrollReveal>
            </div>
          </article>

          {/* Scene 3: Living language - Chapter 03 */}
          <article className="cinematic-film__scene cinematic-film__scene--language cinematic-film__scene--full cinematic-film__scene--widget">
            <ChapterGlyphNumeral numeral={homeCopy.chapters[1].number} id="chapter-three-glyph-pattern" />
            <div className="cinematic-film__image" data-parallax-speed="0.1"><div data-glyph-occlusion><img src="/koa/assets/story-community-original.png" alt={homeCopy.chapters[1].imageAlt} loading="lazy" decoding="async" /></div></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel" data-glyph-occlusion>
              <ScrollReveal className="cinematic-film__kicker">{homeCopy.chapters[1].kicker}</ScrollReveal>
              <ScrollReveal><h2>{homeCopy.chapters[1].title}</h2></ScrollReveal>
              <ScrollReveal><p>{homeCopy.chapters[1].body}</p></ScrollReveal>
              <ScrollReveal delay={0.08}><Link className="cinematic-film__text-link" href={homeCopy.chapters[1].href.replace("{lang}", lang)}>{homeCopy.chapters[1].linkLabel} <span>→</span></Link></ScrollReveal>
            </div>
          </article>

          {/* Scene 4: Community - Chapter 04 */}
          <article className="cinematic-film__scene cinematic-film__scene--community cinematic-film__scene--split cinematic-film__scene--split-left">
            <ChapterGlyphNumeral numeral={homeCopy.chapters[2].number} id="chapter-four-glyph-pattern" />
            <div className="cinematic-film__image" data-parallax-speed="0.12"><div data-glyph-occlusion><img src="/koa/assets/fb-outdoor-gathering-mobile-enhanced.png" alt={homeCopy.chapters[2].imageAlt} loading="lazy" decoding="async" /></div></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel" data-glyph-occlusion>
              <ScrollReveal className="cinematic-film__kicker">{homeCopy.chapters[2].kicker}</ScrollReveal>
              <ScrollReveal><h2>{homeCopy.chapters[2].title}</h2></ScrollReveal>
              <ScrollReveal><p>{homeCopy.chapters[2].body}</p></ScrollReveal>
              <ScrollReveal delay={0.08}><Link className="cinematic-film__text-link" href={homeCopy.chapters[2].href.replace("{lang}", lang)}>{homeCopy.chapters[2].linkLabel} <span>→</span></Link></ScrollReveal>
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

      <PartnerMarquee motionReduced={motionReduced} />

    </>
  );
}

export default CinematicHome;
