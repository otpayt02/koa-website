"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * KOA Logo Intro Sequence - "The Beacon"
 * 
 * Phase 1: The Spark (0-1.5s) - Single point of light, subtle sunshine rays
 * Phase 2: Statue of Liberty Emerges (1.5-3.5s) - Silhouette rises from light
 * Phase 3: KOA Letters Form (3.5-5.5s) - Glyphs swarm into K, O, A
 * Phase 4: The Reveal (5.5-7.5s) - Logo scales, O dissolves, K/A settle
 * Phase 5: The O Forms (7.5-9s) - Glyphs converge from off-screen to form O
 * Phase 6: Idle Breathing (9s+) - Subtle ray rotation, glyph breathing
 */

interface IntroPhase {
  name: string;
  start: number;
  end: number;
  progress: number;
}

const PHASES: IntroPhase[] = [
  { name: "spark", start: 0, end: 1500, progress: 0 },
  { name: "statue", start: 1500, end: 3500, progress: 0 },
  { name: "letters", start: 3500, end: 5500, progress: 0 },
  { name: "reveal", start: 5500, end: 7500, progress: 0 },
  { name: "o-form", start: 7500, end: 9000, progress: 0 },
  { name: "idle", start: 9000, end: Infinity, progress: 1 },
];

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
  state: "streaming" | "forming" | "formed" | "dispersing" | "idle";
  targetLetter: "K" | "O" | "A" | null;
  letterIndex: number;
  delay: number;
  noiseOffset: number;
}

const KAREN_GLYPHS = [
  "က", "ခ", "ဂ", "ဃ", "င", "စ", "ဆ", "ဇ", "ဈ", "ဉ", "ည", "ဋ", "ဌ", "ဍ", "ဎ", "ဏ",
  "တ", "ထ", "ဒ", "ဓ", "န", "ပ", "ဖ", "ဗ", "ဘ", "မ", "ယ", "ရ", "လ", "ဝ", "သ", "ဟ",
  "ဠ", "အ", "ဢ", "ါ", "ာ", "ိ", "ီ", "ု", "ူ", "ေ", "ဲ", "ဳ", "ံ", "့", "း", "္", "်",
  "ၢ", "ၣ", "ၤ", "ၥ", "ၦ", "ၧ", "ၨ", "ၩ", "ၪ", "ၫ", "ၬ", "ၭ", "ၮ", "ၯ",
  "ၰ", "ၱ", "ၲ", "ၳ", "ၴ", "ၵ", "ၶ", "ၷ", "ၸ", "ၹ", "ၺ", "ၻ", "ၼ", "ၽ", "ၾ", "ၿ",
  "၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"
];

// Letter shapes defined as glyph positions (relative coordinates)
const LETTER_SHAPES = {
  K: [
    [-1, -1.2], [-1, -0.6], [-1, 0], [-1, 0.6], [-1, 1.2],  // Vertical stem
    [-0.3, 0], [0.4, 0.6], [0.4, -0.6],  // Diagonals
  ],
  O: [
    [-0.7, -0.9], [0, -1.1], [0.7, -0.9], [1.0, -0.4], [1.0, 0], [1.0, 0.4],
    [0.7, 0.9], [0, 1.1], [-0.7, 0.9], [-1.0, 0.4], [-1.0, 0], [-1.0, -0.4],
  ],
  A: [
    [-0.8, 0.6], [-0.4, -0.6], [0, -0.9], [0.4, -0.6], [0.8, 0.6],  // Outer
    [-0.3, 0], [0.3, 0],  // Crossbar
  ],
};

