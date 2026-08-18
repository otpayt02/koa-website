import type { Metadata } from "next";
import { DonationForm } from "@/components/DonationForm";
import { FeatureRequestForm } from "@/components/FeatureRequestForm";
import { Card } from "@/components/Card";
import { isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { getPublishedMessages, getTranslator } from "@/lib/content";

export const metadata: Metadata = {
  title: "Collaborate & Contribute",
  description: "Suggest a feature, propose a service, partner with KOA, or support community-led work."
};

export default async function CollaboratePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const messages = await getPublishedMessages(lang);
  const t = await getTranslator(lang);
  return (
    <>
      <PageHero eyebrow="Community contributions · ပှၤတဝၢအတၢ်ဟ့ၣ်လီၤ" title={pageLabels.collaborate[lang]} description={lang === "karen" ? "နတၢ်ထံၣ်၊ နတၢ်သ့တၢ်ဘၣ် ဒီးနတၢ်ဟ့ၣ်မၤစၢၤ မၤဂ့ၤထီၣ် KOA အတၢ်မၤ။" : "The best next step often comes from someone living the need. Tell us what to improve, what to provide, or who to build with."} image="/koa/assets/community-engagement.jpg" imageAlt="Karen community members collaborating" />
      <Section eyebrow="One form, three pathways" title="Put a useful idea in motion." intro="Choose a website feature, community service, or partnership. Submissions are acknowledged, moderated, and tracked on the community board."><FeatureRequestForm lang={lang} messages={messages} copy={{ eyebrow: t("collaborate.form.eyebrow"), title: t("collaborate.form.title"), type: t("collaborate.form.type"), shortTitle: t("collaborate.form.shortTitle"), description: t("collaborate.form.description"), impact: t("collaborate.form.impact"), email: t("collaborate.form.email") }} /></Section>
      <Section tone="cream" eyebrow="Ways to collaborate" title="Bring the resource you already have." intro="KOA welcomes people and organizations who can make language access, youth leadership, and community care stronger."><div className="feature-grid feature-grid--3"><Card><span className="card-number">01</span><h3>Share expertise</h3><p>Offer a workshop, review a dictionary entry, or support a community training.</p><a className="text-link" href={`/${lang}/contact`}>Offer your time</a></Card><Card><span className="card-number">02</span><h3>Partner with KOA</h3><p>Libraries, schools, courts, and nonprofits can propose a focused collaboration.</p><a className="text-link" href={`/${lang}/contact`}>Talk with the team</a></Card><Card><span className="card-number">03</span><h3>Support the work</h3><p>Gifts help sustain language access, community gatherings, and public learning.</p><a className="text-link" href="#donate">Give with purpose</a></Card></div></Section>
      <section id="donate" className="split-story split-story--donate"><div><p className="eyebrow">Donations</p><h2>Keep community knowledge moving.</h2><p>Donations support the people, tools, and review time behind KOA&apos;s public work. A receipt is sent by email; tax deductibility is confirmed with your receipt.</p></div><DonationForm lang={lang} /></section>
    </>
  );
}
