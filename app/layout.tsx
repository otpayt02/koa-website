import type { Metadata } from "next";
import { headers } from "next/headers";
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
    <html lang={language} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
