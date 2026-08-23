"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sunshine Rays - "The Dawn Light"
 * 
 * Subtle rays emanating from center/top-center
 * Rotation speed directly correlates to scroll velocity
 * Barely visible - premium, ethereal quality
 * Only visible on dark backgrounds
 */

interface SunshineRaysProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  scrollVelocity: number; // Pixels per frame
  isReducedMotion: boolean;
  opacity?: number;
  color?: string;
  rayCount?: number;
}

export function SunshineRays({
  canvasRef,
  scrollVelocity,
  isReducedMotion,
  opacity = 0.025,
  color = "#E8C85A",
  rayCount = 7,
}: SunshineRaysProps) {
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const currentRotationRef = useRef(0);
  const targetRotationSpeedRef = useRef(0);
  const currentRotationSpeedRef = useRef(0);
  const intensityRef = useRef(0);
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });

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
    };

    resize();
    window.addEventListener("resize", resize);
    startTimeRef.current = performance.now();

    // Track mouse for subtle parallax
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current.x = e.clientX / window.innerWidth;
      mousePosRef.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef]);

  useEffect(() => {
    if (isReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = (time: number) => {
      const elapsed = time - startTimeRef.current;
      const dt = Math.min(1, (time - (animationRef.current ? time : startTimeRef.current)) / 16);
      
      // Scroll velocity influences rotation speed
      // Positive scroll (down) = clockwise, negative = counter-clockwise
      const velocityInfluence = scrollVelocity * 0.00008;
      targetRotationSpeedRef.current = velocityInfluence + 0.000008; // Base slow rotation
      
      // Smooth rotation speed
      currentRotationSpeedRef.current += (targetRotationSpeedRef.current - currentRotationSpeedRef.current) * 0.05;
      currentRotationRef.current += currentRotationSpeedRef.current * dt * 16;

      // Intensity breathes with scroll
      const scrollIntensity = Math.min(1, Math.abs(scrollVelocity) * 0.1);
      intensityRef.current += (scrollIntensity * 0.015 + 0.005 - intensityRef.current) * 0.02;

      // Clear
      ctx.clearRect(0, 0, canvasSizeRef.current.width, canvasSizeRef.current.height);

      const width = canvasSizeRef.current.width;
      const height = canvasSizeRef.current.height;
      const centerX = width * mousePosRef.current.x;
      const centerY = height * 0.15; // Near top

      const maxRayLength = Math.max(width, height) * 0.9;
      const baseOpacity = opacity * intensityRef.current;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(currentRotationRef.current);

      // Draw rays
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2;
        const rayLength = maxRayLength * (0.7 + Math.sin(elapsed * 0.0005 + i) * 0.15);
        const rayWidth = 1.5 + Math.sin(elapsed * 0.0008 + i) * 0.5;
        
        // Pulsing opacity per ray
        const rayOpacity = baseOpacity * (0.7 + Math.sin(elapsed * 0.001 + i * 1.5) * 0.3);
        
        const gradient = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
        gradient.addColorStop(0, `rgba(232, 200, 90, ${rayOpacity})`);
        gradient.addColorStop(0.3, `rgba(232, 200, 90, ${rayOpacity * 0.4})`);
        gradient.addColorStop(1, `rgba(232, 200, 90, 0)`);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
        ctx.lineWidth = rayWidth;
        ctx.strokeStyle = gradient;
        ctx.stroke();
      }

      // Central glow
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
      glowGradient.addColorStop(0, `rgba(232, 200, 90, ${baseOpacity * 2})`);
      glowGradient.addColorStop(0.5, `rgba(232, 200, 90, ${baseOpacity * 0.5})`);
      glowGradient.addColorStop(1, `rgba(232, 200, 90, 0)`);
      
      ctx.beginPath();
      ctx.arc(0, 0, 200, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef, scrollVelocity, isReducedMotion, opacity, color, rayCount]);

  return null;
}

export default SunshineRays;