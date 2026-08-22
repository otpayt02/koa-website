import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Card } from "@/components/Card";
import { dictionaryEntries as staticEntries } from "@/components/data";
import { getMessages, isLang } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { StatusPill } from "@/components/StatusPill";
import { getDb } from "@/db";
import { dictionaryEntries, dictionaryExamples, dictionaryRelations, dictionaryTranslations } from "@/db/schema";

export const dynamicParams = true;

export function generateStaticParams() {
  return staticEntries.map((entry) => ({ id: entry.id }));
}

type LiveDetail = {
  entry: { id: string; word: string; partOfSpeech: string | null; category: string | null; etymology: string | null; source: string; status: string; version: number };
  translations: { id: string; language: string; text: string; status: string }[];
  examples: { id: string; karen: string; english: string; status: string }[];
  relations: { id: string; relation: string; relatedText: string | null; status: string }[];
};

async function loadLiveEntry(id: string): Promise<LiveDetail | null> {
  try {
    const db = getDb();
    const [entry] = await db.select().from(dictionaryEntries).where(eq(dictionaryEntries.id, id)).limit(1);
    if (!entry || entry.status !== "approved") return null;
    const [translations, examples, relations] = await Promise.all([
      db.select().from(dictionaryTranslations).where(and(eq(dictionaryTranslations.entryId, id), eq(dictionaryTranslations.status, "approved"))),
      db.select().from(dictionaryExamples).where(and(eq(dictionaryExamples.entryId, id), eq(dictionaryExamples.status, "approved"))),
      db.select().from(dictionaryRelations).where(and(eq(dictionaryRelations.entryId, id), eq(dictionaryRelations.status, "approved"))),
    ]);
    return { entry: { id: entry.id, word: entry.word, partOfSpeech: entry.partOfSpeech, category: entry.category, etymology: entry.etymology, source: entry.source, status: entry.status, version: entry.version }, translations, examples, relations };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const staticEntry = staticEntries.find((item) => item.id === id);
  if (staticEntry) return { title: `${staticEntry.word} · Karen Dictionary`, description: staticEntry.definition.en };
  const live = await loadLiveEntry(id);
  if (live) {
    const firstTranslation = live.translations[0]?.text ?? "";
    return { title: `${live.entry.word} · Karen Dictionary`, description: firstTranslation || "Approved S'gaw Karen dictionary entry." };
  }
  return { title: "Dictionary entry" };
}

export default async function DictionaryEntryPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: value, id } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const messages = getMessages(lang);

  // Static (checked-in) entries render with their curated copy.
  const staticEntry = staticEntries.find((item) => item.id === id);
  if (staticEntry) {
    return (
      <>
        <PageHero eyebrow="Dictionary entry · လံာ်ခီယ့ၣ်" title={staticEntry.word} description={`${staticEntry.romanization} · ${staticEntry.partOfSpeech}`} compact>
          <AudioPlayer word={staticEntry.word} label={`${staticEntry.audioCount} community recordings`} />
          <Link className="button button--secondary" href={`/${lang}/contribute`}>{messages.contribute}</Link>
        </PageHero>
        <Section eyebrow="Meaning & use" title={staticEntry.translations.join(" · ")} intro={staticEntry.definition[lang]}>
          <div className="feature-grid feature-grid--2">
            <Card><p className="eyebrow">Example · တၢ်သူအီၤ</p><p className="dictionary-example" lang="ksw">{staticEntry.exampleKaren}</p><p>{staticEntry.exampleEnglish}</p></Card>
            <Card><p className="eyebrow">Provenance · တၢ်မၤလီၤတံၢ်</p><dl className="detail-list"><div><dt>Category</dt><dd>{staticEntry.category}</dd></div><div><dt>Contributor</dt><dd><Link className="text-link" href={`/${lang}/u/${staticEntry.contributor}`}>@{staticEntry.contributor}</Link></dd></div><div><dt>Published</dt><dd>{staticEntry.updated}</dd></div><div><dt>Version</dt><dd>v{staticEntry.version}</dd></div></dl><StatusPill tone="green">{messages.communityReviewed}</StatusPill></Card>
          </div>
        </Section>
        <Section tone="cream" eyebrow="Related language" title="Words in conversation">
          <div className="feature-grid feature-grid--2"><Card><h3>Synonyms</h3><p>{staticEntry.synonyms.length ? staticEntry.synonyms.join(" · ") : "No synonyms recorded yet."}</p></Card><Card><h3>Antonyms</h3><p>{staticEntry.antonyms.length ? staticEntry.antonyms.join(" · ") : "No antonyms recorded yet."}</p></Card></div>
        </Section>
        <Section eyebrow="Edit history" title="A visible path from contribution to publication.">
          <ol className="timeline"><li><span>{staticEntry.updated}</span><h3>Community review completed</h3><p>Version {staticEntry.version} is published after language and context review.</p></li><li><span>Earlier versions</span><h3>Contributor edits remain attributed</h3><p>Future corrections and regional notes will appear here with their reviewer and reason for change.</p></li></ol>
        </Section>
      </>
    );
  }

  // Live DB entries (approved only).
  const live = await loadLiveEntry(id);
  if (!live) notFound();

  const firstExample = live.examples[0];
  const synonyms = live.relations.filter((r) => r.relation === "synonym").map((r) => r.relatedText).filter(Boolean) as string[];
  const antonyms = live.relations.filter((r) => r.relation === "antonym").map((r) => r.relatedText).filter(Boolean) as string[];

  return (
    <>
      <PageHero eyebrow="Dictionary entry · လံာ်ခီယ့ၣ်" title={live.entry.word} description={live.entry.partOfSpeech ?? "S'gaw Karen"} compact>
        <AudioPlayer word={live.entry.word} label="Recordings coming soon" />
        <Link className="button button--secondary" href={`/${lang}/contribute`}>{messages.contribute}</Link>
      </PageHero>
      <Section eyebrow="Meaning & use" title={live.translations.map((t) => t.text).join(" · ") || "Translation in review"} intro={live.entry.etymology ?? undefined}>
        <div className="feature-grid feature-grid--2">
          <Card>
            <p className="eyebrow">Example · တၢ်သူအီၤ</p>
            {firstExample ? (<><p className="dictionary-example" lang="ksw">{firstExample.karen}</p><p>{firstExample.english}</p></>) : <p>No example sentence recorded yet. Contribute one.</p>}
          </Card>
          <Card>
            <p className="eyebrow">Provenance · တၢ်မၤလီၤတံၢ်</p>
            <dl className="detail-list">
              <div><dt>Category</dt><dd>{live.entry.category ?? "—"}</dd></div>
              <div><dt>Source</dt><dd>{live.entry.source === "scraped" ? "Digitized dictionary (reviewed)" : "Community"}</dd></div>
              <div><dt>Version</dt><dd>v{live.entry.version}</dd></div>
            </dl>
            <StatusPill tone="green">{messages.communityReviewed}</StatusPill>
          </Card>
        </div>
      </Section>
      <Section tone="cream" eyebrow="Related language" title="Words in conversation">
        <div className="feature-grid feature-grid--2">
          <Card><h3>Synonyms</h3><p>{synonyms.length ? synonyms.join(" · ") : "No synonyms recorded yet."}</p></Card>
          <Card><h3>Antonyms</h3><p>{antonyms.length ? antonyms.join(" · ") : "No antonyms recorded yet."}</p></Card>
        </div>
      </Section>
      <Section eyebrow="Edit history" title="A visible path from contribution to publication.">
        <ol className="timeline"><li><span>v{live.entry.version}</span><h3>Community review completed</h3><p>This entry was approved by community reviewers after language and context review.</p></li></ol>
      </Section>
    </>
  );
}
