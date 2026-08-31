import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getMessages, isLang, languages } from "@/components/i18n";
import { AsciiWaveBackground } from "@/components/AsciiWaveBackground";
import { ContentRevealSystem } from "@/components/ui/ContentRevealSystem";
import { AmbientGlyphField } from "@/components/cinematic/AmbientGlyphField";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function LanguageLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang: value } = await params;
  if (!isLang(value)) notFound();
  const messages = getMessages(value);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Karen Organization of America",
            url: `https://karen-organization-of-america.oliverp789.chatgpt.site/${value}`,
            areaServed: "United States",
          }),
        }}
      />
      <a className="skip-link" href="#main-content">{messages.skip}</a>
      <AsciiWaveBackground
        elementSize={16}
        noiseScale={0.008}
        speed={0.3}
        waveIntensity={1.0}
        cursorInteraction={true}
        interactionIntensity={1.0}
        opacity={0.035}
        color="#d4a843"
      />
      <ContentRevealSystem />
      <AmbientGlyphField />
      <Header lang={value} messages={messages} />
      <main id="main-content">{children}</main>
      <Footer lang={value} messages={messages} />
    </>
  );
}
