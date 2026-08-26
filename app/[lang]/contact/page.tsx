import { AsyncForm } from "@/components/FormStatus";
import { Input, Select, Textarea } from "@/components/Input";
import { Card } from "@/components/Card";
import { getMessages, isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { localizedPageMetadata } from "@/lib/locale-metadata";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return localizedPageMetadata(params, "contact", {
    title: "Contact KOA",
    description: "Contact the Karen Organization of America about programs, language access, partnerships, and community support.",
  });
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const messages = getMessages(lang);
  return (
    <>
      <PageHero eyebrow="Contact · ဆဲးကျိး" title={pageLabels.contact[lang]} description={lang === "ksw" ? "တဲဖျါပသ့ၣ်ညါနၤ၊ နတၢ်လိၣ်ဘၣ် မ့တမ့ၢ် နတၢ်အိၣ်သးလၢအဂ့ၤ။" : "Tell us what you need, where you are, and the best way to reach you. A community navigator will route your message to the right person."} image="/koa/assets/fb-community-group-mobile-enhanced.png" imageAlt="Karen community members connecting" />
      <Section eyebrow="Start here" title="A real person will read your message." intro="For urgent medical or legal interpretation, use the language request form so the coordination queue can triage it quickly.">
        <div className="contact-layout"><AsyncForm endpoint="/api/contact" messages={messages} successMessage={lang === "ksw" ? "တၢ်ဘျုး။ ပကဆဲးကျိးနၤကဒီး။" : "Thank you. Your message is with the KOA team and we will follow up soon."}><div className="form-grid"><Input name="name" label="Name" required /><Input name="email" label="Email" type="email" required /><Input name="phone" label="Phone (optional)" type="tel" /><Select name="topic" label="How can we help?" required><option value="programs">Programs or services</option><option value="translation">Translation or interpretation</option><option value="partnership">Partnership or collaboration</option><option value="media">Media or general question</option></Select></div><Textarea name="message" label="Your message" rows={7} required /></AsyncForm><aside className="contact-aside"><Card><p className="eyebrow">National coordination</p><h3>Across the United States</h3><p>KOA works through community leaders and partner organizations in the places Karen families call home.</p><dl className="detail-list"><div><dt>Email</dt><dd><a className="text-link" href="mailto:hello@koamerica.org">hello@koamerica.org</a></dd></div><div><dt>Language access</dt><dd>Karen · English · Burmese by referral</dd></div><div><dt>Response time</dt><dd>Usually within 3 business days</dd></div></dl></Card><Card><p className="eyebrow">Follow the work</p><h3>Stay connected</h3><p>Follow public updates, events, and community decisions on Facebook.</p><a className="text-link" href="https://www.facebook.com/koamerica" target="_blank" rel="noreferrer">KOA on Facebook</a></Card></aside></div>
      </Section>
    </>
  );
}
