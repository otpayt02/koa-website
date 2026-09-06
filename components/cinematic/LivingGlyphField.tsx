"use client";

import { useEffect, useRef } from "react";
import {
  advanceParticle,
  boundedSparseAlpha,
  cycleParticleLife,
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
    if (isInsidePolygon(point, silhouette)) return point;
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
    // Match the seal's visual height and leave its perimeter unoccupied.
    // The K and A sit as complete but separate filled fields, not an orbit.
    const scale = Math.min(width, height) * (phase === "mark-formation" ? 0.24 : 0.22);
    return {
      mode: "forming",
      target: {
        x: width * (isK ? 0.16 : 0.84) + point.x * scale,
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
  const ambientParticlesRef = useRef<GlyphParticle[]>([]);

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
    const startedAt = lastTime;
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
          const isK = index % 2 === 0;
          const formation = filledLetterPoint(index, isK);
          const formationScale = Math.min(width, height) * 0.24;
          const formationTarget = {
            x: width * (isK ? 0.16 : 0.84) + formation.x * formationScale,
            y: height * 0.5 + formation.y * formationScale,
          };
          return createParticle({
            id: `koa-glyph-${index}`,
            pathSeed,
            anchor,
            // The mark begins as a loose rainfall rather than an instant outline.
            // Each deterministic release time makes the assembly varied but replayable.
            position: {
              x: formationTarget.x + (seeded(index, 62) - 0.5) * width * 0.6,
              y: -24 - seeded(index, 63) * height * 0.72,
            },
            char: GLYPHS[Math.floor(seeded(index, 1) * GLYPHS.length)],
            size: 8 + seeded(index, 9) * 10,
            baseOpacity: 0.018 + seeded(index, 10) * 0.032,
            lifePhase: seeded(index, 11),
            lifeDurationMs: 14000 + seeded(index, 12) * 22000,
            arrivalAtMs: 90 + seeded(index, 64) * 3000,
          });
        });
        canvas.dataset.particleSignature = particlesRef.current
          .map((particle) => `${particle.id}:${particle.pathSeed}`)
          .join("|");

        const ambientCount = width < 720 ? 44 : width < 1024 ? 64 : 84;
        ambientParticlesRef.current = Array.from({ length: ambientCount }, (_, index) => {
          const pathSeed = 12000 + index * 53;
          const anchor = { x: seeded(index, 70) * width, y: seeded(index, 71) * height };
          return createParticle({
            id: `koa-ambient-glyph-${index}`,
            pathSeed,
            anchor,
            char: GLYPHS[Math.floor(seeded(index, 72) * GLYPHS.length)],
            size: 8 + seeded(index, 73) * 11,
            baseOpacity: 0.045 + seeded(index, 74) * 0.07,
            lifePhase: seeded(index, 75),
            lifeDurationMs: 7000 + seeded(index, 76) * 13000,
            nextTargetAtMs: 900 + seeded(index, 77) * 5000,
          });
        });
        canvas.dataset.ambientSignature = ambientParticlesRef.current
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
        const isOpeningMark = phase === "mark-formation" || phase === "hero-copy";
        const isReleased = now - startedAt >= particle.arrivalAtMs;
        if (!isOpeningMark || isReleased) retargetParticle(particle, destination);
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
        const formationLift = isOpeningMark && isReleased ? 7 : 1;
        const alpha = Math.min(0.48, sparseAlpha * formationLift);
        if (alpha < 0.002) return;

        context.globalAlpha = alpha;
        context.font = `${particle.size}px "Noto Sans Myanmar", sans-serif`;
        context.fillStyle = particle.mode === "forming" || particle.mode === "breathing"
          ? "#f8f3e8"
          : "#d4c8b8";
        context.fillText(particle.char, particle.position.x, particle.position.y);
      });

      // A separate, low-count school gives the grid depth. It is deliberately
      // independent from the K/A arrival so it can drift, fade, and redirect
      // without ever reading as an extra letter or a seal orbit.
      ambientParticlesRef.current.forEach((particle, index) => {
        if (now >= particle.nextTargetAtMs) {
          cycleParticleLife(particle);
          particle.nextTargetAtMs = now + 4200 + seeded(index, 80 + particle.pathCursor) * 7000;
        }
        advanceParticle(particle, { deltaMs, elapsedMs: now });
        const occluded = isOccluded(particle.position.x, particle.position.y, occlusionRects);
        const alpha = boundedSparseAlpha({
          baseOpacity: particle.opacity,
          lifePhase: particle.lifePhase,
          mode: "ambient",
          occluded,
        });
        if (alpha < 0.006) return;

        const hue = 195 + Math.round(seeded(index, 81) * 72);
        context.globalAlpha = Math.min(0.16, alpha);
        context.filter = `blur(${(1.5 - alpha * 8).toFixed(2)}px)`;
        context.fillStyle = `hsl(${hue} 58% ${72 + Math.round(seeded(index, 82) * 14)}%)`;
        context.font = `${particle.size}px "Noto Sans Myanmar", sans-serif`;
        context.fillText(particle.char, particle.position.x, particle.position.y);
        context.filter = "none";
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
