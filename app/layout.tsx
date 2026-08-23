import type { Metadata } from "next";
import { Inter, Libre_Caslon_Display, Noto_Sans_Myanmar } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700", "800"],
});

const libreCaslon = Libre_Caslon_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
  weight: ["400"],
});

const notoMyanmar = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  variable: "--font-myanmar",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${libreCaslon.variable} ${notoMyanmar.variable}`}>
      <body>{children}</body>
    </html>
  );
}