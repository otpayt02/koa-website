import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { CommunityAtmosphere } from "@/components/CommunityAtmosphere";
import { discussions } from "@/components/data";
import { isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { StatusPill } from "@/components/StatusPill";

export const metadata: Metadata = { title: "Community", description: "Karen community stories, events, volunteer opportunities, and moderated discussions." };

export default async function CommunityPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params; if (!isLang(value)) return null; const lang = value;
  return <div className="community-current">
    <CommunityAtmosphere lang={lang} />
    <div className="community-current__content">
      <PageHero eyebrow="Community · ပှၤတဝၢ" title={pageLabels.community[lang]} description={lang === "ksw" ? "နမ့ၢ်အိၣ်ဖဲလဲၣ်ဂ့ၤ နပာ်ဃုာ်လၢကညီပှၤတဝၢအတၢ်မၤသကိးန့ၢ်လီၤ။" : "Find community moments, join an event, volunteer your skills, or bring an idea to the people shaping KOA's work."} image="/koa/assets/fb-outdoor-gathering-mobile-enhanced.png" imageAlt="Karen community members gathered outdoors" />
      <Section eyebrow="Upcoming" title="Gather, learn, and celebrate.">
      <div className="event-grid"><Card><time dateTime="2026-08-22"><strong>22</strong>August · Online</time><h3>Language contributor orientation</h3><p>A welcoming introduction to dictionary entries, recordings, consent, and community review.</p><Link className="text-link" href={`/${lang}/contribute`}>Reserve a place</Link></Card><Card><time dateTime="2026-09-05"><strong>05</strong>September · Omaha</time><h3>Youth civic leadership workshop</h3><p>Public systems, advocacy practice, and a plan for local action.</p><Link className="text-link" href={`/${lang}/contact`}>Ask about registration</Link></Card><Card><time dateTime="2026-09-19"><strong>19</strong>September · Minnesota</time><h3>Community culture & sport day</h3><p>An intergenerational day of connection, food, play, and cultural learning.</p><Link className="text-link" href={`/${lang}/contact`}>Volunteer</Link></Card></div>
      </Section>
      <section className="story-strip"><article><img src="/koa/assets/youth-advocacy.jpg" alt="Karen youth advocates" /><div><p className="eyebrow">Youth leadership</p><h2>Young people carry knowledge into action.</h2><p>Workshops and national learning visits help emerging leaders understand public systems and advocate for their communities.</p></div></article><article><img src="/koa/assets/cultural-community.jpg" alt="Karen cultural community gathering" /><div><p className="eyebrow">Culture & belonging</p><h2>Connection crosses generations.</h2><p>Gatherings create space to speak Karen, share traditions, build relationships, and welcome people home.</p></div></article></section>
      <Section tone="cream" eyebrow="Community board" title="Ideas move forward in public." intro="Every suggestion has a visible status and a moderated place for constructive discussion.">
      <div className="discussion-list">{discussions.slice(0, 3).map((item) => <article key={item.title}><div><StatusPill tone={item.status === "Approved" ? "green" : "gold"}>{item.status}</StatusPill><h3>{item.title}</h3><p>{item.kind} · {item.author} · {item.time}</p></div><strong>{item.replies}<small>replies</small></strong></article>)}</div><div className="section-action"><Button href={`/${lang}/community/board`}>Open the community board</Button><Button href={`/${lang}/collaborate`} variant="quiet">Share a new idea</Button></div>
      </Section>
    </div>
  </div>;
}
