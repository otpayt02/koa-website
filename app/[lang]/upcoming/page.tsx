import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { isLang } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Upcoming",
  description: "Gatherings, trainings, and community dates from the Karen Organization of America."
};

export default async function UpcomingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;
  return (
    <>
      <PageHero eyebrow="Upcoming · Gatherings and dates" title="What's next for the community." description="Gatherings, trainings, and community dates from KOA and partner communities across the United States. Each date is posted here as soon as it is confirmed." image="/koa/assets/fb-outdoor-gathering.jpg" imageAlt="Karen community members gathered outdoors" />
      <Section tone="cream" eyebrow="On the calendar" title="Coming up." intro="Dates marked to be confirmed are placeholders — they will be replaced with the confirmed date, time, and location as soon as the hosting team locks them in.">
        <div className="feature-grid feature-grid--3">
          <Card><span className="card-number">01</span><h3>Karen New Year celebration</h3><p>KOA&apos;s annual Karen New Year gathering — food, music, traditional dress, and community recognition.</p><p><strong>Date and location to be confirmed.</strong></p><a className="text-link" href={`/${lang}/contact`}>Ask about this event</a></Card>
          <Card><span className="card-number">02</span><h3>Youth leadership training</h3><p>Workshops and learning visits that help emerging Karen leaders understand public systems and advocate for their communities.</p><p><strong>Date and location to be confirmed.</strong></p><a className="text-link" href={`/${lang}/contact`}>Ask about this training</a></Card>
          <Card><span className="card-number">03</span><h3>Language &amp; learning session</h3><p>A community session on S&apos;gaw Karen language learning, interpretation, and the growing KOA dictionary.</p><p><strong>Date and location to be confirmed.</strong></p><a className="text-link" href={`/${lang}/contact`}>Ask about this session</a></Card>
        </div>
      </Section>
      <Section eyebrow="Plan with KOA" title="Hosting or proposing something?" intro="Community organizations, churches, schools, and partner groups can propose a gathering or ask KOA to join one already planned.">
        <p><a className="text-link" href={`/${lang}/collaborate`}>Propose an event on Collaborate</a></p>
        <p><a className="text-link" href={`/${lang}/community/board`}>See the community board</a></p>
      </Section>
    </>
  );
}
