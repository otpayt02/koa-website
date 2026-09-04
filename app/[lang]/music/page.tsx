import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { isLang, pageLabels } from "@/components/i18n";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Karen Music Director · Preserve, Equip, Connect",
  description:
    "Karen hymnody, bilingual chord-chart editor, and community music archive — preserving the sound of home for the S'gaw Karen diaspora.",
};

const chapters = [
  {
    numeral: "၁",
    title: "The sound of home",
    copy: "Karen hymns carry the memory of villages, refugee camps, and church gatherings across three continents. The music director program preserves these songs in durable digital form.",
  },
  {
    numeral: "၂",
    title: "What we preserve",
    copy: "Handwritten chord charts, church hymnals, oral arrangements, and community recordings — each one catalogued, rights-checked, and archived with provenance.",
  },
  {
    numeral: "၃",
    title: "What we build",
    copy: "A bilingual chord-chart editor with Karen typing mode, print-ready PDF export, and a chord-chart library of 21+ Karen music pieces. Built for Karen music directors in America.",
  },
  {
    numeral: "ၔ",
    title: "Who leads the music",
    copy: "Karen music directors lead worship, teach young singers, and arrange hymns for community gatherings. KOA equips them with tools and connects them to each other.",
  },
  {
    numeral: "၅",
    title: "How to contribute",
    copy: "Upload a handwritten chart, submit a recording, or suggest a lyric correction. Every contribution passes through a rights review before publication.",
  },
];

const musicFeatures = [
  {
    title: "Bilingual editor",
    copy: "Write lyrics in S'gaw Karen and English side by side. Karen typing mode maps your keyboard to Myanmar/Karen script.",
    status: "Implemented — Karen + English, reviewed",
  },
  {
    title: "Print-ready sheet music",
    copy: "Export chord charts as PDFs with Karen-script lyrics, chord symbols, and proper hymn formatting. Two systems per page for hymns.",
    status: "Implemented — PDF export with Karen script",
  },
  {
    title: "Chord-chart library",
    copy: "21+ Karen music chart files including hymns, youth songs, and contemporary pieces. Hand-scanned charts from community elders.",
    status: "Declared — library grows with each contribution",
  },
  {
    title: "Karen music generation",
    copy: "Melody templates using Karen-scale grammar. Generative music in Karen styles is planned but requires dataset provenance first.",
    status: "In development — melody templates only; no generative model yet",
  },
];

