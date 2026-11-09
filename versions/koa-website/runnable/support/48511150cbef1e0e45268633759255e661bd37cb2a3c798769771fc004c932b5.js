import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
//#region components/GrammarRuleForm.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function GrammarRuleForm({ messages }) {
	const [state, setState] = (0, import_react.useState)("idle");
	const [examples, setExamples] = (0, import_react.useState)([{
		karen: "",
		english: ""
	}]);
	async function submit(event) {
		event.preventDefault();
		setState("sending");
		const form = event.currentTarget;
		const data = Object.fromEntries(new FormData(form).entries());
		const body = {
			titleEn: data.titleEn,
			titleKaren: data.titleKaren || null,
			summary: data.summary || null,
			explanation: data.explanation,
			scope: data.scope === "none" ? null : data.scope,
			source: data.source,
			provenanceUrl: data.provenanceUrl || null,
			provenancePage: data.provenancePage || null,
			examples: examples.filter((example) => example.karen.trim() || example.english.trim()).map((example) => ({
				karen: example.karen.trim(),
				english: example.english.trim()
			}))
		};
		try {
			if (!(await fetch("/api/grammar/rules", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			})).ok) throw new Error("Request failed");
			setState("success");
			form.reset();
			setExamples([{
				karen: "",
				english: ""
			}]);
		} catch {
			setState("error");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "form-card",
		onSubmit: submit,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "form-intro",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Community grammar knowledge"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Describe a rule of S'gaw Karen as you know it." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Explain the pattern, then show it in real sentences. Reviewers check accuracy and attribution before publication." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "form-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						htmlFor: "rule-title-en",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Rule title (English)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "rule-title-en",
							name: "titleEn",
							required: true,
							maxLength: 200,
							placeholder: "e.g. Tone 3 marks completed action"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						htmlFor: "rule-title-ksw",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Rule title (Karen, optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "rule-title-ksw",
							name: "titleKaren",
							lang: "ksw",
							maxLength: 200
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						htmlFor: "rule-scope",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "What this rule governs" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							id: "rule-scope",
							name: "scope",
							defaultValue: "none",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "none",
									children: "General / not sure"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "phonology",
									children: "Sounds & phonology"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "tone",
									children: "Tone"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "syllable",
									children: "Syllable structure"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "word_order",
									children: "Word order"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "particles",
									children: "Particles"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "negation",
									children: "Negation"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "questions",
									children: "Questions"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "verbs",
									children: "Verbs"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "nouns",
									children: "Nouns"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "numerals",
									children: "Numerals"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "discourse",
									children: "Discourse / conversation"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "other",
									children: "Other"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						htmlFor: "rule-source",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Where this comes from" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							id: "rule-source",
							name: "source",
							defaultValue: "community",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "community",
									children: "My own knowledge / community"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "grammar_book",
									children: "A grammar book"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "scraped",
									children: "Another published source"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						htmlFor: "rule-prov-url",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Source URL (if not yours)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "rule-prov-url",
							name: "provenanceUrl",
							maxLength: 500
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						htmlFor: "rule-prov-page",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Source page (if a book)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "rule-prov-page",
							name: "provenancePage",
							maxLength: 160
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "field",
				htmlFor: "rule-summary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "One-line summary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "rule-summary",
					name: "summary",
					maxLength: 500,
					placeholder: "The shortest true version of this rule"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "field",
				htmlFor: "rule-explanation",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Full explanation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					id: "rule-explanation",
					name: "explanation",
					rows: 6,
					required: true,
					placeholder: "Describe when this pattern applies, what changes, and any regional variation you know…"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "form-intro",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Example sentences"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Show the rule at work. Up to ten pairs of Karen + English." })]
			}),
			examples.map((example, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "form-grid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					htmlFor: `rule-ex-ksw-${index}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Karen sentence" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: `rule-ex-ksw-${index}`,
						lang: "ksw",
						value: example.karen,
						maxLength: 500,
						onChange: (event) => setExamples((value) => value.map((item, i) => i === index ? {
							...item,
							karen: event.target.value
						} : item))
					})]
				}), examples.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-link",
					onClick: () => setExamples((value) => value.filter((_, i) => i !== index)),
					children: "Remove this example"
				}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					htmlFor: `rule-ex-en-${index}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "English translation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: `rule-ex-en-${index}`,
						value: example.english,
						maxLength: 500,
						onChange: (event) => setExamples((value) => value.map((item, i) => i === index ? {
							...item,
							english: event.target.value
						} : item))
					})]
				})]
			}, index)),
			examples.length < 10 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "button button--quiet",
				onClick: () => setExamples((value) => [...value, {
					karen: "",
					english: ""
				}]),
				children: "Add another example"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "checkbox-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "rule-rights",
					type: "checkbox",
					required: true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: "rule-rights",
					children: "I created this explanation or have permission to share it under KOA's community language license."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "button button--primary",
				type: "submit",
				disabled: state === "sending",
				children: state === "sending" ? messages.sending : messages.submit
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `form-status form-status--${state}`,
				"aria-live": "polite",
				children: state === "success" ? "Thank you — your rule is queued for community review." : state === "error" ? messages.error : ""
			})
		]
	});
}
//#endregion
export { GrammarRuleForm };
