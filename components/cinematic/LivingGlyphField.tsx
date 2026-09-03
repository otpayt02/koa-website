"use client";

import { useEffect, useRef } from "react";
import {
  advanceParticle,
  boundedSparseAlpha,
  createParticle,
  retargetParticle,
} from "../../lib/cinema/glyph-motion.mjs";

export type CinematicPhase =
  | "mark-formation"
  | "hero-copy"
  | `chapter-${number}`
  | "motion-off";

export type OcclusionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type GlyphParticle = ReturnType<typeof createParticle>;

const GLYPHS = "ကခဂဃငစဆဇညတထဒဓနပဖဗဘမယရလဝသဟအ၁၂၃၄၅၆၇၈၉";
type Point = { x: number; y: number };

// Solid silhouettes keep the letters filled during forward and reverse scatter.
const K_SILHOUETTE: Point[] = [
  { x: -0.72, y: -1 }, { x: -0.34, y: -1 }, { x: -0.34, y: -0.34 },
  { x: 0.5, y: -1 }, { x: 0.78, y: -1 }, { x: 0.08, y: 0 },
  { x: 0.78, y: 1 }, { x: 0.5, y: 1 }, { x: -0.34, y: 0.34 },
  { x: -0.34, y: 1 }, { x: -0.72, y: 1 },
];
const A_SILHOUETTE: Point[] = [
  { x: -0.76, y: 1 }, { x: 0, y: -1 }, { x: 0.76, y: 1 },
];
const A_COUNTER: Point[] = [
  { x: -0.25, y: 0.34 }, { x: 0, y: -0.35 }, { x: 0.25, y: 0.34 },
];

function seeded(index: number, salt: number) {
  let value = Math.imul(index + 1, 374761393) ^ Math.imul(salt + 1, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function isInsidePolygon(point: Point, polygon: Point[]) {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
    const a = polygon[current];
    const b = polygon[previous];
    const crosses = (a.y > point.y) !== (b.y > point.y);
    const edgeX = ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses && point.x < edgeX) inside = !inside;
  }
  return inside;
}

function filledLetterPoint(index: number, isK: boolean): Point {
  const silhouette = isK ? K_SILHOUETTE : A_SILHOUETTE;
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const point = {
      x: -0.8 + seeded(index, 40 + attempt * 2) * 1.6,
      y: -1 + seeded(index, 41 + attempt * 2) * 2,
    };
    const isACounter = !isK && isInsidePolygon(point, A_COUNTER) && !(point.y > 0.32 && point.y < 0.5);
    if (isInsidePolygon(point, silhouette) && !isACounter) return point;
  }
  return isK ? { x: -0.5, y: 0 } : { x: 0, y: 0.62 };
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

function sceneTarget(
  particle: GlyphParticle,
  index: number,
  phase: CinematicPhase,
  chapter: number,
  width: number,
  height: number,
) {
  if (phase === "mark-formation" || phase === "hero-copy") {
    const isK = index % 2 === 0;
    const point = filledLetterPoint(index, isK);
    const scale = Math.min(width, height) * (phase === "mark-formation" ? 0.41 : 0.35);
    return {
      mode: "forming",
      target: {
        x: width * (isK ? 0.17 : 0.83) + point.x * scale,
        y: height * (phase === "mark-formation" ? 0.5 : 0.3) + point.y * scale,
      },
    } as const;
  }

  if (phase.startsWith("chapter-")) {
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
}: {
  phase: CinematicPhase;
  chapter: number;
  reducedMotion: boolean;
  occlusionRects: OcclusionRect[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<GlyphParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { willReadFrequently: true });
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

    const resize = () => {
      const rectangle = canvas.getBoundingClientRect();
      width = Math.max(1, rectangle.width);
      height = Math.max(1, rectangle.height);
      const pixelRatio = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (particlesRef.current.length === 0) {
        const count = width < 720 ? 150 : width < 1024 ? 220 : 280;
        particlesRef.current = Array.from({ length: count }, (_, index) => {
          const pathSeed = 7000 + index * 37;
          const anchor = { x: seeded(index, 3) * width, y: seeded(index, 4) * height };
          return createParticle({
            id: `koa-glyph-${index}`,
            pathSeed,
            anchor,
            position: { x: anchor.x, y: anchor.y },
            char: GLYPHS[Math.floor(seeded(index, 1) * GLYPHS.length)],
            size: 8 + seeded(index, 9) * 10,
            baseOpacity: 0.018 + seeded(index, 10) * 0.032,
            lifePhase: seeded(index, 11),
            lifeDurationMs: 14000 + seeded(index, 12) * 22000,
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
    };
    const pointerLeave = () => { pointerActive = false; };

    const draw = (now: number) => {
      const deltaMs = Math.min(48, Math.max(1, now - lastTime));
      lastTime = now;
      context.clearRect(0, 0, width, height);
      context.textAlign = "center";
      context.textBaseline = "middle";

      particlesRef.current.forEach((particle, index) => {
        const destination = sceneTarget(particle, index, phase, chapter, width, height);
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
        const occluded = isOccluded(particle.position.x, particle.position.y, occlusionRects);
        const sparseAlpha = boundedSparseAlpha({
          baseOpacity: particle.opacity,
          lifePhase: particle.lifePhase,
          reveal: revealed,
          mode: particle.mode,
          occluded,
        });
        // Formation is the signature mark: keep the glyphs individually quiet,
        // but lift the assembled K/A enough to read without a cursor.
        const formationLift = phase === "mark-formation" || phase === "hero-copy" ? 7 : 1;
        const alpha = Math.min(0.48, sparseAlpha * formationLift);
        if (alpha < 0.002) return;

        context.globalAlpha = alpha;
        context.font = `${particle.size}px "Noto Sans Myanmar", sans-serif`;
        context.fillStyle = particle.mode === "forming" || particle.mode === "breathing"
          ? "#f8f3e8"
          : "#d4c8b8";
        context.fillText(particle.char, particle.position.x, particle.position.y);
      });

      context.globalAlpha = 1;
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    canvas.dataset.motionState = "running";
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", pointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", pointerLeave);
    frame = window.requestAnimationFrame(draw);
    return () => {
      canvas.dataset.motionState = "stopped";
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", pointerMove);
      document.documentElement.removeEventListener("pointerleave", pointerLeave);
      window.cancelAnimationFrame(frame);
    };
  }, [chapter, occlusionRects, phase, reducedMotion]);

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
