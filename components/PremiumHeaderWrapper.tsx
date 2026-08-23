"use client";

import { usePathname } from "next/navigation";
import { PremiumHeader } from "./PremiumHeader";

interface PremiumHeaderWrapperProps {
  lang: "en" | "karen";
  messages: any;
}

export function PremiumHeaderWrapper({ lang, messages }: PremiumHeaderWrapperProps) {
  const pathname = usePathname();

  const handleLanguageChange = (newLang: "en" | "karen") => {
    if (typeof window !== "undefined") {
      window.location.href = `/${newLang}${pathname.replace(/^\/[^/]+/, "")}`;
    }
  };

  return <PremiumHeader lang={lang} messages={messages} onLanguageChange={handleLanguageChange} />;
}

export default PremiumHeaderWrapper;