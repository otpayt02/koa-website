"use client";

import { useEffect, useRef } from "react";
import type { Lang } from "./i18n";

const GLYPHS: Record<Lang, string[]> = {
  en: ["က", "ည", "တ", "န", "ပ", "ဖ", "မ", "ယ", "ရ", "လ", "ဝ", "သ", "ဟ", "အ"],
  ksw: ["က", "ည", "တ", "န", "ပ", "ဖ", "မ", "ယ", "ရ", "လ", "ဝ", "သ", "ဟ", "အ", "ၢ", "ၤ", "့"],
  my: ["ခ", "ဂ", "င", "စ", "ဆ", "ဇ", "ဈ", "ဉ", "ဌ", "ဍ", "ဎ", "ဏ", "ထ", "ဒ", "ဓ", "ဗ", "ဘ", "ဠ"],
  th: ["ก", "ข", "ค", "ง", "จ", "ฉ", "ช", "ญ", "ด", "ต", "ถ", "ท", "น", "บ", "ป", "ผ", "ฝ", "พ", "ฟ", "ม", "ย", "ร", "ล", "ว", "ส", "ห", "อ"],
};
type Mote = { x: number; y: number; vx: number; vy: number; glyph: string; size: number; depth: number; age: number; life: number; driftX: number; driftY: number };

/** Karen-glyph dust travels in slow straight lines with long, staggered fade cycles. */
export function AtticDust({ lang, reducedMotion }: { lang: Lang; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const pointer = { x: -1000, y: -1000, vx: 0, vy: 0, at: 0 };
    let width = 1;
    let height = 1;
    let motes: Mote[] = [];
    let frame = 0;
    let previous = 0;

    const makeMote = (stagger = false): Mote => {
      const depth = .55 + Math.random() * 1.2;
      const angle = Math.random() * Math.PI * 2;
      const speed = (2 + Math.random() * 4) * depth;
      const life = 28 + Math.random() * 22;
      return {
        x: Math.random() * width, y: Math.random() * height,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        glyph: GLYPHS[lang][Math.floor(Math.random() * GLYPHS[lang].length)],
        size: 5 + Math.random() * 6 * depth, depth,
        age: stagger ? Math.random() * life : 0, life,
        driftX: 0, driftY: 0,
      };
    };
    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      motes = Array.from({ length: Math.min(120, Math.max(60, Math.round(width * .09))) }, () => makeMote(true));
    };
    const move = (event: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(12, now - pointer.at);
      pointer.vx = pointer.at ? Math.max(-2, Math.min(2, (event.clientX - pointer.x) / dt)) : 0;
      pointer.vy = pointer.at ? Math.max(-2, Math.min(2, (event.clientY - pointer.y) / dt)) : 0;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.at = now;
    };
    const draw = (now: number) => {
      frame = 0;
      if (document.hidden) return;
      const dt = Math.min(.05, previous ? (now - previous) / 1000 : .016);
      previous = now;
      context.clearRect(0, 0, width, height);
      context.textBaseline = "top";
      for (let index = 0; index < motes.length; index++) {
        const mote = motes[index];
        if (!reducedMotion) {
          mote.age += dt;
          mote.x += mote.vx * dt;
          mote.y += mote.vy * dt;
          if (mote.age >= mote.life) { motes[index] = makeMote(); continue; }
          const distance = Math.hypot(mote.x - pointer.x, mote.y - pointer.y);
          if (now - pointer.at < 320 && distance < 115) {
            const flow = (1 - distance / 115) ** 2 * mote.depth;
            mote.driftX += pointer.vx * flow * .4;
            mote.driftY += pointer.vy * flow * .4;
          }
          mote.driftX *= .985;
          mote.driftY *= .985;
        }
        // Long fade-in, visible middle, and long fade-out avoid sudden arrivals.
        const fade = Math.min(1, mote.age / 9, (mote.life - mote.age) / 9);
        context.globalAlpha = Math.max(0, fade) * .65 * Math.min(1, mote.depth);
        context.fillStyle = mote.depth > 1.15 ? "#f5e6c8" : "#a9bdd6";
        context.font = `${mote.size}px ${lang === "th" ? '"Noto Sans Thai"' : '"Noto Sans Myanmar"'}, sans-serif`;
        context.fillText(mote.glyph, mote.x + mote.driftX, mote.y + mote.driftY);
      }
      context.globalAlpha = 1;
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };
    const wake = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(draw); };
    resize();
    wake();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", wake);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [lang, reducedMotion]);

  return <canvas ref={canvasRef} className="site-atmosphere__dust" aria-hidden="true" />;
}
