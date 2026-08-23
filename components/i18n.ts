import en from "@/messages/en.json";
import karen from "@/messages/karen.json";

export const languages = ["en", "karen"] as const;
export type Lang = (typeof languages)[number];
export type Messages = typeof en;

export function isLang(value: string): value is Lang {
  return languages.includes(value as Lang);
}

export function getMessages(lang: Lang): Messages {
  return lang === "karen" ? karen : en;
}

export function localized<T>(lang: Lang, value: { en: T; karen: T }): T {
  return value[lang];
}

export const pageLabels = {
  home: { en: "A national home for Karen communities", karen: "ကညီပှၤတဝၢအဟံၣ်လၢကီၢ်ဒီဘ့ၣ်" },
  about: { en: "A shared history. A future built together.", karen: "တၢ်စံၣ်စိၤတဲစိၤတပူၤဃီ။ ခါဆူညါလၢပတ့ထီၣ်သကိး။" },
  services: { en: "Support shaped around community life.", karen: "တၢ်မၤစၢၤလၢပှၤတဝၢတၢ်အိၣ်မူအဂီၢ်။" },
  community: { en: "Belong, participate, and lead.", karen: "ဃူဃူဖိးဖိး၊ ပာ်ဃုာ်၊ ဒီးတီခိၣ်ရိၣ်မဲ။" },
  contact: { en: "Start a conversation with KOA.", karen: "စးထီၣ်တၢ်ကတိၤဒီး KOA။" },
  dictionary: { en: "A living dictionary, held by community.", karen: "ကညီလံာ်ခီယ့ၣ်လၢအမူ ဒီးပှၤတဝၢပၢၤဃာ်အီၤ။" },
  contribute: { en: "Your voice helps the language grow.", karen: "နကလုၢ်မၤစၢၤကညီကျိာ်ဒိၣ်ထီၣ်။" },
  translation: { en: "Language access for every important moment.", karen: "ကျိာ်တၢ်မၤစၢၤလၢတၢ်ဆၢကတီၢ်အရ့ဒိၣ်ကိးခါဒဲး။" },
  collaborate: { en: "Bring an idea. Build what community needs.", karen: "ဟဲစိာ်နတၢ်ထံၣ်။ တ့ထီၣ်တၢ်လၢပှၤတဝၢလိၣ်ဘၣ်။" },
  board: { en: "The community board", karen: "ပှၤတဝၢတၢ်တဲသကိးခီၣ်ထံး" },
  changelog: { en: "Built in public, accountable to community.", karen: "တ့ထီၣ်လၢပှၤခဲလၢာ်အမဲာ်ညါ ဒီးစံးဆၢပှၤတဝၢ။" },
  admin: { en: "Community stewardship workspace", karen: "ပှၤတဝၢတၢ်ကွၢ်ထွဲအလီၢ်" }
} as const;
