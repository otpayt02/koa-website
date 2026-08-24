import type { Metadata } from "next";
import { isLang } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { StatusPill } from "@/components/StatusPill";
import { requirePageAdmin } from "@/lib/page-auth";

export const metadata: Metadata = {
  title: "Design Studio",
  description: "Protected KOA workspace for reviewing the cinematic frame story.",
  robots: { index: false, follow: false },
};

export default async function DesignStudioPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  await requirePageAdmin(`/${lang}/admin/design-studio`);

  return (
    <>
      <PageHero eyebrow="Admin authoring" title="Design Studio" description="A protected shell for chronological frame review and mobile presentation checks." compact>
        <StatusPill tone="gold">Admin only</StatusPill>
      </PageHero>
      <Section eyebrow="Review boundary" title="Frame controls arrive in the next slice." intro="The studio will expose the authored cinematic sequence without creating a second public runtime or bypassing review gates.">
        <div className="button-row"><a className="button button--secondary" href={`/${lang}/admin`}>Back to dashboard</a></div>
      </Section>
    </>
  );
}
