import Link from "next/link";

export function KoaContentPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return <div className="content-page"><section className="page-hero"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-hero__intro">{intro}</p></section>{children}<div className="section-action"><Link className="button button--secondary" href="/en">Return home</Link><Link className="button" href="/en/contact">Contact KOA</Link></div></div>;
}

export function KoaSection({ eyebrow, title, children }: { eyebrow?: string; title: string; children: React.ReactNode }) {
  return <section className="content-section"><div className="content-section__inner">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{children}</div></section>;
}

export function Unconfirmed({ children }: { children: React.ReactNode }) { return <em className="unconfirmed">{children}</em>; }
