"use client";

import { useEffect, useRef } from "react";
import {
  advanceParticle,
  boundedSparseAlpha,
  createParticle,
  retargetParticle,
} from "../../lib/cinema/glyph-motion.mjs";

export type CinematicPhase =
  | "arrival"
  | "seal-flight"
  | "glyph-o"
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

function sceneTarget(
  particle: GlyphParticle,
  index: number,
  phase: CinematicPhase,
  chapter: number,
  width: number,
  height: number,
) {
  if (phase === "glyph-o") {
    const angle = (index % 96) / 96 * Math.PI * 2;
    const radiusX = Math.min(width, height) * 0.155;
    const radiusY = radiusX * 1.18;
    return {
      mode: "forming",
      target: {
        x: width / 2 + Math.cos(angle) * radiusX,
        y: height * 0.47 + Math.sin(angle) * radiusY,
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
        const count = width < 720 ? 72 : width < 1024 ? 112 : 168;
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
            baseOpacity: 0.008 + seeded(index, 10) * 0.026,
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
        const alpha = boundedSparseAlpha({
          baseOpacity: particle.opacity,
          lifePhase: particle.lifePhase,
          reveal: revealed,
          mode: particle.mode,
          occluded,
        });
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
