"use client";

import { useEffect, useRef } from "react";
import { SGAW_GLYPH_STRING } from "../../lib/cinema/glyph-config";

/**
 * AmbientGlyphField — persistent, barely-visible Burmese glyphs
 * floating across the entire app in different depth layers.
 * Each glyph drifts slowly, fading in and out of view independently.
 */

const GLYPHS = SGAW_GLYPH_STRING;

interface DriftGlyph {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  size: number;
  opacity: number;
  fadeSpeed: number;
  fadePhase: number;
  maxOpacity: number;
  depth: number;
  blur: number;
}

function seededRandom(seed: number) {
  let v = Math.imul(seed + 1, 374761393) ^ Math.imul(seed + 2, 668265263);
  v = Math.imul(v ^ (v >>> 13), 1274126177);
  return ((v ^ (v >>> 16)) >>> 0) / 4294967296;
}

function createDriftGlyph(index: number, width: number, height: number): DriftGlyph {
  const depth = 0.08 + seededRandom(index * 7) * 0.92;
  return {
    x: seededRandom(index * 3) * width,
    y: seededRandom(index * 3 + 1) * height,
    vx: (seededRandom(index * 5) - 0.5) * 0.11 * depth,
    vy: (seededRandom(index * 5 + 1) - 0.42) * 0.085 * depth,
    char: GLYPHS[Math.floor(seededRandom(index * 11) * GLYPHS.length)],
    size: (3 + seededRandom(index * 9) * 10) * (0.45 + depth * 0.55),
    opacity: 0,
    fadeSpeed: 0.00008 + seededRandom(index * 13) * 0.0004,
    fadePhase: seededRandom(index * 15) * Math.PI * 2,
    maxOpacity: 0.018 + depth * 0.058,
    depth,
    blur: seededRandom(index * 17) * 1.8,
  };
}

export function AmbientGlyphField({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lowPower = window.matchMedia("(prefers-reduced-data: reduce)").matches
      || (navigator.hardwareConcurrency || 8) <= 4;
    const motionOff = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frameInterval = lowPower ? 1000 / 30 : 1000 / 60;
    let lastPaint = 0;
    let visible = true;

    let width = 1;
    let height = 1;
    let frame = 0;
    let lastTime = performance.now();
    let glyphs: DriftGlyph[] = [];
    const cursor = { x: -1000, y: -1000, active: false };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = 1; // Cap at 1x for performance
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = motionOff ? 42 : width < 720 ? 110 : width < 1200 ? 170 : 230;
      glyphs = Array.from({ length: count }, (_, i) => createDriftGlyph(i, width, height));
    };

    const draw = (now: number) => {
      if (!visible || document.hidden) {
        frame = 0;
        return;
      }
      if (now - lastPaint < frameInterval) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastPaint = now;
      const delta = Math.min(48, Math.max(1, now - lastTime));
      lastTime = now;
      ctx.clearRect(0, 0, width, height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const g of glyphs) {
        // Gentle sinusoidal fade cycle
        g.fadePhase += g.fadeSpeed * delta;
        const fadeCycle = (Math.sin(g.fadePhase) + 1) * 0.5;
        const cursorDistance = Math.hypot(g.x - cursor.x, g.y - cursor.y);
        const cursorLift = cursor.active && cursorDistance < 190 ? Math.pow(1 - cursorDistance / 190, 2) * 0.18 : 0;
        g.opacity = g.maxOpacity * fadeCycle + cursorLift;

        // Drift movement
        g.x += g.vx * (delta / 16);
        g.y += g.vy * (delta / 16);

        // Wrap around viewport with margin
        const margin = 60;
        if (g.x < -margin) g.x = width + margin;
        else if (g.x > width + margin) g.x = -margin;
        if (g.y < -margin) g.y = height + margin;
        else if (g.y > height + margin) g.y = -margin;

        if (g.opacity < 0.003) continue;

        ctx.globalAlpha = g.opacity;
        ctx.shadowBlur = g.blur;
        ctx.shadowColor = "#f4d77a";
        ctx.font = `${g.size}px "Noto Sans Myanmar", sans-serif`;
        ctx.fillStyle = "#d4c8b8";
        ctx.fillText(g.char, g.x, g.y);
      }

      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    resize();
    if (motionOff) {
      ctx.clearRect(0, 0, width, height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const glyph of glyphs) {
        ctx.globalAlpha = 0.018;
        ctx.font = `${Math.max(7, glyph.size)}px "Noto Sans Myanmar", sans-serif`;
        ctx.fillStyle = "#d4c8b8";
        ctx.fillText(glyph.char, glyph.x, glyph.y);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      canvas.dataset.motionState = "static";
      return;
    }
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(draw);
    }, { threshold: 0 });
    visibilityObserver.observe(canvas);
    const onVisibilityChange = () => {
      if (!document.hidden && visible && !frame) frame = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("resize", resize);
    const onPointerMove = (event: PointerEvent) => { cursor.x = event.clientX; cursor.y = event.clientY; cursor.active = true; };
    const onPointerLeave = () => { cursor.active = false; };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    frame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      visibilityObserver.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="ambient-glyph-field"
      aria-hidden="true"
    />
  );
}

export default AmbientGlyphField;
