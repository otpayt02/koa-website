import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { LogViewer } from "@/components/LogViewer";
import { ReviewQueue } from "@/components/ReviewQueue";
import { getMessages, isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { StatusPill } from "@/components/StatusPill";
import { requireAdminPage } from "@/lib/page-auth";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "KOA community stewardship workspace for moderation, review, and audit activity.",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function AdminPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const admin = await requireAdminPage(`/${lang}/admin`);
  const messages = getMessages(lang);
  if (!admin) return <Section eyebrow="Private workspace" title="Administrator access required." intro="Your signed-in user ID or email is not on the KOA administrator allowlist." />;
  return (
    <>
      <PageHero eyebrow="Stewardship · ပှၤတဝၢတၢ်ကွၢ်ထွဲ" title={pageLabels.admin[lang]} description={lang === "karen" ? "တၢ်မၤလီၤတံၢ်၊ တၢ်ကွၢ်သမံသမိး ဒီးတၢ်မၤစရီလၢပှၤတဝၢအဂီၢ်။" : "A focused workspace for the people entrusted with review, moderation, access, and public accountability."} compact><StatusPill tone="green">Authenticated workspace</StatusPill></PageHero>
      <Section eyebrow="Today" title="Review before you publish." intro="This prototype keeps moderation actions visible and attributable. Production access will require role-based authentication and audit logging."><div className="feature-grid feature-grid--4"><Card><p className="eyebrow">Dictionary</p><h3>12</h3><p>Pending entries</p></Card><Card><p className="eyebrow">Audio</p><h3>7</h3><p>Pairs awaiting checks</p></Card><Card><p className="eyebrow">Translation</p><h3>4</h3><p>Requests to assign</p></Card><Card><p className="eyebrow">Flags</p><h3>2</h3><p>Needs moderator review</p></Card></div></Section>
      <Section tone="cream" eyebrow="Moderation queue" title="Items needing a decision."><ReviewQueue /><div className="section-action"><a className="button button--primary" href={`/${lang}/admin/translations`}>Open Translation Studio</a></div></Section>
      <Section eyebrow="Audit trail" title="Recent activity stays inspectable."><LogViewer /></Section>
      <Section tone="ink" eyebrow="Access note" title="Protect community trust." intro="Admin actions should be limited to approved roles, logged with a reason, and reversible where possible. Invite another reviewer only through the secure operations workflow."><div className="button-row"><a className="button button--secondary" href={`/${lang}/contact`}>Contact operations</a><a className="button button--quiet" href={`/${lang}/changelog`}>{messages.changelog}</a></div></Section>
    </>
  );
}
