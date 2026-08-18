import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Card } from "@/components/Card";
import { dictionaryEntries } from "@/components/data";
import { getMessages, isLang } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { StatusPill } from "@/components/StatusPill";

export function generateStaticParams() {
  return dictionaryEntries.map((entry) => ({ id: entry.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const entry = dictionaryEntries.find((item) => item.id === id);
  return entry ? { title: `${entry.word} · Karen Dictionary`, description: entry.definition.en } : { title: "Dictionary entry" };
}

export default async function DictionaryEntryPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: value, id } = await params;
  if (!isLang(value)) return null;
  const entry = dictionaryEntries.find((item) => item.id === id);
  if (!entry) notFound();
  const lang = value;
  const messages = getMessages(lang);

  return (
    <>
      <PageHero eyebrow="Dictionary entry · လံာ်ခီယ့ၣ်" title={entry.word} description={`${entry.romanization} · ${entry.partOfSpeech}`} compact>
        <AudioPlayer word={entry.word} label={`${entry.audioCount} community recordings`} />
        <Link className="button button--secondary" href={`/${lang}/contribute`}>{messages.contribute}</Link>
      </PageHero>
      <Section eyebrow="Meaning & use" title={entry.translations.join(" · ")} intro={entry.definition[lang]}>
        <div className="feature-grid feature-grid--2">
          <Card><p className="eyebrow">Example · တၢ်သူအီၤ</p><p className="dictionary-example" lang="ksw">{entry.exampleKaren}</p><p>{entry.exampleEnglish}</p></Card>
          <Card><p className="eyebrow">Provenance · တၢ်မၤလီၤတံၢ်</p><dl className="detail-list"><div><dt>Category</dt><dd>{entry.category}</dd></div><div><dt>Contributor</dt><dd><Link className="text-link" href={`/${lang}/u/${entry.contributor}`}>@{entry.contributor}</Link></dd></div><div><dt>Published</dt><dd>{entry.updated}</dd></div><div><dt>Version</dt><dd>v{entry.version}</dd></div></dl><StatusPill tone="green">{messages.communityReviewed}</StatusPill></Card>
        </div>
      </Section>
      <Section tone="cream" eyebrow="Related language" title="Words in conversation">
        <div className="feature-grid feature-grid--2"><Card><h3>Synonyms</h3><p>{entry.synonyms.length ? entry.synonyms.join(" · ") : "No synonyms recorded yet."}</p></Card><Card><h3>Antonyms</h3><p>{entry.antonyms.length ? entry.antonyms.join(" · ") : "No antonyms recorded yet."}</p></Card></div>
      </Section>
      <Section eyebrow="Edit history" title="A visible path from contribution to publication.">
        <ol className="timeline"><li><span>{entry.updated}</span><h3>Community review completed</h3><p>Version {entry.version} is published after language and context review.</p></li><li><span>Earlier versions</span><h3>Contributor edits remain attributed</h3><p>Future corrections and regional notes will appear here with their reviewer and reason for change.</p></li></ol>
      </Section>
    </>
  );
}
