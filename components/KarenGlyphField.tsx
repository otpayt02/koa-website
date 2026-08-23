"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Karen Glyph Particle System ("The Loom")
 * 
 * A living field of Karen script glyphs that:
 * - Disperses smoothly in idle state (Brownian + Perlin flow)
 * - Assembles into words/phrases on trigger
 * - Explodes back to dispersion
 * - Never renders behind foreground elements (occlusion)
 * - Chapter numbers display in Burmese with Arabic flash
 */

// Karen script Unicode ranges and common characters
const KAREN_CONSONANTS = [
  "က", "ခ", "ဂ", "ဃ", "င", "စ", "ဆ", "ဇ", "ဈ", "ဉ", "ည", "ဋ", "ဌ", "ဍ", "ဎ", "ဏ",
  "တ", "ထ", "ဒ", "ဓ", "န", "ပ", "ဖ", "ဗ", "ဘ", "မ", "ယ", "ရ", "လ", "ဝ", "သ", "ဟ",
  "ဠ", "အ", "ဢ"
];

const KAREN_VOWELS_TONES = [
  "ါ", "ာ", "ိ", "ီ", "ု", "ူ", "ေ", "ဲ", "ဳ", "ံ", "့", "း", "္", "်",
  "ၢ", "ၣ", "ၤ", "ၥ", "ၦ", "ၧ", "ၨ", "ၩ", "ၪ", "ၫ", "ၬ", "ၭ", "ၮ", "ၯ",
  "ၰ", "ၱ", "ၲ", "ၳ", "ၴ", "ၵ", "ၶ", "ၷ", "ၸ", "ၹ", "ၺ", "ၻ", "ၼ", "ၽ", "ၾ", "ၿ"
];

const KAREN_NUMBERS = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];

const KAREN_ALL_GLYPHS = [...KAREN_CONSONANTS, ...KAREN_VOWELS_TONES, ...KAREN_NUMBERS];

// Common Karen words for formation
const KAREN_WORDS = {
  KOA: "ကွၢ်ဃု",
  KAREN: "ကညီ",
  LANGUAGE: "ကညီကျိာ်",
  COMMUNITY: "ပှၤတဝၢ",
  UNITY: "မၤဂၢၢ်မၤကျၢ",
  RIGHTS: "ဒီသဒၢတၢ်ခွဲးတၢ်ယာ်",
  BELONGING: "ဖိး",
  VOICE: "သး",
  HOME: "အမဲရကၤ",
  FUTURE: "ဒီးသ့တၢ်ဘၣ်လၢ",
  TOGETHER: "ခု",
  THANK_YOU: "တၢ်ဘျုး",
  PEOPLE: "ကညီကျိာ်",
  WORD: "စာ",
  HEART: "နんんっ/",
  SPIRIT: "သးၣ်သံ",
};

interface GlyphParticle {
  id: number;
  char: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  rotation: number;
  targetRotation: number;
  vx: number;
  vy: number;
  state: "idle" | "forming" | "formed" | "dispersing";
  formationIndex: number;
  formationDelay: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
  speed: number;
}

interface FormationTarget {
  text: string;
  x: number;
  y: number;
  size: number;
  glyphs: GlyphParticle[];
}

const PARTICLE_COUNT = 300;
const VIEWPORT_PADDING = 100;
const IDLE_OPACITY_MIN = 0.015;
const IDLE_OPACITY_MAX = 0.06;
const FORM_OPACITY = 0.95;
const FORM_DURATION = 1200;
const DISPERSE_DURATION = 800;
const DIRECTION_CHANGE_INTERVAL = 5000;

