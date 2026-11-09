import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
//#region components/SentenceHighlightTool.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function SentenceHighlightTool() {
	const [text, setText] = (0, import_react.useState)("");
	const [annotations, setAnnotations] = (0, import_react.useState)([]);
	const [approvedRules, setApprovedRules] = (0, import_react.useState)([]);
	const [active, setActive] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [fetchError, setFetchError] = (0, import_react.useState)(false);
	const textareaRef = (0, import_react.useRef)(null);
	const [selection, setSelection] = (0, import_react.useState)(null);
	const [ruleId, setRuleId] = (0, import_react.useState)("");
	const [submitState, setSubmitState] = (0, import_react.useState)("idle");
	(0, import_react.useEffect)(() => {
		fetch("/api/grammar/rules?limit=50").then((response) => response.ok ? response.json() : { rules: [] }).then((data) => setApprovedRules(data.rules ?? [])).catch(() => setApprovedRules([]));
	}, []);
	(0, import_react.useEffect)(() => {
		const trimmed = text.trim();
		if (trimmed.length < 2) {
			setAnnotations([]);
			setActive(null);
			return;
		}
		setLoading(true);
		setFetchError(false);
		const controller = new AbortController();
		const timer = setTimeout(() => {
			fetch(`/api/grammar/annotations?text=${encodeURIComponent(trimmed)}`, { signal: controller.signal }).then((response) => {
				if (!response.ok) throw new Error("Failed");
				return response.json();
			}).then((data) => {
				const rows = data.annotations ?? [];
				setAnnotations(rows);
				setActive(rows[0] ?? null);
				setLoading(false);
			}).catch(() => {
				setFetchError(true);
				setLoading(false);
			});
		}, 350);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [text]);
	const segments = (0, import_react.useMemo)(() => {
		const trimmed = text.trim();
		if (!trimmed) return [];
		const boundaries = new Set([0, trimmed.length]);
		for (const annotation of annotations) {
			boundaries.add(Math.max(0, Math.min(annotation.startOffset, trimmed.length)));
			boundaries.add(Math.max(0, Math.min(annotation.endOffset, trimmed.length)));
		}
		const points = [...boundaries].sort((a, b) => a - b);
		const result = [];
		for (let i = 0; i < points.length - 1; i += 1) {
			const [start, end] = [points[i], points[i + 1]];
			if (end <= start) continue;
			const covering = annotations.filter((annotation) => annotation.startOffset <= start && annotation.endOffset >= end).sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
			result.push({
				text: trimmed.slice(start, end),
				annotation: covering[0] ?? null
			});
		}
		return result;
	}, [text, annotations]);
	function captureSelection() {
		const el = textareaRef.current;
		if (!el) return;
		const start = el.selectionStart ?? 0;
		const end = el.selectionEnd ?? 0;
		setSelection(end > start ? {
			start,
			end
		} : null);
		setSubmitState("idle");
	}
	async function submitAnnotation() {
		const el = textareaRef.current;
		if (!el || !selection || !ruleId) return;
		setSubmitState("sending");
		try {
			const response = await fetch("/api/grammar/annotations", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					karenText: el.value.trim(),
					startOffset: selection.start,
					endOffset: selection.end,
					ruleId,
					source: "member"
				})
			});
			if (response.status === 401) {
				setSubmitState("auth");
				return;
			}
			if (!response.ok) throw new Error("Failed");
			setSubmitState("success");
			setSelection(null);
		} catch {
			setSubmitState("error");
		}
	}
	const selectedText = selection && textareaRef.current ? text.slice(selection.start, selection.end) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "highlight-tool",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "field",
				htmlFor: "highlight-sentence",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Karen sentence" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					id: "highlight-sentence",
					ref: textareaRef,
					rows: 2,
					lang: "ksw",
					placeholder: "ဘၣ်လၢ်အိၣ်ယွၤဒိၣ်…",
					value: text,
					maxLength: 2e3,
					onChange: (event) => setText(event.target.value),
					onSelect: captureSelection
				})]
			}),
			segments.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "highlight-render",
				"aria-label": "Sentence with grammar highlights",
				children: segments.map((segment, index) => segment.annotation && segment.annotation.rule ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "highlight-span",
					"data-active": active?.id === segment.annotation.id || void 0,
					onMouseEnter: () => setActive(segment.annotation),
					onFocus: () => setActive(segment.annotation),
					onClick: () => setActive(segment.annotation),
					tabIndex: 0,
					role: "button",
					"aria-label": `Grammar rule: ${segment.annotation.rule.titleEn}`,
					children: segment.text
				}, index) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: segment.text }, index))
			}) : text.trim().length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "romanization",
				children: loading ? "Looking up annotations…" : fetchError ? "Annotations could not be loaded." : "No verified grammar annotations for this sentence yet."
			}) : null,
			active?.rule ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "rule-popover",
				"aria-live": "polite",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: active.source === "agent" ? `Agent proposal · ${Math.round((active.confidence ?? 0) * 100)}% confidence` : "Verified by community"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: active.rule.titleKaren ?? active.rule.titleEn }),
					active.rule.titleKaren ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "romanization",
						children: active.rule.titleEn
					}) : null,
					active.rule.summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: active.rule.summary }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: active.rule.explanation })
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "highlight-attach",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Know a rule this span follows?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "form-grid",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							htmlFor: "highlight-rule",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Governing rule" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								id: "highlight-rule",
								value: ruleId,
								onChange: (event) => setRuleId(event.target.value),
								disabled: !selection,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: selection ? "Choose a rule…" : "Select text in the sentence first"
								}), approvedRules.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: rule.id,
									children: rule.titleKaren ?? rule.titleEn
								}, rule.id))]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "field",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Selected text" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "dictionary-word",
									lang: "ksw",
									children: selectedText || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "button button--primary",
									disabled: !selection || !ruleId || submitState === "sending",
									onClick: submitAnnotation,
									children: submitState === "sending" ? "Saving…" : "Attach rule"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `form-status form-status--${submitState === "auth" ? "error" : submitState}`,
						"aria-live": "polite",
						children: submitState === "success" ? "Submitted — a verifier will review this annotation." : submitState === "auth" ? "Sign in to attach grammar annotations." : submitState === "error" ? "Something went wrong — please try again." : ""
					})
				]
			})
		]
	});
}
//#endregion
export { SentenceHighlightTool };
