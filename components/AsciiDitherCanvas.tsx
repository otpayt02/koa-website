"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Lang } from "./i18n";

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

const KAREN_DITHER_CHARS = [
  // Light
  " ", " ", " ", "·", "·", "•", "◦", "◘", "◙",
  // Medium - Karen tone marks
  "ှ", "ံ", "့", "း", "ၠ", "ၡ", "ၢ", "ၣ", "ၤ", "ၥ", "ၦ", "ၧ", "ၨ", "ၩ",
  // Heavy - Karen consonants
  "က", "ခ", "ဂ", "ဃ", "င", "စ", "ဆ", "ဇ", "ဈ", "ဉ", "ည",
  "တ", "ထ", "ဒ", "ဓ", "န", "ပ", "ဖ", "ဗ", "ဘ", "မ",
  "ယ", "ရ", "လ", "ဝ", "သ", "ဟ", "ဠ", "အ",
  // Numerals
  "၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉",
  // Block elements for classic dither
  "░", "▒", "▓", "▄", "▀", "▌", "▐", "█"
];

const DITHER_GRADIENT = [
  // 0-255 brightness mapped to character index
  // This creates a smooth dither gradient
];

interface DitherCell {
  char: string;
  baseBrightness: number;
  currentBrightness: number;
  targetBrightness: number;
  animationOffset: number;
  isRevealed: boolean;
  revealIntensity: number;
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

    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
      cursorRef.current.active = true;
      cursorRef.current.radius = revealRadius;
    };

    const handleMouseLeave = () => {
      cursorRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [cursorReveal, revealRadius]);

  // Animation loop
  useEffect(() => {
    if (isReducedMotion) return;

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

      if (!initializedRef.current) {
        initializeGrid(canvasSizeRef.current.width, canvasSizeRef.current.height);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = (time: number) => {
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
      ctx.fillStyle = "#040818";
      ctx.fillRect(0, 0, width, height);

      // Update and render each cell
      ctx.font = `${cellSize}px 'Noto Sans Myanmar', monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
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
          if (Math.random() < 0.002) { // Occasional character flutter
            cell.char = KAREN_DITHER_CHARS[Math.max(0, clampedIndex + (Math.random() - 0.5) * 4 | 0)];
          } else {
            cell.char = KAREN_DITHER_CHARS[clampedIndex];
          }

          // Color based on brightness and reveal
          let color: string;
          let alpha: number;

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
      if (cursor.active) {
        onRevealArea(cursor.x, cursor.y, cursor.radius);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef, isReducedMotion, cursorReveal, initializeGrid, lang]);

  return null;
}

export default AsciiDitherCanvas;