export function KarenGlyphField({
  canvasRef,
  isReducedMotion,
  formationTriggers = [],
  chapterNumber = 0,
  showChapterNumber = false,
  occlusionElements = [],
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isReducedMotion: boolean;
  formationTriggers?: Array<{ id: string; text: string; x: number; y: number; size: number; progress: number }>;
  chapterNumber?: number;
  showChapterNumber?: boolean;
  occlusionElements?: Array<{ x: number; y: number; width: number; height: number }>;
}) {
  const particlesRef = useRef<GlyphParticle[]>([]);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const formationsRef = useRef<Map<string, FormationTarget>>(new Map());
  const directionAngleRef = useRef<number>(Math.random() * Math.PI * 2);
  const lastDirectionChangeRef = useRef<number>(0);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const occlusionPathsRef = useRef<Path2D[]>([]);

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvasSizeRef.current.width = window.innerWidth;
      canvasSizeRef.current.height = window.innerHeight;
      canvas.width = canvasSizeRef.current.width * dpr;
      canvas.height = canvasSizeRef.current.height * dpr;
      canvas.style.width = `${canvasSizeRef.current.width}px`;
      canvas.style.height = `${canvasSizeRef.current.height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      char: KAREN_ALL_GLYPHS[Math.floor(Math.random() * KAREN_ALL_GLYPHS.length)],
      x: Math.random() * (canvasSizeRef.current.width - VIEWPORT_PADDING * 2) + VIEWPORT_PADDING,
      y: Math.random() * (canvasSizeRef.current.height - VIEWPORT_PADDING * 2) + VIEWPORT_PADDING,
      targetX: 0,
      targetY: 0,
      size: 8 + Math.random() * 16,
      baseOpacity: IDLE_OPACITY_MIN + Math.random() * (IDLE_OPACITY_MAX - IDLE_OPACITY_MIN),
      opacity: IDLE_OPACITY_MIN + Math.random() * (IDLE_OPACITY_MAX - IDLE_OPACITY_MIN),
      rotation: (Math.random() - 0.5) * 0.3,
      targetRotation: 0,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      state: "idle",
      formationIndex: -1,
      formationDelay: Math.random() * 500,
      noiseOffsetX: Math.random() * 10000,
      noiseOffsetY: Math.random() * 10000,
      speed: 0.15 + Math.random() * 0.25,
    }));

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef]);

  // Perlin noise helper (simplified)
  const noise = useCallback((x: number, y: number) => {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }, []);

  // Update occlusion paths
  useEffect(() => {
    occlusionPathsRef.current = occlusionElements.map(el => {
      const path = new Path2D();
      path.rect(el.x, el.y, el.width, el.height);
      return path;
    });
  }, [occlusionElements]);

  // Check if point is in any occlusion element
  const isOccluded = useCallback((x: number, y: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || occlusionPathsRef.current.length === 0) return false;
    return occlusionPathsRef.current.some(path => ctx.isPointInPath(path, x, y));
  }, [canvasRef]);

  // Burmese numerals
  const toBurmese = (num: number): string => {
    return num.toString().split("").map(d => KAREN_NUMBERS[parseInt(d)]).join("");
  };

  // Main animation loop
  useEffect(() => {
    if (isReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = (time: number) => {
      const dt = Math.min(time - lastTimeRef.current, 33); // Cap at ~30fps min
      lastTimeRef.current = time;

      const width = canvasSizeRef.current.width;
      const height = canvasSizeRef.current.height;
      const particles = particlesRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update direction flow occasionally
      if (time - lastDirectionChangeRef.current > DIRECTION_CHANGE_INTERVAL) {
        directionAngleRef.current += (Math.random() - 0.5) * Math.PI * 0.5;
        lastDirectionChangeRef.current = time;
      }

      // Process formation triggers
      formationTriggers.forEach(trigger => {
        if (trigger.progress > 0 && trigger.progress < 1) {
          const key = trigger.id;
          let formation = formationsRef.current.get(key);
          
          if (!formation) {
            // Create new formation
            const chars = trigger.text.split("");
            const glyphs: GlyphParticle[] = chars.map((char, idx) => {
              // Find available particles
              const available = particles.filter(p => p.state === "idle");
              const particle = available[Math.floor(Math.random() * available.length)] || particles[idx % particles.length];
              
              const charWidth = trigger.size * 0.6;
              const startX = trigger.x - (chars.length - 1) * charWidth / 2 + idx * charWidth;
              
              particle.char = char;
              particle.targetX = startX;
              particle.targetY = trigger.y;
              particle.targetRotation = 0;
              particle.state = "forming";
              particle.formationIndex = idx;
              particle.formationDelay = idx * 40;
              particle.baseOpacity = FORM_OPACITY;
              
              return particle;
            });
            
            formation = { text: trigger.text, x: trigger.x, y: trigger.y, size: trigger.size, glyphs };
            formationsRef.current.set(key, formation);
          } else {
            // Update existing formation progress
            formation.glyphs.forEach(p => {
              if (p.state === "forming") {
                const progress = Math.min(1, (trigger.progress * FORM_DURATION - p.formationDelay) / FORM_DURATION);
                if (progress > 0) {
                  const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                  p.x += (p.targetX - p.x) * eased * 0.15;
                  p.y += (p.targetY - p.y) * eased * 0.15;
                  p.opacity += (FORM_OPACITY - p.opacity) * eased * 0.1;
                  p.rotation += (p.targetRotation - p.rotation) * eased * 0.1;
                  if (progress >= 1) p.state = "formed";
                }
              }
            });
          }
        } else if (trigger.progress >= 1) {
          // Formation complete - hold
          const formation = formationsRef.current.get(trigger.id);
          if (formation) {
            formation.glyphs.forEach(p => {
              if (p.state === "formed") {
                p.opacity = FORM_OPACITY;
                // Gentle breathe
                p.opacity = FORM_OPACITY * (0.98 + Math.sin(time * 0.002 + p.id) * 0.02);
              }
            });
          }
        } else {
          // Trigger ended - disperse
          const formation = formationsRef.current.get(trigger.id);
          if (formation) {
            formation.glyphs.forEach(p => {
              if (p.state === "formed" || p.state === "forming") {
                p.state = "dispersing";
                p.targetX = Math.random() * (width - VIEWPORT_PADDING * 2) + VIEWPORT_PADDING;
                p.targetY = Math.random() * (height - VIEWPORT_PADDING * 2) + VIEWPORT_PADDING;
                p.targetRotation = (Math.random() - 0.5) * 0.5;
                p.baseOpacity = IDLE_OPACITY_MIN + Math.random() * (IDLE_OPACITY_MAX - IDLE_OPACITY_MIN);
              }
            });
            // Remove after dispersion
            setTimeout(() => formationsRef.current.delete(trigger.id), DISPERSE_DURATION + 500);
          }
        }
      });

      // Update all particles
      particles.forEach(p => {
        // Skip if in formation and not dispersing
        if (p.state === "formed") return;
        
        if (p.state === "dispersing") {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < 2) {
            p.state = "idle";
            p.vx = (Math.random() - 0.5) * 0.3;
            p.vy = (Math.random() - 0.5) * 0.3;
            p.opacity = p.baseOpacity;
          } else {
            const force = Math.min(1, dist / 200);
            p.vx += (dx / dist) * force * 0.08;
            p.vy += (dy / dist) * force * 0.08;
            p.opacity += (p.baseOpacity - p.opacity) * 0.02;
            p.rotation += (p.targetRotation - p.rotation) * 0.02;
          }
        } else if (p.state === "forming") {
          // Handled in formation trigger processing
        } else {
          // Idle state - Brownian + Perlin flow
          const nx = noise(p.noiseOffsetX + time * 0.0001, p.noiseOffsetY);
          const ny = noise(p.noiseOffsetX, p.noiseOffsetY + time * 0.0001);
          
          // Flow field direction
          const flowAngle = directionAngleRef.current + (nx - 0.5) * Math.PI * 0.3;
          const flowStrength = 0.02;
          
          p.vx += Math.cos(flowAngle) * flowStrength + (nx - 0.5) * 0.005;
          p.vy += Math.sin(flowAngle) * flowStrength + (ny - 0.5) * 0.005;
          
          // Damping
          p.vx *= 0.98;
          p.vy *= 0.98;
          
          // Speed limit
          const speed = Math.hypot(p.vx, p.vy);
          if (speed > p.speed) {
            p.vx = (p.vx / speed) * p.speed;
            p.vy = (p.vy / speed) * p.speed;
          }
          
          // Update position
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          
          // Wrap around viewport (with padding)
          if (p.x < VIEWPORT_PADDING) p.x = width - VIEWPORT_PADDING;
          if (p.x > width - VIEWPORT_PADDING) p.x = VIEWPORT_PADDING;
          if (p.y < VIEWPORT_PADDING) p.y = height - VIEWPORT_PADDING;
          if (p.y > height - VIEWPORT_PADDING) p.y = VIEWPORT_PADDING;
          
          // Subtle opacity variation
          p.opacity = p.baseOpacity * (0.9 + Math.sin(time * 0.001 + p.id) * 0.1);
        }
      });

      // Render particles (back to front by size for depth)
      const sortedParticles = [...particles].sort((a, b) => a.size - b.size);
      
      ctx.font = "400 16px 'Noto Sans Myanmar', sans-serif";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      
      sortedParticles.forEach(p => {
        // Skip if occluded
        if (isOccluded(p.x, p.y)) return;
        
        // Skip if fully transparent
        if (p.opacity < 0.005) return;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px 'Noto Sans Myanmar', sans-serif`;
        ctx.fillStyle = "#f8f3e8"; // Cream color
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      });

      // Render chapter number if active
      if (showChapterNumber && chapterNumber > 0) {
        const burmeseNum = toBurmese(chapterNumber);
        const arabicNum = chapterNumber.toString();
        
        // Flash between Burmese and Arabic
        const flashCycle = Math.floor(time / 150) % 2; // Flash every 150ms
        const displayText = flashCycle === 0 ? burmeseNum : arabicNum;
        
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.globalAlpha = 0.15;
        ctx.font = `700 ${Math.min(width, height) * 0.15}px 'Noto Sans Myanmar', 'Libre Caslon Display', serif`;
        ctx.fillStyle = "#f8f3e8";
        ctx.fillText(displayText, 0, 0);
        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isReducedMotion, formationTriggers, chapterNumber, showChapterNumber, canvasRef, occlusionElements]);

  return null; // Rendered via canvas
}

export default KarenGlyphField;