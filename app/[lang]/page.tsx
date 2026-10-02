import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { CinematicHome } from "@/components/CinematicHome";
import { dictionaryEntries } from "@/components/data";
import { DictionaryEntry } from "@/components/DictionaryEntry";
import { getMessages, isLang } from "@/components/i18n";
import { Section } from "@/components/Section";
import homeCopyCatalog from "@/content/koa-home-copy.json";

export const metadata: Metadata = {
  title: "Home",
  description: "America's home for the Karen community. Providing, combining, and inviting a national Karen voice.",
};

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const m = getMessages(lang);
  const homeCopy = lang === "ksw" ? homeCopyCatalog.ksw : homeCopyCatalog.en;
  return (
    <>
      <CinematicHome lang={lang} messages={m} />

      <Section eyebrow="Our purpose · ပတၢ်ပညိၣ်" title={homeCopy.sections.purpose} intro={lang === "ksw" ? "KOA ဆဲးကျိးပှၤတဝၢ၊ ကတိၤခဲပှၤတဖၣ်အဂီၢ်၊ ဒီးဟ့ၣ်တၢ်သ့တၢ်ဘၣ်လၢကတီခိၣ်ရိၣ်မဲ။" : "KOA connects Karen communities, advocates for justice, and gives people practical pathways to participate and lead."}>
        <div className="feature-grid feature-grid--3">
          <Card><span className="card-number">01</span><h3>Civic education</h3><p>Understand public systems, grow youth leadership, and turn community priorities into action.</p><Link className="text-link" href={`/${lang}/services`}>Explore programs</Link></Card>
          <Card><span className="card-number">02</span><h3>Language access</h3><p>Find community-reviewed words and request trusted Karen translation or interpretation.</p><Link className="text-link" href={`/${lang}/translation`}>Find language support</Link></Card>
          <Card><span className="card-number">03</span><h3>Community care</h3><p>Share ideas, volunteer, partner, or give so resources move where they matter most.</p><Link className="text-link" href={`/${lang}/collaborate`}>Take part</Link></Card>
        </div>
      </Section>

      <section className="image-story"><div className="image-story__media"><img src="/koa/assets/fb-capitol-group-mobile-enhanced.png" alt="Karen advocates visiting the United States Capitol" /></div><div className="image-story__copy"><p className="eyebrow">Community-led advocacy</p><h2>Knowledge becomes a voice in the room.</h2><p>KOA helps Karen leaders and young people understand public systems, speak to decision-makers, and bring what they learn home.</p><Button href={`/${lang}/services`} variant="secondary">See the work</Button></div></section>

      <Section tone="cream" eyebrow="Living language · ကညီကျိာ်" title={homeCopy.sections.language} intro="Every published entry preserves who contributed, who reviewed it, and how the language is used.">
        <div className="dictionary-grid">{dictionaryEntries.slice(0, 3).map((entry) => <DictionaryEntry key={entry.id} entry={entry} lang={lang} compact />)}</div>
        <div className="section-action"><Button href={`/${lang}/dictionary`}>{m.explore} {m.dictionary}</Button><Button href={`/${lang}/contribute`} variant="quiet">Share a word or recording</Button></div>
      </Section>

      <Section tone="ink" eyebrow="This month" title={homeCopy.sections.community} intro="Ways to learn, connect, and take part—wherever you live.">
        <div className="event-list"><article><time dateTime="2026-08-22"><strong>22</strong>Aug</time><div><p className="eyebrow">Online · National</p><h3>Language contributor orientation</h3><p>Learn how community definitions and recordings move through review.</p></div><Link className="text-link" href={`/${lang}/contribute`}>Join orientation</Link></article><article><time dateTime="2026-09-05"><strong>05</strong>Sep</time><div><p className="eyebrow">Omaha, Nebraska</p><h3>Youth civic leadership workshop</h3><p>A practical day of public-system learning and community action.</p></div><Link className="text-link" href={`/${lang}/community`}>Event details</Link></article></div>
      </Section>
    </>
  );
}
