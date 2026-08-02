import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karen Organization of America | Community Website Prototype",
  description:
    "A community-centered KOA website prototype with programs, resources, and review-gated future tools.",
  icons: {
    icon: "/koa/assets/koa-logo.png",
    shortcut: "/koa/assets/koa-logo.png",
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
