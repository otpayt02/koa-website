import type { Metadata } from "next";
import { AudioRecorder } from "@/components/AudioRecorder";
import { ContributionForm } from "@/components/ContributionForm";
import { getMessages, isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { getPublishedMessages, getTranslator } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contribute to the Dictionary",
  description: "Share Karen definitions, translations, examples, and recordings for community review."
};

export default async function ContributePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const messages = await getPublishedMessages(lang);
  const t = await getTranslator(lang);
  return (
    <>
      <PageHero eyebrow="Community language work · တၢ်မၤသကိးကျိာ်" title={pageLabels.contribute[lang]} description={lang === "karen" ? "ဟ့ၣ်လီၤတၢ်ကတိၤ၊ တၢ်ပာ်ဖျါ၊ တၢ်သူအီၤ ဒီးနကလုၢ်ဆူလံာ်ခီယ့ၣ်။" : "Add a word, a better context, or your voice. Every contribution is reviewed before it becomes part of the public dictionary."} image="/koa/assets/cultural-community.jpg" imageAlt="Karen community members in conversation" />
      <Section eyebrow="1 · Add language knowledge" title="Give reviewers enough context to care for the word." intro="Use the side-by-side fields to share what you know. A reviewer may follow up before publication, and your name stays attached to the entry history.">
        <ContributionForm lang={lang} messages={messages} copy={{ eyebrow: t("contribute.form.eyebrow"), title: t("contribute.form.title"), word: t("contribute.form.word"), translation: t("contribute.form.translation"), type: t("contribute.form.type"), dialect: t("contribute.form.dialect"), definition: t("contribute.form.definition") }} />
      </Section>
      <Section tone="cream" eyebrow="2 · Record a voice" title="Pronunciation is knowledge, too." intro="Record a quiet, natural Karen word or sentence. Audio is held for moderation and may support future speech-to-text and text-to-speech training only with your consent.">
        <div className="feature-grid feature-grid--2"><AudioRecorder lang={lang} messages={messages} /><Card><p className="eyebrow">Consent & review</p><h3>Your recording remains yours.</h3><p>KOA asks for permission before using a recording in a training set. Reviewers check the transcript, dialect label, and rights confirmation before it is published.</p><ul className="check-list"><li>Record in a quiet place</li><li>Say the word once, then in a sentence</li><li>Keep personal information out of recordings</li></ul></Card></div>
      </Section>
      <Section eyebrow="After you submit" title="A clear review path." intro="Submissions enter a queue for language, context, and rights review. Approved entries show their contributor and version history publicly."><ol className="timeline"><li><span>01 · Submitted</span><h3>We receive your contribution</h3><p>You receive a confirmation and the item is marked pending.</p></li><li><span>02 · Reviewed</span><h3>Community reviewers check context</h3><p>Reviewers may ask a follow-up or suggest a regional note.</p></li><li><span>03 · Published</span><h3>The community can find and hear it</h3><p>Approved words appear in search with attribution and provenance.</p></li></ol></Section>
    </>
  );
}
