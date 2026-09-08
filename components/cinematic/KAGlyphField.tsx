"use client";

import { useEffect, useRef } from "react";

// The formation uses only the approved background repertoire. The supplied seal is the only O mark.
const KAREN_CODEPOINTS = Array.from({ length: 32 }, (_, index) => String.fromCodePoint(0xa9e0 + index));
const GLYPHS = [...KAREN_CODEPOINTS, "K", "O", "A"];

type Letter = "K" | "A";
type Point = { x: number; y: number };
type Particle = {
  char: string;
  letter: Letter;
  local: Point;
  x: number;
  y: number;
  spawnX: number;
  spawnY: number;
  scatterX: number;
  scatterY: number;
  curveY: number;
  size: number;
  alpha: number;
  depth: number;
  phase: number;
  speed: number;
  stiffness: number;
  arrivalStart: number;
  arrivalEnd: number;
  tone: "gold" | "red" | "paper";
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;
const smooth = (value: number) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};

function pointInPolygon(point: Point, polygon: Point[]) {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
    const a = polygon[current];
    const b = polygon[previous];
    const intersects = ((a.y > point.y) !== (b.y > point.y))
      && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

// This is the original broad, architectural K silhouette. It is sampled internally;
// no SVG, text node, or construction rail is ever rendered.
function insideFirstK(point: Point) {
  const spine = point.x >= 0.04 && point.x <= 0.25;
  const upper = pointInPolygon(point, [{ x: 0.21, y: 0.46 }, { x: 0.58, y: 0 }, { x: 0.88, y: 0 }, { x: 0.47, y: 0.49 }]);
  const lower = pointInPolygon(point, [{ x: 0.21, y: 0.54 }, { x: 0.58, y: 1 }, { x: 0.91, y: 1 }, { x: 0.47, y: 0.51 }]);
  return spine || upper || lower;
}

// The original A triangle is retained, but targets fill its interior and the crossbar.
function insideFirstA(point: Point) {
  const outer = pointInPolygon(point, [{ x: 0.5, y: 0 }, { x: 0.04, y: 1 }, { x: 0.96, y: 1 }]);
  const counter = pointInPolygon(point, [{ x: 0.5, y: 0.32 }, { x: 0.31, y: 0.76 }, { x: 0.69, y: 0.76 }]);
  const crossbar = point.x >= 0.27 && point.x <= 0.73 && point.y >= 0.56 && point.y <= 0.69;
  return outer && (!counter || crossbar);
}

function shuffled<T>(values: T[]) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function fillTargets(letter: Letter) {
  const contains = letter === "K" ? insideFirstK : insideFirstA;
  const targets: Point[] = [];
  // A staggered grid fills the old silhouette without leaving regular visible rows.
  for (let row = 0; row < 32; row += 1) {
    for (let column = 0; column < 32; column += 1) {
      const point = { x: (column + 0.16 + (row % 2) * 0.34) / 32, y: (row + 0.5) / 32 };
      if (contains(point)) targets.push(point);
    }
  }
  return shuffled(targets);
}

function buildParticles(width: number, height: number) {
  const count = width < 720 ? 180 : 360;
  const targets = { K: fillTargets("K"), A: fillTargets("A") };
  const centerX = width / 2;
  const centerY = height * 0.48;
  return Array.from({ length: count }, (_, index): Particle => {
    const letter: Letter = index % 2 === 0 ? "K" : "A";
    const target = targets[letter][Math.floor(index / 2) % targets[letter].length] ?? { x: 0.5, y: 0.5 };
    const side = letter === "K" ? -1 : 1;
    const toneRoll = Math.random();
    const spawnX = centerX + side * (width * (0.52 + Math.random() * 0.28));
    const spawnY = centerY + (Math.random() - 0.5) * height * 0.9;
    const scatterX = clamp(centerX + side * width * (0.26 + Math.random() * 0.2) + (Math.random() - 0.5) * width * 0.16, 22, width - 22);
    const scatterY = clamp(centerY + (Math.random() - 0.5) * height * 0.7, 22, height - 22);
    const arrivalStart = 0.07 + Math.random() * 0.24;
    return {
      char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      letter,
      local: target,
      x: spawnX,
      y: spawnY,
      spawnX,
      spawnY,
      scatterX,
      scatterY,
      curveY: (Math.random() - 0.5) * height * 0.22,
      size: 9 + Math.random() * 10,
      alpha: 0,
      depth: 0.42 + Math.random() * 0.58,
      phase: Math.random() * Math.PI * 2,
      speed: 0.45 + Math.random() * 1.1,
      stiffness: 0.045 + Math.random() * 0.05,
      arrivalStart,
      arrivalEnd: Math.min(0.42, arrivalStart + 0.065 + Math.random() * 0.11),
      tone: toneRoll > 0.82 ? "red" : toneRoll > 0.58 ? "gold" : "paper",
    };
  });
}

function composition(width: number, height: number, progress: number) {
  const rise = smooth((progress - 0.62) / 0.18);
  // Mirrors the CSS seal dimensions: the letters are 90% of the shrinking seal.
  const initialSeal = Math.min(Math.min(width, height) * 0.62, 530, width * 0.38);
  const sealSize = initialSeal * (1 - rise * 0.45);
  const center = { x: width / 2, y: height * (0.48 - rise * 0.26) };
  return {
    center,
    sealSize,
    letterWidth: sealSize * 0.79,
    letterHeight: sealSize * 0.9,
    // A fixed breathing corridor prevents either letter from touching the seal.
    letterOffset: sealSize * 0.98,
  };
}

function targetFor(particle: Particle, layout: ReturnType<typeof composition>) {
  const centerX = layout.center.x + (particle.letter === "K" ? -layout.letterOffset : layout.letterOffset);
  return {
    x: centerX + (particle.local.x - 0.5) * layout.letterWidth,
    y: layout.center.y + (particle.local.y - 0.5) * layout.letterHeight,
  };
}

export function KAGlyphField({ progress, reducedMotion }: { progress: number; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 1;
    let height = 1;
    let frame = 0;
    let visible = true;
    let coldStart = true;
    let particles: Particle[] = [];
    const pointer = { x: -9999, y: -9999, active: false };

    const resize = () => {
      const rectangle = canvas.getBoundingClientRect();
      width = Math.max(1, rectangle.width);
      height = Math.max(1, rectangle.height);
      const dpr = Math.min(width < 720 ? 1.25 : 1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = buildParticles(width, height);
      coldStart = true;
    };

    const movePointer = (event: PointerEvent) => {
      const rectangle = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rectangle.left;
      pointer.y = event.clientY - rectangle.top;
      pointer.active = true;
    };
    const leavePointer = () => { pointer.active = false; };

    const draw = (now: number) => {
      frame = 0;
      const sceneProgress = reducedMotion ? 0.79 : progressRef.current;
      const layout = composition(width, height, sceneProgress);
      const scatter = smooth((sceneProgress - 0.91) / 0.09);
      context.clearRect(0, 0, width, height);
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.filter = "blur(0.35px)";

      for (const particle of particles) {
        const finalTarget = targetFor(particle, layout);
        const arrival = smooth((sceneProgress - particle.arrivalStart) / Math.max(0.001, particle.arrivalEnd - particle.arrivalStart));
        const pathX = mix(particle.spawnX, finalTarget.x, arrival);
        const pathY = mix(particle.spawnY, finalTarget.y, arrival) + Math.sin(arrival * Math.PI) * particle.curveY;
        let targetX = pathX;
        let targetY = pathY;
        if (scatter > 0) {
          targetX = mix(finalTarget.x, particle.scatterX, scatter);
          targetY = mix(finalTarget.y, particle.scatterY, scatter);
        }
        if (coldStart && sceneProgress > 0.07) {
          particle.x = targetX;
          particle.y = targetY;
        } else {
          particle.x += (targetX - particle.x) * (particle.stiffness * 1.5);
          particle.y += (targetY - particle.y) * (particle.stiffness * 1.5);
        }

        if (!reducedMotion && arrival > 0.98 && scatter < 0.35 && pointer.active) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 130 && distance > 0.001) {
            // The settled mark makes room without breaking the seal/letter corridor.
            const force = (1 - distance / 130) * 3.6;
            particle.x += dx / distance * force;
            particle.y += dy / distance * force;
          }
        }

        const settled = arrival > 0.98 && scatter < 0.01;
        const flicker = 0.82 + 0.18 * Math.sin(now * 0.001 * particle.speed + particle.phase);
        const targetAlpha = settled ? 0.66 : arrival * 0.52;
        particle.alpha += (targetAlpha * (1 - scatter * 0.82) - particle.alpha) * 0.08;
        if (particle.alpha < 0.004 || arrival <= 0.001) continue;

        context.globalAlpha = particle.alpha * flicker;
        context.font = `${Math.max(8, particle.size * (0.75 + particle.depth * 0.5))}px "Noto Sans Myanmar", "Space Grotesk", sans-serif`;
        context.fillStyle = particle.tone === "red" ? "#dc4b4f" : particle.tone === "gold" ? "#f0b84f" : "#f5efe4";
        context.fillText(particle.char, particle.x, particle.y);
      }

      coldStart = false;
      context.globalAlpha = 1;
      context.filter = "none";
      if (!reducedMotion && visible && !document.hidden) frame = window.requestAnimationFrame(draw);
    };

    const wake = () => {
      if (!reducedMotion && visible && !document.hidden && !frame) frame = window.requestAnimationFrame(draw);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); }, { threshold: 0.01 });
    const sizeObserver = new ResizeObserver(resize);
    resize();
    observer.observe(canvas);
    sizeObserver.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", movePointer, { passive: true });
    window.addEventListener("pointerleave", leavePointer);
    document.addEventListener("visibilitychange", wake);
    if (reducedMotion) draw(performance.now()); else wake();
    return () => {
      observer.disconnect();
      sizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", movePointer);
      window.removeEventListener("pointerleave", leavePointer);
      document.removeEventListener("visibilitychange", wake);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="koa-ka-glyph-field" aria-hidden="true" />;
}

export default KAGlyphField;
