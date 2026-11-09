"use client";

import { useEffect, useRef } from "react";
import type { Lang } from "./i18n";
import { scrollKinetics } from "./scrollKinetics";
import { atmosphereInk } from "./atmosphereInk";

const GLYPHS: Record<Lang, string[]> = {
  en: ["က", "ခ", "ဂ", "ဃ", "င", "စ", "ဆ", "ဇ", "ည", "တ", "ထ", "ဒ", "န", "ပ", "ဖ", "ဘ", "မ", "ယ", "ရ", "လ", "ဝ", "သ", "ဟ", "အ", "ၡ", "အၢ", "အၣ", "အၤ"],
  ksw: ["က", "ခ", "ဂ", "ဃ", "င", "စ", "ဆ", "ဇ", "ည", "တ", "ထ", "ဒ", "န", "ပ", "ဖ", "ဘ", "မ", "ယ", "ရ", "လ", "ဝ", "သ", "ဟ", "အ", "ၡ", "အၢ", "အၣ", "အၤ"],
  my: ["ခ", "ဂ", "င", "စ", "ဆ", "ဇ", "ဈ", "ဉ", "ဌ", "ဍ", "ဎ", "ဏ", "ထ", "ဒ", "ဓ", "ဗ", "ဘ", "ဠ"],
  th: ["ก", "ข", "ค", "ง", "จ", "ฉ", "ช", "ญ", "ด", "ต", "ถ", "ท", "น", "บ", "ป", "ผ", "ฝ", "พ", "ฟ", "ม", "ย", "ร", "ล", "ว", "ส", "ห", "อ"],
};
type Mote = { x: number; y: number; vx: number; vy: number; glyph: string; size: number; depth: number; age: number; life: number; driftX: number; driftY: number };

/** Language-specific glyph motes move on long paths and use the numeral ink palette. */
export function AtticDust({ lang, reducedMotion }: { lang: Lang; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const staticMotion = new URLSearchParams(window.location.search).get("motion") === "off";
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const field = canvas.parentElement;
    const pointer = { x: -1000, y: -1000, vx: 0, vy: 0, at: 0 };
    let width = 1;
    let height = 1;
    let motes: Mote[] = [];
    let frame = 0;
    let previous = 0;
    let lastDraw = 0;
    let visible = true;

    const makeMote = (stagger = false): Mote => {
      const depth = .55 + Math.random() * 1.2;
      const angle = Math.random() * Math.PI * 2;
      const speed = (3.4 + Math.random() * 6.2) * depth;
      const life = 28 + Math.random() * 22;
      return {
        x: Math.random() * width, y: Math.random() * height,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        glyph: GLYPHS[lang][Math.floor(Math.random() * GLYPHS[lang].length)],
        size: 10 + Math.random() * 7 * depth, depth,
        age: stagger ? Math.random() * life : 0, life,
        driftX: 0, driftY: 0,
      };
    };
    const resize = () => {
      const bounds = canvas.parentElement?.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds?.width ?? window.innerWidth));
      height = Math.max(1, Math.round(bounds?.height ?? window.innerHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Seventy percent of the previous field, with a larger minimum glyph size.
      motes = Array.from({ length: Math.round(Math.min(360, Math.max(170, Math.round(width * height / 3200))) * .35) }, () => makeMote(true));
    };
    const move = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - (bounds?.left ?? 0);
      const y = event.clientY - (bounds?.top ?? 0);
      const now = performance.now();
      const dt = Math.max(12, now - pointer.at);
      pointer.vx = pointer.at ? Math.max(-2, Math.min(2, (x - pointer.x) / dt)) : 0;
      pointer.vy = pointer.at ? Math.max(-2, Math.min(2, (y - pointer.y) / dt)) : 0;
      pointer.x = x;
      pointer.y = y;
      pointer.at = now;
    };
    const draw = (now: number) => {
      frame = 0;
      if (document.hidden || !visible) return;
      if (now - lastDraw < (reducedMotion ? 64 : 30)) { frame = requestAnimationFrame(draw); return; }
      lastDraw = now;
      const dt = Math.min(.05, previous ? (now - previous) / 1000 : .016);
      previous = now;
      context.clearRect(0, 0, width, height);
      context.textBaseline = "top";
      for (let index = 0; index < motes.length; index++) {
        const mote = motes[index];
        // Reduced motion keeps a slower living field; only pointer disturbance is removed.
        mote.age += staticMotion ? 0 : dt * (reducedMotion ? .6 : 1);
        const wind = reducedMotion || staticMotion ? 0 : Math.tanh(scrollKinetics.velocity / 1100);
        // Birth vectors create different directions; a shared eased current adds depth without randomness per frame.
        const phase = index * 2.399963 + mote.depth;
        mote.x += staticMotion ? 0 : (mote.vx + wind * Math.sin(phase) * 85 * mote.depth) * dt * (reducedMotion ? .55 : 1);
        mote.y += staticMotion ? 0 : (mote.vy + wind * Math.cos(phase) * 65 * mote.depth) * dt * (reducedMotion ? .55 : 1);
        if (mote.x < -30) mote.x = width + 20;
        if (mote.x > width + 30) mote.x = -20;
        if (mote.y < -30) mote.y = height + 20;
        if (mote.y > height + 30) mote.y = -20;
        if (mote.age >= mote.life) { motes[index] = makeMote(); continue; }
        if (!reducedMotion) {
          const distance = Math.hypot(mote.x - pointer.x, mote.y - pointer.y);
          if (now - pointer.at < 320 && distance < 115) {
            const flow = (1 - distance / 115) ** 2 * mote.depth;
            mote.driftX += pointer.vx * flow * .4;
            mote.driftY += pointer.vy * flow * .4;
          }
          mote.driftX *= Math.exp(-.9 * dt);
          mote.driftY *= Math.exp(-.9 * dt);
        }
        // Long fade-in, visible middle, and long fade-out avoid sudden arrivals.
        const fade = Math.min(1, mote.age / 9, (mote.life - mote.age) / 9);
        context.globalAlpha = Math.max(0, fade) * Math.min(.52, .12 + mote.depth * .22);
        context.fillStyle = mote.depth > 1.15 ? atmosphereInk.rose : atmosphereInk.ice;
        context.shadowBlur = mote.depth > 1.15 ? 5 : 2;
        context.shadowColor = mote.depth > 1.15 ? "rgba(232,194,217,.38)" : "rgba(185,224,238,.3)";
        context.font = `${mote.size}px ${lang === "th" ? '"Noto Sans Thai"' : '"Noto Sans Myanmar"'}, sans-serif`;
        context.fillText(mote.glyph, mote.x + mote.driftX, mote.y + mote.driftY);
      }
      context.globalAlpha = 1;
      context.shadowBlur = 0;
      if (!staticMotion) frame = requestAnimationFrame(draw);
    };
    const wake = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(draw); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); }, { threshold: 0 });
    const sizeObserver = new ResizeObserver(resize);
    resize();
    wake();
    if (field) observer.observe(field);
    if (canvas.parentElement) sizeObserver.observe(canvas.parentElement);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", wake);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      sizeObserver.disconnect();
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [lang, reducedMotion]);

  return <canvas ref={canvasRef} data-mote-density="0.7" data-mote-min-size="10" className="site-atmosphere__dust" aria-hidden="true" />;
}
