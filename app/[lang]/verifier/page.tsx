import type { Metadata } from "next";
import Link from "next/link";
import { isLang } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { VerifierApplicationForm } from "@/components/VerifierApplicationForm";
import { getPublishedMessages, getTranslator } from "@/lib/content";

export const metadata: Metadata = {
  title: "Become a Community Verifier",
  description: "Apply to verify Karen dictionary entries, grammar rules, and translations. Your dialect profile — where you grew up and learned Karen — is part of every approval."
};

export default async function VerifierPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const messages = await getPublishedMessages(lang);
  const t = await getTranslator(lang);
  void t;

  return (
    <>
      <PageHero
        eyebrow={lang === "karen" ? "ပှၤတဝၢပၢၤဃာ်အီၤ · Verifiers" : "Guardians of the language"}
        title="Verification carries your story."
        description="Karen sounds different in Mae La than in Hpa-An, in a camp than in a city. When you verify a word, your geography travels with it — so future speakers know whose Karen approved it."
      />
      <Section eyebrow="What verifiers do" title="Review. Approve. Shape the record." intro="Verifiers are community members who check dictionary entries, grammar rules, and translations before they are published to the public lexicon.">
        <div className="feature-grid">
          <article className="dictionary-card"><p className="eyebrow">01</p><h3>Dictionary entries</h3><p>Check headwords, definitions, and translations against your own knowledge. Approve, request changes, or reject with a note.</p></article>
          <article className="dictionary-card"><p className="eyebrow">02</p><h3>Grammar rules & examples</h3><p>Confirm that community-submitted rules describe real patterns, and that example sentences truly demonstrate them.</p></article>
          <article className="dictionary-card"><p className="eyebrow">03</p><h3>Sentence annotations</h3><p>Validate grammar-span annotations so the highlight tool can show learners which rule governs each part of a sentence.</p></article>
        </div>
      </Section>
      <Section tone="cream" eyebrow="Apply" title="Tell us where your Karen comes from." intro="Sign in first, then submit this application. Moderators review every application; approved applicants become reviewers and their dialect profile is attached to their account.">
        <VerifierApplicationForm messages={messages} />
      </Section>
      <Section eyebrow="Already a verifier?" title="Your dialect profile lives on your account." intro="Reviewers can update their profile through KOA moderators. Your region shows on your public profile page.">
        <p>Visit <Link className="text-link" href={`/${lang}/community/board`}>the community board</Link> or <Link className="text-link" href={`/${lang}/contact`}>contact KOA</Link> to update your profile.</p>
      </Section>
    </>
  );
}
