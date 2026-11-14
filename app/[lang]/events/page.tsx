import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCalendar } from "@/components/EventCalendar";
import { isLang } from "@/components/i18n";

export const metadata: Metadata = { title: "Events", description: "Verified Karen Organization of America community event dates and announcements." };

export default async function EventsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <section className="koa-events">
    <div className="koa-events__intro">
      <p className="eyebrow">Community / Gatherings</p>
      <h1>Gather here.<br /><em>Move forward together.</em></h1>
      <p>Find verified KOA gatherings and civic learning opportunities. Dates appear on the calendar after KOA confirms them.</p>
      {lang === "ksw" && <p className="koa-events__review" lang="en">The event details are currently in English while the S’gaw Karen edition awaits community language review.</p>}
      <div className="koa-events__links"><a href="https://www.facebook.com/koamerica" target="_blank" rel="noreferrer">Latest KOA announcements ↗</a><Link href={`/${lang}/contact`}>Suggest an event ↗</Link></div>
    </div>
    <EventCalendar />
    <style>{`
      .koa-events{min-height:100svh;background:#f7f3e9;color:#1b333b;padding:clamp(72px,10vw,150px) clamp(20px,6vw,100px) clamp(90px,11vw,150px)}
      .koa-events__intro{max-width:950px;margin:0 auto 70px;text-align:center}.koa-events .eyebrow,.koa-calendar__top span{font:700 11px/1.4 system-ui,sans-serif;letter-spacing:.17em;text-transform:uppercase;color:#a34436}
      .koa-events h1{font:400 clamp(48px,6vw,90px)/1.05 Georgia,serif;letter-spacing:-.045em;margin:20px 0}.koa-events h1 em{font-weight:400;color:#a34436}
      .koa-events__intro>p:not(.eyebrow){max-width:590px;margin:0 auto 20px;font:400 16px/1.75 system-ui,sans-serif;color:#506266}.koa-events__review{border-left:3px solid #c29b54;padding-left:14px;text-align:left}
      .koa-events__links{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:30px}.koa-events__links a{border:1px solid #a9b5b3;padding:13px 18px;text-decoration:none;font:700 12px/1.3 system-ui,sans-serif}.koa-events__links a:hover,.koa-events__links a:focus-visible{background:#204752;color:white}
      .koa-calendar{max-width:1150px;margin:auto;border:1px solid #c9c8bd;background:#fffdf8;box-shadow:0 24px 70px #253f3914}.koa-calendar__top{display:flex;justify-content:space-between;align-items:end;gap:18px;padding:clamp(22px,3vw,40px)}.koa-calendar__top h2{font:400 clamp(28px,3.5vw,45px)/1.1 Georgia,serif;margin:8px 0 0}
      .koa-calendar__controls{display:flex;align-items:center;gap:6px}.koa-calendar__controls button{border:1px solid #c9c8bd;background:transparent;color:#1b333b;min-width:44px;min-height:44px;padding:8px 14px;cursor:pointer}.koa-calendar__controls button:hover,.koa-calendar__controls button:focus-visible{background:#204752;color:white}
      .koa-calendar__grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border-top:1px solid #d8d8d0}.koa-calendar__weekday{padding:14px 8px;text-align:center;font:700 11px system-ui,sans-serif;color:#667678;border-right:1px solid #e8e7e0}
      .koa-calendar__day{min-height:clamp(70px,9vw,110px);padding:13px;border-top:1px solid #e8e7e0;border-right:1px solid #e8e7e0;font:500 13px system-ui,sans-serif}.koa-calendar__day--blank{background:#f8f6f0}.koa-calendar__day a{display:block;margin-top:9px;color:#8f372e;font:700 11px/1.3 system-ui,sans-serif}.koa-calendar__empty{border-top:1px solid #d8d8d0;margin:0;padding:25px clamp(22px,3vw,40px);color:#52676b;font:400 14px/1.6 system-ui,sans-serif}
      .koa-calendar__details details{border-top:1px solid #d8d8d0;padding:20px 30px}.koa-calendar__details summary{display:flex;gap:18px;align-items:center;cursor:pointer}.koa-calendar__details summary span{margin-left:auto}.koa-calendar__details p{line-height:1.7}
      @media(max-width:650px){.koa-events__intro{margin-bottom:40px}.koa-calendar__top{align-items:start;flex-direction:column}.koa-calendar__weekday{font-size:10px}.koa-calendar__day{min-height:58px;padding:7px;font-size:11px}.koa-calendar__day a{font-size:9px;overflow-wrap:anywhere}}
    `}</style>
  </section>;
}
