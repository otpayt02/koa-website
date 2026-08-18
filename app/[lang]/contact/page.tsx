import type { Metadata } from "next";
import { AsyncForm } from "@/components/FormStatus";
import { Input, Select, Textarea } from "@/components/Input";
import { Card } from "@/components/Card";
import { getMessages, isLang } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { getTranslator } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact KOA",
  description: "Contact the Karen Organization of America about programs, language access, partnerships, and community support."
};

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  const messages = getMessages(lang);
  const t = await getTranslator(lang);
  return (
    <>
      <PageHero eyebrow={t("contact.hero.eyebrow")} title={t("page.contact.heroTitle")} description={t("contact.hero.description")} image="/koa/assets/fb-community-group-mobile-enhanced.png" imageAlt="Karen community members connecting" />
      <Section eyebrow="Start here" title={t("contact.form.title")} intro={t("contact.form.intro")}>
        <div className="contact-layout"><AsyncForm endpoint="/api/contact" messages={messages} successMessage={lang === "karen" ? "တၢ်ဘျုး။ ပကဆဲးကျိးနၤကဒီး။" : "Thank you. Your message is with the KOA team and we will follow up soon."}><div className="form-grid"><Input name="name" label={t("contact.form.name")} required /><Input name="email" label={t("contact.form.email")} type="email" required /><Input name="phone" label={t("contact.form.phone")} type="tel" /><Select name="topic" label={t("contact.form.topic")} required><option value="programs">Programs or services</option><option value="translation">Translation or interpretation</option><option value="partnership">Partnership or collaboration</option><option value="media">Media or general question</option></Select></div><Textarea name="message" label={t("contact.form.message")} rows={7} required /></AsyncForm><aside className="contact-aside"><Card><p className="eyebrow">National coordination</p><h3>Across the United States</h3><p>KOA works through community leaders and partner organizations in the places Karen families call home.</p><dl className="detail-list"><div><dt>Email</dt><dd><a className="text-link" href="mailto:hello@koamerica.org">hello@koamerica.org</a></dd></div><div><dt>Language access</dt><dd>Karen · English · Burmese by referral</dd></div><div><dt>Response time</dt><dd>Usually within 3 business days</dd></div></dl></Card><Card><p className="eyebrow">Follow the work</p><h3>Stay connected</h3><p>Follow public updates, events, and community decisions on Facebook.</p><a className="text-link" href="https://www.facebook.com/koamerica" target="_blank" rel="noreferrer">KOA on Facebook</a></Card></aside></div>
      </Section>
    </>
  );
}
