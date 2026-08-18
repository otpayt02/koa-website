import type { Metadata } from "next";
import { DictionarySearch } from "@/components/DictionarySearch";
import { getMessages, isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { getTranslator } from "@/lib/content";

export const metadata: Metadata = {
  title: "Karen Dictionary",
  description: "Search a community-reviewed S'gaw Karen and English dictionary with pronunciation, examples, and contributor provenance."
};

export default async function DictionaryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const messages = getMessages(lang);
  const t = await getTranslator(lang);

  return (
    <>
      <PageHero
        eyebrow={t("dictionary.hero.eyebrow")}
        title={t("page.dictionary.heroTitle")}
        description={t("dictionary.hero.description")}
        image="/koa/assets/hero-community-mobile-enhanced.png"
        imageAlt="Karen community members sharing language"
      />
      <Section eyebrow="Search, listen, contribute" title={t("dictionary.search.title")} intro={t("dictionary.search.intro")}>
        <DictionarySearch lang={lang} messages={messages} />
      </Section>
    </>
  );
}
