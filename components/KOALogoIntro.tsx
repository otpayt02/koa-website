"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Lang } from "./i18n";

/**
 * KOA Logo Intro Sequence - "The Beacon" (Enhanced Deluxe Version)
 * 
 * Phase 1: The Spark (0-2s) - Subtle sunshine halo, Karen glyph rays
 * Phase 2: Statue of Liberty Emerges (2-5s) - Silhouette rises from light
 * Phase 3: KOA Letters Form (5-8s) - Glyphs swarm into K, O, A
 * Phase 4: The Reveal (8-12s) - Logo scales, O dissolves, K/A settle horizontal
 * Phase 5: The O Forms (12-16s) - Glyphs converge from off-screen to form O
 * Phase 6: Idle Breathing (16s+) - Ray rotation, glyph breathing, clockwise orbit
 * 
 * NEW ENHANCEMENTS:
 * - Halo made of Karen glyph rays (subtle, semi-transparent)
 * - Statue of Liberty inside inner circle
 * - White Karen glyphs orbiting clockwise around inner circle
 * - White circumference-outlining words in English/Karen orbiting
 * - Ray spiral never has visible boundary
 * - 2x frame duration for smoother cinematic
 */

// Karen script Unicode ranges
const KAREN_GLYPHS = [
  "က", "ခ", "ဂ", "ဃ", "င", "စ", "ဆ", "ဇ", "ဈ", "ဉ", "ည", "ဋ", "ဌ", "ဍ", "ဎ", "ဏ",
  "တ", "ထ", "ဒ", "ဓ", "န", "ပ", "ဖ", "ဗ", "ဘ", "မ", "ယ", "ရ", "လ", "ဝ", "သ", "ဟ",
  "ဠ", "အ", "ဢ", "ါ", "ာ", "ိ", "ီ", "ု", "ူ", "ေ", "ဲ", "ဳ", "ံ", "့", "း", "္", "်",
  "ၢ", "ၣ", "ၤ", "ၥ", "ၦ", "ၧ", "ၨ", "ၩ", "ၪ", "ၫ", "ၬ", "ၭ", "ၮ", "ၯ",
  "ၰ", "ၱ", "ၲ", "ၳ", "ၴ", "ၵ", "ၶ", "ၷ", "ၸ", "ၹ", "ၺ", "ၻ", "ၼ", "ၽ", "ၾ", "ၿ",
  "၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"
];

// Bilingual orbiting text
const ORBIT_TEXTS = {
  en: ["KAREN ORGANIZATION OF AMERICA", "MANY PLACES ONE COMMUNITY", "ESTABLISHED 2018", "UNITY · VOICE · BELONGING"],
  karen: ["ကွၢ်ဃု အဖွဲ့အစည်း အမေရိကန်", "ကညီပှၤတဝၢလၢ အမဲရကၤ", "နည်းထားလဴ ၂၀၁၈", "မၤဂၢၢ်မၤကျၢ · သး · ဖိး"]
};

// Letter shapes for glyph formation
const LETTER_SHAPES = {
  K: [
    [-1, -1.2], [-1, -0.6], [-1, 0], [-1, 0.6], [-1, 1.2],
    [-0.3, 0], [0.4, 0.6], [0.4, -0.6],
  ],
  O: [
    [-0.7, -0.9], [0, -1.1], [0.7, -0.9], [1.0, -0.4], [1.0, 0], [1.0, 0.4],
    [0.7, 0.9], [0, 1.1], [-0.7, 0.9], [-1.0, 0.4], [-1.0, 0], [-1.0, -0.4],
  ],
  A: [
    [-0.8, 0.6], [-0.4, -0.6], [0, -0.9], [0.4, -0.6], [0.8, 0.6],
    [-0.3, 0], [0.3, 0],
  ],
};

interface GlyphParticle {
  id: number;
  char: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  opacity: number;
  rotation: number;
  targetRotation: number;
  vx: number;
  vy: number;
  state: "streaming" | "forming" | "formed" | "dispersing" | "idle" | "orbiting";
  targetLetter: "K" | "O" | "A" | null;
  letterIndex: number;
  delay: number;
  noiseOffset: number;
  orbitAngle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
}

interface OrbitingText {
  text: string;
  radius: number;
  angle: number;
  speed: number;
  opacity: number;
  color: string;
  fontSize: number;
  lang: "en" | "karen";
}

interface IntroPhase {
  name: string;
  start: number;
  end: number;
}

