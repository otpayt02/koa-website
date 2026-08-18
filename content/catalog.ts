import enMessages from "@/messages/en.json";
import karenMessages from "@/messages/karen.json";
import { pageLabels } from "@/components/i18n";
import generatedInventory from "@/content/inventory.generated.json";

export const contentTypes = ["heading", "paragraph", "label", "action", "tooltip", "status"] as const;
export type ContentType = (typeof contentTypes)[number];
export type ContentLanguage = "en" | "karen";

export type ContentDefinition = {
  key: string;
  route: string;
  section: string;
  type: ContentType;
  en: string;
  karen: string;
  shared?: boolean;
};

export type ContentBinding = {
  key: string;
  route: string;
  kind: "text" | "attribute";
  attribute?: "aria-label" | "placeholder" | "title";
  en: string;
  karen: string;
  occurrence: { en: number; karen: number };
};

function define(
  key: string,
  route: string,
  section: string,
  type: ContentType,
  en: string,
  karen = "",
  shared = false,
): ContentDefinition {
  return { key, route, section, type, en, karen, shared };
}

const shellEntries = (Object.keys(enMessages) as Array<keyof typeof enMessages>).map((key) =>
  define(`shell.${key}`, "*", "Shared shell", key === "tagline" ? "paragraph" : "label", enMessages[key], karenMessages[key], true),
);

const labelEntries = Object.entries(pageLabels).map(([key, value]) =>
  define(`page.${key}.heroTitle`, key === "home" ? "/" : `/${key}`, "Hero", "heading", value.en, value.karen),
);

