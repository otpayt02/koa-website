import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./cinematic-landing.css";
import "./home-sections.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.koamerica.org"),
  title: {
    default: "Karen Organization of America | Many places. One community.",
    template: "%s | Karen Organization of America",
  },
  description:
    "A national home for Karen communities to lead, connect, and act together.",
  alternates: {
    canonical: "/en",
    languages: {
      en: "/en",
      "ksw-US": "/ksw",
    },
  },
  icons: {
    icon: "/koa/assets/koa-seal-white-lettering-v2.png",
    shortcut: "/koa/assets/koa-seal-white-lettering-v2.png",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = (await headers()).get("x-koa-document-language") === "ksw" ? "ksw" : "en";
  return (
    <html lang={language} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
