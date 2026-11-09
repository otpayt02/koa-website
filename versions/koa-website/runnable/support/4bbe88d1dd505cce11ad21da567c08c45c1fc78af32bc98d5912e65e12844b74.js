import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
import { t as AudioPlayer } from "./AudioPlayer-d7WmuI91.js";
import { t as Link } from "./link-DiLTuv2w.js";
//#region components/data.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var dictionaryEntries = [
	{
		id: "knyaw",
		word: "ကညီ",
		romanization: "K'nyaw",
		partOfSpeech: "noun",
		category: "identity",
		translations: [
			"Karen person",
			"Karen people",
			"K'nyaw"
		],
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
];
function content(lang, en, karen) {
	return lang === "ksw" ? karen : en;
}
//#endregion
//#region components/StatusPill.tsx
var import_jsx_runtime = require_jsx_runtime();
function StatusPill({ children, tone = "gold" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `status status--${tone}`,
		children
	});
}
//#endregion
//#region components/DictionaryEntry.tsx
function DictionaryEntry({ entry, lang, compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: `dictionary-card${compact ? " dictionary-card--compact" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dictionary-card__top",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
					tone: "green",
					children: "Community reviewed"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["v", entry.version] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dictionary-card__identity",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "dictionary-word",
					lang: "ksw",
					children: entry.word
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "romanization",
					children: [
						entry.romanization,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["· ", entry.partOfSpeech] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: entry.translations.slice(0, 2).join(" · ") }),
			!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "dictionary-card__definition",
				children: content(lang, entry.definition.en, entry.definition.karen)
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dictionary-card__foot",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioPlayer, {
					word: entry.word,
					label: `${entry.audioCount} recordings`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					className: "text-link",
					href: `/${lang}/dictionary/${entry.id}`,
					children: "View full entry"
				})]
			})
		]
	});
}
//#endregion
//#region components/DictionarySearch.tsx
var categories = [
	"all",
	"identity",
	"language",
	"everyday",
	"community",
	"family",
	"values"
];
function DictionarySearch({ lang, messages }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("all");
	const results = (0, import_react.useMemo)(() => {
		const needle = query.toLocaleLowerCase();
		return dictionaryEntries.filter((entry) => (category === "all" || entry.category === category) && (!needle || [
			entry.word,
			entry.romanization,
			...entry.translations,
			entry.definition.en,
			entry.definition.karen
		].join(" ").toLocaleLowerCase().includes(needle)));
	}, [query, category]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "dictionary-explorer",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "search-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					htmlFor: "dictionary-query",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: messages.searchDictionary }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "dictionary-query",
						type: "search",
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: lang === "ksw" ? "ကညီ မ့တမ့ၢ် English" : "Try “community” or ကညီ",
						autoComplete: "off"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "filter-row",
					"aria-label": "Filter by category",
					children: categories.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": category === item,
						onClick: () => setCategory(item),
						children: item
					}, item))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "result-count",
				"aria-live": "polite",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: results.length }),
					" ",
					results.length === 1 ? "entry" : "entries",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Approved S'gaw Karen records" })
				]
			}),
			results.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "dictionary-grid",
				children: results.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DictionaryEntry, {
					entry,
					lang
				}, entry.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "empty-state",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "No matching entry yet." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Try another spelling, or share the word with community reviewers." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "button button--primary",
						href: `/${lang}/contribute`,
						children: "Suggest this word"
					})
				]
			})
		]
	});
}
//#endregion
export { DictionarySearch };
