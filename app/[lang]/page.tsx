import type { Metadata } from "next";
import { HomeLanding } from "@/components/HomeLanding";
import { isLang } from "@/components/i18n";

export const metadata: Metadata = { title: "Home", description: "A national home for Karen communities to connect, contribute, and lead." };

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params;
  if (!isLang(value)) return null;
  return <HomeLanding lang={value} />;
}
