import type { Lang } from "./i18n";

export type Localized = { en: string; karen: string };

export const dictionaryEntries = [
  {
    id: "knyaw",
    word: "ကညီ",
    romanization: "K'nyaw",
    partOfSpeech: "noun",
    category: "identity",
    translations: ["Karen person", "Karen people", "K'nyaw"],
    definition: {
      en: "A Karen person or the Karen people; a community identifier used across generations.",
      karen: "ကညီဖိတဂၤ မ့တမ့ၢ် ကညီပှၤကလုာ်အမံၤလၢဘၣ်တၢ်သူအီၤလၢစိၤတစိၤဆူတစိၤ။"
    },
    synonyms: ["Karen", "K'nyaw"],
    antonyms: [],
    exampleKaren: "ယမ့ၢ်ပှၤကညီဖိတဂၤလီၤ။",
    exampleEnglish: "I am Karen.",
    contributor: "naw-eh-wah",
    audioCount: 4,
    version: 4,
    updated: "August 8, 2026"
  },
  {
    id: "karen-language",
    word: "ကညီကျိာ်",
    romanization: "K'nyaw kwa",
    partOfSpeech: "noun",
    category: "language",
    translations: ["Karen language", "S'gaw Karen"],
    definition: {
      en: "The Karen language; this entry focuses on the S'gaw Karen variety used by this website.",
      karen: "ကညီပှၤကလုာ်အကျိာ်။ လီၢ်ကဝီၤအံၤသူစှၤကညီကျိာ်အါတက့ၢ်။"
    },
    synonyms: ["S'gaw Karen"],
    antonyms: [],
    exampleKaren: "ပကတိၤကညီကျိာ်လၢဟံၣ်။",
    exampleEnglish: "We speak Karen at home.",
    contributor: "saw-ler-poe",
    audioCount: 7,
    version: 6,
    updated: "August 6, 2026"
  },
  {
    id: "thank-you",
    word: "တၢ်ဘျုး",
    romanization: "Ta bluh",
    partOfSpeech: "expression",
    category: "everyday",
    translations: ["thank you", "gratitude"],
    definition: {
      en: "An expression of thanks or gratitude.",
      karen: "တၢ်စံးဘျုးစံးဖှိၣ်အတၢ်ကတိၤ။"
    },
    synonyms: ["thanks"],
    antonyms: [],
    exampleKaren: "တၢ်ဘျုးဒိၣ်မးလီၤ။",
    exampleEnglish: "Thank you very much.",
    contributor: "naw-mu-mu",
    audioCount: 9,
    version: 3,
    updated: "August 4, 2026"
  },
  {
    id: "community",
    word: "ပှၤတဝၢ",
    romanization: "Pwa ta wah",
    partOfSpeech: "noun",
    category: "community",
    translations: ["community", "society"],
    definition: {
      en: "People connected by place, identity, care, or shared purpose.",
      karen: "ပှၤတဖုလၢအဘၣ်ထွဲလိာ်အသးခီဖျိတၢ်လီၢ်၊ တၢ်မ့ၢ်တၢ်၊ ဒီးတၢ်ကဟုကယာ်။"
    },
    synonyms: ["community", "collective"],
    antonyms: ["isolation"],
    exampleKaren: "ပှၤတဝၢမၤသကိးတၢ်လီၤ။",
    exampleEnglish: "The community works together.",
    contributor: "saw-ler-poe",
    audioCount: 3,
    version: 2,
    updated: "August 2, 2026"
  },
  {
    id: "mother",
    word: "မိၢ်",
    romanization: "Moo",
    partOfSpeech: "noun",
    category: "family",
    translations: ["mother", "mom"],
    definition: {
      en: "A mother; an affectionate or respectful family term.",
      karen: "ဖိအမိၢ် မ့တမ့ၢ် ဟံၣ်ဖိဃီဖိအတၢ်ကတိၤလၢတၢ်အဲၣ်တၢ်ကွံအပူၤ။"
    },
    synonyms: ["mom"],
    antonyms: [],
    exampleKaren: "ယမိၢ်အဲၣ်ယၤလီၤ။",
    exampleEnglish: "My mother loves me.",
    contributor: "naw-eh-wah",
    audioCount: 5,
    version: 3,
    updated: "July 29, 2026"
  },
  {
    id: "peace",
    word: "တၢ်ဃူတၢ်ဖိး",
    romanization: "Ta ghuh ta hpoh",
    partOfSpeech: "noun",
    category: "values",
    translations: ["peace", "harmony"],
    definition: {
      en: "Peace, unity, or harmony among people.",
      karen: "တၢ်မုာ်တၢ်ခုၣ်ဒီးတၢ်ဃူတၢ်ဖိးလၢပှၤအဘၢၣ်စၢၤ။"
    },
    synonyms: ["harmony", "unity"],
    antonyms: ["conflict"],
    exampleKaren: "ပအဲၣ်ဒိးတၢ်ဃူတၢ်ဖိးလီၤ။",
    exampleEnglish: "We want peace.",
    contributor: "naw-mu-mu",
    audioCount: 2,
    version: 1,
    updated: "July 27, 2026"
  }
] as const;

export type DictionaryEntry = (typeof dictionaryEntries)[number];

export const interpreters = [
  {
    name: "Naw Eh Wah",
    username: "naw-eh-wah",
    initials: "NE",
    languages: "S'gaw Karen · English",
    credentials: "Medical interpretation · 8 years",
    area: "Minnesota · Video nationwide",
    availability: "Weekdays",
    rating: "4.9",
    reviews: 48
  },
  {
    name: "Saw Ler Poe",
    username: "saw-ler-poe",
    initials: "SL",
    languages: "S'gaw Karen · English · Burmese",
    credentials: "Court & legal interpretation · 11 years",
    area: "Nebraska · Regional travel",
    availability: "Court appointments",
    rating: "4.8",
    reviews: 31
  },
  {
    name: "Naw Mu Mu",
    username: "naw-mu-mu",
    initials: "NM",
    languages: "S'gaw Karen · English",
    credentials: "Community & education interpretation · 6 years",
    area: "New York · Phone and video",
    availability: "Evenings & weekends",
    rating: "4.9",
    reviews: 26
  }
] as const;

export const discussions = [
  { title: "Add regional pronunciation notes to family terms", kind: "Dictionary", status: "Under review", author: "Naw S.", replies: 12, time: "2 hours ago" },
  { title: "Monthly community health interpretation clinic", kind: "Service idea", status: "Proposed", author: "Htoo W.", replies: 8, time: "Yesterday" },
  { title: "Partner with libraries for recording sessions", kind: "Collaboration", status: "Approved", author: "Saw L.", replies: 19, time: "2 days ago" },
  { title: "Clearer dialect labels in dictionary results", kind: "Feature request", status: "In progress", author: "Naw E.", replies: 6, time: "3 days ago" }
] as const;

export function content(lang: Lang, en: string, karen: string): string {
  return lang === "karen" ? karen : en;
}
