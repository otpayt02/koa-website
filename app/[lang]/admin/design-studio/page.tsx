import type { Metadata } from "next";
import rawFrameManifest from "@/content/cinematic-frame-manifest.json";
import { DesignStudio } from "@/components/admin/DesignStudio";
import { isLang } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { StatusPill } from "@/components/StatusPill";
import { loadFrameManifest } from "@/lib/cinema/frame-manifest";
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
  const manifest = loadFrameManifest(rawFrameManifest);

  return (
    <>
      <PageHero eyebrow="Admin authoring" title="Design Studio" description="A protected shell for chronological frame review and mobile presentation checks." compact>
        <StatusPill tone="gold">Admin only</StatusPill>
      </PageHero>
      <DesignStudio lang={lang} manifest={manifest} />
    </>
  );
}
