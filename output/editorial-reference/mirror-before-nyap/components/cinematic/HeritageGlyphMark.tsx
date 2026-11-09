"use client";

import { useEffect, useRef } from "react";

// The supplied seal is the only O. These private masks place individual Karen
// glyphs in complete K/A silhouettes; no outline, arrival path, or scatter is rendered.
type Point = { x: number; y: number };
type Letter = "K" | "A";
type Mark = { letter: Letter; point: Point; char: string; tone: "paper" | "gold" | "red"; size: number; phase: number; layer: 0 | 1 | 2 };
const KAREN_GLYPHS = ["က", "ခ", "ဂ", "ဃ", "င", "စ", "ဆ", "ဇ", "ည", "တ", "ထ", "ဒ", "န", "ပ", "ဖ", "ဘ", "မ", "ယ", "ရ", "လ", "ဝ", "သ", "ဟ", "အ", "ၡ", "အၢ", "အၣ", "အၤ"];

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

function buildMarks(width: number): Mark[] {
  const rows = width < 720 ? 13 : 17;
  const marks: Mark[] = [];
  for (const letter of ["K", "A"] as const) {
    const contains = letter === "K" ? insideK : insideA;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < rows; column++) {
        const point = { x: (column + 0.33 + (row % 2) * 0.34) / rows, y: (row + 0.5) / rows };
        if (!contains(point)) continue;
        const index = marks.length;
        const layer = ((index * 7 + row * 3 + column) % 9 < 2 ? 2 : (index + row) % 4 === 0 ? 0 : 1) as 0 | 1 | 2;
        const edge = [[0.75 / rows, 0], [-0.75 / rows, 0], [0, 0.75 / rows], [0, -0.75 / rows]]
          .some(([dx, dy]) => !contains({ x: point.x + dx, y: point.y + dy }));
        marks.push({
          letter, point,
          char: KAREN_GLYPHS[(index * 13 + row * 7) % KAREN_GLYPHS.length],
          tone: index % 19 === 0 ? "red" : index % 7 === 0 ? "gold" : "paper",
          size: (1.38 + ((index * 37 + row * 13 + column * 7) % 13) / 12 * .48 + layer * .08 - (edge ? .04 : 0)) / rows,
          phase: (index * 0.61803398875 % 1) * Math.PI * 2,
          layer,
        });
      }
    }
  }
  return marks;
}

function composition(width: number, height: number) {
  // Keep a measurable gap between both letters and the supplied seal.
  const sealSize = Math.min(Math.min(width, height) * 0.84, 590, width * 0.38);
  const mobile = width < 720;
  const gap = Math.max(19, Math.min(width * 0.045, 28));
  const letterWidth = Math.min(
    mobile ? Math.min(sealSize * 0.86, width * 0.3) : sealSize * 0.82,
    (width - sealSize - gap * 2) / 2,
  );
  return {
    centerX: width / 2,
    centerY: height * 0.54,
    sealSize,
    letterWidth,
    letterHeight: sealSize * (mobile ? 1.02 : .96),
    letterOffset: sealSize * 0.5 + gap + letterWidth * 0.5,
  };
}

