import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import { Noto_Sans_Myanmar } from "next/font/google";
import "./globals.css";
import "./cinematic-landing.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansMyanmar = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  display: "swap",
  variable: "--font-noto-myanmar",
});

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
    languages: {
      en: "/en",
      "ksw-US": "/karen",
    },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = (await headers()).get("x-koa-document-language") === "ksw" ? "ksw" : "en";
  return (
    <html lang={language} suppressHydrationWarning className={`${inter.variable} ${notoSansMyanmar.variable}`}>
      <body className={`${inter.className} ${notoSansMyanmar.className}`}>{children}</body>
    </html>
  );
}
