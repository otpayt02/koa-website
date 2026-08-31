"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SGAW_GLYPH_STRING } from "../../lib/cinema/glyph-config";

/* ── Pathname → tab number → Burmese digit ─────────────────────── */
const PATH_TO_NUMERAL: Record<string, string> = {
  "/": "\u1041",        // ၁ (tab 1)
  "/community": "\u1042",   // ၂
  "/dictionary": "\u1043",  // ၃
  "/services": "\u1044",    // ၄
  "/contribute": "\u1045",  // ၅
  "/events": "\u1046",      // ၆
  "/translation": "\u1047", // ၇
  "/culture": "\u1048",     // ၈
  "/history": "\u1049",     // ၉
  "/ai": "\u1040",          // ၀ (tab 10)
};

const GLYPHS = SGAW_GLYPH_STRING;
const ANIM_DURATION = 5000;
const HOLD_DURATION = 2000;
const FADE_DURATION = 1500;
const TOTAL_DURATION = ANIM_DURATION + HOLD_DURATION + FADE_DURATION;
const MAX_PARTICLES = 300;

/**
 * Render a Burmese digit to an offscreen canvas and sample opaque pixels.
 * Returns normalized target coordinates (0-1) for particle convergence.
 */
function sampleTargets(digit: string, cw: number, ch: number): Array<{ x: number; y: number }> {
  const offscreen = document.createElement("canvas");
  offscreen.width = cw;
  // Render area: top 60% of viewport (above the fold, below the banner)
  const renderH = Math.round(ch * 0.6);
  offscreen.height = renderH;
  const offCtx = offscreen.getContext("2d");
  if (!offCtx) return [];

  const fontSize = Math.min(renderH * 0.85, cw * 0.5);
  offCtx.fillStyle = "#fff";
  offCtx.font = `bold ${fontSize}px "Noto Sans Myanmar", "Myanmar Text", "Padauk", sans-serif`;
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";
  offCtx.fillText(digit, cw / 2, renderH / 2);

  const imageData = offCtx.getImageData(0, 0, cw, renderH);
  const data = imageData.data;
  const targets: Array<{ x: number; y: number }> = [];
  const step = Math.max(3, Math.round(Math.min(cw, renderH) / 160));

  for (let y = 0; y < renderH; y += step) {
    for (let x = 0; x < cw; x += step) {
      const idx = (y * cw + x) * 4;
      if (data[idx + 3] > 100) {
        // Map to full viewport coordinates (numeral sits in top 60%)
        targets.push({ x: x / cw, y: y / ch });
      }
    }
  }

  // Cap and shuffle for organic particle distribution
  if (targets.length > MAX_PARTICLES) {
    for (let i = targets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [targets[i], targets[j]] = [targets[j], targets[i]];
    }
    targets.length = MAX_PARTICLES;
  }

  return targets;
}

/**
 * NumeralConvergence
 *
 * When the user navigates to a page, ambient Burmese glyphs slowly converge
 * from scattered positions across the viewport to form a large full-screen
 * Burmese numeral corresponding to the active tab number.
 *
 * Timeline:
 *   0 – 5s  : Glyphs drift inward, easing into target positions
 *   5 – 7s  : Formed numeral holds at full visibility
 *   7 – 8.5s: Numeral fades out
 */
export function NumeralConvergence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const animFrameRef = useRef(0);

  useEffect(() => {
    const routePath = pathname.replace(/^\/(en|th|my|ksw)(?=\/|$)/, "") || "/";
    // The home route owns its chapter numerals inside the cinematic film. A
    // second global numeral here would collide with the K/O/A formation.
    if (routePath === "/") return;
    const digit = PATH_TO_NUMERAL[routePath];
    if (!digit) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Cap at 1x DPR for performance (retina is the biggest perf killer)
    const dpr = 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Sample target positions from the rendered Burmese digit
    const targets = sampleTargets(digit, w, h);
    if (targets.length === 0) return;

    // Create particles at random scattered positions
    const particles = targets.map((target) => ({
      startX: Math.random() * w,
      startY: Math.random() * h,
      targetX: target.x * w,
      targetY: target.y * h,
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      delay: Math.random() * 0.35,
      rotation: (Math.random() - 0.5) * Math.PI * 2,
      fontSize: 14 + Math.random() * 10,
    }));

    const startTime = performance.now();

    // Custom easing: slow start → accelerate → settle
    function ease(t: number): number {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      return t < 0.5
        ? 8 * t * t * t * t
        : 1 - Math.pow(-2 * t + 2, 4) / 2;
    }

    function animate(now: number) {
      const elapsed = now - startTime;
      const totalProgress = elapsed / TOTAL_DURATION;

      ctx!.clearRect(0, 0, w, h);

      // Fade out the entire numeral at the end
      let globalAlpha = 1;
      if (elapsed > ANIM_DURATION + HOLD_DURATION) {
        globalAlpha = Math.max(0, 1 - (elapsed - ANIM_DURATION - HOLD_DURATION) / FADE_DURATION);
      }
      if (globalAlpha <= 0) return; // Animation complete

      for (const p of particles) {
        // Per-particle progress with staggered delay
        const rawProgress = Math.max(0, totalProgress - p.delay) / (1 - p.delay);
        const t = ease(Math.min(rawProgress, 1));

        // Interpolate position
        const x = p.startX + (p.targetX - p.startX) * t;
        const y = p.startY + (p.targetY - p.startY) * t;

        // Opacity: fade in during convergence, hold, fade out at end
        let opacity: number;
        if (rawProgress < 0.3) {
          opacity = rawProgress / 0.3;
        } else if (totalProgress > (ANIM_DURATION + HOLD_DURATION) / TOTAL_DURATION) {
          opacity = globalAlpha;
        } else {
          opacity = 1;
        }
        opacity *= 0.55;

        // Rotation settles as particle approaches target
        const rot = p.rotation * (1 - t * 0.8);

        ctx!.save();
        ctx!.translate(x, y);
        ctx!.rotate(rot);
        ctx!.globalAlpha = opacity;
        ctx!.fillStyle = "#f2c85a";
        ctx!.font = `${p.fontSize}px "Noto Sans Myanmar", "Myanmar Text", sans-serif`;
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillText(p.glyph, 0, 0);
        ctx!.restore();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [pathname]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}
