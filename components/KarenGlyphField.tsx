"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Lang } from "./i18n";

/**
 * Karen Glyph Field v2 - "The Living Loom" (Enhanced Deluxe)
 * 
 * Features:
 * - Fish-like floating glyphs with natural schooling behavior
 * - Cursor reveal: hovering reveals glyphs in radius
 * - Spawn/fade: glyphs continuously spawn and fade out
 * - Dithering ASCII background texture
 * - Occlusion: never behind foreground elements
 * - Chapter convergence: glyphs form Burmese numerals
 * - Perlin flow field for natural movement
 * - Bilingual support
 */

// Karen script character sets
const KAREN_CONSONANTS = [
  "က", "ခ", "ဂ", "ဃ", "င", "စ", "ဆ", "ဇ", "ဈ", "ဉ", "ည", "ဋ", "ဌ", "ဍ", "ဎ", "ဏ",
  "တ", "ထ", "ဒ", "ဓ", "န", "ပ", "ဖ", "ဗ", "ဘ", "မ", "ယ", "ရ", "လ", "ဝ", "သ", "ဟ",
  "ဠ", "အ", "ဢ"
];

const KAREN_VOWELS_TONES = [
  "ါ", "ာ", "ိ", "ီ", "ု", "ူ", "ေ", "ဲ", "ဳ", "ံ", "၇", "း", "္", "်",
  "ၢ", "ၣ", "ၤ", "ၥ", "ၦ", "ၧ", "ၨ", "ၩ", "ၪ", "ၫ", "ၬ", "ၭ", "ၮ", "ၯ",
  "ၰ", "ၱ", "ၲ", "ၳ", "ၴ", "ၵ", "ၶ", "ၷ", "ၸ", "ၹ", "ၺ", "ၻ", "ၼ", "ၽ", "ၾ", "ၿ"
];

const KAREN_NUMBERS = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];

const KAREN_ALL_GLYPHS = [...KAREN_CONSONANTS, ...KAREN_VOWELS_TONES, ...KAREN_NUMBERS];

// Dithering patterns for ASCII background
const DITHER_PATTERNS = [
  " ", "░", "▒", "▓", "█",
  "·", "•", "◦", "◘", "◙",
  "၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"
];

interface GlyphParticle {
  id: number;
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  rotation: number;
  targetRotation: number;
  state: "idle" | "forming" | "formed" | "dispersing" | "revealed" | "cursor-following";
  formationIndex: number;
  formationDelay: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
  speed: number;
  maxSpeed: number;
  schoolForce: number;
  separationDistance: number;
  life: number;
  maxLife: number;
  isDither: boolean;
  ditherChar: string;
  targetX: number;
  targetY: number;
}

interface FormationTarget {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  glyphs: GlyphParticle[];
  progress: number;
}

interface CursorReveal {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  active: boolean;
}

const PARTICLE_COUNT = 400;
const DITHER_PARTICLE_COUNT = 200;
const VIEWPORT_PADDING = 80;
const IDLE_OPACITY_MIN = 0.008;
const IDLE_OPACITY_MAX = 0.04;
const REVEALED_OPACITY = 0.35;
const FORM_OPACITY = 0.9;
const FORM_DURATION = 1500;
const DISPERSE_DURATION = 1000;
const DIRECTION_CHANGE_INTERVAL = 8000;
const MAX_LIFE = 30000; // 30 seconds max life
const SPAWN_INTERVAL = 80; // ms between spawns
const CURSOR_REVEAL_RADIUS = 200;
const SCHOOLING_RADIUS = 120;
const SEPARATION_RADIUS = 35;

