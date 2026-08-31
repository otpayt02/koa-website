import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://karen-organization-of-america.oliverp789.chatgpt.site"),
  title: {
    default: "Karen Organization of America | America's home for the Karen community.",
    template: "%s | Karen Organization of America",
  },
  description:
    "America's home for the Karen community. Providing, combining, and inviting a national Karen voice.",
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
    description: "America's home for the Karen community.",
    images: ["/og-cinematic.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karen Organization of America",
    description: "America's home for the Karen community.",
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
