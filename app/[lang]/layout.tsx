import { notFound } from "next/navigation";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getMessages, isLang } from "@/components/i18n";

const supportedLanguages = ["en", "karen"] as const;

export function generateStaticParams() {
  return supportedLanguages.map((lang) => ({ lang }));
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
      <aside className="preview-mode-bar" aria-label="Bilingual preview mode">
        <span>Bilingual preview mode · Community review in progress</span>
        <Link href="/koa/">Return to cinematic site</Link>
      </aside>
      <Header lang={value} messages={messages} />
      <main id="main-content">{children}</main>
      <Footer lang={value} messages={messages} />
    </>
  );
}
