import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
import { t as StatusPill } from "./StatusPill-CR-KwSKn.js";
//#region components/GrammarExplorer.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SCOPE_LABELS = {
	phonology: "Sounds",
	tone: "Tone",
	syllable: "Syllable",
	word_order: "Word order",
	particles: "Particles",
	negation: "Negation",
	questions: "Questions",
	verbs: "Verbs",
	nouns: "Nouns",
	numerals: "Numerals",
	discourse: "Discourse",
	other: "Other"
};
function GrammarExplorer() {
	const [rules, setRules] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(false);
	const [openId, setOpenId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const controller = new AbortController();
		fetch("/api/grammar/rules?limit=50", { signal: controller.signal }).then((response) => {
			if (!response.ok) throw new Error("Failed to load");
			return response.json();
		}).then((data) => {
			setRules(data.rules ?? []);
			setLoading(false);
		}).catch(() => {
			setError(true);
			setLoading(false);
		});
		return () => controller.abort();
	}, []);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "empty-state",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Loading approved grammar rules…" })
	});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "empty-state",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Grammar rules could not be loaded right now." })
	});
	if (!rules.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "empty-state",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "No approved rules published yet." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Grammar rules appear here after community review. Share what you know using the form below — the language's structure belongs to its speakers." })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grammar-list",
		children: rules.map((rule) => {
			const open = openId === rule.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "dictionary-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "grammar-card-toggle",
					"aria-expanded": open,
					onClick: () => setOpenId(open ? null : rule.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "dictionary-word",
							lang: "ksw",
							children: rule.titleKaren ?? rule.titleEn
						}),
						rule.titleKaren ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "romanization",
							children: rule.titleEn
						}) : null,
						rule.summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: rule.summary }) : null
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grammar-card-toggle__meta",
						children: [rule.scope ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
							tone: "blue",
							children: SCOPE_LABELS[rule.scope] ?? rule.scope
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-link",
							children: open ? "Close" : "Read rule"
						})]
					})]
				}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grammar-card-body",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: rule.explanation }),
						rule.examples.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Example sentences"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grammar-examples",
							children: rule.examples.map((example) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								example.karen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									lang: "ksw",
									className: "dictionary-word",
									children: example.karen
								}) : null,
								example.english ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: example.english }) : null,
								example.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "romanization",
									children: example.note
								}) : null
							] }, example.id))
						})] }) : null,
						rule.provenanceUrl || rule.provenancePage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "romanization",
							children: ["Source: ", rule.provenanceUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "text-link",
								href: rule.provenanceUrl,
								rel: "noreferrer",
								target: "_blank",
								children: rule.provenanceUrl
							}) : rule.provenancePage]
						}) : null
					]
				}) : null]
			}, rule.id);
		})
	});
}
//#endregion
export { GrammarExplorer };