const authoredEntries: ContentDefinition[] = [
  define("home.film.ariaLabel", "/", "Cinematic introduction", "tooltip", "Karen Organization of America story"),
  define("home.film.established", "/", "Cinematic introduction", "label", "Established 2018 · Omaha, Nebraska"),
  define("home.film.title", "/", "Cinematic introduction", "heading", "Many places. One community.", "ကညီပှၤတဝၢလၢ အမဲရကၤ"),
  define("home.film.intro", "/", "Cinematic introduction", "paragraph", "A national home for Karen people to connect, protect language, and lead the future together.", "ဆဲးကျိးလိာ်သး၊ ဒီသဒၢကညီကျိာ်၊ ဒီးတီခိၣ်ရိၣ်မဲခါဆူညါဃုာ်ဒီးလိာ်သး။"),
  define("home.purpose.eyebrow", "/", "Purpose", "label", "Our purpose", "ပတၢ်ပညိၣ်"),
  define("home.purpose.title", "/", "Purpose", "heading", "Strengthen unity. Protect rights. Build belonging.", "မၤဂၢၢ်မၤကျၢၤတၢ်ဃူတၢ်ဖိး။ ဒီသဒၢတၢ်ခွဲးတၢ်ယာ်။"),
  define("home.purpose.intro", "/", "Purpose", "paragraph", "KOA connects Karen communities, advocates for justice, and gives people practical pathways to participate and lead.", "KOA ဆဲးကျိးပှၤတဝၢ၊ ကတိၤခဲပှၤတဖၣ်အဂီၢ်၊ ဒီးဟ့ၣ်တၢ်သ့တၢ်ဘၣ်လၢကတီခိၣ်ရိၣ်မဲ။"),
  define("home.advocacy.title", "/", "Advocacy", "heading", "Knowledge becomes a voice in the room."),
  define("home.advocacy.copy", "/", "Advocacy", "paragraph", "KOA helps Karen leaders and young people understand public systems, speak to decision-makers, and bring what they learn home."),
  define("home.language.title", "/", "Living language", "heading", "Words carried forward, together."),
  define("home.language.copy", "/", "Living language", "paragraph", "Every published entry preserves who contributed, who reviewed it, and how the language is used."),
  define("home.events.title", "/", "Events", "heading", "A community in motion."),
  define("home.events.copy", "/", "Events", "paragraph", "Ways to learn, connect, and take part—wherever you live."),

  define("about.hero.eyebrow", "/about", "Hero", "label", "About KOA", "ဘၣ်ဃး KOA"),
  define("about.hero.description", "/about", "Hero", "paragraph", "Born from collaboration among Karen leaders across the United States, KOA advocates, educates, connects, and stands in solidarity.", "ပှၤတီခိၣ်ရိၣ်မဲလၢကီၢ်အါဘ့ၣ် ပာ်ဖှိၣ်ထီၣ်အသးလၢတၢ်ကတိၤခဲ၊ တၢ်ကူၣ်ဘၣ်ကူၣ်သ့ ဒီးတၢ်ဃူတၢ်ဖိးအဂီၢ်။"),
  define("about.story.title", "/about", "Story", "heading", "From conversation to national coalition."),
  define("about.story.intro", "/about", "Story", "paragraph", "In 2018, leaders recognized that communities in many places could act with greater strength together."),
  define("about.mission.title", "/about", "Mission", "heading", "Purpose that becomes action."),
  define("about.leadership.title", "/about", "Leadership", "heading", "Accountable, community-rooted leadership."),
  define("about.leadership.intro", "/about", "Leadership", "paragraph", "KOA is preparing verified public biographies and regional roles. Profiles are published only after each leader approves the details."),
  define("about.reporting.title", "/about", "Reporting", "heading", "Transparency belongs to everyone."),

  define("services.hero.eyebrow", "/services", "Hero", "label", "Programs & services", "တၢ်မၤစၢၤတဖၣ်"),
  define("services.hero.description", "/services", "Hero", "paragraph", "Practical programs help individuals and families navigate public systems, access care, grow skills, and lead in community.", "တၢ်ကူၣ်ဘၣ်ကူၣ်သ့၊ တၢ်ကတိၤခဲ၊ တၢ်အိၣ်ဆူၣ်အိၣ်ချ့ ဒီးကျိာ်တၢ်မၤစၢၤလၢဟံၣ်ဖိဃီဖိတဖၣ်အဂီၢ်။"),
  define("services.overview.title", "/services", "Overview", "heading", "One door to practical support."),
  define("services.overview.intro", "/services", "Overview", "paragraph", "Program availability varies by region. KOA connects each request to a local community, partner, or approved provider."),
  define("services.civic.title", "/services", "Programs", "heading", "Civic education"),
  define("services.civic.copy", "/services", "Programs", "paragraph", "Advocacy training, public-system learning, Washington visits, and youth leadership development."),
  define("services.immigration.title", "/services", "Programs", "heading", "Immigration support"),
  define("services.immigration.copy", "/services", "Programs", "paragraph", "Trusted referrals, document navigation, interpretation, and connections to qualified legal help."),
  define("services.health.title", "/services", "Programs", "heading", "Health access"),
  define("services.health.copy", "/services", "Programs", "paragraph", "Language access, community health navigation, and culturally responsive connections to care."),
  define("services.workforce.title", "/services", "Programs", "heading", "Workforce development"),
  define("services.workforce.copy", "/services", "Programs", "paragraph", "Employment readiness, skills pathways, mentoring, and connections to local opportunity."),
  define("services.translation.title", "/services", "Programs", "heading", "Translation & interpretation"),
  define("services.translation.copy", "/services", "Programs", "paragraph", "Reviewed document translation and trusted medical, legal, community, phone, and video interpretation."),
  define("services.humanitarian.title", "/services", "Programs", "heading", "Humanitarian assistance"),
  define("services.humanitarian.copy", "/services", "Programs", "paragraph", "Practical solidarity through food, clean water, shelter, education, and vocational support."),
  define("services.access.title", "/services", "Program access", "heading", "Not sure where to begin?"),
  define("services.access.intro", "/services", "Program access", "paragraph", "Tell us what you need in the language and channel that works for you. A community navigator will help identify the next step."),

  define("community.hero.eyebrow", "/community", "Hero", "label", "Community", "ပှၤတဝၢ"),
  define("community.hero.description", "/community", "Hero", "paragraph", "Find community moments, join an event, volunteer your skills, or bring an idea to the people shaping KOA's work.", "နမ့ၢ်အိၣ်ဖဲလဲၣ်ဂ့ၤ နပာ်ဃုာ်လၢကညီပှၤတဝၢအတၢ်မၤသကိးန့ၢ်လီၤ။"),
  define("community.events.title", "/community", "Events", "heading", "Gather, learn, and celebrate."),
  define("community.youth.title", "/community", "Stories", "heading", "Young people carry knowledge into action."),
  define("community.culture.title", "/community", "Stories", "heading", "Connection crosses generations."),
  define("community.board.title", "/community", "Community board", "heading", "Ideas move forward in public."),
  define("community.board.intro", "/community", "Community board", "paragraph", "Every suggestion has a visible status and a moderated place for constructive discussion."),

  define("contact.hero.eyebrow", "/contact", "Hero", "label", "Contact", "ဆဲးကျိး"),
  define("contact.hero.description", "/contact", "Hero", "paragraph", "Tell us what you need, where you are, and the best way to reach you. A community navigator will route your message to the right person.", "တဲဖျါပသ့ၣ်ညါနၤ၊ နတၢ်လိၣ်ဘၣ် မ့တမ့ၢ် နတၢ်အိၣ်သးလၢအဂ့ၤ။"),
  define("contact.form.title", "/contact", "Contact form", "heading", "A real person will read your message."),
  define("contact.form.intro", "/contact", "Contact form", "paragraph", "For urgent medical or legal interpretation, use the language request form so the coordination queue can triage it quickly."),
  define("contact.form.name", "/contact", "Contact form", "label", "Name"),
  define("contact.form.email", "/contact", "Contact form", "label", "Email"),
  define("contact.form.phone", "/contact", "Contact form", "label", "Phone (optional)"),
  define("contact.form.topic", "/contact", "Contact form", "label", "How can we help?"),
  define("contact.form.message", "/contact", "Contact form", "label", "Your message"),

  define("dictionary.hero.eyebrow", "/dictionary", "Hero", "label", "Living language", "ကညီကျိာ်"),
  define("dictionary.hero.description", "/dictionary", "Hero", "paragraph", "Explore S'gaw Karen words held in public by the people who speak, teach, and carry them.", "ဃုကွၢ်ကညီတၢ်ကတိၤတဖၣ်လၢပှၤတဝၢကွၢ်သမံသမိးဝဲ ဒီးနၢ်ဟူအကလုၢ်တဖၣ်။"),
  define("dictionary.search.title", "/dictionary", "Search", "heading", "A dictionary that remembers its people."),
  define("dictionary.search.intro", "/dictionary", "Search", "paragraph", "Browse by category or search Karen, romanization, English translations, and definitions. Every published entry keeps its review status and contribution history visible."),
  define("dictionary.empty.title", "/dictionary", "Search", "heading", "No matching entry yet."),
  define("dictionary.empty.copy", "/dictionary", "Search", "paragraph", "Try another spelling, or share the word with community reviewers."),

  define("translation.hero.eyebrow", "/translation", "Hero", "label", "Language access", "ကျိာ်တၢ်မၤစၢၤ"),
  define("translation.hero.description", "/translation", "Hero", "paragraph", "From a medical appointment to a court date, request language support from a directory built around trust, training, and accountability.", "ဃုထၢပှၤကွဲးကျိာ်ထံ ဒီးပှၤကတိၤကျိာ်ထံလၢပှၤတဝၢအၢၣ်လီၤအီၤ။"),
  define("translation.services.title", "/translation", "Services", "heading", "Support for the moments that matter."),
  define("translation.services.intro", "/translation", "Services", "paragraph", "Community translation is free when capacity allows. Organizations can request a sliding-scale quote; urgent legal and medical needs are triaged first."),
  define("translation.document.title", "/translation", "Services", "heading", "Document translation"),
  define("translation.document.copy", "/translation", "Services", "paragraph", "Letters, forms, school materials, and community information in Karen or English."),
  define("translation.interpretation.title", "/translation", "Services", "heading", "Interpretation"),
  define("translation.interpretation.copy", "/translation", "Services", "paragraph", "Medical, legal, community, phone, and video appointments with an approved interpreter."),
  define("translation.rates.title", "/translation", "Services", "heading", "Community rates"),
  define("translation.rates.copy", "/translation", "Services", "paragraph", "Free for community requests where possible, with transparent rates for organizations."),
  define("translation.request.title", "/translation", "Request form", "heading", "Tell us what you need."),
  define("translation.request.intro", "/translation", "Request form", "paragraph", "A coordinator will confirm availability, cost, and the next step. Please do not include sensitive medical or legal details in this first request."),

  define("contribute.form.eyebrow", "/contribute", "Contribution form", "label", "Share language knowledge", "ဟ့ၣ်လီၤကျိာ်တၢ်သ့ၣ်ညါ"),
  define("contribute.form.title", "/contribute", "Contribution form", "heading", "Add to the living dictionary.", "မၤအါထီၣ်ကညီလံာ်ခီယ့ၣ်။"),
  define("contribute.form.word", "/contribute", "Contribution form", "label", "Karen word or phrase", "ကညီတၢ်ကတိၤ"),
  define("contribute.form.translation", "/contribute", "Contribution form", "label", "English translation", "အဲကလံးတၢ်ကွဲးကျိာ်ထံ"),
  define("contribute.form.type", "/contribute", "Contribution form", "label", "Contribution type", "တၢ်ဆှၢလီၤအကလုာ်"),
  define("contribute.form.dialect", "/contribute", "Contribution form", "label", "Dialect", "ကျိာ်အကလုာ်"),
  define("contribute.form.definition", "/contribute", "Contribution form", "label", "Definition or context", "တၢ်ပာ်ဖျါ"),

  define("collaborate.form.eyebrow", "/collaborate", "Idea form", "label", "Shape what comes next", "တဲဖျါနတၢ်ထံၣ်"),
  define("collaborate.form.title", "/collaborate", "Idea form", "heading", "Tell us what community needs.", "ပအဲၣ်ဒိးနၢ်ဟူနတၢ်ထံၣ်။"),
  define("collaborate.form.type", "/collaborate", "Idea form", "label", "Request type"),
  define("collaborate.form.shortTitle", "/collaborate", "Idea form", "label", "Short title"),
  define("collaborate.form.description", "/collaborate", "Idea form", "label", "What should KOA consider?"),
  define("collaborate.form.impact", "/collaborate", "Idea form", "label", "Who would this help, and how?"),
  define("collaborate.form.email", "/collaborate", "Idea form", "label", "Email for follow-up (optional)"),

  define("shared.status.communityReviewed", "*", "Records", "status", "Community reviewed", "", true),
  define("shared.action.viewFullEntry", "*", "Records", "action", "View full entry", "", true),
  define("shared.status.koaApproved", "*", "Profiles", "status", "KOA approved", "", true),
  define("shared.action.viewProfile", "*", "Profiles", "action", "View profile and request service", "", true),
  define("shared.audio.start", "*", "Audio recorder", "action", "Start recording", "စးထီၣ်ဖီၣ်ကလုၢ်", true),
  define("shared.audio.stop", "*", "Audio recorder", "action", "Stop recording", "ပတုာ်", true),
  define("shared.audio.upload", "*", "Audio recorder", "action", "Upload recording", "ဆှၢလီၤကလုၢ်", true),
  define("shared.audio.review", "*", "Audio recorder", "status", "Review your recording", "ကွၢ်ကဒါနကလုၢ်", true),
];

export const generatedContentBindings = generatedInventory.bindings as ContentBinding[];
export const contentCatalog: readonly ContentDefinition[] = [
  ...shellEntries,
  ...labelEntries,
  ...authoredEntries,
  ...(generatedInventory.definitions as ContentDefinition[]),
];
export const contentCatalogVersion = 1;

const catalogByKey = new Map(contentCatalog.map((entry) => [entry.key, entry]));

export function getContentDefinition(key: string): ContentDefinition {
  const entry = catalogByKey.get(key);
  if (!entry) throw new Error(`Unknown bilingual content key: ${key}`);
  return entry;
}

export function staticContent(key: string, language: ContentLanguage): string {
  const entry = getContentDefinition(key);
  return language === "karen" ? entry.karen || entry.en : entry.en;
}

export function catalogKeysForRoute(route: string): string[] {
  return contentCatalog.filter((entry) => entry.route === "*" || entry.route === route).map((entry) => entry.key);
}
