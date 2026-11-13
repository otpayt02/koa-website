"use client";

import { useEffect, useRef, type RefObject } from "react";

// The approved seal is the only O. These private masks place individual Karen
// glyphs in K/A silhouettes; no outline, arrival path, or scatter is rendered.
type Point = { x: number; y: number };
type Letter = "K" | "A";
type Mark = { letter: Letter; point: Point; char: string; tone: "paper" | "gold" | "red"; size: number; phase: number };
const KAREN_GLYPHS = Array.from({ length: 32 }, (_, index) => String.fromCodePoint(0xa9e0 + index));

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => { const x = clamp(value); return x * x * (3 - 2 * x); };

function pointInPolygon(point: Point, polygon: Point[]) {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
    const a = polygon[current];
    const b = polygon[previous];
    if ((a.y > point.y) !== (b.y > point.y)
      && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

function insideK(point: Point) {
  const spine = point.x >= 0.04 && point.x <= 0.25;
  const upper = pointInPolygon(point, [{ x: 0.21, y: 0.46 }, { x: 0.58, y: 0 }, { x: 0.88, y: 0 }, { x: 0.47, y: 0.49 }]);
  const lower = pointInPolygon(point, [{ x: 0.21, y: 0.54 }, { x: 0.58, y: 1 }, { x: 0.91, y: 1 }, { x: 0.47, y: 0.51 }]);
  return spine || upper || lower;
}

function insideA(point: Point) {
  const left = pointInPolygon(point, [{ x: 0.45, y: 0 }, { x: 0.56, y: 0 }, { x: 0.34, y: 1 }, { x: 0.06, y: 1 }]);
  const right = pointInPolygon(point, [{ x: 0.44, y: 0 }, { x: 0.55, y: 0 }, { x: 0.94, y: 1 }, { x: 0.66, y: 1 }]);
  const bar = point.y >= 0.58 && point.y <= 0.7 && point.x >= 0.24 && point.x <= 0.76;
  return left || right || bar;
}

function buildMarks(width: number, hero: boolean): Mark[] {
  const rows = hero ? (width < 720 ? 20 : 26) : (width < 720 ? 20 : 28);
  const baselineRows = width < 720 ? 29 : 40;
  const marks: Mark[] = [];
  // The Home mark samples bold serif letterforms, then renders only Karen glyphs.
  const mask = hero ? document.createElement("canvas") : null;
  const maskInk = mask?.getContext("2d", { willReadFrequently: true });
  if (mask && maskInk) { mask.width = mask.height = 240; maskInk.font = '700 230px "Cormorant Garamond", Georgia, serif'; maskInk.textAlign = "center"; maskInk.textBaseline = "middle"; maskInk.lineWidth = 8; maskInk.lineJoin = "round"; }
  for (const letter of ["K", "A"] as const) {
    const letterStart = marks.length;
    if (maskInk) { maskInk.clearRect(0, 0, 240, 240); maskInk.fillText(letter, 120, 125); maskInk.strokeText(letter, 120, 125); }
    const pixels = maskInk?.getImageData(0, 0, 240, 240).data;
    const contains = pixels
      ? (point: Point) => pixels[(Math.min(239, Math.floor((.08 + point.y * .84) * 240)) * 240 + Math.min(239, Math.floor((.16 + point.x * .68) * 240))) * 4 + 3] > 80
      : letter === "K" ? insideK : insideA;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < rows; column++) {
        const point = { x: (column + 0.33 + (row % 2) * 0.34) / rows, y: (row + 0.5) / rows };
        if (!contains(point)) continue;
        const index = marks.length;
        const edge = [[0.75 / rows, 0], [-0.75 / rows, 0], [0, 0.75 / rows], [0, -0.75 / rows]]
          .some(([dx, dy]) => !contains({ x: point.x + dx, y: point.y + dy }));
        marks.push({
          letter, point,
          char: KAREN_GLYPHS[(index * 13 + row * 7) % KAREN_GLYPHS.length],
          tone: index % 19 === 0 ? "red" : index % 7 === 0 ? "gold" : "paper",
          // Fewer Home targets preserve individual glyphs at 1.5–2.5× their prior size.
          size: hero
            ? (edge ? 1.64 : 1.53) * (1.5 + (index * .61803398875 % 1)) / baselineRows
            : (edge ? 1.08 : 0.96) / rows,
          phase: (index * 0.61803398875 % 1) * Math.PI * 2,
        });
      }
    }
    if (hero && marks.length > letterStart) {
      // Normalize each sampled silhouette so K and A occupy equal cap-height boxes.
      const letterMarks = marks.slice(letterStart);
      const xs = letterMarks.map((mark) => mark.point.x);
      const ys = letterMarks.map((mark) => mark.point.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      for (const mark of letterMarks) {
        mark.point = {
          x: .04 + .92 * (mark.point.x - minX) / Math.max(.01, maxX - minX),
          y: .04 + .92 * (mark.point.y - minY) / Math.max(.01, maxY - minY),
        };
      }
    }
  }
  return marks;
}

function composition(width: number, height: number, progress: number, hero: boolean) {
  if (hero) {
    const mobile = width < 720;
    const sealSize = height * (mobile ? .65 : .8);
    const letterWidth = Math.min(sealSize * (mobile ? .92 : .96), (width - sealSize - 20) / 2);
    return { centerX: width / 2, centerY: height * .54, letterWidth,
      letterHeight: sealSize, letterOffset: sealSize * .5 + 10 + letterWidth * .5 };
  }
  // Match the seal's CSS rise and scale so the three marks travel as one.
  const rise = smooth((progress - 0.55) / 0.16);
  const initialSeal = Math.min(Math.min(width, height) * 0.68, 560, width * 0.4);
  const sealSize = initialSeal * (1 - rise * 0.42);
  const mobile = width < 720;
  const gap = Math.min(width * 0.035, 20);
  const letterWidth = Math.min(
    mobile ? Math.min(sealSize * 0.9, width * 0.25) : sealSize * 0.74,
    (width - sealSize - gap * 2) / 2,
  );
  return {
    centerX: width / 2,
    centerY: height * (0.54 - rise * 0.16),
    letterWidth,
    letterHeight: sealSize * (mobile ? 1.14 : 1.04),
    letterOffset: sealSize * 0.5 + gap + letterWidth * 0.5,
  };
}

export function KAGlyphField({ progress, reducedMotion, hero = false, loading = false, scatterProgress }: { progress: RefObject<number>; reducedMotion: boolean; hero?: boolean; loading?: boolean; scatterProgress?: RefObject<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let width = 1;
    let height = 1;
    let frame = 0;
    let visible = true;
    let mounted = true;
    let marks: Mark[] = [];
    const startedAt = performance.now();
    const sprites = new Map<string, HTMLCanvasElement>();

    const draw = (now: number) => {
      frame = 0;
      context.clearRect(0, 0, width, height);
      const layout = composition(width, height, progress.current, hero);
      const phase = ((now - startedAt) % 2400) / 2400;
      const scatter = scatterProgress && !reducedMotion
        ? 1 - smooth(scatterProgress.current)
        : loading && !reducedMotion
          ? phase < .43 ? smooth(phase / .43) : phase < .88 ? 1 - smooth((phase - .43) / .45) : 0
          : 0;
      for (const mark of marks) {
        const key = mark.char + ":" + mark.tone;
        let sprite = sprites.get(key);
        if (!sprite) {
          sprite = document.createElement("canvas");
          sprite.width = 80;
          sprite.height = 80;
          const ink = sprite.getContext("2d");
          if (ink) {
            ink.textAlign = "center";
            ink.textBaseline = "middle";
            ink.font = '64px "Noto Sans Myanmar", sans-serif';
            ink.fillStyle = mark.tone === "red" ? "#dc4b4f" : mark.tone === "gold" ? "#f0b84f" : "#f5efe4";
            ink.fillText(mark.char, 40, 40, 64);
          }
          sprites.set(key, sprite);
        }
        // Breathing changes opacity and size slightly; every target stays put.
        const breath = reducedMotion ? 1 : 0.93 + 0.07 * Math.sin(now * 0.00065 + mark.phase);
        const size = mark.size * layout.letterHeight * (reducedMotion ? 1 : 0.985 + breath * 0.015);
        const cell = size * 1.25;
        const alive = hero && !reducedMotion ? Math.sin(now * .0011 + mark.phase) * 1.1 : 0;
        const loadingOffset = loading ? layout.letterWidth * .5 + 9 : layout.letterOffset;
        const drift = scatter * Math.min(width, height) * .36;
        const x = layout.centerX + (mark.letter === "K" ? -loadingOffset : loadingOffset)
          + (mark.point.x - 0.5) * layout.letterWidth + alive + Math.cos(mark.phase * 2.3) * drift;
        const y = layout.centerY + (mark.point.y - 0.5) * layout.letterHeight + Math.sin(mark.phase * 2.3) * drift * .7;
        context.globalAlpha = (hero ? (mark.tone === "paper" ? .52 : .48) : (mark.tone === "paper" ? .83 : .76)) * breath * (1 - scatter * .32);
        context.drawImage(sprite, x - cell / 2, y - cell / 2, cell, cell);
      }
      context.globalAlpha = 1;
      if (!reducedMotion && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };

    const wake = () => {
      if (visible && !document.hidden && !frame) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const dpr = Math.min(width < 720 ? 1.25 : 1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      marks = buildMarks(width, hero);
      draw(performance.now());
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); }, { threshold: 0.01 });
    const sizeObserver = new ResizeObserver(resize);
    resize();
    void document.fonts.ready.then(() => { if (mounted) { sprites.clear(); resize(); } });
    observer.observe(canvas);
    sizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", wake);
    return () => {
      mounted = false;
      observer.disconnect();
      sizeObserver.disconnect();
      document.removeEventListener("visibilitychange", wake);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [progress, reducedMotion, hero, loading, scatterProgress]);

  return <canvas ref={canvasRef} className="koa-ka-glyph-field" aria-hidden="true" />;
}

export default KAGlyphField;
