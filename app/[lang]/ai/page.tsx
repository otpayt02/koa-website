import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { localizedPageMetadata } from "@/lib/locale-metadata";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return localizedPageMetadata(params, "ai", {
    title: "S'gaw-Mango AI · Karen Language Program",
    description:
      "A community-owned Karen language tool — dictionary, translation, glyph recognition, and sentence construction — built by and for the S'gaw Karen diaspora.",
  });
}

const capabilities = [
  {
    title: "Dictionary search",
    copy: "Community-reviewed Karen–English dictionary with provenance on every entry. Search headwords, browse by topic, or suggest a correction.",
    status: "Available now",
    statusKind: "measured" as const,
    href: "dictionary",
    action: "Search the dictionary",
  },
  {
    title: "Translation with review",
    copy: "English to S'gaw Karen translation backed by the community dictionary. Every result shows its source: dictionary, community-approved, or model draft.",
    status: "Declared — dictionary-backed with human review",
    statusKind: "declared" as const,
    href: "translation",
    action: "Request translation",
  },
  {
    title: "Glyph recognition (OCR)",
    copy: "Computer vision model trained to read S'gaw Karen glyphs and syllables from printed and handwritten sources.",
    status: "Measured — 88.7% mAP on held-out Roboflow test set",
    statusKind: "measured" as const,
    href: "contribute",
    action: "Submit a sample",
  },
  {
    title: "Sentence construction",
    copy: "Bilingual sentence builder that helps Karen speakers and learners construct grammatically correct sentences with guided translation.",
    status: "In development — community review pipeline active",
    statusKind: "development" as const,
    href: "contribute",
    action: "Help build sentences",
  },
  {
    title: "Speech understanding",
    copy: "Record a spoken Karen sentence for community transcription. Every recording becomes training data only after human review and speaker consent.",
    status: "In development — speech-to-text not yet trained",
    statusKind: "development" as const,
    href: "contribute",
    action: "Record a sentence",
  },
  {
    title: "Karen music generation",
    copy: "Chord-chart editor and Karen-style music sheet generator. Preserve existing hymns and compose new music in Karen styles.",
    status: "In development — editor works; generative music not yet",
    statusKind: "development" as const,
    href: "music",
    action: "See the music editor",
  },
] as const;

const principles = [
  "Every word reviewed by a human before it becomes training data.",
  "Unreviewed S'gaw Karen is not training data — it is a proposal.",
  "Community contributors own their corrections; the language stays with the community.",
  "No public claim about capability is made without measured evidence.",
];

export default async function AIPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  const lang = value;

  return (
    <>
      <PageHero
        eyebrow="S'gaw-Mango AI · ကညီကျိာ်တၢ်ပညိၣ်"
        title={pageLabels.ai[lang]}
        description={
          lang === "ksw"
            ? "တၢ်ပညိၣ်ကညီကျိာ်လၢပှၤတဝၢတဖၣ်တ့ထီၣ်။ တၢ်လံာ်ခီယ့ၣ်၊ တၢ်ပိၤဘၣ်၊ ဒီးတၢ်မၤတၢ်စၢၤကညီကျိာ်အဂီၢ်။"
            : "A Karen language tool, built by the Karen community. Dictionary, translation, glyph recognition, and sentence construction — every word reviewed, every voice belonging to someone."
        }
        image="/koa/assets/programs-community-mobile-generated.png"
        imageAlt="Karen script and community language materials"
      >
        <Button href={`/${lang}/contribute`}>Contribute a word</Button>
        <Button href={`/${lang}/dictionary`} variant="quiet">
          Search the dictionary
        </Button>
      </PageHero>

      <Section
        eyebrow="How it works"
        title="From syllables on paper to syllables in the air."
        intro="S'gaw-Mango AI connects community-reviewed language tools into one pipeline. Every capability traces to a real evidence artifact and a real reviewer."
      >
        <div className="feature-grid feature-grid--3">
          {capabilities.map((cap, index) => (
            <Card key={cap.title}>
              <span className="card-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{cap.title}</h3>
              <p>{cap.copy}</p>
              <span
                className={`truth-label truth-label--${cap.statusKind}`}
                role="note"
              >
                {cap.status}
              </span>
              <Link className="text-link" href={`/${lang}/${cap.href}`}>
                {cap.action}
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <section className="split-story">
        <div>
          <img
            src="/koa/assets/fb-capitol-group-mobile-enhanced.png"
            alt="Karen community members participating in language review"
          />
        </div>
        <div>
          <p className="eyebrow">Data provenance</p>
          <h2>Every word is reviewed. Every voice belongs to someone.</h2>
          <p>
            S'gaw-Mango AI does not learn from scraped text or unreviewed
            submissions. Every training datum traces to one approved translation
            proposal whose reviewer is a real human contributor.
          </p>
          <ul className="check-list">
            {principles.map((principle) => (
              <li key={principle}>{principle}</li>
            ))}
          </ul>
          <Button href={`/${lang}/contribute`}>Join the review pipeline</Button>
        </div>
      </section>

      <Section
        tone="cream"
        eyebrow="Community contribution"
        title="The language grows because people give to it."
        intro="Every correction, recording, and sentence pair helps the next generation of Karen speakers. Contributions pass through the Language Studio before they become training data."
      >
        <div className="feature-grid feature-grid--2">
          <Card>
            <span className="card-number">01</span>
            <h3>Share a word or phrase</h3>
            <p>
              Submit a Karen word, phrase, or correction. It enters the
              Language Studio review queue where a human reviewer checks
              accuracy and provenance.
            </p>
            <Link className="text-link" href={`/${lang}/contribute`}>
              Submit a word
            </Link>
          </Card>
          <Card>
            <span className="card-number">02</span>
            <h3>Record your voice</h3>
            <p>
              Record a Karen sentence for community transcription. Your voice
              becomes training data only after review and your recorded consent.
            </p>
            <Link className="text-link" href={`/${lang}/contribute`}>
              Record a sentence
            </Link>
          </Card>
        </div>
        <div className="section-action">
          <Button href={`/${lang}/contribute`}>Start contributing</Button>
          <Button href={`/${lang}/collaborate`} variant="quiet">
            Learn about the Language Studio
          </Button>
        </div>
      </Section>

      <Section
        tone="ink"
        eyebrow="Truth in claims"
        title="What we say, and how we know it."
        intro="KOA does not overclaim. Every capability statement carries a truth-state label so visitors know what is measured, what is in development, and what is planned."
      >
        <div className="feature-grid feature-grid--2">
          <Card>
            <h3>Declared</h3>
            <p>
              The capability exists and is backed by a specific implementation,
              but has not been independently measured on a held-out test set.
            </p>
          </Card>
          <Card>
            <h3>Measured</h3>
            <p>
              The capability has been evaluated on a specific test set with a
              published metric. The measurement date and conditions are recorded.
            </p>
          </Card>
          <Card>
            <h3>In development</h3>
            <p>
              Work has begun but the capability is not yet available for public
              use. The spec describes the planned approach.
            </p>
          </Card>
          <Card>
            <h3>Planned</h3>
            <p>
              A design exists but no implementation has started. Community input
              is welcome at this stage.
            </p>
          </Card>
        </div>
      </Section>
    </>
  );
}
