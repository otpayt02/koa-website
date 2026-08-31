"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * ASCII Wave Background — "The Living Veil"
 * 
 * A full-screen ASCII wave/ripple effect that serves as the site-wide background.
 * Inspired by reactbits.dev ASCII Waves but customized for KOA with:
 * - Karen glyphs mixed with ASCII characters
 * - KOA color palette (navy, gold, red)
 * - Cursor-reactive ripple disturbances
 * - Smooth flowing wave animation
 * - Very subtle opacity to not interfere with content
 */

// Character gradient: sparse → dense, with Karen glyphs for cultural identity
const WAVE_CHARS = " .·•◦◘ံ့းကခဂငစဇနပဖမယရလဝသဟအ၀၁၂၃၄၅၆၇၈၉";

// Simple 2D noise implementation (value noise with smoothing)
function createNoise() {
  const permutation = new Array(512);
  const grad3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
  ];

  // Initialize permutation table
  for (let i = 0; i < 256; i++) permutation[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  for (let i = 0; i < 256; i++) {
    permutation[i + 256] = permutation[i];
  }

  function fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(a: number, b: number, t: number) {
    return a + t * (b - a);
  }

  function dot(g: number[], x: number, y: number) {
    return g[0] * x + g[1] * y;
  }

  return function noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);

    const aa = permutation[permutation[X] + Y] % 12;
    const ab = permutation[permutation[X] + Y + 1] % 12;
    const ba = permutation[permutation[X + 1] + Y] % 12;
    const bb = permutation[permutation[X + 1] + Y + 1] % 12;

    const x1 = lerp(dot(grad3[aa], xf, yf), dot(grad3[ba], xf - 1, yf), u);
    const x2 = lerp(dot(grad3[ab], xf, yf - 1), dot(grad3[bb], xf - 1, yf - 1), u);

    return (lerp(x1, x2, v) + 1) / 2; // Normalize to 0-1
  };
}

interface Ripple {
  x: number;
  y: number;
  startTime: number;
  intensity: number;
  speed: number;
}

