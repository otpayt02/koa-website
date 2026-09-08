'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import KarenGlyphField from './KarenGlyphField';
import KOALogoIntro from './KOALogoIntro';

export default function CinematicHome() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll setup for the entire hero section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Smooth out the scroll value for cinematic feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001
  });

  // --- CHOREOGRAPHY TRANSFORMS ---

  // 1. Logo Scale: Starts HUGE (3.5x), shrinks to normal (1x) as we scroll
  const logoScale = useTransform(smoothProgress, [0, 0.4], [3.5, 1]);

  // 2. Logo Position: Starts centered/top, rises slightly then locks or fades
  const logoY = useTransform(smoothProgress, [0, 0.3], [0, -100]);
  const logoOpacity = useTransform(smoothProgress, [0, 0.6], [1, 0]);

  // 3. Text Reveal (Lazy): Starts invisible/blurred, fades in after logo shrinks
  const textY = useTransform(smoothProgress, [0.2, 0.5], [100, 0]);
  const textOpacity = useTransform(smoothProgress, [0.2, 0.5], [0, 1]);
  const textBlur = useTransform(smoothProgress, [0.2, 0.5], [10, 0]);

  // 4. Background Glyph Field Parallax
  const bgY = useTransform(smoothProgress, [0, 1], [0, 200]);

  return (
    <div ref={containerRef} className="relative w-full h-[300vh] bg-[#0a0e17]">
      {/* Sticky Viewport for the Cinematic Experience */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-start">

        {/* Background: Glyph Field (Convergence enabled) */}
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 z-0"
        >
          <KarenGlyphField mode="convergence" />
        </motion.div>

        {/* FOREGROUND: Massive Static Logo Assembly */}
        <motion.div
          style={{ scale: logoScale, y: logoY, opacity: logoOpacity }}
          className="z-10 relative mt-[-10vh] mb-10"
        >
          {/* 
             The KOALogoIntro is updated to render K - [Seal] - A 
             without forming an O from glyphs. 
          */}
          <KOALogoIntro variant="massive-static" />
        </motion.div>

        {/* LAZY REVEAL CONTENT */}
        <motion.div
          style={{ y: textY, opacity: textOpacity, filter: `blur(${textBlur}px)` }}
          className="z-20 relative w-full max-w-4xl px-6 text-center mt-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-display tracking-tight">
            Karen Organization of America
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
            Preserving heritage, empowering community, and building a future where every voice is heard.
            Scroll to explore our mission.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
            className="mt-12 text-red-500"
          >
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}