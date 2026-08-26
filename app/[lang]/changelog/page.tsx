import { Card } from "@/components/Card";
import { getMessages, isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { localizedPageMetadata } from "@/lib/locale-metadata";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return localizedPageMetadata(params, "changelog", { title: "Changelog", description: "Public product and community decisions for the Karen Organization of America website." });
}

export default async function ChangelogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  getMessages(lang);
  return <><PageHero eyebrow="Public decisions · တၢ်ဆီတလဲစရီ" title={pageLabels.changelog[lang]} description={lang === "ksw" ? "KOA အတၢ်မၤလၢအိၣ်ဖျါ ဒီးတၢ်ဆၢတဲာ်တဖၣ်။" : "A short, public record of what changed, why it changed, and how community feedback shaped the work."} compact /><Section eyebrow="2026" title="A foundation for shared stewardship."><div className="feature-grid feature-grid--2"><Card><p className="eyebrow">v4 · August 2026</p><h3>Language and access became core</h3><p>Community dictionary review, audio contributions, translation and interpretation services, and collaboration requests moved into the committed build.</p></Card><Card><p className="eyebrow">v3 · Earlier work</p><h3>Public shell and community story</h3><p>Bilingual navigation, KOA history, programs, community gatherings, and a visual system established the starting point.</p></Card></div></Section><Section tone="cream" eyebrow="How to participate" title="Changes are open to conversation." intro="If something feels missing, propose a feature, service, or partnership on the community board. Decisions are reviewed with the people who will use them."><a className="button button--primary" href={`/${lang}/collaborate`}>Bring an idea</a></Section></>;
}
