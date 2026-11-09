"use client";

import { DenseGlyphGrid } from "./DenseGlyphGrid";
import { AtticDust } from "./AtticDust";
import type { Lang } from "./i18n";

/** Shared aurora grid and Karen-glyph motes sit behind route content. */
export function SiteAtmosphere({ lang }: { lang: Lang }) {
  return (
    <div className="site-atmosphere" aria-hidden="true">
      <DenseGlyphGrid lang={lang} reducedMotion={false} />
      <AtticDust lang={lang} reducedMotion={false} />
    </div>
  );
}
