import type { Metadata } from "next";
import Link from "next/link";
import { KoaContentPage, KoaSection } from "@/components/KoaContentPage";
import { isLang } from "@/components/i18n";
import news from "@/content/news.json";

export const metadata: Metadata = { title: "KOA News", description: "Updates from the Karen Organization of America." };

type NewsItem = { id: string; date: string; title: string; summary: string; sourceUrl: string; sourceLabel: string };

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) return null;
  const items = (news as NewsItem[]).filter((item) => item.id && item.date && item.title && item.sourceUrl).sort((a, b) => b.date.localeCompare(a.date));

  return <KoaContentPage lang={lang} eyebrow="News" title="Updates from KOA." intro="Announcements and stories with a source you can open and check.">
    <KoaSection title="Latest updates">{items.length ? <div className="news-list">{items.map((item) => <article key={item.id}><time dateTime={item.date}>{item.date}</time><h3>{item.title}</h3><p>{item.summary}</p><a className="text-link" href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceLabel}</a></article>)}</div> : <p>No verified KOA news is published here yet. <Link className="text-link" href={`/${lang}/contact`}>Send KOA an update</Link>.</p>}</KoaSection>
  </KoaContentPage>;
}

// Source contract: content/news.json contains only dated, attributable KOA updates; empty data renders an honest state.
