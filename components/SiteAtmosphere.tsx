"use client";

import { useEffect, useState } from "react";
import { DenseGlyphGrid } from "./DenseGlyphGrid";
import { AtticDust } from "./AtticDust";
import type { Lang } from "./i18n";

/** Shared aurora grid and Karen-glyph motes sit behind route content. */
export function SiteAtmosphere({ lang }: { lang: Lang }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return (
    <div className="site-atmosphere" aria-hidden="true">
      <DenseGlyphGrid lang={lang} reducedMotion={reducedMotion} />
      <AtticDust lang={lang} reducedMotion={reducedMotion} />
    </div>
  );
}
