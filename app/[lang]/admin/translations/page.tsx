import type { Metadata } from "next";
import Link from "next/link";
import { isLang } from "@/components/i18n";
import { TranslationStudio } from "@/components/TranslationStudio";
import { requireAdminPage } from "@/lib/page-auth";

export const metadata: Metadata = {
  title: "Bilingual Translation Studio",
  description: "Private KOA workspace for paired English and S'gaw Karen website content.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TranslationStudioPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const returnTo = `/${value}/admin/translations`;
  const admin = await requireAdminPage(returnTo);

  if (!admin) {
    return (
      <div className="studio-access">
        <p className="eyebrow">Private beta</p>
        <h1>Translation Studio access required</h1>
        <p>You are signed in, but your server-verified user ID or email is not on the KOA administrator allowlist.</p>
        <Link className="button button--secondary" href={`/${value}`}>Return to the website</Link>
      </div>
    );
  }

  return <TranslationStudio lang={value} />;
}
