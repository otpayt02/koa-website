import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
//#region components/admin/LanguageStudio.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var localeColumns = [
	{
		locale: "th",
		label: "Thai"
	},
	{
		locale: "my",
		label: "Burmese"
	},
	{
		locale: "ksw",
		label: "S'gaw Karen"
	}
];
function LanguageStudio({ lang }) {
	const [units, setUnits] = (0, import_react.useState)([]);
	const [viewState, setViewState] = (0, import_react.useState)("loading");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [showSourceForm, setShowSourceForm] = (0, import_react.useState)(false);
	const loadUnits = (0, import_react.useCallback)(async () => {
		setViewState("loading");
		setNotice("");
		try {
			const response = await fetch("/api/admin/content-units", { headers: { accept: "application/json" } });
			if (response.status === 401 || response.status === 403) {
				setViewState("permission");
				return;
			}
			if (!response.ok) throw new Error(await responseMessage(response, "Content units could not load."));
			const data = await response.json();
			const nextUnits = Array.isArray(data.units) ? data.units : [];
			setUnits(nextUnits);
			setViewState(nextUnits.length ? "ready" : "empty");
		} catch (error) {
			setNotice(error instanceof Error ? error.message : "Content units could not load.");
			setViewState("error");
		}
	}, []);
	(0, import_react.useEffect)(() => {
		queueMicrotask(() => {
			loadUnits();
		});
	}, [loadUnits]);
	function replaceProposal(unitId, proposal) {
		setUnits((current) => current.map((unit) => unit.id === unitId ? {
			...unit,
			proposals: [proposal, ...unit.proposals.filter((item) => item.id !== proposal.id)]
		} : unit));
		setViewState("ready");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "language-studio",
		"aria-labelledby": "language-studio-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "language-studio__toolbar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Source-led review matrix"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "language-studio-title",
						children: "One English revision, three independent proposals."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Rows stay aligned by route, section, and frame so review decisions never lose their source." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "language-studio__toolbar-actions",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button button--secondary",
							type: "button",
							onClick: () => setShowSourceForm((value) => !value),
							"aria-expanded": showSourceForm,
							children: showSourceForm ? "Close source form" : "Add English source"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button button--quiet",
							type: "button",
							onClick: () => void loadUnits(),
							disabled: viewState === "loading",
							children: "Refresh"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "button button--quiet",
							href: `/${lang}/admin`,
							children: "Back to dashboard"
						})
					]
				})]
			}),
			showSourceForm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnglishSourceForm, { onSaved: () => {
				setShowSourceForm(false);
				loadUnits();
			} }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "language-studio__boundary",
				role: "note",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "S'gaw Karen review boundary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Unreviewed S'gaw Karen is not training data. Only a current, reviewer-approved proposal can be exported." })]
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "language-studio__notice",
				role: "status",
				"aria-live": "polite",
				children: notice
			}) : null,
			viewState === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioState, {
				title: "Loading content units…",
				detail: "Reading current English revisions and proposal history."
			}) : null,
			viewState === "permission" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioState, {
				title: "Permission denied",
				detail: "An administrator account is required to use Language Studio."
			}) : null,
			viewState === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioState, {
				title: "Language Studio could not load",
				detail: notice || "Check the API connection, then refresh.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button button--secondary",
					type: "button",
					onClick: () => void loadUnits(),
					children: "Try again"
				})
			}) : null,
			viewState === "empty" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioState, {
				title: "No content units yet",
				detail: "Add the first English source above. Translation proposals remain unavailable until a source revision exists.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button button--primary",
					type: "button",
					onClick: () => setShowSourceForm(true),
					children: "Add English source"
				})
			}) : null,
			viewState === "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "language-studio__table",
				role: "region",
				"aria-label": "Translation proposal matrix",
				tabIndex: 0,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "language-studio__locale-grid language-studio__locale-grid--header",
					"aria-hidden": "true",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "English source" }), localeColumns.map(({ locale, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						lang: locale,
						children: label
					}, locale))]
				}), units.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "language-studio__unit-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "language-studio__unit-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: unit.route }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							unit.section,
							" / ",
							unit.frame
						] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "language-studio__status language-studio__status--source",
							children: ["English · revision ", unit.sourceRevision]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "language-studio__locale-grid",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "language-studio__source",
							"data-locale-label": "English source",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: unit.sourceText }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "language-studio__meta",
								"aria-label": "English source provenance",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "source · en" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["revision · ", unit.sourceRevision] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["provenance · ", provenanceLabel(unit.sourceProvenance)] })
								]
							})]
						}), localeColumns.map(({ locale, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalCell, {
							unit,
							locale,
							label,
							onSaved: (proposal) => {
								replaceProposal(unit.id, proposal);
								setNotice("Proposal saved. Review status and provenance are shown in this row.");
							},
							onFailure: setNotice
						}, `${locale}:${proposalForLocale(unit, locale)?.id ?? "empty"}`))]
					})]
				}, unit.id))]
			}) : null
		]
	});
}
function ProposalCell({ unit, locale, label, onSaved, onFailure }) {
	const proposal = proposalForLocale(unit, locale);
	const [value, setValue] = (0, import_react.useState)(proposal?.value ?? "");
	const [provider, setProvider] = (0, import_react.useState)(proposal?.provider ?? "human");
	const [modelVersion, setModelVersion] = (0, import_react.useState)(proposal?.modelVersion ?? "manual");
	const [confidence, setConfidence] = (0, import_react.useState)(String(proposal?.confidence ?? 1));
	const [reviewNote, setReviewNote] = (0, import_react.useState)(proposal?.reviewNote ?? "");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function saveDraft() {
		setBusy(true);
		onFailure("");
		try {
			const response = await fetch("/api/admin/translation-proposals", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					contentUnitId: unit.id,
					sourceRevision: unit.sourceRevision,
					sourceLocale: "en",
					locale,
					value,
					provider,
					modelVersion,
					confidence: Number(confidence),
					status: "draft"
				})
			});
			if (response.status === 401 || response.status === 403) throw new Error("Permission denied. Administrator access is required.");
			if (!response.ok) throw new Error(await responseMessage(response, "Proposal could not be saved."));
			onSaved((await response.json()).proposal);
		} catch (error) {
			onFailure(error instanceof Error ? error.message : "Proposal could not be saved.");
		} finally {
			setBusy(false);
		}
	}
	async function review(status) {
		if (!proposal) return;
		setBusy(true);
		onFailure("");
		try {
			const response = await fetch("/api/admin/translation-proposals", {
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					id: proposal.id,
					status,
					reviewNote
				})
			});
			if (response.status === 401 || response.status === 403) throw new Error("Permission denied. Administrator access is required.");
			if (!response.ok) throw new Error(await responseMessage(response, "Review transition could not be saved."));
			onSaved((await response.json()).proposal);
		} catch (error) {
			onFailure(error instanceof Error ? error.message : "Review transition could not be saved.");
		} finally {
			setBusy(false);
		}
	}
	const canReview = proposal && ![
		"approved",
		"rejected",
		"superseded"
	].includes(proposal.status);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "language-studio__proposal",
		"data-locale-label": label,
		lang: locale,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "language-studio__proposal-topline",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `language-studio__status language-studio__status--${proposal?.status ?? "empty"}`,
					children: statusLabel(proposal?.status)
				}), proposal?.trainingEligible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "language-studio__status language-studio__status--eligible",
					children: "Export eligible"
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [label, " proposal"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				value,
				onChange: (event) => setValue(event.target.value),
				rows: 5,
				placeholder: `Enter ${label} proposal`
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "language-studio__provenance-fields",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Provider" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: provider,
						onChange: (event) => setProvider(event.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Model" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: modelVersion,
						onChange: (event) => setModelVersion(event.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Confidence" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						min: "0",
						max: "1",
						step: "0.01",
						value: confidence,
						onChange: (event) => setConfidence(event.target.value)
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "language-studio__meta",
				"aria-label": `${label} proposal provenance`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["provider · ", (proposal?.provider ?? provider) || "unset"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["model · ", (proposal?.modelVersion ?? modelVersion) || "unset"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["confidence · ", formatConfidence(proposal?.confidence ?? Number(confidence))] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["provenance · English r", unit.sourceRevision] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "button button--secondary language-studio__save",
				type: "button",
				onClick: () => void saveDraft(),
				disabled: busy || !value.trim(),
				children: busy ? "Saving…" : "Save draft"
			}),
			proposal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "language-studio__review",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Review note" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: reviewNote,
					onChange: (event) => setReviewNote(event.target.value),
					placeholder: "Optional decision note"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "language-studio__review-actions",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void review("approved"),
							disabled: busy || !canReview,
							children: "Approve"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void review("rejected"),
							disabled: busy || !canReview,
							children: "Reject"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void review("superseded"),
							disabled: busy || proposal.status === "superseded",
							children: "Supersede"
						})
					]
				})]
			}) : null
		]
	});
}
function EnglishSourceForm({ onSaved }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	async function submit(event) {
		event.preventDefault();
		setBusy(true);
		setMessage("");
		const form = new FormData(event.currentTarget);
		try {
			const response = await fetch("/api/admin/content-units", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					route: form.get("route"),
					section: form.get("section"),
					frame: form.get("frame"),
					sourceText: form.get("sourceText"),
					provenanceNote: form.get("provenanceNote"),
					baseRevision: Number(form.get("baseRevision")),
					sourceLocale: "en"
				})
			});
			if (response.status === 401 || response.status === 403) throw new Error("Permission denied. Administrator access is required.");
			if (!response.ok) throw new Error(await responseMessage(response, "English source could not be saved."));
			setMessage("English source revision saved.");
			onSaved();
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "English source could not be saved.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "language-studio__source-form",
		onSubmit: submit,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "language-studio__source-form-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Route" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "route",
						placeholder: "/about",
						required: true
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Section" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "section",
						placeholder: "hero",
						required: true
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Frame" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "frame",
						placeholder: "title",
						required: true
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Base revision" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "baseRevision",
						type: "number",
						min: "0",
						defaultValue: "0",
						required: true
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "English source" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				name: "sourceText",
				rows: 4,
				required: true
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Provenance note" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				name: "provenanceNote",
				placeholder: "Where this wording came from"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "language-studio__source-form-actions",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button button--primary",
					type: "submit",
					disabled: busy,
					children: busy ? "Saving…" : "Save English revision"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					role: "status",
					"aria-live": "polite",
					children: message
				})]
			})
		]
	});
}
function StudioState({ title, detail, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "language-studio__state",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: title }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: detail }),
			action
		]
	});
}
async function responseMessage(response, fallback) {
	try {
		return (await response.json()).error || fallback;
	} catch {
		return fallback;
	}
}
function statusLabel(status) {
	if (!status) return "No proposal";
	return status.replaceAll("_", " ");
}
function formatConfidence(value) {
	return typeof value === "number" && Number.isFinite(value) ? `${Math.round(value * 100)}%` : "unset";
}
function provenanceLabel(value) {
	const note = typeof value?.note === "string" ? value.note : null;
	const actor = typeof value?.authoredBy === "string" ? value.authoredBy : null;
	return note || actor || "recorded";
}
function proposalForLocale(unit, locale) {
	return unit.proposals.find((item) => item.locale === locale && item.status !== "superseded") ?? unit.proposals.find((item) => item.locale === locale);
}
//#endregion
export { LanguageStudio };
