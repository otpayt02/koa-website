import type { ReactNode } from "react";
import { CursorGlareImage } from "./ui/CursorGlareImage";

export function PageHero({ eyebrow, title, description, image, imageAlt = "", children, compact = false }: { eyebrow: string; title: string; description: string; image?: string; imageAlt?: string; children?: ReactNode; compact?: boolean }) {
  return (
    <section className={`page-hero${compact ? " page-hero--compact" : ""}`}>
      {image ? <CursorGlareImage className="page-hero__media" src={image} alt={imageAlt} loading="eager" fetchPriority="high" /> : null}
      <div className="page-hero__shade" />
      <div className="page-hero__content container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lede">{description}</p>
        {children ? <div className="button-row">{children}</div> : null}
      </div>
    </section>
  );
}
