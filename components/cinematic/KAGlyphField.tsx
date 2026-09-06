"use client";

import { useEffect, useRef } from "react";

const SYLLABLES = [
  "က", "ခ", "ဂ", "င", "စ", "ဆ", "ည", "တ", "ထ", "ဒ", "န", "ပ", "ဖ", "ဘ", "မ", "ယ", "ရ", "လ", "ဝ", "သ", "ဟ", "အ",
  "ကညီ", "တၢ်", "ပှၤ", "ကျိာ်", "ဒီး", "လၢ", "တဝၢ", "ဃူ", "ဖိး", "က့ၤ", "မၤ", "သ့", "ဘၣ်",
];

type Point = { x: number; y: number };
type Particle = {
  char: string;
  start: Point;
  target: Point;
  scatter: Point;
  size: number;
  alpha: number;
  depth: number;
  phase: number;
};

const K_OUTLINE: Point[] = [
  { x: 0.14, y: 0.18 }, { x: 0.21, y: 0.18 }, { x: 0.21, y: 0.42 },
  { x: 0.34, y: 0.18 }, { x: 0.41, y: 0.18 }, { x: 0.29, y: 0.48 },
  { x: 0.42, y: 0.80 }, { x: 0.35, y: 0.80 }, { x: 0.21, y: 0.56 },
  { x: 0.21, y: 0.80 }, { x: 0.14, y: 0.80 }, { x: 0.14, y: 0.18 },
];

const A_OUTLINE: Point[] = [
  { x: 0.59, y: 0.80 }, { x: 0.70, y: 0.18 }, { x: 0.78, y: 0.18 },
  { x: 0.90, y: 0.80 }, { x: 0.83, y: 0.80 }, { x: 0.79, y: 0.61 },
  { x: 0.69, y: 0.61 }, { x: 0.66, y: 0.80 }, { x: 0.59, y: 0.80 },
];

const A_BAR: Point[] = [
  { x: 0.69, y: 0.51 }, { x: 0.80, y: 0.51 },
];

function seeded(index: number, salt: number) {
  let value = Math.imul(index + 1, 374761393) ^ Math.imul(salt + 1, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutQuart(value: number) {
  return 1 - Math.pow(1 - clamp(value), 4);
}

function mix(a: number, b: number, amount: number) {
  return a + (b - a) * amount;
}

function pointAlong(points: Point[], amount: number) {
  if (points.length < 2) return points[0] ?? { x: 0.5, y: 0.5 };
  const lengths = points.slice(1).map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let remaining = clamp(amount) * total;
  for (let index = 0; index < lengths.length; index += 1) {
    if (remaining <= lengths[index] || index === lengths.length - 1) {
      const local = lengths[index] === 0 ? 0 : remaining / lengths[index];
      return {
        x: mix(points[index].x, points[index + 1].x, local),
        y: mix(points[index].y, points[index + 1].y, local),
      };
    }
    remaining -= lengths[index];
  }
  return points.at(-1)!;
}

function formationTarget(index: number, count: number): Point {
  const normalized = index / Math.max(1, count - 1);
  if (normalized < 0.44) {
    return pointAlong(K_OUTLINE, normalized / 0.44);
  }
  if (normalized < 0.88) {
    const local = (normalized - 0.44) / 0.44;
    return local < 0.84
      ? pointAlong(A_OUTLINE, local / 0.84)
      : pointAlong(A_BAR, (local - 0.84) / 0.16);
  }
  const local = (normalized - 0.88) / 0.12;
  const angle = local * Math.PI * 2;
  return {
    x: 0.5 + Math.cos(angle) * 0.105,
    y: 0.49 + Math.sin(angle) * 0.175,
  };
}

function buildParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, index) => {
    const target = formationTarget(index, count);
    const side = seeded(index, 4) > 0.5 ? 1 : -1;
    const start = {
      x: seeded(index, 2),
      y: seeded(index, 3),
    };
    if (index % 4 === 0) start.x = side > 0 ? 1.03 + seeded(index, 5) * 0.25 : -0.03 - seeded(index, 5) * 0.25;
    if (index % 7 === 0) start.y = seeded(index, 6) > 0.5 ? 1.02 + seeded(index, 7) * 0.18 : -0.02 - seeded(index, 7) * 0.18;

    const awayX = target.x - 0.5;
    const awayY = target.y - 0.49;
    return {
      char: SYLLABLES[Math.floor(seeded(index, 1) * SYLLABLES.length)],
      start,
      target,
      scatter: {
        x: target.x + awayX * (0.9 + seeded(index, 8) * 1.6) + (seeded(index, 9) - 0.5) * 0.28,
        y: target.y + awayY * (0.7 + seeded(index, 10) * 1.4) + (seeded(index, 11) - 0.5) * 0.24,
      },
      size: 7 + seeded(index, 12) * 11,
      alpha: 0.18 + seeded(index, 13) * 0.58,
      depth: 0.35 + seeded(index, 14) * 0.9,
      phase: seeded(index, 15) * Math.PI * 2,
    };
  });
}

