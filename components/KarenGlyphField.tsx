'use client';

import React, { useEffect, useRef, useState } from 'react';

// S'gaw Karen Unicode Range + K, O, A
const KAREN_GLYPHS = [
  ‘က’, ‘ခ’, ‘ဂ’, ‘ဃ’, ‘င’, ‘စ’, ‘ဆ’, ‘ည’, ‘တ’, ‘ထ’, ‘ဒ’, ‘န’, ‘ပ’, ‘ဖ’, ’ဘ’, ’မ’, ’ယ’, ’ရ”, ’လ”, ’ဝ”, ”သ”, ”ဟ”, ”အ”, ”ြ”, ”ွ”, ”ူ”, ”ဲ”, ”့“, ”း“, ”်“, ”၀“, ”၁“, ”၂“, ”၃“, »K», »O», »A»
];

const BURMESE_NUMERALS = ['၀', '၁', '၂', '၃', '၄'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  size: number;
  opacity: number;
  targetX: number;
  targetY: number;
  phase: 'idle' | 'converge' | 'disperse';
  life: number;
  maxLife: number;
}

export default function KarenGlyphField({ mode = 'idle' }: { mode?: 'idle' | 'convergence' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const frameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Initialize Particles
    const particleCount = Math.min(width * 0.15, 400); // Responsive count
    particles.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4, // Slow drift
      vy: (Math.random() - 0.5) * 0.4,
      char: KAREN_GLYPHS[Math.floor(Math.random() * KAREN_GLYPHS.length)],
      size: Math.random() * 6 + 8,
      opacity: Math.random() * 0.1 + 0.05,
      targetX: Math.random() * width,
      targetY: Math.random() * height,
      phase: 'idle',
      life: Math.random() * 1000,
      maxLife: 2000 + Math.random() * 1000
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Determine Target Shape (Burmese Numeral based on scroll or random)
      // Simplified: Just a central cluster for now, expand to numeral logic as needed
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.3;

      particles.current.forEach((p, i) => {
        // Lifecycle
        p.life++;
        if (p.life > p.maxLife) {
          // Respawn
          p.x = Math.random() * width;
          p.y = height + 20;
          p.life = 0;
          p.opacity = 0;
          p.phase = 'idle';
        }

        // Fade in/out
        if (p.life < 100) p.opacity += 0.002;
        if (p.life > p.maxLife - 100) p.opacity -= 0.002;

        // Movement Logic
        if (mode === 'convergence') {
          // Simple convergence to center cluster (simulate numeral)
          const angle = (i / particles.current.length) * Math.PI * 2;
          const r = radius * (0.5 + Math.sin(angle * 10) * 0.2); // Irregular ring
          p.targetX = centerX + Math.cos(angle) * r;
          p.targetY = centerY + Math.sin(angle) * r;

          // Move towards target
          p.x += (p.targetX - p.x) * 0.02;
          p.y += (p.targetY - p.y) * 0.02;
        } else {
          // Idle Fish-like motion
          p.x += p.vx;
          p.y += p.vy;

          // Mouse Interaction (Gentle Swirl)
          const dx = mouse.current.x - p.x;
          const dy = mouse.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            p.vx += (dx / dist) * force * 0.05;
            p.vy += (dy / dist) * force * 0.05;
            p.opacity = Math.min(p.opacity + 0.01, 0.4); // Reveal on hover
          } else {
            // Dampen velocity
            p.vx *= 0.99;
            p.vy *= 0.99;
            // Restore base drift
            p.vx += (Math.random() - 0.5) * 0.02;
            p.vy += (Math.random() - 0.5) * 0.02;
          }
        }

        // Wrap around screen
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;

        // Draw
        ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`; // Gold
        ctx.font = `${p.size}px "Noto Sans Myanmar", sans-serif`;
        ctx.fillText(p.char, p.x, p.y);
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mode]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}