export function AsciiWaveBackground({
  elementSize = 14,
  noiseScale = 0.008,
  speed = 0.3,
  waveIntensity = 1.0,
  cursorInteraction = true,
  interactionIntensity = 1.0,
  opacity = 0.06,
  color = "#d4a843",
}: {
  elementSize?: number;
  noiseScale?: number;
  speed?: number;
  waveIntensity?: number;
  cursorInteraction?: boolean;
  interactionIntensity?: number;
  opacity?: number;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const noiseRef = useRef(createNoise());
  const timeRef = useRef(0);
  const lastFrameRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const ripplesRef = useRef<Ripple[]>([]);
  const sizeRef = useRef({ width: 0, height: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
    mouseRef.current.active = true;

    // Create ripple on mouse move (throttled)
    if (cursorInteraction && Math.random() < 0.03) {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        startTime: performance.now(),
        intensity: interactionIntensity * 0.5,
        speed: 0.002,
      });
      // Limit active ripples
      if (ripplesRef.current.length > 5) {
        ripplesRef.current.shift();
      }
    }
  }, [cursorInteraction, interactionIntensity]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!cursorInteraction) return;
    // Create stronger ripple on click
    ripplesRef.current.push({
      x: e.clientX,
      y: e.clientY,
      startTime: performance.now(),
      intensity: interactionIntensity * 2.0,
      speed: 0.003,
    });
    if (ripplesRef.current.length > 8) {
      ripplesRef.current.shift();
    }
  }, [cursorInteraction, interactionIntensity]);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lowPower = window.matchMedia("(prefers-reduced-data: reduce)").matches
      || (navigator.hardwareConcurrency || 8) <= 4;
    const frameInterval = lowPower ? 1000 / 30 : 1000 / 60;
    let lastPaint = 0;
    let visible = true;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Render a single static frame
      const dpr = lowPower ? 1 : Math.min(1.5, window.devicePixelRatio || 1);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      renderFrame(ctx, width, height, 0, [], noiseRef.current, { x: 0, y: 0, active: false }, cursorInteraction, elementSize, noiseScale, waveIntensity, opacity, color);
      return;
    }

    const resize = () => {
      const dpr = lowPower ? 1 : Math.min(1.5, window.devicePixelRatio || 1);
      const width = window.innerWidth;
      const height = window.innerHeight;
      sizeRef.current = { width, height };
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);
    if (cursorInteraction) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("click", handleClick);
      window.addEventListener("mouseleave", handleMouseLeave);
    }

    const animate = (time: number) => {
      if (!visible || document.hidden) {
        animationRef.current = null;
        return;
      }
      if (time - lastPaint < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastPaint = time;
      const dt = Math.min(time - lastFrameRef.current, 50);
      lastFrameRef.current = time;
      timeRef.current += dt * speed * 0.001;

      const { width, height } = sizeRef.current;
      const noise = noiseRef.current;
      const mouse = mouseRef.current;
      const ripples = ripplesRef.current;

      // Clean up old ripples
      const now = performance.now();
      ripplesRef.current = ripples.filter(r => now - r.startTime < 3000);

      renderFrame(
        ctx,
        width,
        height,
        timeRef.current,
        ripplesRef.current,
        noise,
        mouse,
        cursorInteraction,
        lowPower ? Math.max(elementSize, 18) : elementSize,
        noiseScale,
        waveIntensity,
        opacity,
        color,
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !animationRef.current) animationRef.current = requestAnimationFrame(animate);
    }, { threshold: 0 });
    visibilityObserver.observe(canvas);
    const onVisibilityChange = () => {
      if (!document.hidden && visible && !animationRef.current) animationRef.current = requestAnimationFrame(animate);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      visibilityObserver.disconnect();
      if (cursorInteraction) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("click", handleClick);
        window.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [elementSize, noiseScale, speed, waveIntensity, cursorInteraction, interactionIntensity, opacity, color, handleMouseMove, handleClick, handleMouseLeave]);

  return (
    <canvas
      ref={canvasRef}
      className="ascii-wave-bg"
      aria-hidden="true"
    />
  );
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  ripples: Ripple[],
  noise?: (x: number, y: number) => number,
  mouse?: { x: number; y: number; active: boolean },
  cursorInteraction?: boolean,
  elementSize = 14,
  noiseScale = 0.008,
  waveIntensity = 1,
  opacity = 0.06,
  color = "#d4a843",
) {
  // Keep a quiet material baseline, then let the local cursor wave carry the
  // visible contrast. The loop still runs at a bounded frame budget, but its
  // idle pixels never compete with foreground copy.
  const baseOpacity = Math.min(0.08, Math.max(0.01, opacity));

  // Clear with background color
  ctx.fillStyle = "#040818";
  ctx.fillRect(0, 0, width, height);

  const cols = Math.ceil(width / elementSize) + 1;
  const rows = Math.ceil(height / elementSize) + 1;
  const chars = WAVE_CHARS;
  const maxCharIndex = chars.length - 1;

  ctx.font = `${elementSize}px 'Noto Sans Myanmar', monospace`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  const now = performance.now();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * elementSize;
      const y = row * elementSize;

      // Base noise value
      const nx = col * noiseScale;
      const ny = row * noiseScale;
      let noiseVal = noise
        ? noise(nx + time * 0.5, ny + time * 0.3)
        : (Math.sin(nx * 10 + time) * 0.5 + 0.5);

      // Add secondary noise layer for complexity
      if (noise) {
        const noise2 = noise(nx * 2.5 + time * 0.8, ny * 2.5 - time * 0.4);
        noiseVal = noiseVal * 0.7 + noise2 * 0.3;
      }

      // Apply wave intensity
      noiseVal = Math.pow(noiseVal, 1.5 / waveIntensity);

      // Cursor proximity effect
      let cursorInfluence = 0;
      if (cursorInteraction && mouse && mouse.active) {
        const dx = mouse.x - (x + elementSize / 2);
        const dy = mouse.y - (y + elementSize / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 200;
        if (dist < radius) {
          cursorInfluence = Math.pow(1 - dist / radius, 2) * 0.5;
          noiseVal = Math.min(1, noiseVal + cursorInfluence);
        }
      }

      // Ripple effects
      for (const ripple of ripples) {
        const age = (now - ripple.startTime) * ripple.speed;
        const dx = ripple.x - (x + elementSize / 2);
        const dy = ripple.y - (y + elementSize / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const rippleRadius = age * 300;
        const rippleWidth = 80;
        const distFromRipple = Math.abs(dist - rippleRadius);
        if (distFromRipple < rippleWidth) {
          const rippleEffect = (1 - distFromRipple / rippleWidth) * ripple.intensity * Math.exp(-age * 2);
          noiseVal = Math.min(1, noiseVal + rippleEffect * 0.3);
        }
      }

      // Map noise to character
      const charIndex = Math.floor(noiseVal * maxCharIndex);
      const char = chars[Math.max(0, Math.min(charIndex, maxCharIndex))];

      // Skip spaces (they're invisible anyway)
      if (char === " ") continue;

      // Color and opacity based on noise and cursor
      let alpha = baseOpacity * (0.3 + noiseVal * 0.7);
      let fillColor = color;

      if (cursorInfluence > 0.1) {
        // Gold highlight near cursor
          alpha = Math.min(0.22, alpha + cursorInfluence * 0.14);
        fillColor = "#e8c85a";
      } else if (noiseVal > 0.8) {
        // Bright peaks get red accent
        alpha = Math.min(0.12, alpha + 0.02);
        fillColor = "#D84A4D";
      } else if (noiseVal < 0.2) {
        // Dark valleys get blue
        fillColor = "#3d6b9e";
        alpha *= 0.5;
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = fillColor;
      ctx.fillText(char, x, y);
    }
  }

  ctx.globalAlpha = 1;
}

export default AsciiWaveBackground;