export function KarenGlyphField({
  canvasRef,
  isReducedMotion,
  formationTriggers = [],
  chapterNumber = 0,
  showChapterNumber = false,
  occlusionElements = [],
  lang = "en",
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isReducedMotion: boolean;
  formationTriggers?: Array<{ id: string; text: string; x: number; y: number; size: number; progress: number }>;
  chapterNumber?: number;
  showChapterNumber?: boolean;
  occlusionElements?: Array<{ x: number; y: number; width: number; height: number }>;
  lang?: Lang;
}) {
  const particlesRef = useRef<GlyphParticle[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const formationsRef = useRef<Map<string, FormationTarget>>(new Map());
  const directionAngleRef = useRef<number>(0);
  const lastDirectionChangeRef = useRef<number>(0);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const occlusionPathsRef = useRef<Path2D[]>([]);
  const cursorRevealRef = useRef<CursorReveal>({
    x: 0,
    y: 0,
    radius: CURSOR_REVEAL_RADIUS,
    intensity: 0,
    active: false,
  });
  const lastSpawnRef = useRef<number>(0);
  const ditherPatternRef = useRef<string[][]>([]);

  // Initialize particles and dither pattern
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvasSizeRef.current.width = window.innerWidth;
      canvasSizeRef.current.height = window.innerHeight;
      canvas.width = canvasSizeRef.current.width * dpr;
      canvas.height = canvasSizeRef.current.height * dpr;
      canvas.style.width = `${canvasSizeRef.current.width}px`;
      canvas.style.height = `${canvasSizeRef.current.height}px`;
      ctx.scale(dpr, dpr);

      // Initialize dither pattern grid
      const cellSize = 12;
      const cols = Math.ceil(canvasSizeRef.current.width / cellSize) + 2;
      const rows = Math.ceil(canvasSizeRef.current.height / cellSize) + 2;
      ditherPatternRef.current = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () =>
          DITHER_PATTERNS[Math.floor(Math.random() * DITHER_PATTERNS.length)]
        )
      );
    };

    resize();
    window.addEventListener("resize", resize);

    // Initialize particles (mix of glyphs and dither)
    const allParticles: GlyphParticle[] = [];

    // Regular glyph particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      allParticles.push({
        id: i,
        char: KAREN_ALL_GLYPHS[Math.floor(Math.random() * KAREN_ALL_GLYPHS.length)],
        x: Math.random() * (canvasSizeRef.current.width - VIEWPORT_PADDING * 2) + VIEWPORT_PADDING,
        y: Math.random() * (canvasSizeRef.current.height - VIEWPORT_PADDING * 2) + VIEWPORT_PADDING,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: 7 + Math.random() * 14,
        baseOpacity: IDLE_OPACITY_MIN + Math.random() * (IDLE_OPACITY_MAX - IDLE_OPACITY_MIN),
        opacity: IDLE_OPACITY_MIN + Math.random() * (IDLE_OPACITY_MAX - IDLE_OPACITY_MIN),
        rotation: (Math.random() - 0.5) * 0.2,
        targetRotation: 0,
        state: "idle",
        formationIndex: -1,
        formationDelay: Math.random() * 500,
        noiseOffsetX: Math.random() * 10000,
        noiseOffsetY: Math.random() * 10000,
        speed: 0.1 + Math.random() * 0.2,
        maxSpeed: 0.8,
        schoolForce: 0.0008,
        separationDistance: SEPARATION_RADIUS,
        life: Math.random() * MAX_LIFE,
        maxLife: MAX_LIFE,
        isDither: false,
        ditherChar: "",
        targetX: 0,
        targetY: 0,
      });
    }

    // Dither particles (ASCII-style background)
    for (let i = 0; i < DITHER_PARTICLE_COUNT; i++) {
      allParticles.push({
        id: PARTICLE_COUNT + i,
        char: "",
        x: Math.random() * canvasSizeRef.current.width,
        y: Math.random() * canvasSizeRef.current.height,
        vx: 0,
        vy: 0,
        size: 8 + Math.random() * 8,
        baseOpacity: 0.015 + Math.random() * 0.025,
        opacity: 0.015 + Math.random() * 0.025,
        rotation: 0,
        targetRotation: 0,
        state: "idle",
        formationIndex: -1,
        formationDelay: 0,
        noiseOffsetX: Math.random() * 10000,
        noiseOffsetY: Math.random() * 10000,
        speed: 0,
        maxSpeed: 0,
        schoolForce: 0,
        separationDistance: 0,
        life: MAX_LIFE,
        maxLife: MAX_LIFE,
        isDither: true,
        ditherChar: DITHER_PATTERNS[Math.floor(Math.random() * DITHER_PATTERNS.length)],
        targetX: 0,
        targetY: 0,
      });
    }

    particlesRef.current = allParticles;

    // Mouse move handler for cursor reveal
    const handleMouseMove = (e: MouseEvent) => {
      cursorRevealRef.current.x = e.clientX;
      cursorRevealRef.current.y = e.clientY;
      cursorRevealRef.current.active = true;
      cursorRevealRef.current.intensity = 1;
    };

    const handleMouseLeave = () => {
      cursorRevealRef.current.active = false;
      cursorRevealRef.current.intensity = 0;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef]);

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

  // Perlin noise helper
  const noise = useCallback((x: number, y: number) => {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }, []);

  // Burmese numerals
  const toBurmese = (num: number): string => {
    return num.toString().split("").map(d => KAREN_NUMBERS[parseInt(d)]).join("");
  };

  // Schooling behavior (fish-like)
  const applySchooling = useCallback((particle: GlyphParticle, allParticles: GlyphParticle[], dt: number) => {
    if (particle.isDither) return;

    let alignmentX = 0;
    let alignmentY = 0;
    let cohesionX = 0;
    let cohesionY = 0;
    let separationX = 0;
    let separationY = 0;
    let neighborCount = 0;

    allParticles.forEach(other => {
      if (other.id === particle.id || other.isDither) return;
      
      const dx = other.x - particle.x;
      const dy = other.y - particle.y;
      const dist = Math.hypot(dx, dy);

      if (dist < SCHOOLING_RADIUS && dist > 0) {
        // Alignment - match velocity
        alignmentX += other.vx;
        alignmentY += other.vy;
        
        // Cohesion - move toward center of neighbors
        cohesionX += dx;
        cohesionY += dy;
        
        neighborCount++;
      }

      if (dist < particle.separationDistance && dist > 0) {
        // Separation - avoid crowding
        const force = (particle.separationDistance - dist) / particle.separationDistance;
        separationX -= (dx / dist) * force * 0.5;
        separationY -= (dy / dist) * force * 0.5;
      }
    });

    if (neighborCount > 0) {
      alignmentX /= neighborCount;
      alignmentY /= neighborCount;
      cohesionX /= neighborCount;
      cohesionY /= neighborCount;

      // Apply schooling forces
      particle.vx += (alignmentX - particle.vx) * 0.01 + cohesionX * 0.0001 + separationX * 0.02;
      particle.vy += (alignmentY - particle.vy) * 0.01 + cohesionY * 0.0001 + separationY * 0.02;
    }
  }, []);

  // Cursor reveal effect
  const applyCursorReveal = useCallback((particle: GlyphParticle) => {
    if (!cursorRevealRef.current.active || particle.isDither) return;

    const dx = cursorRevealRef.current.x - particle.x;
    const dy = cursorRevealRef.current.y - particle.y;
    const dist = Math.hypot(dx, dy);

    if (dist < cursorRevealRef.current.radius && dist > 0) {
      const influence = (1 - dist / cursorRevealRef.current.radius) * cursorRevealRef.current.intensity;
      
      // Reveal glyph - increase opacity dramatically
      particle.opacity = Math.min(REVEALED_OPACITY, particle.opacity + influence * 0.05);
      particle.state = "revealed";
      
      // Gentle attraction to cursor
      const attractForce = influence * 0.0003;
      particle.vx += (dx / dist) * attractForce;
      particle.vy += (dy / dist) * attractForce;
      
      // Slight rotation toward cursor
      particle.targetRotation = Math.atan2(dy, dx) + Math.PI / 2;
    } else if (particle.state === "revealed") {
      // Fade back to idle
      particle.opacity = Math.max(particle.baseOpacity, particle.opacity - 0.005);
      if (particle.opacity <= particle.baseOpacity * 1.1) {
        particle.state = "idle";
      }
    }
  }, []);

  // Spawn new particles (continuous renewal)
  const spawnParticles = useCallback((time: number) => {
    const particles = particlesRef.current;
    const width = canvasSizeRef.current.width;
    const height = canvasSizeRef.current.height;
    
    if (time - lastSpawnRef.current > SPAWN_INTERVAL && particles.filter(p => !p.isDither).length < PARTICLE_COUNT) {
      // Spawn from edges
      const side = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;
      const margin = 50;
      
      switch (side) {
        case 0: x = Math.random() * width; y = -margin; break;
        case 1: x = width + margin; y = Math.random() * height; break;
        case 2: x = Math.random() * width; y = height + margin; break;
        case 3: x = -margin; y = Math.random() * height; break;
      }
      
      // Add new particle
      particles.push({
        id: Date.now() + Math.random(),
        char: KAREN_ALL_GLYPHS[Math.floor(Math.random() * KAREN_ALL_GLYPHS.length)],
        x, y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 7 + Math.random() * 14,
        baseOpacity: IDLE_OPACITY_MIN + Math.random() * (IDLE_OPACITY_MAX - IDLE_OPACITY_MIN),
        opacity: 0,
        rotation: (Math.random() - 0.5) * 0.2,
        targetRotation: 0,
        state: "idle",
        formationIndex: -1,
        formationDelay: 0,
        noiseOffsetX: Math.random() * 10000,
        noiseOffsetY: Math.random() * 10000,
        speed: 0.1 + Math.random() * 0.2,
        maxSpeed: 0.8,
        schoolForce: 0.0008,
        separationDistance: SEPARATION_RADIUS,
        life: 0,
        maxLife: MAX_LIFE,
        isDither: false,
        ditherChar: "",
        targetX: x,
        targetY: y,
      });
      
      lastSpawnRef.current = time;
    }
  }, []);

  // Remove dead particles
  const cullParticles = useCallback(() => {
    const particles = particlesRef.current;
    const width = canvasSizeRef.current.width;
    const height = canvasSizeRef.current.height;
    const margin = 100;
    
    // Remove particles that are too old or too far off-screen
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += 16; // Approximate frame time
      
      if (p.life > p.maxLife || 
          p.x < -margin || p.x > width + margin ||
          p.y < -margin || p.y > height + margin) {
        // Replace with new particle if we're under count
        if (!p.isDither && particles.filter(p => !p.isDither).length <= PARTICLE_COUNT) {
          // Will be replaced by spawnParticles
        }
        particles.splice(i, 1);
      }
    }
  }, []);

  // Main animation loop
  useEffect(() => {
    if (isReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = (time: number) => {
      const dt = Math.min(time - lastTimeRef.current, 33);
      lastTimeRef.current = time;

      const width = canvasSizeRef.current.width;
      const height = canvasSizeRef.current.height;
      const particles = particlesRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw dither background pattern (very subtle)
      const cellSize = 12;
      ctx.font = `${cellSize}px monospace`;
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgba(212, 168, 67, 0.015)";
      
      for (let row = 0; row < ditherPatternRef.current.length; row++) {
        for (let col = 0; col < ditherPatternRef.current[row].length; col++) {
          const char = ditherPatternRef.current[row][col];
          if (char !== " ") {
            const x = col * cellSize + Math.sin(time * 0.0001 + row) * 0.5;
            const y = row * cellSize + Math.cos(time * 0.0001 + col) * 0.5;
            ctx.globalAlpha = 0.01 + Math.sin(time * 0.0005 + row * 10 + col) * 0.005;
            ctx.fillText(char, x, y);
          }
        }
      }
      ctx.globalAlpha = 1;

      // Update direction flow occasionally
      if (time - lastDirectionChangeRef.current > DIRECTION_CHANGE_INTERVAL) {
        directionAngleRef.current += (Math.random() - 0.5) * Math.PI * 0.3;
        lastDirectionChangeRef.current = time;
      }

      // Spawn new particles
      spawnParticles(time);

      // Process formation triggers
      formationTriggers.forEach(trigger => {
        if (trigger.progress > 0 && trigger.progress < 1) {
          const key = trigger.id;
          let formation = formationsRef.current.get(key);
          
          if (!formation) {
            const chars = trigger.text.split("");
            const glyphs: GlyphParticle[] = chars.map((char, idx) => {
              const available = particles.filter(p => p.state === "idle" && !p.isDither);
              const particle = available[Math.floor(Math.random() * available.length)] || particles[idx % particles.length];
              
              const charWidth = trigger.size * 0.6;
              const startX = trigger.x - (chars.length - 1) * charWidth / 2 + idx * charWidth;
              
              particle.char = char;
              particle.targetX = startX;
              particle.targetY = trigger.y;
              particle.targetRotation = 0;
              particle.state = "forming";
              particle.formationIndex = idx;
              particle.formationDelay = idx * 50;
              particle.baseOpacity = FORM_OPACITY;
              particle.maxSpeed = 2;
              
              return particle;
            });
            
            formation = { id: key, text: trigger.text, x: trigger.x, y: trigger.y, size: trigger.size, glyphs, progress: trigger.progress };
            formationsRef.current.set(key, formation);
          } else {
            formation.glyphs.forEach(p => {
              if (p.state === "forming") {
                const progress = Math.min(1, (trigger.progress * FORM_DURATION - p.formationDelay) / FORM_DURATION);
                if (progress > 0) {
                  const eased = 1 - Math.pow(1 - progress, 3);
                  p.x += (p.targetX - p.x) * eased * 0.12;
                  p.y += (p.targetY - p.y) * eased * 0.12;
                  p.opacity += (FORM_OPACITY - p.opacity) * eased * 0.08;
                  p.rotation += (p.targetRotation - p.rotation) * eased * 0.1;
                  if (progress >= 1) p.state = "formed";
                }
              }
            });
          }
        } else if (trigger.progress >= 1) {
          const formation = formationsRef.current.get(trigger.id);
          if (formation) {
            formation.glyphs.forEach(p => {
              if (p.state === "formed") {
                p.opacity = FORM_OPACITY * (0.97 + Math.sin(time * 0.0015 + p.id) * 0.03);
              }
            });
          }
        } else {
          const formation = formationsRef.current.get(trigger.id);
          if (formation) {
            formation.glyphs.forEach(p => {
              if (p.state === "formed" || p.state === "forming") {
                p.state = "dispersing";
                p.targetX = Math.random() * (width - VIEWPORT_PADDING * 2) + VIEWPORT_PADDING;
                p.targetY = Math.random() * (height - VIEWPORT_PADDING * 2) + VIEWPORT_PADDING;
                p.targetRotation = (Math.random() - 0.5) * 0.5;
                p.baseOpacity = IDLE_OPACITY_MIN + Math.random() * (IDLE_OPACITY_MAX - IDLE_OPACITY_MIN);
                p.maxSpeed = 1.5;
              }
            });
            setTimeout(() => formationsRef.current.delete(trigger.id), DISPERSE_DURATION + 500);
          }
        }
      });

      // Update all particles
      particles.forEach(p => {
        // Skip if in formation and not dispersing
        if (p.state === "formed") {
          applyCursorReveal(p);
          return;
        }
        
        if (p.state === "dispersing") {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < 3) {
            p.state = "idle";
            p.vx = (Math.random() - 0.5) * 0.3;
            p.vy = (Math.random() - 0.5) * 0.3;
            p.opacity = p.baseOpacity;
            p.maxSpeed = 0.8;
          } else {
            const force = Math.min(1, dist / 300);
            p.vx += (dx / dist) * force * 0.1;
            p.vy += (dy / dist) * force * 0.1;
            p.opacity += (p.baseOpacity - p.opacity) * 0.015;
            p.rotation += (p.targetRotation - p.rotation) * 0.02;
          }
        } else if (p.state === "forming") {
          // Handled in formation trigger processing
        } else {
          // Idle/revealed state - fish-like behavior
          const nx = noise(p.noiseOffsetX + time * 0.00008, p.noiseOffsetY);
          const ny = noise(p.noiseOffsetX, p.noiseOffsetY + time * 0.00008);
          
          // Flow field
          const flowAngle = directionAngleRef.current + (nx - 0.5) * Math.PI * 0.25;
          const flowStrength = 0.015;
          
          p.vx += Math.cos(flowAngle) * flowStrength + (nx - 0.5) * 0.003;
          p.vy += Math.sin(flowAngle) * flowStrength + (ny - 0.5) * 0.003;
          
          // Schooling behavior
          applySchooling(p, particles, dt);
          
          // Cursor reveal
          applyCursorReveal(p);
          
          // Damping
          p.vx *= 0.985;
          p.vy *= 0.985;
          
          // Speed limit
          const speed = Math.hypot(p.vx, p.vy);
          if (speed > p.maxSpeed) {
            p.vx = (p.vx / speed) * p.maxSpeed;
            p.vy = (p.vy / speed) * p.maxSpeed;
          }
          
          // Update position
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          
          // Wrap around viewport
          if (p.x < VIEWPORT_PADDING) p.x = width - VIEWPORT_PADDING;
          if (p.x > width - VIEWPORT_PADDING) p.x = VIEWPORT_PADDING;
          if (p.y < VIEWPORT_PADDING) p.y = height - VIEWPORT_PADDING;
          if (p.y > height - VIEWPORT_PADDING) p.y = VIEWPORT_PADDING;
          
          // Subtle opacity variation
          if (p.state === "idle") {
            p.opacity = p.baseOpacity * (0.85 + Math.sin(time * 0.0008 + p.id) * 0.15);
          }
        }
      });

      // Cull dead particles
      cullParticles();

      // Render particles (back to front by size for depth)
      const sortedParticles = [...particles].sort((a, b) => {
        if (a.isDither !== b.isDither) return a.isDither ? -1 : 1;
        return a.size - b.size;
      });
      
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      
      sortedParticles.forEach(p => {
        // Skip if occluded
        if (isOccluded(p.x, p.y)) return;
        
        // Skip if fully transparent
        if (p.opacity < 0.002) return;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        
        if (p.isDither) {
          ctx.font = `${p.size}px monospace`;
          ctx.fillStyle = p.baseOpacity > 0.03 ? "#d4a843" : "#f8f3e8";
          ctx.fillText(p.ditherChar, 0, 0);
        } else {
          ctx.font = `${p.size}px 'Noto Sans Myanmar', sans-serif`;
          
          // Color based on state
          if (p.state === "revealed" || p.state === "cursor-following") {
            ctx.fillStyle = "#e8c85a"; // Gold for revealed
          } else if (p.state === "forming" || p.state === "formed") {
            ctx.fillStyle = "#f8f3e8"; // Cream for formed
          } else {
            ctx.fillStyle = "#d4c8b8"; // Muted for idle
          }
          
          ctx.fillText(p.char, 0, 0);
        }
        
        ctx.restore();
      });

      // Render chapter number if active
      if (showChapterNumber && chapterNumber > 0) {
        const burmeseNum = toBurmese(chapterNumber);
        const arabicNum = chapterNumber.toString();
        
        // Flash between Burmese and Arabic
        const flashCycle = Math.floor(time / 200) % 2;
        const displayText = flashCycle === 0 ? burmeseNum : arabicNum;
        
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.globalAlpha = 0.12;
        ctx.font = `700 ${Math.min(width, height) * 0.12}px 'Noto Sans Myanmar', 'Libre Caslon Display', serif`;
        ctx.fillStyle = "#f8f3e8";
        ctx.fillText(displayText, 0, 0);
        ctx.restore();
      }

      // Render active formations
      formationsRef.current.forEach(formation => {
        formation.glyphs.forEach(p => {
          if (p.state === "formed" || p.state === "forming") {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.opacity;
            ctx.font = `${p.size}px ${lang === "ksw" ? "'Noto Sans Myanmar'" : "'Libre Caslon Display'"}, sans-serif`;
            ctx.fillStyle = p.state === "formed" ? "#f8f3e8" : "#e8c85a";
            ctx.fillText(p.char, 0, 0);
            ctx.restore();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isReducedMotion, formationTriggers, chapterNumber, showChapterNumber, canvasRef, occlusionElements, lang, spawnParticles, applySchooling, applyCursorReveal, cullParticles, noise]);

  return null;
}

export default KarenGlyphField;
