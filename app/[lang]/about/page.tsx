import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { getTranslator } from "@/lib/content";

export const metadata: Metadata = { title: "About", description: "KOA history, mission, values, leadership, and national Karen community network." };

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const t = await getTranslator(lang);
  return <>
    <PageHero eyebrow={t("about.hero.eyebrow")} title={t("page.about.heroTitle")} description={t("about.hero.description")} image="/koa/assets/founding-conference.jpg" imageAlt="Karen leaders at a founding conference" />
    <Section eyebrow="Our story" title={t("about.story.title")} intro={t("about.story.intro")}>
      <ol className="timeline"><li><span>June 13, 2018</span><h3>A shared conversation</h3><p>KOUSA and KAO leaders began discussing deeper collaboration and national unity.</p></li><li><span>August 8, 2018</span><h3>Leaders gathered in Omaha</h3><p>More than fifty leaders representing twenty states met to build a common direction.</p></li><li><span>Today</span><h3>One community, many places</h3><p>KOA connects local strength to national advocacy, language access, and collective care.</p></li></ol>
    </Section>
    <Section tone="cream" eyebrow="Vision and mission" title={t("about.mission.title")}>
      <div className="feature-grid feature-grid--2"><Card><span className="card-number">Vision</span><h3>Thriving Karen communities</h3><p>United and empowered in the United States, with the confidence and resources to shape their own future and advocate for justice in Burma.</p></Card><Card><span className="card-number">Mission</span><h3>Rights, well-being, and unity</h3><p>Advocate for Karen people, create pathways for learning and leadership, strengthen community ties, and stand in solidarity where help is needed.</p></Card></div>
    </Section>
    <Section eyebrow="Leadership" title={t("about.leadership.title")} intro={t("about.leadership.intro")}>
      <div className="people-grid"><Card><div className="avatar avatar--large">OP</div><h3>Oliver P.</h3><p>IT Manager & Web Lead</p><small>Digital stewardship · National</small></Card><Card><div className="avatar avatar--large">KOA</div><h3>Executive leadership</h3><p>Names and biographies in community review</p><small>Publication approval pending</small></Card><Card><div className="avatar avatar--large">11</div><h3>Community network</h3><p>Founding communities across the United States</p><small>Relationships being reconfirmed</small></Card></div>
    </Section>
    <section className="full-bleed-cta"><img src="/koa/assets/koa-national-community-ai.jpg" alt="A Karen community gathering" /><div><p className="eyebrow">Annual reporting</p><h2>{t("about.reporting.title")}</h2><p>KOA&apos;s first public digital annual report will bring program outcomes, partnerships, and financial stewardship into one accessible view.</p><Button href={`/${lang}/changelog`}>See public decisions</Button></div></section>
  </>;
}
