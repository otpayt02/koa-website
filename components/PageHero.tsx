"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function PageHero({ eyebrow, title, description, image, imageAlt = "", children, compact = false }: { eyebrow: string; title: string; description: string; image?: string; imageAlt?: string; children?: ReactNode; compact?: boolean }) {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !image || window.matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(window.location.search).get("motion") === "off") return;
    const photo = hero.querySelector<HTMLElement>(".page-hero__media img");
    const copy = hero.querySelector<HTMLElement>(".page-hero__content");
    if (!photo || !copy) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.fromTo(photo, { xPercent: 6, yPercent: -8, scale: 1.14 }, {
        xPercent: -2, yPercent: 9, scale: 1.08, ease: "none",
        scrollTrigger: { trigger: hero, start: "top bottom", end: "bottom top", scrub: 1.2 },
      });
      gsap.fromTo(copy, { xPercent: -5, yPercent: 10 }, {
        xPercent: 1, yPercent: -5, ease: "none",
        scrollTrigger: { trigger: hero, start: "top bottom", end: "bottom top", scrub: 1.8 },
      });
    }, hero);
    return () => context.revert();
  }, [image]);

  return (
    <section ref={heroRef} className={`page-hero${compact ? " page-hero--compact" : ""}`}>
      {image ? <div className="page-hero__media"><img src={image} alt={imageAlt} /></div> : null}
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
