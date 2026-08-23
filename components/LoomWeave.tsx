"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Loom Weave Background - Diamond Pattern Handwoven Texture
 * 
 * Traditional Karen loom diamond pattern as subtle background texture
 * Extremely slow breathing animation (60s cycle)
 * Respects reduced motion
 */

interface LoomWeaveProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isReducedMotion: boolean;
  opacity?: number;
  color?: string;
}

export function LoomWeave({
  canvasRef,
  isReducedMotion,
  opacity = 0.04,
  color = "#f8f3e8",
}: LoomWeaveProps) {
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const patternCacheRef = useRef<OffscreenCanvas | null>(null);

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
      patternCacheRef.current = null; // Invalidate cache
    };

    resize();
    window.addEventListener("resize", resize);
    startTimeRef.current = performance.now();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef]);

  // Generate diamond pattern once
  const generatePattern = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (patternCacheRef.current) return;

    const diamondSize = 48;
    const offsetX = diamondSize / 2;
    const offsetY = diamondSize / 2;
    const cols = Math.ceil(width / diamondSize) + 2;
    const rows = Math.ceil(height / diamondSize) + 2;

    const offscreen = new OffscreenCanvas(width, height);
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return;

    offCtx.strokeStyle = color;
    offCtx.lineWidth = 0.5;
    offCtx.globalAlpha = opacity;

    // Create variations for handwoven feel
    const variations: Array<{ x: number; y: number; size: number; opacity: number; rotation: number }> = [];
    
    for (let row = -1; row <= rows; row++) {
      for (let col = -1; col <= cols; col++) {
        const x = col * diamondSize + (row % 2 === 0 ? 0 : offsetX);
        const y = row * diamondSize * 0.866; // Hexagonal packing
        
        variations.push({
          x,
          y,
          size: diamondSize * (0.9 + Math.random() * 0.2),
          opacity: 0.7 + Math.random() * 0.6,
          rotation: (Math.random() - 0.5) * 0.1,
        });
      }
    }

    variations.forEach(v => {
      offCtx.save();
      offCtx.translate(v.x, v.y);
      offCtx.rotate(v.rotation);
      offCtx.globalAlpha = opacity * v.opacity;
      offCtx.beginPath();
      offCtx.moveTo(0, -v.size / 2);
      offCtx.lineTo(v.size / 2, 0);
      offCtx.lineTo(0, v.size / 2);
      offCtx.lineTo(-v.size / 2, 0);
      offCtx.closePath();
      offCtx.stroke();
      offCtx.restore();
    });

    patternCacheRef.current = offscreen;
  }, [color, opacity]);

  useEffect(() => {
    if (isReducedMotion) {
      // Render static pattern once
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      generatePattern(ctx, canvasSizeRef.current.width, canvasSizeRef.current.height);
      
      if (patternCacheRef.current) {
        ctx.drawImage(patternCacheRef.current, 0, 0);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = (time: number) => {
      const elapsed = time - startTimeRef.current;
      
      // Very slow breath cycle (60 seconds)
      const breathCycle = (elapsed / 60000) % 1;
      const breathFactor = 0.85 + Math.sin(breathCycle * Math.PI * 2) * 0.15;
      
      // Clear
      ctx.clearRect(0, 0, canvasSizeRef.current.width, canvasSizeRef.current.height);
      
      // Generate pattern if needed
      generatePattern(ctx, canvasSizeRef.current.width, canvasSizeRef.current.height);
      
      // Draw with breathing opacity
      if (patternCacheRef.current) {
        ctx.save();
        ctx.globalAlpha = breathFactor;
        ctx.drawImage(patternCacheRef.current, 0, 0);
        ctx.restore();
      }
      
      // Subtle diagonal line accents (warp threads)
      ctx.save();
      ctx.globalAlpha = opacity * 0.3 * breathFactor;
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.3;
      
      const warpSpacing = 120;
      const warpOffset = (elapsed / 10000) % warpSpacing; // Very slow drift
      
      for (let x = -warpSpacing; x < canvasSizeRef.current.width + warpSpacing; x += warpSpacing) {
        const xPos = x + warpOffset;
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos + canvasSizeRef.current.height * 0.1, canvasSizeRef.current.height);
        ctx.stroke();
      }
      ctx.restore();
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef, isReducedMotion, generatePattern, opacity, color]);

  return null;
}

export default LoomWeave;