import type { Metadata } from "next";
import { GrammarExplorer } from "@/components/GrammarExplorer";
import { GrammarRuleForm } from "@/components/GrammarRuleForm";
import { SentenceHighlightTool } from "@/components/SentenceHighlightTool";
import { isLang } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { getPublishedMessages, getTranslator } from "@/lib/content";

export const metadata: Metadata = {
  title: "S'gaw Karen Grammar",
  description: "Community-documented grammar rules of S'gaw Karen — tone, syllables, word order, particles — with example sentences and a sentence highlight tool."
};

export default async function GrammarPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const messages = await getPublishedMessages(lang);
  const t = await getTranslator(lang);

  return (
    <>
      <PageHero
        eyebrow={lang === "karen" ? "တၢ်ပၢ်သုကျိာ်ကညီလီၤ · Grammar" : "The structure of S'gaw Karen"}
        title={t("page.grammar.heroTitle")}
        description={lang === "karen"
          ? "သုကျိာ်လီၤအကဲာက် ဒီးသူးကွၢ်သွဲလၢပှၤတဝၢပၢၤဃာ်အီၤ။"
          : "S'gaw Karen is monosyllabic and tonal — one syllable, one tone, one meaning. These rules are documented by the people who speak the language, reviewed by community verifiers."}
      />
      <Section eyebrow="Read" title="Rules the community has approved." intro="Every rule here passed review. Each links the sentences that show it at work.">
        <GrammarExplorer />
      </Section>
      <Section tone="cream" eyebrow="Listen" title="See a rule inside a sentence." intro="Paste a Karen sentence. Highlighted spans show the grammar rule that governs them — hover or tap to reveal. Annotations are made by members and agents, then verified.">
        <SentenceHighlightTool />
      </Section>
      <Section eyebrow="Contribute" title="You know a rule. Write it down." intro="Explain the pattern in your own words, add example sentences, and tell reviewers where your knowledge comes from — your own usage, a book, or another source.">
        <GrammarRuleForm messages={messages} />
      </Section>
    </>
  );
}
