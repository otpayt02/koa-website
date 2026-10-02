"use client";

import { useEffect, useRef } from "react";
import { SGAW_GLYPH_STRING } from "../../lib/cinema/glyph-config";

const GLYPHS = SGAW_GLYPH_STRING;

interface HaloParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  size: number;
  opacity: number;
  blur: number;
  age: number;
  maxAge: number;
  seed: number;
}

const SPAWN_RADIUS_MIN = 8;
const SPAWN_RADIUS_MAX = 30;
const GLYPH_COUNT_MIN = 3;
const GLYPH_COUNT_MAX = 5;
const CLICK_GLYPH_COUNT_MIN = 7;
const CLICK_GLYPH_COUNT_MAX = 11;
const FADE_DURATION_MS = 680;
const BLUR_MAX = 6;
const DRIFT_SPEED = 0.62;
const SPAWN_THROTTLE_MS = 46;

export function CursorGlyphHalo({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 1;
    let height = 1;
    let frame = 0;
    let lastTime = performance.now();
    let pointerX = -9999;
    let pointerY = -9999;
    let previousPointerX = pointerX;
    let previousPointerY = pointerY;
    let lastSpawn = 0;
    let lastPointerMove = 0;
    let idle = true;
    const particles: HaloParticle[] = [];
    const lowPower = window.matchMedia("(prefers-reduced-data: reduce)").matches
      || (navigator.hardwareConcurrency || 8) <= 4;
    const frameInterval = lowPower ? 1000 / 30 : 1000 / 60;
    let lastPaint = 0;

    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (now: number, burst = false) => {
      if (now - lastSpawn < SPAWN_THROTTLE_MS) return;
      lastSpawn = now;

      const min = burst ? CLICK_GLYPH_COUNT_MIN : GLYPH_COUNT_MIN;
      const max = burst ? CLICK_GLYPH_COUNT_MAX : GLYPH_COUNT_MAX;
      const count = min + Math.floor(Math.random() * (max - min + 1));
      const deltaX = pointerX - previousPointerX;
      const deltaY = pointerY - previousPointerY;
      const direction = Math.hypot(deltaX, deltaY) || 1;
      const trailX = deltaX / direction;
      const trailY = deltaY / direction;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const radius = (burst ? 14 : SPAWN_RADIUS_MIN) + Math.random() * ((burst ? 46 : SPAWN_RADIUS_MAX) - (burst ? 14 : SPAWN_RADIUS_MIN));
        const trailing = burst ? 0 : 12 + Math.random() * 18;
        const px = pointerX - trailX * trailing + Math.cos(angle) * radius;
        const py = pointerY - trailY * trailing + Math.sin(angle) * radius;
        const drift = (Math.random() * 0.45 + 0.35) * DRIFT_SPEED * (burst ? 1.8 : 1);

        particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * drift,
          vy: Math.sin(angle) * drift,
          char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          size: 10 + Math.random() * 12,
          opacity: 0.4 + Math.random() * 0.3,
          blur: 0,
          age: 0,
          maxAge: FADE_DURATION_MS,
          seed: Math.random(),
        });
      }

      // Cap particles to prevent memory growth
      while (particles.length > (lowPower ? 64 : 120)) particles.shift();
    };

    const pointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      lastPointerMove = performance.now();
      if (idle) {
        idle = false;
        lastTime = performance.now();
        frame = requestAnimationFrame(draw);
      }
      spawn(performance.now());
      previousPointerX = pointerX;
      previousPointerY = pointerY;
    };

    const pointerDown = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      lastPointerMove = performance.now();
      if (idle) {
        idle = false;
        lastTime = performance.now();
        frame = requestAnimationFrame(draw);
      }
      spawn(performance.now(), true);
    };

    const draw = (now: number) => {
      const delta = Math.min(48, Math.max(1, now - lastTime));
      lastTime = now;

      if (now - lastPaint < frameInterval) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastPaint = now;

      ctx.clearRect(0, 0, width, height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += delta;

        if (p.age >= p.maxAge) {
          particles.splice(i, 1);
          continue;
        }

        const life = p.age / p.maxAge;
        p.x += p.vx;
        p.y += p.vy;
        p.opacity = (0.42 + p.seed * 0.12) * (1 - life);
        p.blur = life * BLUR_MAX;

        if (p.opacity < 0.01) continue;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        if (p.blur > 0.5) {
          ctx.filter = `blur(${p.blur.toFixed(1)}px)`;
        }
        ctx.font = `${p.size}px "Noto Sans Myanmar", sans-serif`;
        ctx.fillStyle = "#d4c8b8";
        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();
      }

      // Idle detection: stop rAF when no particles and pointer hasn't moved recently
      if (particles.length === 0 && now - lastPointerMove > 500) {
        idle = true;
        return; // Don't schedule next frame
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener("pointermove", pointerMove, { passive: true });
    window.addEventListener("pointerdown", pointerDown, { passive: true });
    // Don't start rAF immediately — wait for pointer movement

    return () => {
      window.removeEventListener("resize", resize);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerdown", pointerDown);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="cinematic-film__cursor-halo"
      aria-hidden="true"
    />
  );
}

export default CursorGlyphHalo;
