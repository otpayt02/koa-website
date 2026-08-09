import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karen Organization of America | One Community",
  description:
    "A national home for Karen communities to lead, connect, and act together.",
  icons: {
    icon: "/koa/assets/koa-logo.png",
    shortcut: "/koa/assets/koa-logo.png",
  },
  openGraph: {
    title: "Karen Organization of America",
    description: "Many places. One community.",
    images: [
      "https://karen-organization-of-america.oliverp789.chatgpt.site/og-cinematic.png",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karen Organization of America",
    description: "Many places. One community.",
    images: [
      "https://karen-organization-of-america.oliverp789.chatgpt.site/og-cinematic.png",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
