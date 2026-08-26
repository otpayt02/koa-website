import type { Metadata } from "next";
import { languages, localeMeta } from "@/components/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://karen-organization-of-america.oliverp789.chatgpt.site"),
  title: {
    default: "Karen Organization of America | Many places. One community.",
    template: "%s | Karen Organization of America",
  },
  description:
    "A national home for Karen communities to lead, connect, and act together.",
  alternates: {
    canonical: "/en",
    languages: Object.fromEntries(
      languages.map((lang) => [localeMeta[lang].htmlLang, `/${lang}`]),
    ),
  },
  icons: {
    icon: "/koa/assets/koa-logo.png",
    shortcut: "/koa/assets/koa-logo.png",
  },
  openGraph: {
    title: "Karen Organization of America",
    description: "Many places. One community.",
    images: ["/og-cinematic.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karen Organization of America",
    description: "Many places. One community.",
    images: ["/og-cinematic.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
