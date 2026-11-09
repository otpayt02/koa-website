import Link from "next/link";
import type { Lang } from "../i18n";

/** First-screen routes keep the film navigable before its scroll narrative appears. */
export function VisitorPathways({ lang }: { lang: Lang }) {
  return (
    <nav className="koa-visitor-pathways" aria-label="Explore KOA" lang="en">
      <p>Standing with the Karen community in America.</p>
      <div>
        <Link href={`/${lang}/services`}>Explore programs <span aria-hidden="true">↗</span></Link>
        <Link href={`/${lang}/collaborate`}>Get involved <span aria-hidden="true">↗</span></Link>
      </div>
    </nav>
  );
}
