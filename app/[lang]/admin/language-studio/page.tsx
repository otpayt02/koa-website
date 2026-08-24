import type { Metadata } from "next";
import { isLang } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { StatusPill } from "@/components/StatusPill";
import { requirePageAdmin } from "@/lib/page-auth";

export const metadata: Metadata = {
  title: "Language Studio",
  description: "Protected KOA workspace for reviewing multilingual content proposals.",
  robots: { index: false, follow: false },
};

export default async function LanguageStudioPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  await requirePageAdmin(`/${lang}/admin/language-studio`);

  return (
    <>
      <PageHero eyebrow="Admin authoring" title="Language Studio" description="A protected shell for source-led translation proposals and human review." compact>
        <StatusPill tone="gold">Admin only</StatusPill>
      </PageHero>
      <Section eyebrow="Review boundary" title="Translation tools arrive in the next slice." intro="English remains the source of truth. Thai, Burmese, and S'gaw Karen proposals will retain provenance and require human approval before publication or training use.">
        <div className="button-row"><a className="button button--secondary" href={`/${lang}/admin`}>Back to dashboard</a></div>
      </Section>
    </>
  );
}
