"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Lang, Messages } from "./i18n";
import { KOALogoIntro } from "./KOALogoIntro";
import { KarenGlyphField } from "./KarenGlyphField";
import { AsciiDitherCanvas } from "./AsciiDitherCanvas";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const clampSigned = (value: number) => Math.min(0.5, Math.max(-0.5, value));

type FormationTrigger = {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  progress: number;
};

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

// Dither threshold for cursor reveal
function ditherThreshold(x: number, y: number) {
  const gx = Math.floor(x / 8);
  const gy = Math.floor(y / 8);
  return ((gx * 17 + gy * 31 + (gx ^ gy) * 7) % 97) / 97;
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
// LIVING GLYPH FIELD - Background fish-like Karen glyphs
// ============================================================================
type LivingGlyph = {
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetVx: number;
  targetVy: number;
  schoolSpeed: number;
  size: number;
  opacity: number;
  lifePhase: number;
  lifeMs: number;
  turnAt: number;
};

function LivingGlyphField({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const glyphSet = "ကခဂဃငစဆဇညတထဒဓနပဖဗဘမယရလဝသဟအ၁၂၃၄၅၆၇၈၉";
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastTime = performance.now();
    let pointerX = -9999;
    let pointerY = -9999;
    let pointerActive = false;
    let glyphs: LivingGlyph[] = [];

    const makeGlyph = (index: number): LivingGlyph => {
      const schoolSpeed = seeded(index, 2) < 0.25 ? 1.5 : 0.5;
      return {
        char: glyphSet[Math.floor(seeded(index, 1) * glyphSet.length)],
        x: seeded(index, 3) * width,
        y: seeded(index, 4) * height,
        vx: (seeded(index, 5) - 0.5) * 0.04 * schoolSpeed,
        vy: (seeded(index, 6) - 0.5) * 0.03 * schoolSpeed,
        targetVx: (seeded(index, 7) - 0.5) * 0.04 * schoolSpeed,
        targetVy: (seeded(index, 8) - 0.5) * 0.03 * schoolSpeed,
        schoolSpeed,
        size: 5 + seeded(index, 9) * 6,
        opacity: 0.008 + seeded(index, 10) * 0.02,
        lifePhase: seeded(index, 11),
        lifeMs: 12000 + seeded(index, 12) * 20000,
        turnAt: performance.now() + 3000 + seeded(index, 13) * 7000,
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const ratio = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width < 720 ? 60 : width < 1024 ? 100 : 150;
      glyphs = Array.from({ length: count }, (_, index) => makeGlyph(index));
    };

    const respawn = (glyph: LivingGlyph, index: number) => {
      const next = makeGlyph(index + Math.floor(performance.now() / 1000));
      Object.assign(glyph, next, { lifePhase: 0 });
    };

    const pointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      pointerActive = true;
    };
    const pointerLeave = () => { pointerActive = false; };

    const draw = (now: number) => {
      const delta = Math.min(48, Math.max(1, now - lastTime));
      lastTime = now;
      context.clearRect(0, 0, width, height);
      context.textAlign = "center";
      context.textBaseline = "middle";

      glyphs.forEach((glyph, index) => {
        glyph.lifePhase += delta / glyph.lifeMs;
        if (glyph.lifePhase >= 1) respawn(glyph, index);
        if (now >= glyph.turnAt) {
          const turnSeed = index + Math.floor(now / 2200);
          glyph.targetVx = (seeded(turnSeed, 21) - 0.5) * 0.04 * glyph.schoolSpeed;
          glyph.targetVy = (seeded(turnSeed, 22) - 0.5) * 0.03 * glyph.schoolSpeed;
          glyph.turnAt = now + 3200 + seeded(turnSeed, 23) * 6500;
        }
        glyph.vx += (glyph.targetVx - glyph.vx) * 0.01;
        glyph.vy += (glyph.targetVy - glyph.vy) * 0.01;
        glyph.x += glyph.vx * delta / 16;
        glyph.y += glyph.vy * delta / 16;
        if (glyph.x < -20) glyph.x = width + 20;
        if (glyph.x > width + 20) glyph.x = -20;
        if (glyph.y < -20) glyph.y = height + 20;
        if (glyph.y > height + 20) glyph.y = -20;

        const lifeEnvelope = Math.max(0, Math.min(1, glyph.lifePhase / 0.12, (1 - glyph.lifePhase) / 0.18));
        const distance = pointerActive ? Math.hypot(glyph.x - pointerX, glyph.y - pointerY) : Infinity;
        const cursorReveal = clamp(1 - distance / Math.min(250, Math.max(150, width * 0.18)));
        const revealed = cursorReveal > ditherThreshold(glyph.x, glyph.y) * 0.7 ? cursorReveal * cursorReveal * 0.1 : 0;
        context.globalAlpha = Math.max(glyph.opacity, revealed) * lifeEnvelope;
        context.font = `${glyph.size}px "Noto Sans Myanmar", sans-serif`;
        context.fillStyle = "#f8f3e8";
        context.fillText(glyph.char, glyph.x, glyph.y);
      });
      context.globalAlpha = 1;
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", pointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", pointerLeave);
    frame = window.requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", pointerMove);
      document.documentElement.removeEventListener("pointerleave", pointerLeave);
      window.cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="cinematic-film__glyph-field" aria-hidden="true" />;
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
  const glyphCanvasRef = useRef<HTMLCanvasElement>(null);
  const ditherCanvasRef = useRef<HTMLCanvasElement>(null);
  const [motionReduced, setMotionReduced] = useState(false);
  const [logoComplete, setLogoComplete] = useState(false);
  const targetProgressRef = useRef(0);
  const visualProgressRef = useRef(0);
  const chapterHoldUntilRef = useRef(0);
  const heldBoundaryRef = useRef(-1);
  const currentChapterRef = useRef(0);
  const [formationTriggers] = useState<FormationTrigger[]>(() => [
    { id: "seal", text: lang === "karen" ? "ကွၢ်ဃု" : "KOA", x: 0, y: 0, size: 48, progress: 0 },
    { id: "chapter1", text: "၁", x: 0, y: 0, size: 120, progress: 0 },
    { id: "chapter2", text: "၂", x: 0, y: 0, size: 120, progress: 0 },
    { id: "chapter3", text: "၃", x: 0, y: 0, size: 120, progress: 0 },
    { id: "chapter4", text: "၄", x: 0, y: 0, size: 120, progress: 0 },
  ]);

  // Reduced motion
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setPreferredMotion = () => setMotionReduced(media.matches);
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
      if (!frame) frame = window.requestAnimationFrame(update);
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
              currentChapterRef.current = crossed + 1;
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
      
      // Update current chapter for glyph field
      if (progress < CHAPTER_BOUNDARIES[0]) currentChapterRef.current = 1;
      else if (progress < CHAPTER_BOUNDARIES[1]) currentChapterRef.current = 2;
      else if (progress < CHAPTER_BOUNDARIES[2]) currentChapterRef.current = 3;
      else currentChapterRef.current = 4;

      // Keep formations in viewport coordinates because both particle canvases
      // are fixed inside the cinematic's isolated background layer.
      const formationX = window.innerWidth / 2;
      const formationY = window.innerHeight * 0.52;
      formationTriggers.forEach((trigger) => {
        trigger.x = formationX;
        trigger.y = formationY;
        if (trigger.id === "seal") {
          trigger.progress = progress < 0.065 ? clamp(progress / 0.045) : 0;
          return;
        }

        const chapterNumber = Number(trigger.id.replace("chapter", ""));
        const boundary = chapterNumber === 1 ? 0 : CHAPTER_BOUNDARIES[chapterNumber - 2];
        const approach = clamp((progress - (boundary - 0.012)) / 0.012);
        trigger.progress = progress <= boundary + 0.024 ? approach : 0;
      });

      const stillMoving = Math.abs(targetProgressRef.current - progress) > 0.0001 || 
                          queue.length > 0 || 
                          now < chapterHoldUntilRef.current;
      if (stillMoving && !frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", queueTarget, { passive: true });
    window.addEventListener("resize", queueTarget);
    queue.push({ at: performance.now() - SCROLL_DELAY_MS, value: measure() });
    frame = window.requestAnimationFrame(update);
    return () => {
      window.removeEventListener("scroll", queueTarget);
      window.removeEventListener("resize", queueTarget);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [motionReduced]);

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

      {/* Karen Glyph Field - Living background with fish-like behavior */}
      <KarenGlyphField
        canvasRef={glyphCanvasRef}
        isReducedMotion={motionReduced}
        formationTriggers={formationTriggers}
        showChapterNumber={false}
        occlusionElements={[]}
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
        aria-label={messages.filmAriaLabel}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty("--pointer-x", clampSigned((event.clientX - rect.left) / rect.width - 0.5).toFixed(4));
          event.currentTarget.style.setProperty("--pointer-y", clampSigned((event.clientY - rect.top) / rect.height - 0.5).toFixed(4));
        }}
      >
        <div className="cinematic-film__sticky">
          <canvas ref={ditherCanvasRef} className="cinematic-film__glyph-field cinematic-film__glyph-field--dither" aria-hidden="true" />
          <canvas ref={glyphCanvasRef} className="cinematic-film__glyph-field cinematic-film__glyph-field--living" aria-hidden="true" />
          <div className="cinematic-film__vortex" aria-hidden="true"><i /><b /></div>
          <div className="cinematic-film__grain" aria-hidden="true" />

          {/* Scene 1: Seal / National home */}
          <article className="cinematic-film__scene cinematic-film__scene--seal">
            <div className="cinematic-film__seal-wrap" aria-hidden="true">
              <div className="cinematic-film__seal-halo" />
              <span className="cinematic-film__glyph-rays">
                {coronaRays.map((ray, index) => <i key={index} style={ray.style}>{ray.char}</i>)}
              </span>
              <div className="cinematic-film__orbit">
                <svg viewBox="0 0 500 500">
                  <defs>
                    <path id="bilingual-orbit-top" d="M 58 250 A 192 192 0 0 1 442 250" />
                    <path id="bilingual-orbit-bottom" d="M 58 250 A 192 192 0 0 0 442 250" />
                  </defs>
                  <text>
                    <textPath href="#bilingual-orbit-top" startOffset="50%" textAnchor="middle">
                      KAREN ORGANIZATION OF AMERICA
                    </textPath>
                  </text>
                  <text className="cinematic-film__orbit-karen" lang="kar">
                    <textPath href="#bilingual-orbit-bottom" startOffset="50%" textAnchor="middle">
                      ကညီပှၤတဝၢလၢ အမဲရကၤ · တၢ်ဃူတၢ်ဖိး · တၢ်ဘၣ်ထွဲ
                    </textPath>
                  </text>
                </svg>
              </div>
              <img src="/koa/assets/koa-logo.png" alt="" width="1024" height="1024" fetchPriority="high" />
            </div>
            <div className="cinematic-film__copy">
              <p className="cinematic-film__kicker">{messages.founded}</p>
              <h1>{lang === "karen" ? "ကညီပှၤတဝၢလၢ အမဲရကၤ" : "Many places. One community."}</h1>
              <p>{lang === "karen" ? "ဆဲးကျိးလိာ်သး၊ ဒီသဒၢကညီကျိာ်၊ ဒီးတီခိၣ်ရိၣ်မဲခါဆူညါဃုာ်ဒီးလိာ်သး။" : "A national home for Karen people to connect, protect language, and lead the future together."}</p>
              <div className="cinematic-film__actions">
                <Link className="cinematic-film__button" href={`/${lang}/community`}>{messages.explore} {messages.community}</Link>
                <Link className="cinematic-film__button cinematic-film__button--ghost" href={`/${lang}/dictionary`}>{messages.searchDictionary}</Link>
              </div>
            </div>
          </article>

          {/* Scene 2: Civic voice - Chapter 02 */}
          <article className="cinematic-film__scene cinematic-film__scene--voice">
            <ChapterGlyphNumeral numeral="၂" id="chapter-two-glyph-pattern" />
            <div className="cinematic-film__image"><img src="/koa/assets/fb-capitol-group-mobile-enhanced.png" alt="" fetchPriority="high" /></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel">
              <p className="cinematic-film__kicker">Chapter 02 · Civic voice</p>
              <h2>Knowledge becomes a voice in the room.</h2>
              <p>Community experience belongs in the places where decisions are made.</p>
              <Link className="cinematic-film__text-link" href={`/${lang}/services`}>Explore community programs <span>→</span></Link>
            </div>
          </article>

          {/* Scene 3: Living language - Chapter 03 */}
          <article className="cinematic-film__scene cinematic-film__scene--language">
            <ChapterGlyphNumeral numeral="၃" id="chapter-three-glyph-pattern" />
            <div className="cinematic-film__image"><img src="/koa/assets/story-community-original.png" alt="" /></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel">
              <p className="cinematic-film__kicker">Chapter 03 · Living language</p>
              <h2>Every word is a way home.</h2>
              <p>Share a definition, a recording, or a memory that helps Karen language travel forward.</p>
              <Link className="cinematic-film__text-link" href={`/${lang}/contribute`}>Contribute to the living dictionary <span>→</span></Link>
            </div>
          </article>

          {/* Scene 4: Community - Chapter 04 */}
          <article className="cinematic-film__scene cinematic-film__scene--community">
            <ChapterGlyphNumeral numeral="၄" id="chapter-four-glyph-pattern" />
            <div className="cinematic-film__image"><img src="/koa/assets/fb-outdoor-gathering-mobile-enhanced.png" alt="" /></div>
            <div className="cinematic-film__copy cinematic-film__copy--panel">
              <p className="cinematic-film__kicker">Chapter 04 · Community</p>
              <h2>Culture, care, and courage—connected.</h2>
              <p>KOA&apos;s programs move between public voice, community belonging, and practical support.</p>
              <Link className="cinematic-film__text-link" href={`/${lang}/programs`}>Explore our programs <span>→</span></Link>
            </div>
          </article>

          {/* Controls */}
          <div className="cinematic-film__controls">
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