export function HeritageGlyphMark({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const staticMotion = reducedMotion || new URLSearchParams(window.location.search).get("motion") === "off";
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let width = 1;
    let height = 1;
    let frame = 0;
    let lastDraw = 0;
    let visible = true;
    let mounted = true;
    let marks: Mark[] = [];
    let pointerX = 0;
    let pointerY = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerTime = performance.now();
    const sprites = new Map<string, HTMLCanvasElement>();

    const draw = (now: number) => {
      frame = 0;
      if (reducedMotion && now - lastDraw < 50) { frame = requestAnimationFrame(draw); return; }
      lastDraw = now;
      // Clear physical pixels after a viewport/DPR change so old letter paint cannot survive.
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();
      const layout = composition(width, height);
      const pointerDt = Math.min(.05, Math.max(0, (now - pointerTime) / 1000));
      pointerTime = now;
      // Closed-form exponential response stays equally responsive at every frame rate.
      const pointerEase = 1 - Math.exp(-22 * pointerDt);
      pointerX += (pointerTargetX - pointerX) * pointerEase;
      pointerY += (pointerTargetY - pointerY) * pointerEase;
      canvas.parentElement?.style.setProperty("--seal-lean-x", `${staticMotion ? 0 : -pointerY * 2}deg`);
      canvas.parentElement?.style.setProperty("--seal-lean-y", `${staticMotion ? 0 : pointerX * 3}deg`);
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
            ink.font = '400 64px "Noto Sans Myanmar", sans-serif';
            ink.fillStyle = mark.tone === "red" ? "#dc4b4f" : mark.tone === "gold" ? "#f0b84f" : "#f5efe4";
            ink.fillText(mark.char, 40, 40, 64);
          }
          sprites.set(key, sprite);
        }
        // Different small two-axis oscillations keep the complete K/A silhouettes alive without scattering.
        const layerScale = [0.88, 1, 1.2][mark.layer];
        const breathDepth = [0.022, 0.038, 0.055][mark.layer];
        const breath = staticMotion ? 1 : 1 - breathDepth / 2 + breathDepth * Math.sin(now * (.00034 + mark.layer * .00007) + mark.phase);
        const size = mark.size * layout.letterHeight * breath * layerScale;
        const cell = size * 1.25;
        const speed = mark.phase / (Math.PI * 2);
        const swayX = staticMotion ? 0 : Math.sin(now * (.00031 + speed * .00023) + mark.phase) * Math.min(reducedMotion ? .45 : 1.8, layout.letterHeight * .012);
        const swayY = staticMotion ? 0 : Math.cos(now * (.00027 + speed * .00019) + mark.phase * 1.7) * Math.min(reducedMotion ? .3 : 1.1, layout.letterHeight * .008);
        const parallax = staticMotion ? 0 : [1.4, 3.2, 5.6][mark.layer];
        const x = layout.centerX + (mark.letter === "K" ? -layout.letterOffset : layout.letterOffset)
          + (mark.point.x - 0.5) * layout.letterWidth + swayX + pointerX * parallax;
        const y = layout.centerY + (mark.point.y - 0.5) * layout.letterHeight + swayY + pointerY * parallax;
        const layerAlpha = [0.58, 0.9, 1][mark.layer];
        context.globalAlpha = (mark.tone === "paper" ? 0.98 : 0.9) * breath * layerAlpha;
        context.drawImage(sprite, x - cell / 2, y - cell / 2, cell, cell);
      }
      context.globalAlpha = 1;
      if (!staticMotion && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };

    const wake = () => {
      if (visible && !document.hidden && !frame) frame = requestAnimationFrame(draw);
    };
    const followPointer = (event: PointerEvent) => {
      if (staticMotion || event.pointerType === "touch") return;
      pointerTargetX = Math.max(-1, Math.min(1, event.clientX / window.innerWidth * 2 - 1));
      pointerTargetY = Math.max(-1, Math.min(1, event.clientY / window.innerHeight * 2 - 1));
      wake();
    };
    const settlePointer = () => { pointerTargetX = 0; pointerTargetY = 0; wake(); };
    const resize = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const dpr = Math.min(width < 720 ? 1.25 : 1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      marks = buildMarks(width).sort((a, b) => a.layer - b.layer);
      canvas.parentElement?.style.setProperty("--koa-seal-size", `${composition(width, height).sealSize}px`);
      draw(performance.now());
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); }, { threshold: 0.01 });
    const sizeObserver = new ResizeObserver(resize);
    resize();
    void document.fonts.ready.then(() => { if (mounted) { sprites.clear(); resize(); } });
    observer.observe(canvas);
    sizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("pointermove", followPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", settlePointer);
    return () => {
      mounted = false;
      observer.disconnect();
      sizeObserver.disconnect();
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("pointermove", followPointer);
      document.documentElement.removeEventListener("pointerleave", settlePointer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="koa-ka-glyph-field" aria-hidden="true" />;
}

export default HeritageGlyphMark;
