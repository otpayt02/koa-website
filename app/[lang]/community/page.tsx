import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { discussions } from "@/components/data";
import { isLang } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { StatusPill } from "@/components/StatusPill";
import { getTranslator } from "@/lib/content";

export const metadata: Metadata = { title: "Community", description: "Karen community stories, events, volunteer opportunities, and moderated discussions." };

export default async function CommunityPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params; if (!isLang(value)) return null; const lang = value; const t = await getTranslator(lang);
  return <>
    <PageHero eyebrow={t("community.hero.eyebrow")} title={t("page.community.heroTitle")} description={t("community.hero.description")} image="/koa/assets/fb-outdoor-gathering-mobile-enhanced.png" imageAlt="Karen community members gathered outdoors" />
    <Section eyebrow="Upcoming" title={t("community.events.title")}>
      <div className="event-grid"><Card><time dateTime="2026-08-22"><strong>22</strong>August · Online</time><h3>Language contributor orientation</h3><p>A welcoming introduction to dictionary entries, recordings, consent, and community review.</p><Link className="text-link" href={`/${lang}/contribute`}>Reserve a place</Link></Card><Card><time dateTime="2026-09-05"><strong>05</strong>September · Omaha</time><h3>Youth civic leadership workshop</h3><p>Public systems, advocacy practice, and a plan for local action.</p><Link className="text-link" href={`/${lang}/contact`}>Ask about registration</Link></Card><Card><time dateTime="2026-09-19"><strong>19</strong>September · Minnesota</time><h3>Community culture & sport day</h3><p>An intergenerational day of connection, food, play, and cultural learning.</p><Link className="text-link" href={`/${lang}/contact`}>Volunteer</Link></Card></div>
    </Section>
    <section className="story-strip"><article><img src="/koa/assets/youth-advocacy.jpg" alt="Karen youth advocates" /><div><p className="eyebrow">Youth leadership</p><h2>{t("community.youth.title")}</h2><p>Workshops and national learning visits help emerging leaders understand public systems and advocate for their communities.</p></div></article><article><img src="/koa/assets/cultural-community.jpg" alt="Karen cultural community gathering" /><div><p className="eyebrow">Culture & belonging</p><h2>{t("community.culture.title")}</h2><p>Gatherings create space to speak Karen, share traditions, build relationships, and welcome people home.</p></div></article></section>
    <Section tone="cream" eyebrow="Community board" title={t("community.board.title")} intro={t("community.board.intro")}>
      <div className="discussion-list">{discussions.slice(0, 3).map((item) => <article key={item.title}><div><StatusPill tone={item.status === "Approved" ? "green" : "gold"}>{item.status}</StatusPill><h3>{item.title}</h3><p>{item.kind} · {item.author} · {item.time}</p></div><strong>{item.replies}<small>replies</small></strong></article>)}</div><div className="section-action"><Button href={`/${lang}/community/board`}>Open the community board</Button><Button href={`/${lang}/collaborate`} variant="quiet">Share a new idea</Button></div>
    </Section>
  </>;
}
