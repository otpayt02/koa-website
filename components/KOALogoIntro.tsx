'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  variant?: 'standard' | 'massive-static';
}

export default function KOALogoIntro({ variant = 'standard' }: Props) {
  const isMassive = variant === 'massive-static';

  return (
    <div className={`flex items-center justify-center gap-4 md:gap-8 ${isMassive ? 'scale-150' : ''}`}>

      {/* LEFT: Giant 'K' made of Glyphs */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative w-32 h-48 md:w-48 md:h-64 flex items-center justify-center"
      >
        <div className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-red-800 font-black text-9xl md:text-[12rem] leading-none select-none">
          K
        </div>
        {/* Subtle glyph texture overlay for K */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
          {/* Simulated glyph noise */}
          <span className="text-xs text-red-500">ကေအေ</span>
        </div>
      </motion.div>

      {/* CENTER: The Seal (Statue of Liberty) */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 2, delay: 0.5, type: "spring" }}
        className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)] bg-[#0a0e17] flex items-center justify-center overflow-hidden z-10"
      >
        {/* Rotating Halo Rays */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_10deg,#DC2626_10deg_20deg,transparent_20deg_360deg)] opacity-30"
        />

        {/* Inner Circle Content (Statue Placeholder) */}
        <div className="relative z-10 text-yellow-500">
          <svg className="w-16 h-16 md:w-20 md:h-20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 17L5.5 21L8 13.5L2 9H9.5L12 2Z" />
          </svg>
        </div>

        {/* Orbiting Text (Clockwise) */}
        <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
          <defs>
            <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
          </defs>
          <text fontSize="11" fill="#F59E0B" letterSpacing="2">
            <textPath href="#circlePath" startOffset="0%">
              KAREN • ORGANIZATION • AMERICA •
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* RIGHT: Giant 'A' made of Glyphs */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative w-32 h-48 md:w-48 md:h-64 flex items-center justify-center"
      >
        <div className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-blue-800 font-black text-9xl md:text-[12rem] leading-none select-none">
          A
        </div>
        {/* Subtle glyph texture overlay for A */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
          <span className="text-xs text-blue-500">ကေအေ</span>
        </div>
      </motion.div>

    </div>
  );
}