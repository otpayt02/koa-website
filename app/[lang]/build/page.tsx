import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { QuestionIndex } from "@/components/QuestionIndex";
import { Section } from "@/components/Section";
import { isLang } from "@/components/i18n";
import { TabImageGallery } from "@/components/TabImageGallery";

export const metadata: Metadata = {
  title: "Build with KOA",
  description: "Coming soon: a reviewed view of what KOA is preparing and how to help shape it.",
};

export default async function BuildPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;

  return (
    <>
      <PageHero
        eyebrow="Coming soon · Build with KOA"
        title="Help shape what comes next."
        description="Teach me one thing about your language one time, and I will teach the world for a lifetime."
        compact
      />
      <TabImageGallery tab="build" />
      {lang === "en" ? <QuestionIndex id="build-at-a-glance" verb="Invite" title="Make room for what the community can bring." intro="This is the request side of KOA: what the organization needs to hear, learn, and build with others." items={[
        { question: "Who", answer: "Anyone with useful knowledge, time, skills, collaboration, or a question.", detail: "A contribution does not need to be large to help KOA learn." },
        { question: "What", answer: "Ideas and contributions that can help KOA reach its fullest potential.", detail: "Language knowledge, labor, partnership, and lived experience are all meaningful inputs." },
        { question: "When", answer: "While future work is being shaped and reviewed.", detail: "Public details appear only when the purpose and invitation are ready to share." },
        { question: "Where", answer: "Start in this Build space, then use the contribution or contact path.", detail: "The site keeps the invitation visible even before a future project launches." },
        { question: "Why", answer: "The people living a need often see the best next step first.", detail: "Community input can reveal what is missing, unclear, or worth building together." },
        { question: "How", answer: "Give what you have, take what you need.", detail: "Tell KOA what to improve, what to provide, or who to build with." },
      ]} /> : null}
      <Section
        eyebrow="A review-gated space"
        title="The next contribution starts with a good question."
        intro="New work will be described here only after its purpose, details, and invitation to participate are ready to share."
      >
        <p className="build-page__exchange">Give what you have, take what you need.</p>
        <div className="feature-grid feature-grid--3">
          <Card>
            <span className="card-number">01</span>
            <h3>What is being shaped</h3>
            <p>Public details will be added when they are ready for review.</p>
          </Card>
          <Card>
            <span className="card-number">02</span>
            <h3>What needs a voice</h3>
            <p>Tell KOA what would help you learn, connect, or take part.</p>
          </Card>
          <Card>
            <span className="card-number">03</span>
            <h3>What you can do now</h3>
            <p>Contribute language knowledge, collaboration, time, or a thoughtful question.</p>
          </Card>
        </div>
      </Section>
      <section className="full-bleed-cta build-page__cta">
        <div>
          <p className="eyebrow">Your next move</p>
          <h2>Bring the useful idea forward.</h2>
          <p>Tell KOA what you would like to help build, or choose a contribution that is ready today.</p>
          <div className="button-row">
            <Link className="button" href={`/${lang}/contact`}>Tell us what to build</Link>
            <Link className="button button--secondary" href={`/${lang}/contribute`}>Contribute now</Link>
          </div>
        </div>
      </section>
    </>
  );
}
