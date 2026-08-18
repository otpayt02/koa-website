import type { Metadata } from "next";
import { AsyncForm } from "@/components/FormStatus";
import { Input, Select, Textarea } from "@/components/Input";
import { InterpreterCard } from "@/components/InterpreterCard";
import { interpreters } from "@/components/data";
import { getMessages, isLang } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { getTranslator } from "@/lib/content";
import { Card } from "@/components/Card";

export const metadata: Metadata = {
  title: "Translation & Interpretation",
  description: "Request trusted Karen translation and interpretation from community-approved providers."
};

export default async function TranslationPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const messages = getMessages(lang);
  const t = await getTranslator(lang);
  return (
    <>
      <PageHero eyebrow={t("translation.hero.eyebrow")} title={t("page.translation.heroTitle")} description={t("translation.hero.description")} image="/koa/assets/washington-advocacy.jpg" imageAlt="Karen advocates speaking with decision makers" />
      <Section eyebrow="Services" title={t("translation.services.title")} intro={t("translation.services.intro")}>
        <div className="feature-grid feature-grid--3"><Card><span className="card-number">01</span><h3>{t("translation.document.title")}</h3><p>{t("translation.document.copy")}</p></Card><Card><span className="card-number">02</span><h3>{t("translation.interpretation.title")}</h3><p>{t("translation.interpretation.copy")}</p></Card><Card><span className="card-number">03</span><h3>{t("translation.rates.title")}</h3><p>{t("translation.rates.copy")}</p></Card></div>
      </Section>
      <Section tone="cream" eyebrow="Approved directory" title="Meet interpreters the community can verify." intro="Profiles show credentials, service areas, availability, and moderated community ratings. Select a profile to review details before requesting a service."><div className="interpreter-grid">{interpreters.map((interpreter) => <InterpreterCard key={interpreter.username} interpreter={interpreter} lang={lang} />)}</div></Section>
      <Section eyebrow="Request language support" title={t("translation.request.title")} intro={t("translation.request.intro")}>
        <AsyncForm endpoint="/api/translation/request" messages={messages} successMessage={lang === "karen" ? "နတၢ်ဃုထၢအိၣ်လၢတၢ်ကွၢ်သမံသမိးအပူၤလံ။" : "Your request is in the coordination queue. We will follow up with next steps."}>
          <div className="form-grid"><Input name="name" label="Your name" required /><Input name="email" label="Email or phone" required /><Select name="service" label="Service needed" required><option value="document">Document translation</option><option value="medical">Medical interpretation</option><option value="legal">Legal or court interpretation</option><option value="community">Community, school, or other</option></Select><Select name="language" label="Language direction" required><option value="karen-english">Karen ↔ English</option><option value="karen-burmese">Karen ↔ Burmese</option></Select><Input name="date" label="Preferred date" type="date" /><Input name="location" label="Location or video" placeholder="City, venue, or video" /></div>
          <Textarea name="notes" label="What should we know?" rows={4} hint="Share timing and accessibility needs, not confidential case details." required />
        </AsyncForm>
      </Section>
      <Section tone="ink" eyebrow="Court partnership" title="Closing the interpreter gap together." intro="KOA is developing relationships with courts and legal partners so Karen speakers can understand proceedings and exercise their rights. If your court or organization wants to partner, use the collaboration form."><a className="button button--secondary" href={`/${lang}/collaborate`}>Start a partnership conversation</a></Section>
    </>
  );
}