const PHASES: IntroPhase[] = [
  { name: "spark", start: 0, end: 2000 },
  { name: "statue", start: 2000, end: 5000 },
  { name: "letters", start: 5000, end: 8000 },
  { name: "reveal", start: 8000, end: 12000 },
  { name: "o-form", start: 12000, end: 16000 },
  { name: "idle", start: 16000, end: Infinity },
];

export function KOALogoIntro({
  canvasRef,
  onComplete,
  isReducedMotion = false,
  lang = "en",
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onComplete?: () => void;
  isReducedMotion?: boolean;
  lang?: Lang;
}) {
  const [phase, setPhase] = useState(isReducedMotion ? PHASES.length - 1 : 0);
  const [phaseProgress, setPhaseProgress] = useState(isReducedMotion ? 1 : 0);
  const particlesRef = useRef<GlyphParticle[]>([]);
  const orbitTextsRef = useRef<OrbitingText[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);
  const statueYRef = useRef(1);
  const logoScaleRef = useRef(0.1);
  const rayRotationRef = useRef(0);
  const haloIntensityRef = useRef(0);
  const spiralAngleRef = useRef(0);

  // Initialize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);
    startTimeRef.current = performance.now();

    // Initialize particles for streaming from torch/halo
    particlesRef.current = Array.from({ length: 300 }, (_, i) => ({
      id: i,
      char: KAREN_GLYPHS[Math.floor(Math.random() * KAREN_GLYPHS.length)],
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.85,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight * 0.85,
      size: 10 + Math.random() * 18,
      opacity: 0,
      rotation: (Math.random() - 0.5) * 0.3,
      targetRotation: 0,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -1 - Math.random() * 2,
      state: "streaming",
      targetLetter: null,
      letterIndex: -1,
      delay: Math.random() * 3000,
      noiseOffset: Math.random() * 10000,
    }));

    // Initialize orbiting texts
    const orbitLanguage = lang === "ksw" ? "karen" : "en";
    const texts = ORBIT_TEXTS[orbitLanguage];
    orbitTextsRef.current = texts.map((text, idx) => ({
      text,
      radius: 180 + idx * 40,
      angle: (idx / texts.length) * Math.PI * 2,
      speed: 0.00008 + idx * 0.00002, // Clockwise, different speeds
      opacity: 0,
      color: idx % 2 === 0 ? "rgba(248, 243, 232, 0.15)" : "rgba(212, 168, 67, 0.12)",
      fontSize: 11 + idx * 1.5,
      lang: orbitLanguage,
    }));

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef, lang]);

  // Perlin noise
  const noise = useCallback((x: number, y: number) => {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }, []);

  // Get letter glyph positions
  const getLetterPositions = useCallback((letter: "K" | "O" | "A", centerX: number, centerY: number, scale: number) => {
    const shape = LETTER_SHAPES[letter];
    return shape.map(([x, y]) => ({
      x: centerX + x * scale * 35,
      y: centerY + y * scale * 35,
    }));
  }, []);

  // Draw Statue of Liberty silhouette
  const drawStatue = useCallback((
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    progress: number,
    size: number
  ) => {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Halo behind statue
    const haloGradient = ctx.createRadialGradient(0, -size * 0.4, 0, 0, -size * 0.4, size * 1.5);
    haloGradient.addColorStop(0, `rgba(232, 200, 90, ${haloIntensityRef.current * 0.25})`);
    haloGradient.addColorStop(0.5, `rgba(232, 200, 90, ${haloIntensityRef.current * 0.08})`);
    haloGradient.addColorStop(1, "rgba(232, 200, 90, 0)");
    ctx.beginPath();
    ctx.arc(0, -size * 0.4, size * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = haloGradient;
    ctx.fill();

    // Statue body (simplified elegant silhouette)
    ctx.fillStyle = `rgba(4, 8, 24, ${0.85 + progress * 0.15})`;
    
    // Robe
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, -size * 0.2);
    ctx.bezierCurveTo(-size * 0.7, size * 0.2, -size * 0.8, size * 0.8, -size * 0.4, size * 1.4);
    ctx.bezierCurveTo(-size * 0.1, size * 1.6, size * 0.1, size * 1.6, size * 0.4, size * 1.4);
    ctx.bezierCurveTo(size * 0.8, size * 0.8, size * 0.7, size * 0.2, size * 0.5, -size * 0.2);
    ctx.closePath();
    ctx.fill();

    // Head with crown
    ctx.beginPath();
    ctx.arc(0, -size * 0.35, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Crown spikes
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
      const spikeLen = size * 0.18;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * size * 0.25, Math.sin(angle) * size * 0.25 - size * 0.35);
      ctx.lineTo(Math.cos(angle) * (size * 0.25 + spikeLen), Math.sin(angle) * (size * 0.25 + spikeLen) - size * 0.35);
      ctx.lineWidth = size * 0.05;
      ctx.strokeStyle = `rgba(4, 8, 24, ${0.85 + progress * 0.15})`;
      ctx.stroke();
    }

    // Right arm with torch
    const armProgress = Math.min(1, progress * 1.5);
    ctx.beginPath();
    ctx.moveTo(size * 0.4, -size * 0.1);
    ctx.bezierCurveTo(
      size * 0.6 * armProgress, -size * 0.2,
      size * 0.9 * armProgress, -size * 0.5,
      size * 1.1 * armProgress, -size * 0.85
    );
    ctx.lineWidth = size * 0.08;
    ctx.strokeStyle = `rgba(4, 8, 24, ${0.85 + progress * 0.15})`;
    ctx.lineCap = "round";
    ctx.stroke();

    // Torch flame
    const flameGradient = ctx.createRadialGradient(size * 1.1 * armProgress, -size * 0.85, 0, size * 1.1 * armProgress, -size * 0.85, size * 0.4);
    flameGradient.addColorStop(0, `rgba(255, 248, 230, ${armProgress})`);
    flameGradient.addColorStop(0.3, `rgba(255, 220, 150, ${armProgress * 0.8})`);
    flameGradient.addColorStop(1, "rgba(232, 200, 90, 0)");
    ctx.beginPath();
    ctx.arc(size * 1.1 * armProgress, -size * 0.85, size * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = flameGradient;
    ctx.fill();

    // Tablet in left arm
    if (progress > 0.3) {
      ctx.fillStyle = `rgba(4, 8, 24, ${0.7 + progress * 0.2})`;
      ctx.fillRect(-size * 0.85, -size * 0.3, size * 0.35, size * 0.6);
    }

    ctx.restore();
  }, []);

  // Draw spiral rays (never have visible boundary)
  const drawSpiralRays = useCallback((
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    elapsed: number,
    phase: number,
    progress: number
  ) => {
    const width = ctx.canvas.width / (window.devicePixelRatio || 1);
    const height = ctx.canvas.height / (window.devicePixelRatio || 1);
    const maxDim = Math.max(width, height);
    
    // Spiral ray parameters - never ending, no hard boundary
    const rayCount = 12; // More rays for subtlety
    const baseRayOpacity = 0.015;
    const spiralTurns = 3;
    
    spiralAngleRef.current = elapsed * 0.00003; // Very slow clockwise rotation
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(spiralAngleRef.current);

    for (let i = 0; i < rayCount; i++) {
      const baseAngle = (i / rayCount) * Math.PI * 2;
      
      // Each ray is a spiral curve
      ctx.beginPath();
      
      for (let t = 0; t <= 1; t += 0.02) {
        const spiralRadius = t * maxDim * 0.6;
        const spiralAngle = baseAngle + t * spiralTurns * Math.PI * 2;
        
        // Pulsing width along spiral
        const pulse = Math.sin(elapsed * 0.001 + t * Math.PI * 4 + i) * 0.3 + 0.7;
        const rayWidth = (1 + t * 2) * pulse;
        
        const x = Math.cos(spiralAngle) * spiralRadius;
        const y = Math.sin(spiralAngle) * spiralRadius;
        
        if (t === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      // Gradient along spiral - fades to transparency without boundary
      const gradient = ctx.createLinearGradient(0, 0, maxDim * 0.6, 0);
      const rayProgress = Math.min(1, elapsed / 16000);
      const opacity = baseRayOpacity * (0.5 + rayProgress * 0.5);
      
      gradient.addColorStop(0, `rgba(232, 200, 90, ${opacity})`);
      gradient.addColorStop(0.3, `rgba(232, 200, 90, ${opacity * 0.5})`);
      gradient.addColorStop(0.7, `rgba(232, 200, 90, ${opacity * 0.2})`);
      gradient.addColorStop(1, "rgba(232, 200, 90, 0)");
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    
    // Inner Karen glyph rays (very subtle, tiny)
    if (phase >= 1) {
      const glyphRayCount = 24;
      for (let i = 0; i < glyphRayCount; i++) {
        const angle = (i / glyphRayCount) * Math.PI * 2 + spiralAngleRef.current * 0.5;
        const glyph = KAREN_GLYPHS[Math.floor(Math.random() * KAREN_GLYPHS.length)];
        
        // Draw glyph along ray at varying distances
        for (let t = 0.2; t <= 0.8; t += 0.15) {
          const dist = t * maxDim * 0.45;
          const x = Math.cos(angle) * dist;
          const y = Math.sin(angle) * dist;
          const gProgress = Math.min(1, (elapsed - 2000) / 3000);
          const gOpacity = 0.008 * gProgress * (1 - t); // Fade with distance
          
          if (gOpacity > 0.001) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI / 2);
            ctx.globalAlpha = gOpacity;
            ctx.font = `10px 'Noto Sans Myanmar', sans-serif`;
            ctx.fillStyle = "#e8c85a";
            ctx.fillText(glyph, 0, 0);
            ctx.restore();
          }
        }
      }
    }
    
    ctx.restore();
  }, []);

  // Main animation loop
  useEffect(() => {
    if (isReducedMotion) {
      onComplete?.();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = (time: number) => {
      const elapsed = time - startTimeRef.current;
      
      // Determine current phase
      let currentPhase = 0;
      let currentProgress = 0;
      
      for (let i = 0; i < PHASES.length; i++) {
        if (elapsed >= PHASES[i].start) {
          currentPhase = i;
          if (PHASES[i].end !== Infinity) {
            currentProgress = Math.min(1, (elapsed - PHASES[i].start) / (PHASES[i].end - PHASES[i].start));
          } else {
            currentProgress = 1;
          }
        }
      }
      
      setPhase(currentPhase);
      setPhaseProgress(currentProgress);

      const particles = particlesRef.current;
      const orbitTexts = orbitTextsRef.current;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const centerX = width / 2;
      const centerY = height / 2;

      // Clear with navy background
      ctx.fillStyle = "#040818";
      ctx.fillRect(0, 0, width, height);

      // Draw spiral rays (all phases)
      drawSpiralRays(ctx, centerX, centerY, elapsed, currentPhase, currentProgress);

      // Phase 1: The Spark / Halo
      if (currentPhase === 0) {
        const p = currentProgress;
        const sparkSize = 4 + p * 80;
        const sparkOpacity = 0.2 + p * 0.5;
        
        ctx.save();
        ctx.translate(centerX, centerY + height * 0.25 * (1 - p));
        
        // Multi-layer glow
        for (let layer = 0; layer < 3; layer++) {
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, sparkSize * (2 + layer));
          const layerOpacity = sparkOpacity * (1 - layer * 0.3);
          gradient.addColorStop(0, `rgba(255, 248, 230, ${layerOpacity})`);
          gradient.addColorStop(0.4, `rgba(232, 200, 90, ${layerOpacity * 0.4})`);
          gradient.addColorStop(1, "rgba(232, 200, 90, 0)");
          
          ctx.beginPath();
          ctx.arc(0, 0, sparkSize * (1.5 + layer * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
        
        // Core
        ctx.beginPath();
        ctx.arc(0, 0, sparkSize * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 250, 240, ${sparkOpacity})`;
        ctx.fill();
        ctx.restore();

        // Stream Karen glyphs from center (halo rays)
        particles.forEach(pt => {
          if (pt.state === "streaming" && elapsed > pt.delay) {
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.vy += 0.015;
            pt.vx *= 0.995;
            pt.opacity = Math.min(0.15, pt.opacity + 0.002); // Very subtle
            
            // Orbit around center slightly
            const dx = pt.x - centerX;
            const dy = pt.y - centerY;
            const dist = Math.hypot(dx, dy);
            if (dist > 0) {
              const orbitForce = 0.0005;
              pt.vx += -dy / dist * orbitForce;
              pt.vy += dx / dist * orbitForce;
            }
            
            if (pt.opacity > 0.005 && pt.y > -50 && pt.y < height + 50) {
              ctx.save();
              ctx.translate(pt.x, pt.y);
              ctx.rotate(pt.rotation);
              ctx.globalAlpha = pt.opacity;
              ctx.font = `${pt.size}px 'Noto Sans Myanmar', sans-serif`;
              ctx.fillStyle = "#e8c85a";
              ctx.fillText(pt.char, 0, 0);
              ctx.restore();
            }
          }
        });
      }

      // Phase 2: Statue of Liberty Emerges
      if (currentPhase >= 1) {
        const p = currentPhase === 1 ? currentProgress : 1;
        
        // Statue rises from bottom
        statueYRef.current = 1 - p * 1.3;
        const statueY = centerY + statueYRef.current * height * 0.35;
        const statueSize = 80 + p * 60;
        
        // Halo intensity
        haloIntensityRef.current = 0.25 + p * 0.5;
        
        // Draw statue
        drawStatue(ctx, centerX, statueY, p, statueSize);

        // Stream glyphs from torch (Karen glyph rays)
        if (currentPhase === 1) {
          particles.forEach(pt => {
            if (pt.state === "streaming" && elapsed > pt.delay) {
              pt.x += pt.vx;
              pt.y += pt.vy;
              pt.vy += 0.02;
              pt.vx *= 0.99;
              pt.opacity = Math.min(0.2, pt.opacity + 0.003);
              
              // Gentle spiral outward
              const dx = pt.x - centerX;
              const dy = pt.y - (statueY - statueSize * 0.85);
              const dist = Math.hypot(dx, dy);
              if (dist > 0) {
                const spiralForce = 0.0003;
                pt.vx += -dy / dist * spiralForce;
                pt.vy += dx / dist * spiralForce;
              }
              
              if (pt.opacity > 0.005 && pt.y > -100 && pt.y < height + 100) {
                ctx.save();
                ctx.translate(pt.x, pt.y);
                ctx.rotate(pt.rotation);
                ctx.globalAlpha = pt.opacity;
                ctx.font = `${pt.size}px 'Noto Sans Myanmar', sans-serif`;
                ctx.fillStyle = "#f8f3e8";
                ctx.fillText(pt.char, 0, 0);
                ctx.restore();
              }
            }
          });
        }

        // Start orbiting texts fade in
        orbitTexts.forEach((ot, idx) => {
          if (p > 0.5) {
            ot.opacity = Math.min(ot.opacity + 0.0002, 0.12);
          }
        });
      }

      // Phase 3: KOA Letters Form
      if (currentPhase >= 2) {
        const p = currentPhase === 2 ? currentProgress : 1;
        
        // Navy background full
        ctx.fillStyle = "#040818";
        ctx.fillRect(0, 0, width, height);

        // Redraw spiral rays
        drawSpiralRays(ctx, centerX, centerY, elapsed, currentPhase, currentProgress);

        // Statue fades out
        if (currentPhase > 2) {
          statueYRef.current -= 0.003;
        }

        // Letter positions
        const letterScale = 0.7 + p * 0.6;
        const kPos = getLetterPositions("K", centerX - 200 * letterScale, centerY, letterScale);
        const oPos = getLetterPositions("O", centerX, centerY, letterScale);
        const aPos = getLetterPositions("A", centerX + 200 * letterScale, centerY, letterScale);

        // Assign particles to letters
        if (currentPhase === 2) {
          let particleIdx = 0;
          const allPositions = [...kPos, ...oPos, ...aPos];
          
          allPositions.forEach((pos, idx) => {
            if (particleIdx < particles.length) {
              const pt = particles[particleIdx];
              const letter = idx < kPos.length ? "K" : idx < kPos.length + oPos.length ? "O" : "A";
              const letterIdx = idx < kPos.length ? idx : idx < kPos.length + oPos.length ? idx - kPos.length : idx - kPos.length - oPos.length;
              
              pt.targetX = pos.x + (Math.random() - 0.5) * 8;
              pt.targetY = pos.y + (Math.random() - 0.5) * 8;
              pt.targetRotation = 0;
              pt.state = "forming";
              pt.targetLetter = letter;
              pt.letterIndex = letterIdx;
              pt.delay = letterIdx * 25 + (letter === "O" ? kPos.length * 25 : 0) + (letter === "A" ? (kPos.length + oPos.length) * 25 : 0);
              pt.size = 22 + Math.random() * 14;
              particleIdx++;
            }
          });
        }

        // Animate forming particles
        particles.forEach(pt => {
          if (pt.state === "forming") {
            const localProgress = Math.min(1, Math.max(0, (elapsed - PHASES[2].start - pt.delay) / 1200));
            if (localProgress > 0) {
              const eased = 1 - Math.pow(1 - localProgress, 3);
              pt.x += (pt.targetX - pt.x) * eased * 0.15;
              pt.y += (pt.targetY - pt.y) * eased * 0.15;
              pt.opacity = Math.min(0.95, pt.opacity + eased * 0.05);
              pt.rotation += (pt.targetRotation - pt.rotation) * eased * 0.1;
              
              if (localProgress >= 1) {
                pt.state = "formed";
              }
            }
          }
          
          if (pt.state === "formed" || pt.state === "forming") {
            if (pt.opacity > 0.01) {
              ctx.save();
              ctx.translate(pt.x, pt.y);
              ctx.rotate(pt.rotation);
              ctx.globalAlpha = pt.opacity;
              ctx.font = `${pt.size}px 'Noto Sans Myanmar', sans-serif`;
              ctx.fillStyle = "#f8f3e8";
              ctx.fillText(pt.char, 0, 0);
              ctx.restore();
            }
          }
        });

        logoScaleRef.current = 1 + p * 3;

        // Orbiting texts continue
        orbitTexts.forEach((ot, idx) => {
          if (ot.opacity < 0.15) ot.opacity = Math.min(ot.opacity + 0.0003, 0.15);
          ot.angle += ot.speed * 16; // Clockwise
          
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(ot.angle);
          ctx.globalAlpha = ot.opacity;
          ctx.font = `${ot.fontSize}px ${ot.lang === "karen" ? "'Noto Sans Myanmar'" : "'Libre Caslon Display'"}, sans-serif`;
          ctx.fillStyle = ot.color;
          ctx.fillText(ot.text, ot.radius, 0);
          ctx.restore();
        });
      }

      // Phase 4: The Reveal
      if (currentPhase >= 3) {
        const p = currentPhase === 3 ? currentProgress : 1;
        
        ctx.fillStyle = "#040818";
        ctx.fillRect(0, 0, width, height);
        drawSpiralRays(ctx, centerX, centerY, elapsed, currentPhase, currentProgress);

        const scale = logoScaleRef.current * (1 + p * 2);
        const oDissolveProgress = Math.min(1, p * 1.5);

        particles.forEach(pt => {
          // O dissolves
          if (pt.targetLetter === "O" && (pt.state === "formed" || pt.state === "forming")) {
            if (oDissolveProgress > 0) {
              const angle = Math.atan2(pt.y - centerY, pt.x - centerX);
              const distance = 400 * oDissolveProgress;
              pt.targetX = centerX + Math.cos(angle) * distance + (Math.random() - 0.5) * 150;
              pt.targetY = centerY + Math.sin(angle) * distance + (Math.random() - 0.5) * 150;
              pt.targetRotation = (Math.random() - 0.5) * Math.PI * 2;
              pt.state = "dispersing";
            }
          }
          
          if (pt.state === "dispersing" && pt.targetLetter === "O") {
            const dx = pt.targetX - pt.x;
            const dy = pt.targetY - pt.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist > 5) {
              pt.vx = (dx / dist) * 10;
              pt.vy = (dy / dist) * 10;
              pt.x += pt.vx;
              pt.y += pt.vy;
              pt.opacity *= 0.97;
              pt.rotation += (pt.targetRotation - pt.rotation) * 0.1;
            } else {
              pt.state = "idle";
              pt.opacity = 0.01 + Math.random() * 0.03;
              pt.vx = (Math.random() - 0.5) * 0.2;
              pt.vy = (Math.random() - 0.5) * 0.2;
            }
          }
          
          // K and A settle to horizontal axis
          if ((pt.targetLetter === "K" || pt.targetLetter === "A") && pt.state === "formed") {
            pt.targetY = centerY;
            pt.y += (pt.targetY - pt.y) * 0.04;
            pt.opacity = 0.95 * (0.97 + Math.sin(time * 0.002 + pt.id) * 0.03);
          }
          
          if (pt.opacity > 0.01) {
            ctx.save();
            ctx.translate(pt.x, pt.y);
            ctx.rotate(pt.rotation);
            ctx.globalAlpha = pt.opacity;
            ctx.font = `${pt.size}px 'Noto Sans Myanmar', sans-serif`;
            ctx.fillStyle = "#f8f3e8";
            ctx.fillText(pt.char, 0, 0);
            ctx.restore();
          }
        });

        // Orbiting texts at full opacity
        orbitTexts.forEach((ot, idx) => {
          ot.opacity = Math.min(ot.opacity + 0.0002, 0.18);
          ot.angle += ot.speed * 16;
          
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(ot.angle);
          ctx.globalAlpha = ot.opacity;
          ctx.font = `${ot.fontSize}px ${ot.lang === "karen" ? "'Noto Sans Myanmar'" : "'Libre Caslon Display'"}, sans-serif`;
          ctx.fillStyle = ot.color;
          ctx.fillText(ot.text, ot.radius, 0);
          ctx.restore();
        });
      }

      // Phase 5: The O Forms
      if (currentPhase >= 4) {
        const p = currentPhase === 4 ? currentProgress : 1;
        
        ctx.fillStyle = "#040818";
        ctx.fillRect(0, 0, width, height);
        drawSpiralRays(ctx, centerX, centerY, elapsed, currentPhase, currentProgress);

        // K and A stay formed
        particles.forEach(pt => {
          if ((pt.targetLetter === "K" || pt.targetLetter === "A") && pt.state === "formed") {
            pt.targetY = centerY;
            pt.y += (pt.targetY - pt.y) * 0.03;
            pt.opacity = 0.95 * (0.97 + Math.sin(time * 0.002 + pt.id) * 0.03);
            
            ctx.save();
            ctx.translate(pt.x, pt.y);
            ctx.rotate(pt.rotation);
            ctx.globalAlpha = pt.opacity;
            ctx.font = `${pt.size}px 'Noto Sans Myanmar', sans-serif`;
            ctx.fillStyle = "#f8f3e8";
            ctx.fillText(pt.char, 0, 0);
            ctx.restore();
          }
        });

        // New O forms from off-screen (clockwise spiral approach)
        if (currentPhase === 4) {
          const oPositions = getLetterPositions("O", centerX, centerY, 1.8);
          
          let oParticleIdx = 0;
          particles.forEach(pt => {
            if (pt.state === "idle" && oParticleIdx < oPositions.length) {
              const pos = oPositions[oParticleIdx];
              if (!pos) return;
              // Spawn from 4 sides with spiral approach
              const side = Math.floor(Math.random() * 4);
              let startX = 0;
              let startY = 0;
              const margin = 200;
              switch (side) {
                case 0: startX = pos.x + (Math.random() - 0.5) * 200; startY = -margin; break;
                case 1: startX = width + margin; startY = pos.y + (Math.random() - 0.5) * 200; break;
                case 2: startX = pos.x + (Math.random() - 0.5) * 200; startY = height + margin; break;
                case 3: startX = -margin; startY = pos.y + (Math.random() - 0.5) * 200; break;
              }
              
              pt.x = startX;
              pt.y = startY;
              pt.targetX = pos.x;
              pt.targetY = pos.y;
              pt.targetRotation = 0;
              pt.state = "forming";
              pt.targetLetter = "O";
              pt.letterIndex = oParticleIdx;
              pt.delay = oParticleIdx * 15;
              pt.size = 26 + Math.random() * 12;
              pt.opacity = 0;
              oParticleIdx++;
            }
          });

          particles.forEach(pt => {
            if (pt.targetLetter === "O" && pt.state === "forming") {
              const localProgress = Math.min(1, Math.max(0, (elapsed - PHASES[4].start - pt.delay) / 1400));
              if (localProgress > 0) {
                const eased = 1 - Math.pow(1 - localProgress, 4);
                pt.x += (pt.targetX - pt.x) * eased * 0.12;
                pt.y += (pt.targetY - pt.y) * eased * 0.12;
                pt.opacity = Math.min(0.95, localProgress * 0.95);
                pt.rotation += (pt.targetRotation - pt.rotation) * eased * 0.1;
                
                if (localProgress >= 1) {
                  pt.state = "formed";
                }
              }
            }
            
            if ((pt.targetLetter === "O" && pt.state === "formed") || pt.state === "forming") {
              if (pt.opacity > 0.01) {
                ctx.save();
                ctx.translate(pt.x, pt.y);
                ctx.rotate(pt.rotation);
                ctx.globalAlpha = pt.opacity;
                ctx.font = `${pt.size}px 'Noto Sans Myanmar', sans-serif`;
                ctx.fillStyle = "#f8f3e8";
                ctx.fillText(pt.char, 0, 0);
                ctx.restore();
              }
            }
          });
        }

        // Orbiting texts
        orbitTexts.forEach((ot, idx) => {
          ot.angle += ot.speed * 16;
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(ot.angle);
          ctx.globalAlpha = ot.opacity;
          ctx.font = `${ot.fontSize}px ${ot.lang === "karen" ? "'Noto Sans Myanmar'" : "'Libre Caslon Display'"}, sans-serif`;
          ctx.fillStyle = ot.color;
          ctx.fillText(ot.text, ot.radius, 0);
          ctx.restore();
        });
      }

      // Phase 6: Idle Breathing - Full orbit experience
      if (currentPhase >= 5) {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }

        drawSpiralRays(ctx, centerX, centerY, elapsed, currentPhase, currentProgress);

        // All three letters breathing + orbiting slowly
        particles.forEach(pt => {
          if (pt.state === "formed") {
            // Breathing
            pt.opacity = 0.9 * (0.96 + Math.sin(time * 0.0012 + pt.id) * 0.04);
            pt.rotation = Math.sin(time * 0.0006 + pt.id) * 0.03;
            
            // Very slow orbit around center
            if (pt.orbitAngle === undefined) {
              pt.orbitAngle = Math.atan2(pt.y - centerY, pt.x - centerX);
              pt.orbitRadius = Math.hypot(pt.x - centerX, pt.y - centerY);
              pt.orbitSpeed = 0.000005 + Math.random() * 0.00001;
            }
            
            const orbitSpeed = pt.orbitSpeed ?? 0.000008;
            const orbitRadius = pt.orbitRadius ?? 0;
            pt.orbitAngle += orbitSpeed * 16;
            pt.x = centerX + Math.cos(pt.orbitAngle) * orbitRadius;
            pt.y = centerY + Math.sin(pt.orbitAngle) * orbitRadius;
            
            ctx.save();
            ctx.translate(pt.x, pt.y);
            ctx.rotate(pt.rotation);
            ctx.globalAlpha = pt.opacity;
            ctx.font = `${pt.size}px 'Noto Sans Myanmar', sans-serif`;
            ctx.fillStyle = "#f8f3e8";
            ctx.fillText(pt.char, 0, 0);
            ctx.restore();
          }
        });

        // Orbiting texts at full glory - clockwise
        orbitTexts.forEach((ot, idx) => {
          ot.angle += ot.speed * 16; // Consistent clockwise
          
          // Subtle pulsing
          ot.opacity = 0.15 + Math.sin(time * 0.0008 + idx) * 0.03;
          
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(ot.angle);
          ctx.globalAlpha = ot.opacity;
          ctx.font = `${ot.fontSize}px ${ot.lang === "karen" ? "'Noto Sans Myanmar'" : "'Libre Caslon Display'"}, sans-serif`;
          ctx.fillStyle = ot.color;
          ctx.fillText(ot.text, ot.radius, 0);
          ctx.restore();
        });

        // Inner circle with Statue of Liberty (subtle, breathing)
        ctx.save();
        ctx.translate(centerX, centerY);
        const innerPulse = 1 + Math.sin(time * 0.001) * 0.02;
        ctx.scale(innerPulse, innerPulse);
        
        // Inner halo
        const innerHalo = ctx.createRadialGradient(0, 0, 0, 0, 0, 120);
        innerHalo.addColorStop(0, "rgba(232, 200, 90, 0.08)");
        innerHalo.addColorStop(0.5, "rgba(232, 200, 90, 0.02)");
        innerHalo.addColorStop(1, "rgba(232, 200, 90, 0)");
        ctx.beginPath();
        ctx.arc(0, 0, 120, 0, Math.PI * 2);
        ctx.fillStyle = innerHalo;
        ctx.fill();
        
        // Mini Statue silhouette
        ctx.fillStyle = "rgba(248, 243, 232, 0.12)";
        ctx.beginPath();
        ctx.moveTo(-20, -10);
        ctx.bezierCurveTo(-28, 5, -32, 25, -16, 45);
        ctx.bezierCurveTo(-4, 50, 4, 50, 16, 45);
        ctx.bezierCurveTo(32, 25, 28, 5, 20, -10);
        ctx.closePath();
        ctx.fill();
        
        // Crown
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 12, Math.sin(angle) * 12 - 10);
          ctx.lineTo(Math.cos(angle) * 18, Math.sin(angle) * 18 - 10);
          ctx.strokeStyle = "rgba(248, 243, 232, 0.12)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        
        ctx.restore();

        // Rays continue slow spiral
        rayRotationRef.current += 0.000001;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef, isReducedMotion, onComplete, getLetterPositions, drawStatue, drawSpiralRays, lang]);

  return null;
}

export default KOALogoIntro;
