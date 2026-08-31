"use client";

import { useEffect, useRef } from "react";
import {
  advanceParticle,
  boundedSparseAlpha,
  createParticle,
  retargetParticle,
  getNumeral1Positions,
} from "../../lib/cinema/glyph-motion.mjs";
import { getLetterPositions } from "../../lib/cinema/letter-shapes.mjs";
import { SGAW_GLYPH_STRING } from "../../lib/cinema/glyph-config";

export type CinematicPhase =
  | "arrival"
  | "seal-flight"
  | "glyph-o"
  | "koa-shrink"
  | "koa-form"
  | "koa-lock"
  | "koa-rise"
  | "text-reveal"
  | `chapter-${number}`
  | "motion-off";

export type OcclusionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type GlyphParticle = ReturnType<typeof createParticle>;

const GLYPHS = SGAW_GLYPH_STRING;

function seeded(index: number, salt: number) {
  let value = Math.imul(index + 1, 374761393) ^ Math.imul(salt + 1, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function ditherThreshold(x: number, y: number) {
  const gridX = Math.floor(x / 8);
  const gridY = Math.floor(y / 8);
  return ((gridX * 17 + gridY * 31 + (gridX ^ gridY) * 7) % 97) / 97;
}

function isOccluded(x: number, y: number, rectangles: OcclusionRect[]) {
  return rectangles.some((rectangle) =>
    x >= rectangle.x &&
    x <= rectangle.x + rectangle.width &&
    y >= rectangle.y &&
    y <= rectangle.y + rectangle.height,
  );
}

type CachedTargets = {
  k: Array<{ x: number; y: number }>;
  a: Array<{ x: number; y: number }>;
  numeral: Array<{ x: number; y: number }>;
};

const targetCache = new Map<string, CachedTargets>();

function easeInOut(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function isFormationPhase(phase: CinematicPhase) {
  return phase === "koa-form"
    || phase === "koa-lock"
    || phase === "koa-rise"
    || phase === "glyph-o"
    || phase.startsWith("chapter-");
}

function getCachedTargets(
  phase: CinematicPhase,
  chapter: number,
  width: number,
  height: number,
  progress: number,
) {
  // Include a coarse progress bucket so the K/A targets can rise together
  // without recalculating geometry on every animation frame.
  const key = `${phase}:${chapter}:${Math.round(progress * 100)}:${Math.round(width)}x${Math.round(height)}`;
  const existing = targetCache.get(key);
  if (existing) return existing;
  const rise = easeInOut((progress - 0.28) / 0.1);
  const heroY = height * (0.34 - rise * 0.105);
  const heroScale = 3.85 + rise * 0.45;
  const targets: CachedTargets = {
    k: getLetterPositions("K", width * 0.23, heroY, heroScale),
    a: getLetterPositions("A", width * 0.77, heroY, heroScale),
    numeral: getNumeral1Positions(width, height, 120),
  };
  if (targetCache.size > 12) targetCache.delete(targetCache.keys().next().value!);
  targetCache.set(key, targets);
  return targets;
}

function sceneTarget(
  particle: GlyphParticle,
  index: number,
  phase: CinematicPhase,
  chapter: number,
  width: number,
  height: number,
  progress: number,
) {
  const cached = getCachedTargets(phase, chapter, width, height, progress);
  // K/A letter formation during hero sequence — flanking the seal
  if (phase === "koa-form" || phase === "koa-lock" || phase === "koa-rise") {
    const kPositions = cached.k;
    const aPositions = cached.a;
    const totalK = kPositions.length;
    const totalA = aPositions.length;
    const total = totalK + totalA;
    const particleMod = index % total;
    const jitterX = (seeded(index, 211) - 0.5) * 5;
    const jitterY = (seeded(index, 223) - 0.5) * 5;

    if (particleMod < totalK) {
      const pos = kPositions[particleMod % kPositions.length];
      return { mode: "forming", target: { x: pos.x + jitterX, y: pos.y + jitterY } } as const;
    } else {
      const aIdx = (particleMod - totalK) % totalA;
      const pos = aPositions[aIdx];
      return { mode: "forming", target: { x: pos.x + jitterX, y: pos.y + jitterY } } as const;
    }
  }

  if (phase === "glyph-o") {
    const angle = (index % 96) / 96 * Math.PI * 2;
    const radiusX = Math.min(width, height) * 0.155;
    const radiusY = radiusX * 1.18;
    return {
      mode: "forming",
      target: {
        x: width / 2 + Math.cos(angle) * radiusX,
        y: height * 0.26 + Math.sin(angle) * radiusY,
      },
    } as const;
  }

  if (phase.startsWith("chapter-")) {
    // Chapter 1: form Burmese numeral "၁" with mini glyphs
    if (chapter === 1) {
      const numeralPoints = cached.numeral;
      const pt = numeralPoints[index % numeralPoints.length];
      const scatter = seeded(index, 77) * 18 - 9;
      return {
        mode: "forming",
        target: { x: pt.x + scatter, y: pt.y + scatter * 0.5 },
      } as const;
    }
    const angle = (index % 80) / 80 * Math.PI * 2;
    const chapterOffset = (chapter - 2.5) * Math.min(width * 0.025, 22);
    return {
      mode: "forming",
      target: {
        x: width / 2 + chapterOffset + Math.sin(angle * 2) * Math.min(width, height) * 0.09,
        y: height * 0.48 + Math.cos(angle) * Math.min(width, height) * 0.19,
      },
    } as const;
  }

  if (phase === "seal-flight") {
    return {
      mode: "dispersing",
      target: particle.path[(particle.pathCursor + 4) % particle.path.length],
    } as const;
  }

  return {
    mode: "ambient",
    target: particle.path[particle.pathCursor],
  } as const;
}

export function LivingGlyphField({
  phase,
  chapter,
  reducedMotion,
  occlusionRects,
  progressRef,
}: {
  phase: CinematicPhase;
  chapter: number;
  reducedMotion: boolean;
  occlusionRects: OcclusionRect[];
  progressRef: { current: number };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<GlyphParticle[]>([]);
  const occlusionRef = useRef<OcclusionRect[]>(occlusionRects);
  const phaseRef = useRef(phase);
  const chapterRef = useRef(chapter);
  const lastPhaseRef = useRef<CinematicPhase>(phase);
  const releaseUntilRef = useRef(0);
  const releaseSeedRef = useRef(0);
  phaseRef.current = phase;
  chapterRef.current = chapter;
  occlusionRef.current = occlusionRects;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    if (reducedMotion) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let width = 1;
    let height = 1;
    let frame = 0;
    let lastTime = performance.now();
    let pointerX = -10000;
    let pointerY = -10000;
    let pointerActive = false;
    let parallaxX = 0;
    let parallaxY = 0;
    let visible = true;
    const lowPower = window.matchMedia("(prefers-reduced-data: reduce)").matches
      || (navigator.hardwareConcurrency || 8) <= 4;
    const frameInterval = lowPower ? 1000 / 30 : 1000 / 60;
    let lastPaint = 0;

    const resize = () => {
      const rectangle = canvas.getBoundingClientRect();
      width = Math.max(1, rectangle.width);
      height = Math.max(1, rectangle.height);
      const pixelRatio = lowPower ? 1 : Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (particlesRef.current.length === 0) {
        const count = width < 720 ? 84 : width < 1024 ? 132 : 204;
        particlesRef.current = Array.from({ length: count }, (_, index) => {
          const pathSeed = 7000 + index * 37;
          const anchor = { x: seeded(index, 3) * width, y: seeded(index, 4) * height };
          return createParticle({
            id: `koa-glyph-${index}`,
            pathSeed,
            anchor,
            position: { x: anchor.x, y: anchor.y },
            char: GLYPHS[Math.floor(seeded(index, 1) * GLYPHS.length)],
            size: 6 + seeded(index, 9) * 8,
            baseOpacity: 0.015 + seeded(index, 10) * 0.035,
            lifePhase: seeded(index, 11),
            lifeDurationMs: 14000 + seeded(index, 12) * 22000,
            depth: 0.3 + seeded(index, 13) * 0.7,
          });
        });
        canvas.dataset.particleSignature = particlesRef.current
          .map((particle) => `${particle.id}:${particle.pathSeed}`)
          .join("|");
      }
    };

    const pointerMove = (event: PointerEvent) => {
      const rectangle = canvas.getBoundingClientRect();
      pointerX = event.clientX - rectangle.left;
      pointerY = event.clientY - rectangle.top;
      pointerActive = true;
      // Parallax offset based on cursor position relative to center
      parallaxX = (pointerX - width / 2) / width;
      parallaxY = (pointerY - height / 2) / height;
    };
    const pointerLeave = () => { pointerActive = false; };

    const draw = (now: number) => {
      if (!visible || document.hidden) {
        frame = 0;
        return;
      }
      if (now - lastPaint < frameInterval) {
        frame = window.requestAnimationFrame(draw);
        return;
      }
      lastPaint = now;
      const deltaMs = Math.min(48, Math.max(1, now - lastTime));
      lastTime = now;
      context.clearRect(0, 0, width, height);
      context.textAlign = "center";
      context.textBaseline = "middle";

      const activePhase = phaseRef.current;
      if (activePhase !== lastPhaseRef.current) {
        if (isFormationPhase(lastPhaseRef.current) && !isFormationPhase(activePhase)) {
          releaseUntilRef.current = now + 980;
          releaseSeedRef.current += 1;
        }
        lastPhaseRef.current = activePhase;
      }
      const releasing = now < releaseUntilRef.current;

      particlesRef.current.forEach((particle, index) => {
        const destination = releasing
          ? {
              mode: "dispersing" as const,
              target: particle.path[(particle.pathCursor + releaseSeedRef.current + index) % particle.path.length],
            }
          : sceneTarget(
              particle,
              index,
              activePhase,
              chapterRef.current,
              width,
              height,
              progressRef.current,
            );
        retargetParticle(particle, destination);
        advanceParticle(particle, { deltaMs, elapsedMs: now });

        const distance = pointerActive
          ? Math.hypot(particle.position.x - pointerX, particle.position.y - pointerY)
          : Infinity;
        const revealRadius = Math.min(260, Math.max(160, width * 0.2));
        const cursorReveal = Math.max(0, 1 - distance / revealRadius);
        const revealed = cursorReveal > ditherThreshold(particle.position.x, particle.position.y) * 0.72
          ? cursorReveal
          : 0;
        const occluded = isOccluded(particle.position.x, particle.position.y, occlusionRef.current);
        const alpha = boundedSparseAlpha({
          baseOpacity: particle.opacity,
          lifePhase: particle.lifePhase,
          reveal: revealed,
          mode: particle.mode,
          occluded,
        });
        if (alpha < 0.002) return;

        // Depth-based cursor parallax — deeper layers move less (3D effect)
        const depth = particle.depth || 0.5;
        const parallaxIntensity = depth * 25;
        const px = particle.position.x + parallaxX * parallaxIntensity;
        const py = particle.position.y + parallaxY * parallaxIntensity;

        context.globalAlpha = alpha;
        context.font = `${particle.size}px "Noto Sans Myanmar", sans-serif`;
        context.fillStyle = particle.mode === "forming" || particle.mode === "breathing"
          ? "#f8f3e8"
          : "#d4c8b8";
        context.fillText(particle.char, px, py);
      });

      context.globalAlpha = 1;
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    canvas.dataset.motionState = "running";
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = window.requestAnimationFrame(draw);
    }, { threshold: 0 });
    visibilityObserver.observe(canvas);
    const onVisibilityChange = () => {
      if (!document.hidden && visible && !frame) frame = window.requestAnimationFrame(draw);
    };
    window.addEventListener("resize", resize);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener("pointermove", pointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", pointerLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    frame = window.requestAnimationFrame(draw);
    return () => {
      canvas.dataset.motionState = "stopped";
      window.removeEventListener("resize", resize);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", pointerMove);
      document.documentElement.removeEventListener("pointerleave", pointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      visibilityObserver.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="cinematic-film__glyph-field cinematic-film__glyph-field--living"
      data-cinematic-particles="persistent"
      hidden={reducedMotion}
      aria-hidden="true"
    />
  );
}

export default LivingGlyphField;
