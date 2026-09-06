"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };
type Glyph = { start: Point; anchor: Point; away: Point; phase: number; size: number; sprite: number; alpha: number };
// Existing site characters, used decoratively; never a claim about a Unicode block's language.
const GLYPHS = ["က", "ည", "တၢ်", "ပှၤ", "လ", "မ", "သ", "အ", "ဘ", "န", "ဝ", "ဖ", "ဟ", "ထ"];
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => { const t = clamp(v); return t * t * t * (t * (t * 6 - 15) + 10); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
function seeded(index: number, salt: number) {
  let n = Math.imul(index + 1, 374761393) ^ Math.imul(salt + 1, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

// This sampling surface is never mounted: letter faces and guides cannot leak into the scene.
function sampleLetter(letter: string, cx: number, cy: number, w: number, h: number): Point[] {
  const mask = document.createElement("canvas");
  mask.width = 320; mask.height = 360;
  const ctx = mask.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.font = /^[KA]$/.test(letter) ? '600 300px "Cormorant Garamond", Georgia, serif' : '500 250px "Noto Sans Myanmar", sans-serif';
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText(letter, 160, 290);
  const pixels = ctx.getImageData(0, 0, 320, 360).data;
  const raw: Point[] = [];
  let x0 = 320, x1 = 0, y0 = 360, y1 = 0;
  for (let y = 0; y < 360; y += 4) for (let x = 0; x < 320; x += 4) {
    if (pixels[(y * 320 + x) * 4 + 3] > 140) {
      raw.push({ x, y }); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
  }
  const scale = Math.min(w / Math.max(1, x1 - x0), h / Math.max(1, y1 - y0));
  return raw.map(p => ({ x: cx + (p.x - (x0 + x1) / 2) * scale, y: cy + (p.y - (y0 + y1) / 2) * scale }));
}

export function KAGlyphField({ progress, reducedMotion, chapter }: { progress: number; reducedMotion: boolean; chapter?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);
  const wakeRef = useRef<() => void>(() => {});
  useEffect(() => { progressRef.current = progress; wakeRef.current(); }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 1, h = 1, ratio = 1, frame = 0, visible = false, disposed = false;
    let clock = 0, previousTime = 0, visual = progressRef.current;
    let glyphs: Glyph[] = [];
    let atlas: HTMLCanvasElement;
    let pointer = { x: -9999, y: -9999 };
    let bounds = { left: 0, top: 0 };
    let chapterTop = 0, chapterHeight = 1;
    const cell = 48;
    const stats: number[] = [];

    const rebuild = () => {
      const rect = canvas.getBoundingClientRect();
      bounds = rect;
      chapterTop = rect.top + window.scrollY; chapterHeight = rect.height;
      // Ignore height-only address-bar changes on touch devices to avoid reseeding during a gesture.
      if (glyphs.length && w === rect.width && Math.abs(h - rect.height) < 3) return;
      w = Math.max(1, rect.width); h = Math.max(1, rect.height);
      ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const lowPower = (navigator.hardwareConcurrency || 4) < 4;
      const count = chapter ? (w < 720 ? 120 : 240) : w < 720 ? 240 : lowPower ? 300 : 440;
      const left = chapter
        ? sampleLetter(String.fromCharCode(0x1040 + chapter), w * .78, h * .45, w * .28, Math.min(h * .5, 440))
        : sampleLetter("K", w * .255, h * .47, w * .25, h * .48);
      const right = chapter ? left : sampleLetter("A", w * .745, h * .47, w * .25, h * .48);
      glyphs = Array.from({ length: count }, (_, i) => {
        const points = i % 2 ? right : left;
        const anchor = points[Math.floor(seeded(i, 7) * points.length)] || { x: w / 2, y: h / 2 };
        return {
          start: { x: seeded(i, 1) * w, y: seeded(i, 2) * h }, anchor,
          away: { x: anchor.x + (anchor.x - w / 2) * 2.3, y: anchor.y + (seeded(i, 4) - .5) * h * 1.5 },
          phase: seeded(i, 5) * Math.PI * 2, size: (w < 720 ? 7 : 9) + seeded(i, 6) * 5,
          sprite: i % GLYPHS.length, alpha: (chapter ? .34 : 1) * (.2 + seeded(i, 8) * .36),
        };
      });
      atlas = document.createElement("canvas");
      atlas.width = cell * GLYPHS.length * 2; atlas.height = cell * 2;
      const ink = atlas.getContext("2d")!;
      ink.scale(2, 2); ink.font = '22px "Noto Sans Myanmar", sans-serif';
      ink.textAlign = "center"; ink.textBaseline = "middle"; ink.fillStyle = "#e8ddc6";
      GLYPHS.forEach((g, i) => ink.fillText(g, i * cell + cell / 2, cell / 2));
      canvas.dataset.particleCount = String(count);
      canvas.dataset.dpr = String(ratio);
      canvas.dataset.guideCount = "0";
      if (chapter) onChapterScroll();
      visual = progressRef.current;
      wake();
    };

    const draw = (now: number) => {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      const started = performance.now();
      const delta = previousTime ? Math.min(40, now - previousTime) : 16;
      previousTime = now;
      if (!reducedMotion) clock += delta / 1000;
      const target = reducedMotion ? .3 : progressRef.current;
      visual = reducedMotion || Math.abs(target - visual) < .0001 ? target : mix(visual, target, 1 - Math.exp(-delta / 65));
      const form = smooth((visual - .035) / .185);
      const scatter = smooth((visual - .38) / .2);
      const fade = 1 - smooth((visual - .58) / .13);
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < glyphs.length; i++) {
        const g = glyphs[i];
        const float = reducedMotion ? 0 : Math.sin(clock * .2 + g.phase);
        const drift = (1 - form) * 12 + form * 1.4;
        let x = mix(mix(g.start.x, g.anchor.x, form), g.away.x, scatter) + float * drift;
        let y = mix(mix(g.start.y, g.anchor.y, form), g.away.y, scatter) + Math.cos(clock * .17 + g.phase) * drift;
        // Bounded cursor swirl; no layout reads or text shaping in the frame loop.
        const dx = x - pointer.x, dy = y - pointer.y, distance = Math.hypot(dx, dy);
        if (!reducedMotion && distance < 110 && distance > 0) {
          const push = smooth(1 - distance / 110) * 8;
          x += (dx - dy * .35) / distance * push; y += (dy + dx * .35) / distance * push;
        }
        if (x < -30 || y < -30 || x > w + 30 || y > h + 30) continue;
        const life = reducedMotion ? 1 : .78 + .22 * Math.sin(clock * Math.PI / 15 + g.phase);
        ctx.globalAlpha = g.alpha * mix(.18, 1, form) * fade * life;
        const size = g.size * cell / 22;
        ctx.drawImage(atlas, g.sprite * cell * 2, 0, cell * 2, cell * 2, x - size / 2, y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      canvas.dataset.motionState = reducedMotion ? "static" : fade <= 0 ? "settled" : "running";
      canvas.dataset.progress = visual.toFixed(4);
      // Bounded local diagnostics for browser QA; no network or persistent telemetry.
      stats.push(performance.now() - started); if (stats.length > 120) stats.shift();
      if (stats.length % 30 === 0) canvas.dataset.drawMs = (stats.reduce((a, b) => a + b, 0) / stats.length).toFixed(2);
      if (!reducedMotion && (fade > 0 || visual !== target)) frame = requestAnimationFrame(draw);
    };
    function wake() {
      if (!disposed && visible && !document.hidden && !frame && glyphs.length) frame = requestAnimationFrame(draw);
    }
    const pause = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0; previousTime = 0; canvas.dataset.motionState = "paused";
    };
    const onVisibility = () => { if (document.hidden) pause(); else wake(); };
    function onChapterScroll() {
      progressRef.current = clamp((window.innerHeight - chapterTop + window.scrollY) / (window.innerHeight + chapterHeight)) * .65;
      wake();
    }
    const move = (e: PointerEvent) => { pointer = { x: e.clientX - bounds.left, y: e.clientY - bounds.top }; };
    const leave = () => { pointer = { x: -9999, y: -9999 }; };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) { bounds = canvas.getBoundingClientRect(); visual = progressRef.current; wake(); } else pause();
    });
    observer.observe(canvas);
    const resizeObserver = new ResizeObserver(rebuild); resizeObserver.observe(canvas);
    wakeRef.current = wake;
    rebuild();
    document.fonts.ready.then(() => { if (!disposed) { glyphs = []; rebuild(); } });
    document.addEventListener("visibilitychange", onVisibility);
    if (chapter) window.addEventListener("scroll", onChapterScroll, { passive: true });
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (finePointer && !reducedMotion) {
      window.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerleave", leave);
    }
    return () => {
      disposed = true; pause(); wakeRef.current = () => {};
      observer.disconnect(); resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onChapterScroll);
      window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave);
    };
  }, [reducedMotion, chapter]);
  return <canvas ref={canvasRef} className={chapter ? "koa-chapter-glyph-field" : "koa-ka-glyph-field"} aria-hidden="true" />;
}
export default KAGlyphField;
