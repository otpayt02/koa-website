"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import karenMessages from "../messages/ksw.json";
import { HeritageGlyphMark } from "./cinematic/HeritageGlyphMark";
import { SealAssembly } from "./cinematic/SealAssembly";
import { shouldReduceMotion } from "./motionPreference";
import type { Lang, Messages } from "./i18n";
// Use distinct supplied documentary scenes; alternate crops of one event repeat visually.
const pillars = [
  { label: "Education Program", title: "Support that meets people where they are.", body: "Helping Karen families navigate life in a new country, from early arrival needs to longer-term community connection.", href: "services", image: "/koa/assets/523419272_1052856803702849_6160094799043046969_n.jpg" },
  { label: "Civic engagement & culture", title: "Civic engagement & cultural preservation.", body: "Karen New Year celebrations, Karen literacy/language classes/resources, and civic programs that pass identity and participation on to the next generation.", href: "services", image: "/koa/assets/552606827_1102555948732934_6193283630378424638_n.jpg" },
  { label: "Policy advocacy", title: "Carrying Karen voices into U.S. policy.", body: "Engaging Congress and federal agencies on legislation and policy affecting Myanmar/Burma and the Karen people, including the BRAVE Burma Act.", href: "services#advocacy", image: "/koa/assets/518370019_1052051797116683_5742779659502570903_n.jpg" },
] as const;
export function CinematicLanding({ lang, messages: _messages }: { lang: Lang; messages: Messages }) {
  const [activePillar, setActivePillar] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(shouldReduceMotion(media));
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  // Eight-second chapters pause while someone reads or operates the tabs.
  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => { if (!document.hidden) setActivePillar((current) => (current + 1) % pillars.length); }, 8000);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, activePillar]);
  const pillar = pillars[activePillar];
  return <section className="koa-static-landing" aria-labelledby="koa-static-title">
    <div className="koa-static-portrait">
      {/* Full-width supplied original: native aspect ratio preserves the Capitol and every face. */}
      <img src="/koa/assets/520228539_1052042917117571_646496839831873159_n.jpg" alt="Karen community members gathered before the U.S. Capitol" width="1280" height="853" fetchPriority="high" />
    </div>
    <div className="koa-static-hero">
      <div className="koa-static-mark" role="img" aria-label="Karen glyph K, the KOA seal, and Karen glyph A">
        <HeritageGlyphMark reducedMotion={reducedMotion} />
        <div className="koa-static-seal"><SealAssembly rotation={0} /></div>
      </div>
      <div className="koa-static-identity">
        <h1 id="koa-static-title" className="koa-static-name">Karen Organization of America</h1>
        <p className="koa-static-karen-name" lang="ksw">{karenMessages.siteName}</p>
      </div>
      <div className="koa-static-story">
        <p className="koa-static-tagline"><span>Standing with the Karen community</span><strong>in America and along the border.</strong></p>
        <div className="koa-static-story-detail">
          <p className="koa-static-intro">Preserving Karen language across generations, promoting appreciation for cultural identity, and providing a voice for those in Kawthoolei and Burma through advocacy in Washington.</p>
          <div className="koa-static-actions"><Link href={`/${lang}/donate`}>Support our work</Link><Link className="secondary" href={`/${lang}/services`}>Get involved</Link></div>
        </div>
      </div>
    </div>
    <div className="koa-static-pillars" aria-label="KOA's three core services" onPointerMove={(event) => {
      if (reducedMotion || event.pointerType === "touch") return;
      const bounds = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--glare-x", `${(event.clientX - bounds.left) / bounds.width * 100}%`);
      event.currentTarget.style.setProperty("--glare-y", `${(event.clientY - bounds.top) / bounds.height * 100}%`);
    }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false); }}>
      <div ref={tabsRef} className="koa-static-pillar-tabs" role="tablist" aria-label="Three core pillars" onKeyDown={(event) => {
        const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? pillars.length - 1 : (activePillar + (event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1) + pillars.length) % pillars.length;
        setActivePillar(next); tabsRef.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
      }}>
        {pillars.map((item, index) => <button key={item.label} id={`koa-pillar-tab-${index + 1}`} type="button" role="tab" tabIndex={activePillar === index ? 0 : -1} aria-selected={activePillar === index} aria-controls="koa-pillar-panel" onClick={() => setActivePillar(index)}>{item.label}</button>)}
      </div>
      <article key={pillar.label} id="koa-pillar-panel" className="koa-static-pillar-panel" role="tabpanel" tabIndex={0} aria-labelledby={`koa-pillar-tab-${activePillar + 1}`}>
        <div className="koa-static-pillar-copy">
          <p className="koa-static-kicker">{pillar.label}</p>
          <h2>{pillar.title}</h2>
          <p>{pillar.body}</p>
          <Link href={`/${lang}/${pillar.href}`}>Explore {pillar.label} <span aria-hidden="true">↗</span></Link>
        </div>
        <img src={pillar.image} alt="" loading="lazy" />
      </article>
    </div>
  </section>;
}
export default CinematicLanding;
