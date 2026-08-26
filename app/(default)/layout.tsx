import { siteMetadata } from "@/lib/site-metadata";
import "../globals.css";

export const metadata = siteMetadata;

export default function DefaultRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
