import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang } from "@/components/i18n";

export const metadata: Metadata = {
  title: "Commentary | Karen Organization of America",
  description: "A space for sourced, reviewed civic commentary from the Karen Organization of America.",
};

export default async function CommentaryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <section className="koa-commentary" aria-labelledby="commentary-title">
      <div className="koa-commentary__intro">
        <p className="eyebrow">Civic education / Editorial review</p>
        <h1 id="commentary-title">Read the source.<br /><em>Make room for context.</em></h1>
        <p>KOA is preparing a space for commentary on issues affecting Karen communities in the United States and in Myanmar. Every piece will identify its sources, distinguish reporting from KOA’s view, and receive editorial review before appearing here.</p>
        {lang === "ksw" && <p className="koa-commentary__notice" lang="en">The S’gaw Karen edition is awaiting community language review. This English text is shown so an unreviewed translation is never mistaken for approved guidance.</p>}
        <div className="koa-commentary__actions"><Link href={`/${lang}/community/board`}>Browse community board ↗</Link><Link href={`/${lang}/contact`}>Share a source ↗</Link></div>
      </div>
      <div className="koa-commentary__status" role="status"><span>EDITORIAL DESK</span><h2>Reviewed posts will appear here.</h2><p>Drafts and machine-assisted translations stay private until people responsible for the facts and language approve them.</p></div>
      <style>{`
        .koa-commentary{min-height:75svh;background:#f7f3e9;color:#1b333b;padding:clamp(70px,10vw,150px) clamp(24px,7vw,115px);display:grid;grid-template-columns:minmax(0,1.5fr) minmax(260px,.8fr);gap:clamp(40px,8vw,130px);align-items:end}
        .koa-commentary__intro{max-width:850px}.koa-commentary .eyebrow,.koa-commentary__status span{color:#a34436;text-transform:uppercase;font:700 11px/1.4 system-ui,sans-serif;letter-spacing:.17em}
        .koa-commentary h1{font:400 clamp(48px,6.7vw,105px)/1.05 Georgia,serif;letter-spacing:-.05em;margin:20px 0 32px}.koa-commentary h1 em{color:#a34436;font-weight:400}
        .koa-commentary__intro>p:not(.eyebrow){max-width:610px;font:400 16px/1.8 system-ui,sans-serif;color:#506266}.koa-commentary__notice{border-left:3px solid #c29b54;padding-left:16px}
        .koa-commentary__actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:35px}.koa-commentary__actions a{border:1px solid #9baba9;padding:13px 18px;text-decoration:none;font:700 12px/1.3 system-ui,sans-serif}.koa-commentary__actions a:hover,.koa-commentary__actions a:focus-visible{background:#204752;color:white}
        .koa-commentary__status{border-top:1px solid #c9c4b9;padding-top:20px}.koa-commentary__status h2{font:400 clamp(27px,3vw,40px)/1.2 Georgia,serif;margin:20px 0}.koa-commentary__status p{font:400 13px/1.7 system-ui,sans-serif;color:#5b6d70}
        @media(max-width:850px){.koa-commentary{grid-template-columns:1fr;min-height:auto}.koa-commentary__status{max-width:560px}}
      `}</style>
    </section>
  );
}
