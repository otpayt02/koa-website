import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";

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
  const { lang: value } = await params; if (!isLang(value)) return null; const lang = value;
  return <>
    <PageHero eyebrow="Programs & services · တၢ်မၤစၢၤတဖၣ်" title={pageLabels.services[lang]} description={lang === "karen" ? "တၢ်ကူၣ်ဘၣ်ကူၣ်သ့၊ တၢ်ကတိၤခဲ၊ တၢ်အိၣ်ဆူၣ်အိၣ်ချ့ ဒီးကျိာ်တၢ်မၤစၢၤလၢဟံၣ်ဖိဃီဖိတဖၣ်အဂီၢ်။" : "Practical programs help individuals and families navigate public systems, access care, grow skills, and lead in community."} image="/koa/assets/programs-community-mobile-generated.png" imageAlt="Karen community members participating in a program" />
    <Section eyebrow="How KOA helps" title="One door to practical support." intro="Program availability varies by region. KOA connects each request to a local community, partner, or approved provider.">
      <div className="feature-grid feature-grid--3">{programs.map(([title, copy, action], index) => <Card key={title}><span className="card-number">{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p><Link className="text-link" href={title === "Translation & interpretation" ? `/${lang}/translation` : `/${lang}/contact`}>{action}</Link></Card>)}</div>
    </Section>
    <section className="split-story"><div><img src="/koa/assets/washington-advocacy.jpg" alt="Karen advocates in Washington, D.C." /></div><div><p className="eyebrow">Civic leadership</p><h2>Understand the system. Bring knowledge home.</h2><p>From Advocacy 101 to national learning visits, KOA creates practical ways for Karen people to participate in public life with confidence.</p><ul className="check-list"><li>Youth leadership development</li><li>Public policy and systems learning</li><li>Community-led advocacy planning</li><li>Local action and national connection</li></ul><Button href={`/${lang}/contact`}>Ask about a program</Button></div></section>
    <Section tone="cream" eyebrow="Program access" title="Not sure where to begin?" intro="Tell us what you need in the language and channel that works for you. A community navigator will help identify the next step."><div className="section-action"><Button href={`/${lang}/contact`}>Talk with KOA</Button><Button href={`/${lang}/translation`} variant="quiet">Request an interpreter</Button></div></Section>
  </>;
}
