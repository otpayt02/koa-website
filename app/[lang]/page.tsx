import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { CinematicHome } from "@/components/CinematicHome";
import { dictionaryEntries } from "@/components/data";
import { DictionaryEntry } from "@/components/DictionaryEntry";
import { isLang } from "@/components/i18n";
import { Section } from "@/components/Section";
import { getPublishedMessages, getTranslator } from "@/lib/content";

export const metadata: Metadata = { title: "Home", description: "A national home for Karen communities to connect, contribute, and lead." };

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const m = await getPublishedMessages(lang);
  const t = await getTranslator(lang);
  return (
    <>
      <CinematicHome lang={lang} messages={m} copy={{ ariaLabel: t("home.film.ariaLabel"), established: t("home.film.established"), title: t("home.film.title"), intro: t("home.film.intro") }} />

      <Section eyebrow={t("home.purpose.eyebrow")} title={t("home.purpose.title")} intro={t("home.purpose.intro")}>
        <div className="feature-grid feature-grid--3">
          <Card><span className="card-number">01</span><h3>Civic education</h3><p>Understand public systems, grow youth leadership, and turn community priorities into action.</p><Link className="text-link" href={`/${lang}/services`}>Explore programs</Link></Card>
          <Card><span className="card-number">02</span><h3>Language access</h3><p>Find community-reviewed words and request trusted Karen translation or interpretation.</p><Link className="text-link" href={`/${lang}/translation`}>Find language support</Link></Card>
          <Card><span className="card-number">03</span><h3>Community care</h3><p>Share ideas, volunteer, partner, or give so resources move where they matter most.</p><Link className="text-link" href={`/${lang}/collaborate`}>Take part</Link></Card>
        </div>
      </Section>

      <section className="image-story"><div className="image-story__media"><img src="/koa/assets/fb-capitol-group-mobile-enhanced.png" alt="Karen advocates visiting the United States Capitol" /></div><div className="image-story__copy"><p className="eyebrow">Community-led advocacy</p><h2>{t("home.advocacy.title")}</h2><p>{t("home.advocacy.copy")}</p><Button href={`/${lang}/services`} variant="secondary">See the work</Button></div></section>

      <Section tone="cream" eyebrow="Living language · ကညီကျိာ်" title={t("home.language.title")} intro={t("home.language.copy")}>
        <div className="dictionary-grid">{dictionaryEntries.slice(0, 3).map((entry) => <DictionaryEntry key={entry.id} entry={entry} lang={lang} compact />)}</div>
        <div className="section-action"><Button href={`/${lang}/dictionary`}>{m.explore} {m.dictionary}</Button><Button href={`/${lang}/contribute`} variant="quiet">Share a word or recording</Button></div>
      </Section>

      <Section tone="ink" eyebrow="This month" title={t("home.events.title")} intro={t("home.events.copy")}>
        <div className="event-list"><article><time dateTime="2026-08-22"><strong>22</strong>Aug</time><div><p className="eyebrow">Online · National</p><h3>Language contributor orientation</h3><p>Learn how community definitions and recordings move through review.</p></div><Link className="text-link" href={`/${lang}/contribute`}>Join orientation</Link></article><article><time dateTime="2026-09-05"><strong>05</strong>Sep</time><div><p className="eyebrow">Omaha, Nebraska</p><h3>Youth civic leadership workshop</h3><p>A practical day of public-system learning and community action.</p></div><Link className="text-link" href={`/${lang}/community`}>Event details</Link></article></div>
      </Section>
    </>
  );
}
