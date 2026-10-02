"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Lang } from "./i18n";
import { SGAW_GLYPHS } from "../lib/cinema/glyph-config";

/**
 * ASCII Dithering Canvas - "The Static Veil"
 * 
 * A full-screen dithering texture with:
 * - Karen glyph dithering patterns
 * - Cursor-reactive revelation (glyphs bloom at cursor)
 * - Subtle animation (breathing, flowing)
 * - Bilingual character sets
 * - Configurable density and contrast
 */

const KAREN_DITHER_CHARS = [...SGAW_GLYPHS];

interface DitherCell {
  char: string;
  baseBrightness: number;
  currentBrightness: number;
  targetBrightness: number;
  animationOffset: number;
  isRevealed: boolean;
  revealIntensity: number;
  variantSeed: number;
}

interface CursorPosition {
  x: number;
  y: number;
  active: boolean;
  radius: number;
}

export function AsciiDitherCanvas({
  canvasRef,
  isReducedMotion = false,
  cursorReveal = true,
  revealRadius = 180,
  density = 0.5,
  lang = "en",
  onRevealArea = () => {},
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isReducedMotion?: boolean;
  cursorReveal?: boolean;
  revealRadius?: number;
  density?: number;
  lang?: Lang;
  onRevealArea?: (x: number, y: number, radius: number) => void;
}) {
  const gridRef = useRef<DitherCell[][]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const cellSizeRef = useRef(8);
  const cursorRef = useRef<CursorPosition>({
    x: 0,
    y: 0,
    active: false,
    radius: revealRadius,
  });
  const colsRef = useRef(0);
  const rowsRef = useRef(0);
  const initializedRef = useRef(false);
  const lastRevealNotifyRef = useRef(0);
  const inputSequenceRef = useRef(0);
  const scrollRevealTimerRef = useRef<number | null>(null);

  // Initialize grid
  const initializeGrid = useCallback((width: number, height: number) => {
    const cellSize = cellSizeRef.current;
    const cols = Math.ceil(width / cellSize) + 2;
    const rows = Math.ceil(height / cellSize) + 2;
    
    colsRef.current = cols;
    rowsRef.current = rows;
    
    const grid: DitherCell[][] = [];
    for (let row = 0; row < rows; row++) {
      const rowCells: DitherCell[] = [];
      for (let col = 0; col < cols; col++) {
        // Base brightness from noise for organic texture
        const nx = col * 0.15;
        const ny = row * 0.15;
        const noise = Math.sin(nx * 12.9898 + ny * 78.233) * 43758.5453;
        const baseNoise = noise - Math.floor(noise);
        
        // Add large-scale gradient
        const gradientX = col / cols;
        const gradientY = row / rows;
        const vignette = 1 - Math.hypot(gradientX - 0.5, gradientY - 0.5) * 0.8;
        
        const baseBrightness = Math.floor((baseNoise * 0.6 + vignette * 0.4) * 255);
        
        // Character based on brightness and density
        const charIndex = Math.floor((baseBrightness / 255) * KAREN_DITHER_CHARS.length * density);
        const clampedIndex = Math.max(0, Math.min(charIndex, KAREN_DITHER_CHARS.length - 1));
        
        rowCells.push({
          char: KAREN_DITHER_CHARS[clampedIndex],
          baseBrightness,
          currentBrightness: baseBrightness,
          targetBrightness: baseBrightness,
          animationOffset: Math.random() * Math.PI * 2,
          isRevealed: false,
          revealIntensity: 0,
          variantSeed: Math.random() * 100000,
        });
      }
      grid.push(rowCells);
    }
    
    gridRef.current = grid;
    initializedRef.current = true;
  }, []);

  // Mouse handlers
  useEffect(() => {
    if (!cursorReveal) return;

    let pendingX = 0;
    let pendingY = 0;
    let mutationFrame = 0;

    const swapNearbyGlyphs = (x: number, y: number) => {
      const cellSize = cellSizeRef.current;
      const radius = revealRadius * 1.15;
      const sequence = ++inputSequenceRef.current;
      const centerCol = Math.floor(x / cellSize);
      const centerRow = Math.floor(y / cellSize);
      const radiusInCells = Math.max(2, Math.floor(radius / cellSize));
      const updateBudget = window.innerWidth < 720 ? 10 : 18;
      for (let index = 0; index < updateBudget; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.sqrt(Math.random()) * radiusInCells;
        const col = Math.max(0, Math.min(colsRef.current - 1, centerCol + Math.round(Math.cos(angle) * distance)));
        const row = Math.max(0, Math.min(rowsRef.current - 1, centerRow + Math.round(Math.sin(angle) * distance)));
        const cell = gridRef.current[row]?.[col];
        if (!cell) continue;
        cell.variantSeed = Math.random() * 100000 + sequence * 0.618 + index;
        cell.char = KAREN_DITHER_CHARS[Math.floor(Math.random() * KAREN_DITHER_CHARS.length)];
      }
    };

    const queueGlyphSwap = (x: number, y: number) => {
      pendingX = x;
      pendingY = y;
      if (mutationFrame) return;
      mutationFrame = window.requestAnimationFrame(() => {
        mutationFrame = 0;
        swapNearbyGlyphs(pendingX, pendingY);
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
      cursorRef.current.active = true;
      cursorRef.current.radius = revealRadius;
      queueGlyphSwap(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      cursorRef.current.x = touch.clientX;
      cursorRef.current.y = touch.clientY;
      cursorRef.current.active = true;
      cursorRef.current.radius = revealRadius;
      queueGlyphSwap(touch.clientX, touch.clientY);
    };

    const handleScroll = () => {
      if (!cursorRef.current.active) {
        cursorRef.current.x = window.innerWidth * 0.5;
        cursorRef.current.y = window.innerHeight * 0.56;
        cursorRef.current.radius = Math.min(revealRadius, 220) * 0.72;
        cursorRef.current.active = true;
      }
      queueGlyphSwap(cursorRef.current.x, cursorRef.current.y);
      if (scrollRevealTimerRef.current) window.clearTimeout(scrollRevealTimerRef.current);
      scrollRevealTimerRef.current = window.setTimeout(() => {
        cursorRef.current.active = false;
        scrollRevealTimerRef.current = null;
      }, 260);
    };

    const handleMouseLeave = () => {
      cursorRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (mutationFrame) window.cancelAnimationFrame(mutationFrame);
      if (scrollRevealTimerRef.current) window.clearTimeout(scrollRevealTimerRef.current);
    };
  }, [cursorReveal, revealRadius]);

  // Animation loop
  useEffect(() => {
    if (isReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lowPower = window.matchMedia("(prefers-reduced-data: reduce)").matches
      || (navigator.hardwareConcurrency || 8) <= 4;
    const frameInterval = lowPower ? 1000 / 30 : 1000 / 60;
    let lastPaint = 0;
    let visible = true;

    const resize = () => {
      const dpr = lowPower ? 1 : Math.min(1.5, window.devicePixelRatio || 1);
      cellSizeRef.current = lowPower ? 12 : 9;
      canvasSizeRef.current.width = window.innerWidth;
      canvasSizeRef.current.height = window.innerHeight;
      canvas.width = canvasSizeRef.current.width * dpr;
      canvas.height = canvasSizeRef.current.height * dpr;
      canvas.style.width = `${canvasSizeRef.current.width}px`;
      canvas.style.height = `${canvasSizeRef.current.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initializeGrid(canvasSizeRef.current.width, canvasSizeRef.current.height);
    };

    resize();
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !animationRef.current) animationRef.current = requestAnimationFrame(animate);
    }, { threshold: 0 });
    visibilityObserver.observe(canvas);
    const onVisibilityChange = () => {
      if (!document.hidden && visible && !animationRef.current) animationRef.current = requestAnimationFrame(animate);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("resize", resize);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

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
      const dt = Math.min(time - lastTimeRef.current, 33);
      lastTimeRef.current = time;

      const width = canvasSizeRef.current.width;
      const height = canvasSizeRef.current.height;
      const cellSize = cellSizeRef.current;
      const cols = colsRef.current;
      const rows = rowsRef.current;
      const grid = gridRef.current;
      const cursor = cursorRef.current;

      // Clear
      // Transparent idle state: the grid is only visible in the interaction
      // halo, so the cinematic background remains quiet between inputs.
      ctx.clearRect(0, 0, width, height);

      // The canvas is dormant between interactions. This is the main
      // performance guard: no full-screen grid loop runs while the visitor is
      // reading, while the global wave canvas supplies a nearly invisible base.
      if (!cursor.active) {
        ctx.globalAlpha = 1;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Update and render each cell
      ctx.font = `${cellSize}px 'Noto Sans Myanmar', monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";

      const radius = cursor.radius * 1.12;
      const minCol = Math.max(0, Math.floor((cursor.x - radius) / cellSize));
      const maxCol = Math.min(cols - 1, Math.ceil((cursor.x + radius) / cellSize));
      const minRow = Math.max(0, Math.floor((cursor.y - radius) / cellSize));
      const maxRow = Math.min(rows - 1, Math.ceil((cursor.y + radius) / cellSize));

      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const cell = grid[row][col];
          const x = col * cellSize;
          const y = row * cellSize;

          // Skip if off-screen
          if (x > width + cellSize || y > height + cellSize) continue;

          let targetBrightness = cell.baseBrightness;
          let revealIntensity = 0;

          // Cursor reveal effect
          if (cursor.active) {
            const dx = cursor.x - (x + cellSize / 2);
            const dy = cursor.y - (y + cellSize / 2);
            const dist = Math.hypot(dx, dy);

            if (dist < cursor.radius) {
              const influence = Math.pow(1 - dist / cursor.radius, 2); // Quadratic falloff
              revealIntensity = influence;
              
              // Brighten significantly at cursor
              targetBrightness = Math.min(255, cell.baseBrightness + influence * 200);
              
              // Shift to Karen glyphs at high reveal
              if (influence > 0.6) {
                const karenIndex = Math.floor(influence * (KAREN_DITHER_CHARS.length - 20)) + 20;
                cell.char = KAREN_DITHER_CHARS[Math.min(karenIndex, KAREN_DITHER_CHARS.length - 1)];
              } else if (influence > 0.3) {
                const midIndex = Math.floor(influence * 20) + 10;
                cell.char = KAREN_DITHER_CHARS[Math.min(midIndex, KAREN_DITHER_CHARS.length - 1)];
              }

              cell.isRevealed = true;
            } else if (cell.isRevealed) {
              // Fade back
              cell.isRevealed = false;
            }
          }

          // Smooth transition to target brightness
          cell.currentBrightness += (targetBrightness - cell.currentBrightness) * 0.08;
          cell.revealIntensity += (revealIntensity - cell.revealIntensity) * 0.1;

          // Breathing animation
          const breath = Math.sin(time * 0.0005 + cell.animationOffset) * 15;
          const finalBrightness = Math.max(0, Math.min(255, cell.currentBrightness + breath));

          // Map brightness to character
          const charIndex = Math.floor((finalBrightness / 255) * KAREN_DITHER_CHARS.length * density);
          const clampedIndex = Math.max(0, Math.min(charIndex, KAREN_DITHER_CHARS.length - 1));
          
          // Smooth character transition
          const flutterTick = Math.floor(time / 1200 + cell.animationOffset);
          if ((flutterTick + row * 13 + col * 7) % 251 === 0) {
            cell.char = KAREN_DITHER_CHARS[Math.max(0, clampedIndex + (Math.floor(cell.variantSeed) % 5 - 2))];
          } else {
            cell.char = KAREN_DITHER_CHARS[clampedIndex];
          }

          // Color based on brightness and reveal
          let color: string;
          let alpha: number;

          if (cell.revealIntensity <= 0.04) continue;

          if (cell.revealIntensity > 0.1) {
            // Revealed - gold/cream
            const intensity = cell.revealIntensity;
            alpha = 0.02 + intensity * 0.15;
            color = intensity > 0.5 ? "#e8c85a" : "#f8f3e8";
          } else {
            // Normal - subtle navy/gold
            alpha = 0.01 + (finalBrightness / 255) * 0.025;
            color = finalBrightness > 180 ? "#d4a843" : "#3d6b9e";
          }

          ctx.globalAlpha = alpha;
          ctx.fillStyle = color;
          ctx.fillText(cell.char, x, y);
        }
      }

      ctx.globalAlpha = 1;

      // Notify parent of reveal area for coordination
      if (cursor.active && time - lastRevealNotifyRef.current > 120) {
        lastRevealNotifyRef.current = time;
        onRevealArea(cursor.x, cursor.y, cursor.radius);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef, isReducedMotion, cursorReveal, initializeGrid, lang]);

  return null;
}

export default AsciiDitherCanvas;
