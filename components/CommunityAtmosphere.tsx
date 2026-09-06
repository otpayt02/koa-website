"use client";

import { useRef } from "react";
import type { Lang } from "./i18n";
import { AsciiDitherCanvas } from "./AsciiDitherCanvas";

// The community page borrows the landing's living grid without duplicating
// the seal or K/A assembly. Its only job is to give community content depth.
export function CommunityAtmosphere({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="community-current__atmosphere" aria-hidden="true">
      <canvas ref={canvasRef} className="community-current__dither" />
      <AsciiDitherCanvas
        canvasRef={canvasRef}
        isReducedMotion={false}
        cursorReveal
        revealRadius={220}
        density={0.34}
        lang={lang}
      />
    </div>
  );
}
