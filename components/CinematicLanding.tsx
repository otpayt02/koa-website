"use client";
import Link from "next/link";
import { useState } from "react";
import { KAGlyphField } from "./cinematic/KAGlyphField";
import { SealAssembly } from "./cinematic/SealAssembly";
import type { Lang, Messages } from "./i18n";
const pillars = [
  { label: "Resettlement", title: "A steadier first home.", body: "Practical support for Karen families navigating a new country, from early arrival needs to longer-term community connection.", href: "mission", image: "/koa/assets/hero-community-mobile-enhanced.png" },
  { label: "Civic engagement", title: "A voice in the room.", body: "Advocacy, civic education, and youth leadership that carry Karen priorities into community life and Washington policy conversations.", href: "advocacy", image: "/koa/assets/washington-advocacy.jpg" },
  { label: "Cultural preservation", title: "Language that stays alive.", body: "Karen language, New Year celebrations, literacy resources, and shared culture passed forward across generations.", href: "community", image: "/koa/assets/cultural-community.jpg" },
] as const;
const landingGallery = [
  { src: "/koa/assets/landing/koa-wordmark-reference.png", alt: "KOA wordmark in English and S'gaw Karen" },
  { src: "/koa/assets/landing/koa-programs-grid-01.png", alt: "KOA program cards for Language Nest, Oral Histories, and Advocacy Lab" },
  { src: "/koa/assets/landing/koa-programs-grid-02.png", alt: "KOA program cards for Music Archive, Humanitarian Aid, and Youth Council" },
] as const;
export function CinematicLanding({ lang, messages: _messages }: { lang: Lang; messages: Messages }) {
  const [active, setActive] = useState(0); const [galleryIndex, setGalleryIndex] = useState(0); const pillar = pillars[active]; const gallery = landingGallery[galleryIndex];
  return <section className="koa-static-landing" aria-labelledby="koa-static-title">
    <div className="koa-static-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(3,16,28,.94) 0%, rgba(3,16,28,.72) 48%, rgba(3,16,28,.34) 100%), url('${gallery.src}')` }}>
      <div className="koa-static-copy"><p className="koa-static-kicker">Karen Organization of America</p><h1 id="koa-static-title">Standing with the Karen community in America.</h1><p className="koa-static-intro">Preserving Karen language across generations, promoting cultural identity, and providing a voice for those in Kawthoolei and Burma through advocacy in Washington.</p><div className="koa-static-actions"><Link href={`/${lang}/donate`}>Support our work</Link><Link className="secondary" href={`/${lang}/mission`}>Get involved</Link></div><div className="koa-static-gallery-controls" aria-label="Landing image gallery"><button type="button" onClick={() => setGalleryIndex((galleryIndex + landingGallery.length - 1) % landingGallery.length)} aria-label="Previous landing image">←</button><span>{galleryIndex + 1} / {landingGallery.length}</span><button type="button" onClick={() => setGalleryIndex((galleryIndex + 1) % landingGallery.length)} aria-label="Next landing image">→</button><span className="koa-static-gallery-caption">{gallery.alt}</span></div></div>
      <div className="koa-static-mark" aria-label="KOA glyph mark"><KAGlyphField progress={0.3} reducedMotion /><div className="koa-static-seal"><SealAssembly rotation={0} /></div><div className="koa-static-glyph-label">ကညီ · KOA</div></div>
    </div>
    <div className="koa-static-pillars"><div className="koa-static-pillar-tabs" role="tablist" aria-label="KOA's three core services">{pillars.map((item, index) => <button key={item.label} role="tab" aria-selected={active === index} className={active === index ? "active" : ""} onClick={() => setActive(index)}><span>0{index + 1}</span>{item.label}</button>)}</div><article className="koa-static-pillar-panel"><div><p className="koa-static-kicker">Three core services · 0{active + 1}</p><h2>{pillar.title}</h2><p>{pillar.body}</p><Link href={`/${lang}/${pillar.href}`}>Explore {pillar.label} <span aria-hidden="true">↗</span></Link></div><img src={pillar.image} alt="" /></article></div>
  </section>;
}
export default CinematicLanding;