export default async function MusicPage({
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
        eyebrow="Karen Music Director · တၢ်မၤစၢၤကညီဂီတ"
        title={pageLabels.music[lang]}
        description={
          lang === "ksw"
            ? "တၢ်မၤစၢၤကညီဂီတအဂီၢ်။ တၢ်သးတၢ်စဲးကညီ၊ တၢ်မၤတံၣ်တၢ်ဆှဲ၊ ဒီးတၢ်ကူၣ်ဘၣ်ကူၣ်အီၤကညီဂီတအဂီၢ်။"
            : "Preserve Karen hymns, equip music directors with a bilingual editor, and connect the Karen music tradition to the language stack. The sound of home, carried forward."
        }
        image="/koa/assets/programs-community-mobile-generated.png"
        imageAlt="Karen community gathering with music"
      >
        <Button href={`/${lang}/music#editor`}>Try the editor</Button>
        <Button href={`/${lang}/contribute`} variant="quiet">
          Send a song
        </Button>
      </PageHero>

      <Section eyebrow="Five chapters" title="A story told in song.">
        <div className="feature-grid feature-grid--1">
          {chapters.map((chapter) => (
            <article key={chapter.numeral} className="chapter-card">
              <span className="chapter-card__numeral">{chapter.numeral}</span>
              <div>
                <h3>{chapter.title}</h3>
                <p>{chapter.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        tone="cream"
        eyebrow="The editor"
        title="A bilingual tool for Karen music directors."
        intro="The chord-chart editor supports Karen typing mode, chord placement above lyric lines, and print-ready PDF export. Use it to preserve existing hymns or compose new arrangements."
      >
        <div className="feature-grid feature-grid--2">
          {musicFeatures.map((feature, index) => (
            <Card key={feature.title}>
              <span className="card-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
              <span className="truth-label truth-label--declared" role="note">
                {feature.status}
              </span>
            </Card>
          ))}
        </div>
      </Section>

      {/* Option 4: iframe embed of the music editor */}
      <section id="editor" className="music-embed-section">
        <div className="container">
          <p className="eyebrow">Live editor preview</p>
          <h2>The Karen Music Director editor.</h2>
          <p className="section-intro">
            This is a live preview of the bilingual chord-chart editor. It runs
            as a separate service on the KOA platform. For production, the
            editor will be available at{" "}
            <code>music.koamerica.org</code> with full KOA authentication.
          </p>
          <div className="music-embed-frame">
            <iframe
              src="http://127.0.0.1:4177"
              title="Karen Music Director — chord-chart editor preview"
              width="100%"
              height="640"
              style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
            <p className="music-embed-note">
              <strong>Preview only.</strong> The editor requires the local Karen
              Music Director service running on port 4177. If the frame above is
              blank, start the service or visit the editor directly. This embed
              uses{" "}
              <Link href={`/${lang}/contact`}>
                option 4 (iframe demo)
              </Link>{" "}
              from the integration spec; production will use a subdomain with
              reverse proxy.
            </p>
          </div>
        </div>
      </section>

      <section className="split-story">
        <div>
          <img
            src="/koa/assets/washington-advocacy.jpg"
            alt="Karen community music tradition"
          />
        </div>
        <div>
          <p className="eyebrow">Karen music style</p>
          <h2>Meter, melody, and meaning.</h2>
          <p>
            Karen hymns follow established patterns — predominantly 4/4 meter,
            verse–chorus form, I–IV–V–I harmony with stepwise melody within an
            octave. Lyrics use S'gaw Karen script with English chord symbols
            above the line.
          </p>
          <ul className="check-list">
            <li>Predominantly 4/4 meter; some 3/4 waltz hymns</li>
            <li>Verse–chorus or strophic form</li>
            <li>Stepwise melody with characteristic descending cadences</li>
            <li>Karen-script lyrics with English chord notation</li>
          </ul>
          <Button href={`/${lang}/contribute`}>Submit a chart or recording</Button>
        </div>
      </section>

      <Section
        tone="ink"
        eyebrow="Contribute"
        title="Send a song."
        intro="Every hymn, chart, and recording helps preserve the Karen music tradition for the next generation. All contributions pass through a rights review before publication."
      >
        <div className="feature-grid feature-grid--3">
          <Card>
            <h3>Upload a chart</h3>
            <p>
              Photograph or scan a handwritten chord chart. Our OCR will
              extract the content for music-director review.
            </p>
            <Link className="text-link" href={`/${lang}/contribute`}>
              Upload an image
            </Link>
          </Card>
          <Card>
            <h3>Submit a recording</h3>
            <p>
              Record a Karen hymn or song. Every recording requires speaker
              consent and passes through a rights review.
            </p>
            <Link className="text-link" href={`/${lang}/contribute`}>
              Record audio
            </Link>
          </Card>
          <Card>
            <h3>Suggest a correction</h3>
            <p>
              Found an error in a published hymn's lyrics? Your correction
              enters the Language Studio as a translation proposal.
            </p>
            <Link className="text-link" href={`/${lang}/contribute`}>
              Suggest a fix
            </Link>
          </Card>
        </div>
        <div className="section-action">
          <Button href={`/${lang}/contribute`}>Start contributing</Button>
          <Button href={`/${lang}/contact`} variant="quiet">
            Contact the music director
          </Button>
        </div>
      </Section>
    </>
  );
}