export function KAGlyphField({ progress, reducedMotion }: { progress: number; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 1;
    let height = 1;
    let frame = 0;

    const resize = () => {
      const rectangle = canvas.getBoundingClientRect();
      width = Math.max(1, rectangle.width);
      height = Math.max(1, rectangle.height);
      const pixelRatio = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const count = width < 700 ? 170 : width < 1100 ? 240 : 320;
      particlesRef.current = buildParticles(count);
    };

    const draw = (now: number) => {
      const p = reducedMotion ? 0.30 : progressRef.current;
      context.clearRect(0, 0, width, height);
      context.textAlign = "center";
      context.textBaseline = "middle";

      const converge = easeOutQuart((p - 0.045) / 0.175);
      const scatter = easeOutQuart((p - 0.38) / 0.16);
      const holding = p >= 0.22 && p < 0.38;

      for (const particle of particlesRef.current) {
        let x = particle.start.x;
        let y = particle.start.y;
        let alpha = particle.alpha * 0.28;

        if (p >= 0.045 && p < 0.22) {
          x = mix(particle.start.x, particle.target.x, converge);
          y = mix(particle.start.y, particle.target.y, converge);
          alpha = particle.alpha * mix(0.32, 1, converge);
        } else if (holding || reducedMotion) {
          const breathe = reducedMotion ? 0 : Math.sin(now * 0.0012 * particle.depth + particle.phase) * 0.0018 * particle.depth;
          x = particle.target.x + breathe;
          y = particle.target.y + breathe * 0.7;
          alpha = Math.min(0.9, particle.alpha * 1.18);
        } else if (p >= 0.38) {
          x = mix(particle.target.x, particle.scatter.x, scatter);
          y = mix(particle.target.y, particle.scatter.y, scatter);
          x += Math.sin(now * 0.00035 * particle.depth + particle.phase) * 0.006 * scatter;
          y += Math.cos(now * 0.00029 * particle.depth + particle.phase) * 0.005 * scatter;
          alpha = particle.alpha * mix(1, indexDepthAlpha(particle.depth), scatter);
        }

        if (x < -0.2 || x > 1.2 || y < -0.2 || y > 1.2) continue;
        context.globalAlpha = Math.min(0.94, alpha);
        context.font = `${particle.size * particle.depth}px "Noto Sans Myanmar", sans-serif`;
        context.fillStyle = holding ? "#fff8e9" : particle.depth > 0.85 ? "#f1e8d6" : "#c7bba9";
        context.fillText(particle.char, x * width, y * height);
      }

      context.globalAlpha = 1;
      if (!reducedMotion) frame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    if (reducedMotion) draw(performance.now());
    else frame = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="koa-ka-glyph-field" aria-hidden="true" />;
}

function indexDepthAlpha(depth: number) {
  return depth > 0.92 ? 0.24 : depth > 0.7 ? 0.16 : 0.09;
}

export default KAGlyphField;
