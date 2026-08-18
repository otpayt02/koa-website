import type { ReactNode } from "react";

export function Section({ eyebrow, title, intro, children, tone = "plain", id }: { eyebrow?: string; title?: string; intro?: string; children: ReactNode; tone?: "plain" | "ink" | "cream"; id?: string }) {
  return (
    <section className={`section section--${tone}`} id={id}>
      <div className="container">
        {title ? <header className="section-heading">{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}<h2>{title}</h2>{intro ? <p>{intro}</p> : null}</header> : null}
        {children}
      </div>
    </section>
  );
}
