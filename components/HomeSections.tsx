"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DonationForm } from "./DonationForm";
import { getMessages, pageLabels, type Lang } from "./i18n";

const programs = [
  { key: "services", label: "Advocacy and civic learning", detail: "Explore KOA's public policy work and community programs.", image: "/koa/assets/fb-capitol-group-mobile-enhanced.png" },
  { key: "translation", label: "Language access", detail: "Find S'gaw Karen language resources and translation support.", image: "/koa/assets/fb-community-group-mobile-enhanced.png" },
  { key: "community", label: "Community and youth", detail: "Find connection, leadership, and ways to participate.", image: "/koa/assets/fb-outdoor-gathering-mobile-enhanced.png" },
] as const;

export function HomeSections({ lang }: { lang: Lang }) {
  const messages = getMessages(lang);
  const storyRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches || new URLSearchParams(window.location.search).get("motion") === "off");
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const story = storyRef.current;
    if (!story || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      story.querySelectorAll<HTMLElement>(".koa-home-story__program").forEach((section, index) => {
        const image = section.querySelector<HTMLElement>(".koa-home-story__image-plane");
        const copy = section.querySelector<HTMLElement>(".koa-home-story__program-copy");
        if (!image || !copy) return;
        const side = index % 2 === 0 ? 1 : -1;
        gsap.fromTo(image, { xPercent: side * 6, yPercent: -9 }, {
          xPercent: 0, yPercent: 10, ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.2 },
        });
        gsap.fromTo(copy, { xPercent: -side * 8, yPercent: 12 }, {
          xPercent: 0, yPercent: -6, ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.8 },
        });
      });
    }, story);
    return () => context.revert();
  }, [reduced]);

  return (
    <div ref={storyRef} className="koa-home-story">
      <section className="koa-home-story__opening" aria-labelledby="koa-home-story-title">
        <p className="koa-home-story__eyebrow">Community · Language · Civic voice</p>
        <h2 id="koa-home-story-title">{lang === "en" ? <>A place to belong.<br /><em>A way to take part.</em></> : pageLabels.community[lang]}</h2>
        <p lang="en">KOA connects Karen communities in the United States with public learning, language resources, advocacy, and one another.</p>
        <Link href={`/${lang}/about`}>{messages.about} <span aria-hidden="true">↗</span></Link>
      </section>

      <section className="koa-home-story__programs" aria-label="Explore KOA work">
        {programs.map((program, index) => (
          <article className="koa-home-story__program" key={program.key}>
            <div className="koa-home-story__image"><div className="koa-home-story__image-plane"><img src={program.image} alt="" loading="lazy" /></div></div>
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

    </div>
  );
}
