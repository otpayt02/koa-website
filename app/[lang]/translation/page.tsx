import { AsyncForm } from "@/components/FormStatus";
import { Input, Select, Textarea } from "@/components/Input";
import { InterpreterCard } from "@/components/InterpreterCard";
import { interpreters } from "@/components/data";
import { getMessages, isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { localizedPageMetadata } from "@/lib/locale-metadata";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return localizedPageMetadata(params, "translation", {
    title: "Translation & Interpretation",
    description: "Request trusted Karen translation and interpretation from community-approved providers.",
  });
}

export default async function TranslationPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const messages = getMessages(lang);
  return (
    <>
      <PageHero eyebrow="Language access · ကျိာ်တၢ်မၤစၢၤ" title={pageLabels.translation[lang]} description={lang === "ksw" ? "ဃုထၢပှၤကွဲးကျိာ်ထံ ဒီးပှၤကတိၤကျိာ်ထံလၢပှၤတဝၢအၢၣ်လီၤအီၤ။" : "From a medical appointment to a court date, request language support from a directory built around trust, training, and accountability."} image="/koa/assets/washington-advocacy.jpg" imageAlt="Karen advocates speaking with decision makers" />
      <Section eyebrow="Services" title="Support for the moments that matter." intro="Community translation is free when capacity allows. Organizations can request a sliding-scale quote; urgent legal and medical needs are triaged first.">
        <div className="feature-grid feature-grid--3"><Card><span className="card-number">01</span><h3>Document translation</h3><p>Letters, forms, school materials, and community information in Karen or English.</p></Card><Card><span className="card-number">02</span><h3>Interpretation</h3><p>Medical, legal, community, phone, and video appointments with an approved interpreter.</p></Card><Card><span className="card-number">03</span><h3>Community rates</h3><p>Free for community requests where possible, with transparent rates for organizations.</p></Card></div>
      </Section>
      <Section tone="cream" eyebrow="Approved directory" title="Meet interpreters the community can verify." intro="Profiles show credentials, service areas, availability, and moderated community ratings. Select a profile to review details before requesting a service."><div className="interpreter-grid">{interpreters.map((interpreter) => <InterpreterCard key={interpreter.username} interpreter={interpreter} lang={lang} />)}</div></Section>
      <Section eyebrow="Request language support" title="Tell us what you need." intro="A coordinator will confirm availability, cost, and the next step. Please do not include sensitive medical or legal details in this first request.">
        <AsyncForm endpoint="/api/translation/request" messages={messages} successMessage={lang === "ksw" ? "နတၢ်ဃုထၢအိၣ်လၢတၢ်ကွၢ်သမံသမိးအပူၤလံ။" : "Your request is in the coordination queue. We will follow up with next steps."}>
          <div className="form-grid"><Input name="name" label="Your name" required /><Input name="email" label="Email or phone" required /><Select name="service" label="Service needed" required><option value="document">Document translation</option><option value="medical">Medical interpretation</option><option value="legal">Legal or court interpretation</option><option value="community">Community, school, or other</option></Select><Select name="language" label="Language direction" required><option value="karen-english">Karen ↔ English</option><option value="karen-burmese">Karen ↔ Burmese</option></Select><Input name="date" label="Preferred date" type="date" /><Input name="location" label="Location or video" placeholder="City, venue, or video" /></div>
          <Textarea name="notes" label="What should we know?" rows={4} hint="Share timing and accessibility needs, not confidential case details." required />
        </AsyncForm>
      </Section>
      <Section tone="ink" eyebrow="Court partnership" title="Closing the interpreter gap together." intro="KOA is developing relationships with courts and legal partners so Karen speakers can understand proceedings and exercise their rights. If your court or organization wants to partner, use the collaboration form."><a className="button button--secondary" href={`/${lang}/collaborate`}>Start a partnership conversation</a></Section>
    </>
  );
}
