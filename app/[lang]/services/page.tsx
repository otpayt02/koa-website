import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { getTranslator } from "@/lib/content";

export const metadata: Metadata = { title: "Programs & Services", description: "Education, advocacy, community care, workforce, health, immigration, and language access programs." };

const programs = [
  ["Civic education", "Advocacy training, public-system learning, Washington visits, and youth leadership development.", "Learn and lead"],
  ["Immigration support", "Trusted referrals, document navigation, interpretation, and connections to qualified legal help.", "Find support"],
  ["Health access", "Language access, community health navigation, and culturally responsive connections to care.", "Access care"],
  ["Workforce development", "Employment readiness, skills pathways, mentoring, and connections to local opportunity.", "Build a pathway"],
  ["Translation & interpretation", "Reviewed document translation and trusted medical, legal, community, phone, and video interpretation.", "Request language help"],
  ["Humanitarian assistance", "Practical solidarity through food, clean water, shelter, education, and vocational support.", "Stand together"]
];

export default async function ServicesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params; if (!isLang(value)) return null; const lang = value; const t = await getTranslator(lang);
  const translatedPrograms = [
    [t("services.civic.title"), t("services.civic.copy"), programs[0][2]],
    [t("services.immigration.title"), t("services.immigration.copy"), programs[1][2]],
    [t("services.health.title"), t("services.health.copy"), programs[2][2]],
    [t("services.workforce.title"), t("services.workforce.copy"), programs[3][2]],
    [t("services.translation.title"), t("services.translation.copy"), programs[4][2]],
    [t("services.humanitarian.title"), t("services.humanitarian.copy"), programs[5][2]],
  ];
  return <>
    <PageHero eyebrow={t("services.hero.eyebrow")} title={t("page.services.heroTitle")} description={t("services.hero.description")} image="/koa/assets/programs-community-mobile-generated.png" imageAlt="Karen community members participating in a program" />
    <Section eyebrow="How KOA helps" title={t("services.overview.title")} intro={t("services.overview.intro")}>
      <div className="feature-grid feature-grid--3">{translatedPrograms.map(([title, copy, action], index) => <Card key={title}><span className="card-number">{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p><Link className="text-link" href={index === 4 ? `/${lang}/translation` : `/${lang}/contact`}>{action}</Link></Card>)}</div>
    </Section>
    <section className="split-story"><div><img src="/koa/assets/washington-advocacy.jpg" alt="Karen advocates in Washington, D.C." /></div><div><p className="eyebrow">Civic leadership</p><h2>Understand the system. Bring knowledge home.</h2><p>From Advocacy 101 to national learning visits, KOA creates practical ways for Karen people to participate in public life with confidence.</p><ul className="check-list"><li>Youth leadership development</li><li>Public policy and systems learning</li><li>Community-led advocacy planning</li><li>Local action and national connection</li></ul><Button href={`/${lang}/contact`}>Ask about a program</Button></div></section>
    <Section tone="cream" eyebrow="Program access" title={t("services.access.title")} intro={t("services.access.intro")}><div className="section-action"><Button href={`/${lang}/contact`}>Talk with KOA</Button><Button href={`/${lang}/translation`} variant="quiet">Request an interpreter</Button></div></Section>
  </>;
}
