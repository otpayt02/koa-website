"use client";

import { useEffect, useState } from "react";

/** One rAF-backed, device-independent document progress value in the range 0..1. */
export function useNormalizedScroll() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const available = Math.max(1, root.scrollHeight - window.innerHeight);
      const next = Math.min(1, Math.max(0, window.scrollY / available));
      setProgress((current) => Math.abs(current - next) > 0.001 ? next : current);
    };
    const request = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => { window.removeEventListener("scroll", request); window.removeEventListener("resize", request); if (frame) window.cancelAnimationFrame(frame); };
  }, []);
  return progress;
}

export default useNormalizedScroll;
