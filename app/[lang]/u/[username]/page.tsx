import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import { dictionaryEntries, interpreters } from "@/components/data";
import { getMessages, isLang } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { StatusPill } from "@/components/StatusPill";

export function generateStaticParams() {
  return interpreters.map((interpreter) => ({ username: interpreter.username }));
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const profile = interpreters.find((interpreter) => interpreter.username === username);
  return profile ? { title: `${profile.name} · Community profile`, description: `${profile.name}'s approved Karen language profile.` } : { title: "Community profile" };
}

export default async function ProfilePage({ params }: { params: Promise<{ lang: string; username: string }> }) {
  const { lang: value, username } = await params;
  if (!isLang(value)) return null;
  const profile = interpreters.find((interpreter) => interpreter.username === username);
  if (!profile) notFound();
  const lang = value;
  const contributions = dictionaryEntries.filter((entry) => entry.contributor === profile.username);
  const messages = getMessages(lang);
  return (
    <>
      <PageHero eyebrow="Community profile · ပှၤတဝၢအမံၤ" title={profile.name} description={profile.credentials} compact><StatusPill tone="green">KOA approved</StatusPill><Link className="button button--secondary" href={`/${lang}/translation`}>Request language support</Link></PageHero>
      <Section eyebrow="At a glance" title="Trust is built in public."><div className="feature-grid feature-grid--3"><Card><div className="avatar avatar--large">{profile.initials}</div><h3>{profile.languages}</h3><p>{profile.area}</p></Card><Card><p className="eyebrow">Availability</p><h3>{profile.availability}</h3><p>Schedule is confirmed when a request is received.</p></Card><Card><p className="eyebrow">Community rating</p><h3>{profile.rating} / 5</h3><p>{profile.reviews} moderated reviews</p></Card></div></Section>
      <Section tone="cream" eyebrow="Contributions" title="Language work connected to this profile." intro="Contributions are shown only after community review and remain linked to their version history.">{contributions.length ? <div className="dictionary-grid">{contributions.map((entry) => <article className="dictionary-card" key={entry.id}><div className="dictionary-card__top"><StatusPill tone="green">{messages.communityReviewed}</StatusPill><span>v{entry.version}</span></div><p className="dictionary-word" lang="ksw">{entry.word}</p><p className="romanization">{entry.romanization}</p><p>{entry.definition[lang]}</p><Link className="text-link" href={`/${lang}/dictionary/${entry.id}`}>View dictionary entry</Link></article>)}</div> : <div className="empty-state"><h3>No dictionary contributions published yet.</h3><p>Profile activity will appear here as approved work is connected.</p></div>}</Section>
      <Section eyebrow="Languages & credentials" title="Community-reviewed experience."><dl className="detail-list detail-list--wide"><div><dt>Languages</dt><dd>{profile.languages}</dd></div><div><dt>Credentials</dt><dd>{profile.credentials}</dd></div><div><dt>Service area</dt><dd>{profile.area}</dd></div><div><dt>Profile status</dt><dd><StatusPill tone="green">Verified by KOA</StatusPill></dd></div></dl></Section>
    </>
  );
}
