import type { Metadata } from "next";
import { DictionarySearch } from "@/components/DictionarySearch";
import { getMessages, isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Karen Dictionary",
  description: "Search a community-reviewed S'gaw Karen and English dictionary with pronunciation, examples, and contributor provenance."
};

export default async function DictionaryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const messages = getMessages(lang);

  return (
    <>
      <PageHero
        eyebrow="Living language · ကညီကျိာ်"
        title={pageLabels.dictionary[lang]}
        description={lang === "ksw" ? "ဃုကွၢ်ကညီတၢ်ကတိၤတဖၣ်လၢပှၤတဝၢကွၢ်သမံသမိးဝဲ ဒီးနၢ်ဟူအကလုၢ်တဖၣ်။" : "Explore S'gaw Karen words held in public by the people who speak, teach, and carry them."}
        image="/koa/assets/hero-community-mobile-enhanced.png"
        imageAlt="Karen community members sharing language"
      />
      <Section eyebrow="Search, listen, contribute" title="A dictionary that remembers its people." intro="Browse by category or search Karen, romanization, English translations, and definitions. Every published entry keeps its review status and contribution history visible.">
        <DictionarySearch lang={lang} messages={messages} />
      </Section>
    </>
  );
}
