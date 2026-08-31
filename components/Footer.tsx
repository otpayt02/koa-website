import Link from "next/link";
import type { Lang, Messages } from "./i18n";

export function Footer({ lang, messages }: { lang: Lang; messages: Messages }) {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <img src="/koa/assets/koa-seal-white-lettering-v2.png" alt="" width="116" height="116" />
        <div><strong>{messages.siteName}</strong><p>{messages.footerLine}</p></div>
      </div>
      <nav aria-label="Footer navigation">
        <Link href={`/${lang}/about`}>{messages.about}</Link>
        <Link href={`/${lang}/services`}>Programs</Link>
        <Link href={`/${lang}/community`}>Stories</Link>
        <Link href={`/${lang}/about#impact`}>Impact</Link>
        <Link href={`/${lang}/contact`}>Contact</Link>
        <Link href={`/${lang}/build`}>Build</Link>
        <Link href={`/${lang}/dictionary`}>{messages.dictionary}</Link>
        <Link href={`/${lang}/translation`}>{messages.translation}</Link>
        <Link href={`/${lang}/collaborate`}>{messages.collaborate}</Link>
        <Link href={`/${lang}/changelog`}>{messages.changelog}</Link>
      </nav>
      <div className="footer-meta">
        <p>© {new Date().getFullYear()} KOA · {messages.privacy}</p>
        <a href="https://www.facebook.com/koamerica" target="_blank" rel="noreferrer">Facebook</a>
      </div>
    </footer>
  );
}
