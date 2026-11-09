"use client";

import { useEffect, useRef } from "react";
import type { Lang } from "./i18n";

const GLYPHS: Record<Lang, string[]> = {
  en: ["က", "ည", "တ", "ထ", "န", "ပ", "ဖ", "မ", "ယ", "ရ", "လ", "ဝ", "သ", "ဟ", "အ", "ီ", "ၢ", "ၤ", "့", "း"],
  ksw: ["က", "ည", "တ", "န", "ပ", "ဖ", "မ", "ယ", "ရ", "လ", "ဝ", "သ", "ဟ", "အ", "ၢ", "ၤ", "့"],
  my: ["ခ", "ဂ", "င", "စ", "ဆ", "ဇ", "ဈ", "ဉ", "ဌ", "ဍ", "ဎ", "ဏ", "ထ", "ဒ", "ဓ", "ဗ", "ဘ", "ဠ"],
  th: ["ก", "ข", "ค", "ง", "จ", "ฉ", "ช", "ญ", "ด", "ต", "ถ", "ท", "น", "บ", "ป", "ผ", "ฝ", "พ", "ฟ", "ม", "ย", "ร", "ล", "ว", "ส", "ห", "อ"],
};
type Pulse = { x: number; y: number; start: number; reach: number; life: number };
type Mutation = { glyph: string; until: number };

/** Dense fixed glyphs: pointer speed changes glyph identities, never their positions. */
export function DenseGlyphGrid({ lang, reducedMotion }: { lang: Lang; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;
    const base = document.createElement("canvas");
    const baseContext = base.getContext("2d");
    if (!baseContext) return;
    const cell = 12;
    const mutations = new Map<number, Mutation>();
    const pulses: Pulse[] = [];
    const pointer = { x: -1000, y: -1000, speed: 0, lastX: -1000, lastY: -1000, at: 0, active: false };
    let width = 1;
    let height = 1;
    let cols = 1;
    let rows = 1;
    let frame = 0;
    let lastDraw = 0;
    let lastPulse = 0;

    const glyphs = GLYPHS[lang];
    const font = lang === "th" ? '"Noto Sans Thai"' : '"Noto Sans Myanmar"';
    const randomGlyph = () => glyphs[Math.floor(Math.random() * glyphs.length)];
    const changeAt = (x: number, y: number, now: number) => {
      const col = Math.floor(x / cell);
      const row = Math.floor(y / cell);
      if (col < 0 || row < 0 || col >= cols || row >= rows) return;
      mutations.set(row * cols + col, { glyph: randomGlyph(), until: now + 430 + Math.random() * 500 });
      if (mutations.size > 900) {
        const oldest = mutations.keys().next().value;
        if (oldest !== undefined) mutations.delete(oldest);
      }
    };
    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      cols = Math.ceil(width / cell);
      rows = Math.ceil(height / cell);
      // A one-time raster keeps tens of thousands of tiny glyphs cheap to repaint.
      canvas.width = base.width = width;
      canvas.height = base.height = height;
      baseContext.clearRect(0, 0, width, height);
      baseContext.font = `10.8px ${font}, sans-serif`;
      baseContext.textBaseline = "top";
      baseContext.fillStyle = "rgba(151, 191, 232, .2)";
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const index = (row * 13 + col * 17 + (row * col) % 29) % glyphs.length;
          baseContext.fillText(glyphs[index], col * cell, row * cell);
        }
      }
      mutations.clear();
    };
    const move = (event: PointerEvent) => {
      const now = performance.now();
      const elapsed = Math.max(12, now - pointer.at);
      const distance = Math.hypot(event.clientX - pointer.lastX, event.clientY - pointer.lastY);
      pointer.speed = Math.min(2, distance / elapsed);
      // Fill the travelled segment immediately so a fast cursor never outruns the glyph response.
      if (!reducedMotion && pointer.active) {
        const steps = Math.min(6, Math.ceil(distance / 16));
        for (let step = 1; step <= steps; step++) {
          const t = step / steps;
          changeAt(pointer.lastX + (event.clientX - pointer.lastX) * t,
            pointer.lastY + (event.clientY - pointer.lastY) * t, now);
        }
      }
      pointer.x = pointer.lastX = event.clientX;
      pointer.y = pointer.lastY = event.clientY;
      pointer.at = now;
      pointer.active = true;
      if (!reducedMotion && pointer.speed > .1 && now - lastPulse > 30) {
        pulses.push({ x: pointer.x, y: pointer.y, start: now - 22, reach: 18 + pointer.speed * 25, life: 220 });
        if (pulses.length > 12) pulses.shift();
        lastPulse = now;
      }
    };
    const click = (event: PointerEvent) => {
      if (!reducedMotion) {
        const now = performance.now();
        pulses.push({ x: event.clientX, y: event.clientY, start: now - 18, reach: 76, life: 320 });
        pulses.push({ x: event.clientX, y: event.clientY, start: now + 58, reach: 53, life: 310 });
        changeAt(event.clientX, event.clientY, now);
      }
    };
    const leave = () => { pointer.active = false; pointer.speed = 0; };

    const draw = (now: number) => {
      frame = 0;
      if (document.hidden) return;
      if (!reducedMotion && now - lastDraw < 32) { frame = requestAnimationFrame(draw); return; }
      lastDraw = now;
      context.clearRect(0, 0, width, height);
      context.drawImage(base, 0, 0);
      if (!reducedMotion) {
        const speed = pointer.active && now - pointer.at < 110 ? pointer.speed : 0;
        const count = 1 + Math.round(Math.min(12, speed * 7));
        for (let index = 0; index < count; index++) {
          const nearPointer = pointer.active && Math.random() < .78;
          const spread = 24 + speed * 34;
          const x = nearPointer ? pointer.x + (Math.random() - .5) * spread : Math.random() * width;
          const y = nearPointer ? pointer.y + (Math.random() - .5) * spread : Math.random() * height;
          changeAt(x, y, now);
        }
        for (let index = pulses.length - 1; index >= 0; index--) {
          const pulse = pulses[index];
          const progress = (now - pulse.start) / pulse.life;
          if (progress >= 1) { pulses.splice(index, 1); continue; }
          if (progress < 0) continue;
          const radius = progress * pulse.reach;
          const samples = pulse.reach > 60 ? 42 : 26;
          for (let sample = 0; sample < samples; sample++) {
            const angle = sample / samples * Math.PI * 2;
            // Small phase offsets make the substitution wave feel fluid without moving a glyph.
            const liquidRadius = radius + Math.sin(angle * 5 - progress * 13) * Math.min(5, pulse.reach * .08);
            changeAt(pulse.x + Math.cos(angle) * liquidRadius, pulse.y + Math.sin(angle) * liquidRadius, now);
          }
        }
      }
      context.font = `10.8px ${font}, sans-serif`;
      context.textBaseline = "top";
      context.fillStyle = "rgba(151, 191, 232, .2)";
      for (const [index, mutation] of mutations) {
        if (mutation.until < now) { mutations.delete(index); continue; }
        const x = (index % cols) * cell;
        const y = Math.floor(index / cols) * cell;
        context.clearRect(x, y, cell, cell);
        context.fillText(mutation.glyph, x, y);
      }
      // Ripple and trail are visible only as same-color glyph substitutions.
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };

    const wake = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(draw); };
    resize();
    wake();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", click, { passive: true });
    window.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", wake);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", click);
      window.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [lang, reducedMotion]);

  return <canvas ref={canvasRef} className="site-atmosphere__dither" aria-hidden="true" />;
}