export function KOALogoIntro({
  canvasRef,
  onComplete,
  isReducedMotion = false,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onComplete?: () => void;
  isReducedMotion?: boolean;
}) {
  const [phase, setPhase] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const particlesRef = useRef<GlyphParticle[]>([]);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);
  const statueYRef = useRef(1); // Start below screen
  const logoScaleRef = useRef(0.1);
  const rayRotationRef = useRef(0);
  const haloIntensityRef = useRef(0);

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

    // Initialize particles for streaming from torch
    particlesRef.current = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      char: KAREN_GLYPHS[Math.floor(Math.random() * KAREN_GLYPHS.length)],
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.85,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight * 0.85,
      size: 12 + Math.random() * 20,
      opacity: 0,
      rotation: (Math.random() - 0.5) * 0.5,
      targetRotation: 0,
      vx: (Math.random() - 0.5) * 2,
      vy: -1 - Math.random() * 3,
      state: "streaming",
      targetLetter: null,
      letterIndex: -1,
      delay: Math.random() * 2000,
      noiseOffset: Math.random() * 10000,
    }));

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef]);

  // Perlin noise
  const noise = useCallback((x: number, y: number) => {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }, []);

  // Get letter glyph positions
  const getLetterPositions = useCallback((letter: "K" | "O" | "A", centerX: number, centerY: number, scale: number) => {
    const shape = LETTER_SHAPES[letter];
    return shape.map(([x, y]) => ({
      x: centerX + x * scale * 40,
      y: centerY + y * scale * 40,
    }));
  }, []);

  // Main animation loop
  useEffect(() => {
    if (isReducedMotion) {
      // Skip to end instantly
      setPhase(PHASES.length - 1);
      setPhaseProgress(1);
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

      // Phase-specific logic
      const particles = particlesRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      // Clear
      ctx.fillStyle = "#040818";
      ctx.fillRect(0, 0, width, height);

      // Sunshine rays (all phases)
      const rayCount = 5;
      const rayProgress = Math.min(1, elapsed / 9000);
      const rayOpacity = 0.02 + rayProgress * 0.08;
      rayRotationRef.current = elapsed * 0.00005; // Very slow rotation
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rayRotationRef.current);
      
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2;
        const rayLength = Math.max(width, height) * 0.8;
        
        const gradient = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
        gradient.addColorStop(0, `rgba(232, 200, 90, ${rayOpacity})`);
        gradient.addColorStop(0.5, `rgba(232, 200, 90, ${rayOpacity * 0.3})`);
        gradient.addColorStop(1, `rgba(232, 200, 90, 0)`);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
        ctx.lineWidth = 2 + Math.sin(elapsed * 0.001 + i) * 1;
        ctx.strokeStyle = gradient;
        ctx.stroke();
      }
      ctx.restore();

      // Phase 1: The Spark
      if (currentPhase === 0) {
        const p = currentProgress;
        const sparkSize = 4 + p * 60;
        const sparkOpacity = 0.3 + p * 0.4;
        
        ctx.save();
        ctx.translate(centerX, centerY + height * 0.3 * (1 - p));
        
        // Glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, sparkSize * 3);
        gradient.addColorStop(0, `rgba(255, 248, 230, ${sparkOpacity})`);
        gradient.addColorStop(0.5, `rgba(232, 200, 90, ${sparkOpacity * 0.5})`);
        gradient.addColorStop(1, `rgba(232, 200, 90, 0)`);
        
        ctx.beginPath();
        ctx.arc(0, 0, sparkSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Core
        ctx.beginPath();
        ctx.arc(0, 0, sparkSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 250, 240, ${sparkOpacity})`;
        ctx.fill();
        ctx.restore();
      }

      // Phase 2: Statue of Liberty Emerges
      if (currentPhase >= 1) {
        const p = currentPhase === 1 ? currentProgress : 1;
        
        // Statue rises from bottom
        statueYRef.current = 1 - p * 1.2; // From 1 (below) to -0.2 (above center)
        const statueY = centerY + statueYRef.current * height * 0.4;
        
        // Halo behind statue
        haloIntensityRef.current = 0.3 + p * 0.4;
        
        ctx.save();
        ctx.translate(centerX, statueY);
        
        // Halo glow
        const haloGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
        haloGradient.addColorStop(0, `rgba(232, 200, 90, ${haloIntensityRef.current * 0.3})`);
        haloGradient.addColorStop(1, `rgba(232, 200, 90, 0)`);
        ctx.beginPath();
        ctx.arc(0, -50, 200, 0, Math.PI * 2);
        ctx.fillStyle = haloGradient;
        ctx.fill();
        
        // Statue silhouette (simplified)
        ctx.fillStyle = `rgba(4, 8, 24, ${0.8 + p * 0.2})`;
        
        // Body
        ctx.beginPath();
        ctx.ellipse(0, 30, 60 * p, 120 * p, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Arm with torch
        ctx.beginPath();
        ctx.moveTo(60 * p, -20);
        ctx.lineTo(120 * p, -100);
        ctx.lineWidth = 8 * p;
        ctx.strokeStyle = `rgba(4, 8, 24, ${0.8 + p * 0.2})`;
        ctx.lineCap = "round";
        ctx.stroke();
        
        // Torch flame
        const flameGradient = ctx.createRadialGradient(120 * p, -100, 0, 120 * p, -100, 30);
        flameGradient.addColorStop(0, `rgba(255, 248, 230, ${p})`);
        flameGradient.addColorStop(1, `rgba(232, 200, 90, 0)`);
        ctx.beginPath();
        ctx.arc(120 * p, -100, 30, 0, Math.PI * 2);
        ctx.fillStyle = flameGradient;
        ctx.fill();
        
        ctx.restore();

        // Stream glyphs from torch
        if (currentPhase === 1) {
          particles.forEach(pt => {
            if (pt.state === "streaming" && elapsed > pt.delay) {
              pt.x += pt.vx;
              pt.y += pt.vy;
              pt.vy += 0.02; // Gravity
              pt.vx *= 0.99;
              pt.opacity = Math.min(0.8, pt.opacity + 0.01);
              
              // Fade out as they rise
              if (pt.y < centerY - 200) {
                pt.opacity *= 0.98;
              }
              
              if (pt.opacity > 0.01 && pt.y > -50 && pt.y < height + 50) {
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
      }

      // Phase 3: KOA Letters Form
      if (currentPhase >= 2) {
        const p = currentPhase === 2 ? currentProgress : 1;
        
        // Navy background fades in
        const navyOpacity = Math.min(1, (elapsed - 3500) / 2000);
        ctx.fillStyle = `rgba(4, 8, 24, ${navyOpacity})`;
        ctx.fillRect(0, 0, width, height);
        
        // Statue fades out
        if (currentPhase > 2) {
          statueYRef.current -= 0.005;
        }
        
        // Letter positions
        const letterScale = 0.8 + p * 0.5;
        const kPos = getLetterPositions("K", centerX - 180 * letterScale, centerY, letterScale);
        const oPos = getLetterPositions("O", centerX, centerY, letterScale);
        const aPos = getLetterPositions("A", centerX + 180 * letterScale, centerY, letterScale);
        
        // Assign particles to letters
        if (currentPhase === 2) {
          let particleIdx = 0;
          
          [...kPos, ...oPos, ...aPos].forEach((pos, idx) => {
            if (particleIdx < particles.length) {
              const pt = particles[particleIdx];
              const letter = idx < kPos.length ? "K" : idx < kPos.length + oPos.length ? "O" : "A";
              const letterIdx = idx < kPos.length ? idx : idx < kPos.length + oPos.length ? idx - kPos.length : idx - kPos.length - oPos.length;
              
              pt.targetX = pos.x + (Math.random() - 0.5) * 10;
              pt.targetY = pos.y + (Math.random() - 0.5) * 10;
              pt.targetRotation = 0;
              pt.state = "forming";
              pt.targetLetter = letter;
              pt.letterIndex = letterIdx;
              pt.delay = letterIdx * 30 + (letter === "O" ? kPos.length * 30 : 0) + (letter === "A" ? (kPos.length + oPos.length) * 30 : 0);
              pt.size = 24 + Math.random() * 12;
              particleIdx++;
            }
          });
        }
        
        // Animate forming particles
        particles.forEach(pt => {
          if (pt.state === "forming") {
            const localProgress = Math.min(1, Math.max(0, (elapsed - PHASES[2].start - pt.delay) / 1000));
            if (localProgress > 0) {
              const eased = 1 - Math.pow(1 - localProgress, 3);
              pt.x += (pt.targetX - pt.x) * eased * 0.2;
              pt.y += (pt.targetY - pt.y) * eased * 0.2;
              pt.opacity = Math.min(0.95, pt.opacity + eased * 0.05);
              pt.rotation += (pt.targetRotation - pt.rotation) * eased * 0.1;
              
              if (localProgress >= 1) {
                pt.state = "formed";
              }
            }
          }
          
          if (pt.state === "formed" || pt.state === "forming") {
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
        
        // Logo scale increases
        logoScaleRef.current = 1 + p * 3;
      }

      // Phase 4: The Reveal
      if (currentPhase >= 3) {
        const p = currentPhase === 3 ? currentProgress : 1;
        
        // Navy background full
        ctx.fillStyle = "#040818";
        ctx.fillRect(0, 0, width, height);
        
        // Logo continues growing
        const scale = logoScaleRef.current * (1 + p * 2);
        
        // O dissolves
        const oDissolveProgress = Math.min(1, p * 1.5);
        
        particles.forEach(pt => {
          if (pt.targetLetter === "O" && (pt.state === "formed" || pt.state === "forming")) {
            if (oDissolveProgress > 0) {
              // Explode outward
              const angle = Math.atan2(pt.y - centerY, pt.x - centerX);
              const distance = 300 * oDissolveProgress;
              pt.targetX = centerX + Math.cos(angle) * distance + (Math.random() - 0.5) * 100;
              pt.targetY = centerY + Math.sin(angle) * distance + (Math.random() - 0.5) * 100;
              pt.targetRotation = (Math.random() - 0.5) * Math.PI;
              pt.state = "dispersing";
            }
          }
          
          if (pt.state === "dispersing" && pt.targetLetter === "O") {
            const dx = pt.targetX - pt.x;
            const dy = pt.targetY - pt.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist > 5) {
              pt.vx = (dx / dist) * 8;
              pt.vy = (dy / dist) * 8;
              pt.x += pt.vx;
              pt.y += pt.vy;
              pt.opacity *= 0.98;
              pt.rotation += (pt.targetRotation - pt.rotation) * 0.1;
            } else {
              pt.state = "idle";
              pt.opacity = 0.02 + Math.random() * 0.04;
            }
          }
          
          // K and A settle to horizontal axis
          if ((pt.targetLetter === "K" || pt.targetLetter === "A") && pt.state === "formed") {
            pt.targetY = centerY;
            pt.y += (pt.targetY - pt.y) * 0.05;
            // Gentle breathe
            pt.opacity = 0.95 * (0.98 + Math.sin(time * 0.002 + pt.id) * 0.02);
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
        
        // Logo mark fades away
        const logoOpacity = 1 - p;
        if (logoOpacity > 0) {
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.scale(scale, scale);
          ctx.globalAlpha = logoOpacity * 0.5;
          // Would draw logo here if we had it as path
          ctx.restore();
        }
      }

      // Phase 5: The O Forms
      if (currentPhase >= 4) {
        const p = currentPhase === 4 ? currentProgress : 1;
        
        ctx.fillStyle = "#040818";
        ctx.fillRect(0, 0, width, height);
        
        // K and A stay formed at center line
        particles.forEach(pt => {
          if ((pt.targetLetter === "K" || pt.targetLetter === "A") && pt.state === "formed") {
            pt.targetY = centerY;
            pt.y += (pt.targetY - pt.y) * 0.03;
            pt.opacity = 0.95 * (0.98 + Math.sin(time * 0.002 + pt.id) * 0.02);
            
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
        
        // New O forms from off-screen
        if (currentPhase === 4) {
          const oPositions = getLetterPositions("O", centerX, centerY, 1.5);
          
          // Create new particles for O if needed
          let oParticleIdx = 0;
          particles.forEach(pt => {
            if (pt.state === "idle" && oParticleIdx < oPositions.length) {
              const pos = oPositions[oParticleIdx];
              // Start from off-screen
              const side = Math.floor(Math.random() * 4);
              let startX, startY;
              switch (side) {
                case 0: startX = pos.x; startY = -100; break; // Top
                case 1: startX = width + 100; startY = pos.y; break; // Right
                case 2: startX = pos.x; startY = height + 100; break; // Bottom
                case 3: startX = -100; startY = pos.y; break; // Left
              }
              
              pt.x = startX;
              pt.y = startY;
              pt.targetX = pos.x;
              pt.targetY = pos.y;
              pt.targetRotation = 0;
              pt.state = "forming";
              pt.targetLetter = "O";
              pt.letterIndex = oParticleIdx;
              pt.delay = oParticleIdx * 20;
              pt.size = 28 + Math.random() * 10;
              pt.opacity = 0;
              oParticleIdx++;
            }
          });
          
          // Animate O particles
          particles.forEach(pt => {
            if (pt.targetLetter === "O" && pt.state === "forming") {
              const localProgress = Math.min(1, Math.max(0, (elapsed - PHASES[4].start - pt.delay) / 1200));
              if (localProgress > 0) {
                const eased = 1 - Math.pow(1 - localProgress, 4);
                pt.x += (pt.targetX - pt.x) * eased * 0.15;
                pt.y += (pt.targetY - pt.y) * eased * 0.15;
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
      }

      // Phase 6: Idle Breathing
      if (currentPhase >= 5) {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
        
        // All three letters breathing
        particles.forEach(pt => {
          if (pt.state === "formed") {
            pt.opacity = 0.9 * (0.97 + Math.sin(time * 0.0015 + pt.id) * 0.03);
            pt.rotation = Math.sin(time * 0.0008 + pt.id) * 0.02;
            
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
        
        // Rays continue slow rotation
        rayRotationRef.current += 0.000002;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef, isReducedMotion, onComplete, getLetterPositions]);

  // Render nothing - this is a canvas animation controller
  return null;
}

export default KOALogoIntro;