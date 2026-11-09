'use client';

import { useEffect, useRef } from 'react';

// The cursor bends and substitutes local characters; variable motes fade on staggered cycles.
// Ambient motion pauses outside the viewport; the separate K/A field owns the mark.
const GLYPHS = ['က','ခ','ဂ','င','စ','ဆ','ည','တ','ထ','ဒ','န','ပ','ဖ','ဘ','မ','ယ','ရ','လ','ဝ','သ','ဟ','အ','ြ','ွ','ူ','ဲ','့','း','်','၀','၁','၂','၃','၄','၅','၆','၇','၈','၉','။'];
type Mote = { x: number; y: number; vx: number; vy: number; seed: number; pulseSpeed: number; size: number; opacity: number; char: number; tone: string; sprite?: HTMLCanvasElement };

export default function KarenGlyphField({ reducedMotion = false }: { mode?: 'idle' | 'convergence'; reducedMotion?: boolean; progress?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    let width = 1;
    let height = 1;
    let frame = 0;
    let previous = 0;
    let visible = true;
    let motes: Mote[] = [];
    const glyphSprites = new Map<string, HTMLCanvasElement>();
    const pointer = { x: -1000, y: -1000, active: false };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      motes = Array.from({ length: Math.min(420, Math.max(150, Math.round(width * .31))) }, (_, index) => {
        const toneRoll = Math.random();
        return {
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - .5) * 52, vy: (Math.random() - .5) * 46,
        seed: index * 2.399 + Math.random(), pulseSpeed: 0.55 + Math.random() * 1.35,
        size: 7 + Math.random() * 10, opacity: .045 + Math.random() * .11,
        char: Math.floor(Math.random() * GLYPHS.length),
        tone: toneRoll > .91 ? '#dc4b4f' : toneRoll > .7 ? '#f5efe4' : '#d4a843',
      };
      });
      const createSprite = (char: number, tone: string) => {
        const key = `${char}:${tone}`;
        let sprite = glyphSprites.get(key);
        if (!sprite) {
          sprite = document.createElement('canvas');
          sprite.width = 72;
          sprite.height = 72;
          const ink = sprite.getContext('2d');
          if (ink) {
            ink.textAlign = 'center';
            ink.textBaseline = 'middle';
            ink.font = '54px "Noto Sans Myanmar", sans-serif';
            ink.fillStyle = tone;
            ink.fillText(GLYPHS[char], 36, 36, 54);
          }
          glyphSprites.set(key, sprite);
        }
        return sprite;
      };
      // Pre-rasterize every pointer substitution so mouse movement adds no text work per frame.
      for (const tone of ['#d4a843', '#f5efe4', '#dc4b4f']) {
        for (let char = 0; char < GLYPHS.length; char += 1) createSprite(char, tone);
      }
      for (const mote of motes) mote.sprite = createSprite(mote.char, mote.tone);
      if (reducedMotion) draw(performance.now());
    };
    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const leave = () => { pointer.active = false; };
    const draw = (now: number) => {
      frame = 0;
      const dt = Math.min(.05, previous ? (now - previous) / 1000 : .016);
      previous = now;
      context.clearRect(0, 0, width, height);
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      for (const mote of motes) {
        if (!reducedMotion) {
          mote.x += mote.vx * dt;
          mote.y += mote.vy * dt;
          if (mote.x < -30) mote.x = width + 30;
          if (mote.x > width + 30) mote.x = -30;
          if (mote.y < -30) mote.y = height + 30;
          if (mote.y > height + 30) mote.y = -30;
        }
        const dx = mote.x - pointer.x;
        const dy = mote.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const within = pointer.active && !reducedMotion && distance < 115;
        const wave = within ? Math.sin(distance * .085 - now * .006 + mote.seed) : 0;
        const charIndex = within && wave > .12 ? (mote.char + 7) % GLYPHS.length : mote.char;
        const displacement = within ? wave * (1 - distance / 115) * 7 : 0;
        const pulse = (0.5 + 0.5 * Math.sin(now * .001 * mote.pulseSpeed + mote.seed)) ** 1.4;
        context.globalAlpha = mote.opacity * (0.24 + pulse * 0.76);
        const sprite = charIndex === mote.char ? mote.sprite : glyphSprites.get(`${charIndex}:${mote.tone}`);
        context.drawImage(sprite ?? mote.sprite!, mote.x + displacement - mote.size * .65, mote.y - displacement * .4 - mote.size * .65, mote.size * 1.3, mote.size * 1.3);
      }
      context.globalAlpha = 1;
      if (!reducedMotion && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const wake = () => { if (!reducedMotion && visible && !document.hidden && !frame) frame = requestAnimationFrame(draw); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); }, { threshold: .01 });
    const sizeObserver = new ResizeObserver(resize);
    resize();
    observer.observe(canvas);
    sizeObserver.observe(canvas);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', wake);
    wake();
    return () => {
      observer.disconnect(); sizeObserver.disconnect();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', wake);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);
  return <canvas ref={canvasRef} className="karen-glyph-field fixed inset-0 pointer-events-none z-0" aria-hidden="true" />;
}
