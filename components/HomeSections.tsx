"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { KAGlyphField } from "./cinematic/KAGlyphField";
import { SealAssembly } from "./cinematic/SealAssembly";
import { DonationForm } from "./DonationForm";
import { getMessages, pageLabels, type Lang } from "./i18n";

const programs = [
  { key: "services", label: "Advocacy and civic learning", detail: "Explore KOA's public policy work and community programs.", image: "/koa/assets/fb-capitol-group-mobile-enhanced.png" },
  { key: "translation", label: "Language access", detail: "Find S'gaw Karen language resources and translation support.", image: "/koa/assets/fb-community-group-mobile-enhanced.png" },
  { key: "community", label: "Community and youth", detail: "Find connection, leadership, and ways to participate.", image: "/koa/assets/fb-outdoor-gathering-mobile-enhanced.png" },
] as const;

export function HomeSections({ lang }: { lang: Lang }) {
  const messages = getMessages(lang);
  const finaleRef = useRef<HTMLElement>(null);
  const glyphProgress = useRef(1);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const finale = finaleRef.current;
    if (!finale || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: finale,
        start: "top bottom",
        end: "bottom bottom",
        onUpdate: (self) => {
          const p = self.progress * self.progress * (3 - 2 * self.progress);
          glyphProgress.current = p;
          finale.style.setProperty("--finale-progress", p.toFixed(4));
        },
        onRefresh: (self) => {
          glyphProgress.current = self.progress;
          finale.style.setProperty("--finale-progress", self.progress.toFixed(4));
        },
      });
    }, finale);
    return () => context.revert();
  }, [reduced]);

  return (
    <div className="koa-home-story">
      <section className="koa-home-story__opening" aria-labelledby="koa-home-story-title">
        <p className="koa-home-story__eyebrow">Community · Language · Civic voice</p>
        <h2 id="koa-home-story-title">{lang === "en" ? <>A place to belong.<br /><em>A way to take part.</em></> : pageLabels.community[lang]}</h2>
        <p lang="en">KOA connects Karen communities in the United States with public learning, language resources, advocacy, and one another.</p>
        <Link href={`/${lang}/about`}>{messages.about} <span aria-hidden="true">↗</span></Link>
      </section>

      <section className="koa-home-story__programs" aria-label="Explore KOA work">
        {programs.map((program, index) => (
          <article className="koa-home-story__program" key={program.key}>
            <div className="koa-home-story__image"><img src={program.image} alt="" loading="lazy" /></div>
            <div className="koa-home-story__program-copy">
              <span className="koa-home-story__eyebrow">0{index + 1} / 03</span>
              <h2>{pageLabels[program.key][lang]}</h2>
              <p lang="en">{program.detail}</p>
              <Link href={`/${lang}/${program.key}`}>{program.label} <span aria-hidden="true">↗</span></Link>
            </div>
          </article>
        ))}
      </section>

      <section className="koa-home-story__access" aria-labelledby="koa-access-title">
        <span className="koa-home-story__eyebrow">Community access</span>
        <h2 id="koa-access-title">{lang === "en" ? "Find your next step." : messages.explore}</h2>
        <div className="koa-home-story__access-grid">
          <Link href={`/${lang}/dictionary`}><span>01</span><strong>{pageLabels.dictionary[lang]}</strong><small>{messages.dictionary} ↗</small></Link>
          <Link href={`/${lang}/contribute`}><span>02</span><strong>{pageLabels.contribute[lang]}</strong><small>{messages.contribute} ↗</small></Link>
          <Link href={`/${lang}/contact`}><span>03</span><strong>{pageLabels.contact[lang]}</strong><small>{messages.contact} ↗</small></Link>
        </div>
      </section>

      <section className="koa-home-story__join" aria-labelledby="koa-join-title">
        <div>
          <span className="koa-home-story__eyebrow">Events and people</span>
          <h2 id="koa-join-title">{lang === "en" ? "Meet the community behind the work." : pageLabels.community[lang]}</h2>
          <p lang="en">See KOA's public updates for current gatherings and stories. Have an event or volunteer story to share? Contact the team.</p>
          <div className="koa-home-story__links"><a href="https://www.facebook.com/koamerica" target="_blank" rel="noreferrer">Current updates ↗</a><Link href={`/${lang}/contact`}>Share a story ↗</Link></div>
        </div>
        <img src="/koa/assets/fb-capitol-flags-mobile-enhanced.png" alt="Karen community members during a Capitol visit" loading="lazy" />
      </section>

      <section className="koa-home-story__give" aria-labelledby="koa-give-title">
        <div><span className="koa-home-story__eyebrow">Sustain community access</span><h2 id="koa-give-title">{lang === "en" ? "Help keep the work moving." : messages.donate}</h2><p lang="en">Support language access, community gatherings, and public learning.</p></div>
        <DonationForm lang={lang} />
      </section>

      <section ref={finaleRef} className="koa-home-finale" aria-label="Karen Organization of America">
        <div className="koa-home-finale__inner">
          <div className="koa-home-finale__mark" aria-hidden="true">
            <KAGlyphField progress={glyphProgress} reducedMotion={reduced} hero scatterProgress={glyphProgress} />
            <div className="koa-home-finale__seal"><SealAssembly rotation={0} /></div>
          </div>
          <p>Karen Organization of America</p>
          <p lang="ksw">ကညီအတၢ်ကရၢကရိလၢကီၢ်အမဲရကၤ</p>
        </div>
      </section>
    </div>
  );
}
