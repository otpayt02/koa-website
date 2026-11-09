import type { Metadata } from "next";
import { CinematicLanding } from "@/components/CinematicLanding";
import { getMessages, isLang } from "@/components/i18n";
export const metadata: Metadata = { title: "Home", description: "Standing with the Karen community in America, both here and beyond borders." };
export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: value } = await params; if (!isLang(value)) return null;
  return <CinematicLanding lang={value} messages={getMessages(value)} />;
}
