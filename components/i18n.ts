import en from "@/messages/en.json";
import ksw from "@/messages/ksw.json";
import my from "@/messages/my.json";
import th from "@/messages/th.json";

// messages/karen.json remains only as the reviewed compatibility source while
// older imports are retired; /ksw and messages/ksw.json are canonical now.
export const languages = ["en", "th", "my", "ksw"] as const;
export type Lang = (typeof languages)[number];
export type Messages = typeof en;

export const localeMeta: Record<Lang, { label: string; nativeLabel: string; htmlLang: string }> = {
  en: { label: "English", nativeLabel: "English", htmlLang: "en" },
  th: { label: "Thai", nativeLabel: "ไทย", htmlLang: "th" },
  my: { label: "Burmese", nativeLabel: "မြန်မာ", htmlLang: "my" },
  ksw: { label: "S'gaw Karen", nativeLabel: "ကညီ", htmlLang: "ksw" },
};

export const localeReviewStatus = {
  en: "source",
  th: "proposal",
  my: "proposal",
  ksw: "proposal",
} as const satisfies Record<Lang, "source" | "proposal">;

const catalogs: Record<Lang, Messages> = { en, th, my, ksw };

export function isLang(value: string): value is Lang {
  return languages.includes(value as Lang);
}

export function getMessages(lang: Lang): Messages {
  return catalogs[lang];
}

export function localized<T>(lang: Lang, value: Record<Lang, T>): T {
  return value[lang];
}

function pageLabel(enLabel: string, thLabel: string, myLabel: string, kswLabel: string): Record<Lang, string> {
  return { en: enLabel, th: thLabel, my: myLabel, ksw: kswLabel };
}

export const pageLabels = {
  home: pageLabel("A national home for Karen communities", "บ้านระดับชาติของชุมชนกะเหรี่ยง", "ကရင်အသိုင်းအဝိုင်းများအတွက် နိုင်ငံလုံးဆိုင်ရာ အိမ်", "ကညီပှၤတဝၢအဟံၣ်လၢကီၢ်ဒီဘ့ၣ်"),
  about: pageLabel("A shared history. A future built together.", "ประวัติศาสตร์ร่วม อนาคตที่สร้างไปด้วยกัน", "မျှဝေထားသော သမိုင်း၊ အတူတည်ဆောက်မည့် အနာဂတ်", "တၢ်စံၣ်စိၤတဲစိၤတပူၤဃီ။ ခါဆူညါလၢပတ့ထီၣ်သကိး။"),
  services: pageLabel("Support shaped around community life.", "การสนับสนุนที่ออกแบบรอบชีวิตชุมชน", "ရပ်ရွာဘဝကို ဗဟိုပြုသော ပံ့ပိုးမှု", "တၢ်မၤစၢၤလၢပှၤတဝၢတၢ်အိၣ်မူအဂီၢ်။"),
  community: pageLabel("Belong, participate, and lead.", "เป็นส่วนหนึ่ง มีส่วนร่วม และนำทาง", "ပါဝင်ဆက်နွယ်၊ ပူးပေါင်းပြီး ဦးဆောင်ပါ", "ဃူဃူဖိးဖိး၊ ပာ်ဃုာ်၊ ဒီးတီခိၣ်ရိၣ်မဲ။"),
  contact: pageLabel("Start a conversation with KOA.", "เริ่มต้นการสนทนากับ KOA", "KOA နှင့် စကားစမြည်စတင်ပါ", "စးထီၣ်တၢ်ကတိၤဒီး KOA။"),
  dictionary: pageLabel("A living dictionary, held by community.", "พจนานุกรมมีชีวิตที่ชุมชนดูแล", "ရပ်ရွာက ထိန်းသိမ်းထားသော အသက်ဝင်အဘိဓာန်", "ကညီလံာ်ခီယ့ၣ်လၢအမူ ဒီးပှၤတဝၢပၢၤဃာ်အီၤ။"),
  contribute: pageLabel("Your voice helps the language grow.", "เสียงของคุณช่วยให้ภาษาเติบโต", "သင့်အသံက ဘာသာစကား တိုးတက်စေသည်", "နကလုၢ်မၤစၢၤကညီကျိာ်ဒိၣ်ထီၣ်။"),
  translation: pageLabel("Language access for every important moment.", "การเข้าถึงภาษาสำหรับทุกช่วงเวลาสำคัญ", "အရေးကြီးသော အချိန်တိုင်းအတွက် ဘာသာစကားအကူအညီ", "ကျိာ်တၢ်မၤစၢၤလၢတၢ်ဆၢကတီၢ်အရ့ဒိၣ်ကိးခါဒဲး။"),
  collaborate: pageLabel("Bring an idea. Build what community needs.", "นำไอเดียมา สร้างสิ่งที่ชุมชนต้องการ", "အကြံတစ်ခု ယူလာပါ၊ ရပ်ရွာလိုအပ်သည့်အရာကို အတူတည်ဆောက်ပါ", "ဟဲစိာ်နတၢ်ထံၣ်။ တ့ထီၣ်တၢ်လၢပှၤတဝၢလိၣ်ဘၣ်။"),
  board: pageLabel("The community board", "กระดานชุมชน", "ရပ်ရွာဘုတ်အဖွဲ့", "ပှၤတဝၢတၢ်တဲသကိးခီၣ်ထံး"),
  changelog: pageLabel("Built in public, accountable to community.", "สร้างอย่างเปิดเผย รับผิดชอบต่อชุมชน", "ပွင့်လင်းစွာ တည်ဆောက်ပြီး ရပ်ရွာကို တာဝန်ခံသည်", "တ့ထီၣ်လၢပှၤခဲလၢာ်အမဲာ်ညါ ဒီးစံးဆၢပှၤတဝၢ။"),
  admin: pageLabel("Community stewardship workspace", "พื้นที่ดูแลชุมชน", "ရပ်ရွာစောင့်ရှောက်မှု လုပ်ငန်းခွင်", "ပှၤတဝၢတၢ်ကွၢ်ထွဲအလီၢ်"),
} as const;
