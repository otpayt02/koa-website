import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
import { n as publicPartners, t as partners } from "./partners-cbbpqUHj.js";
//#region components/admin/DesignStudio.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var viewports = [
	{
		id: "mobile",
		label: "390 × 844",
		width: 390,
		height: 844
	},
	{
		id: "tablet",
		label: "768 × 1024",
		width: 768,
		height: 1024
	},
	{
		id: "full",
		label: "Full width",
		width: "100%",
		height: "min(78vh, 960px)"
	}
];
var reviewTabs = [
	{
		id: "static",
		label: "Static"
	},
	{
		id: "motion",
		label: "Motion"
	},
	{
		id: "content",
		label: "Content"
	}
];
function DesignStudio({ lang, manifest }) {
	const frames = manifest.ok ? manifest.frames : [];
	const [selectedFrameId, setSelectedFrameId] = (0, import_react.useState)(frames[0]?.id ?? "");
	const [activeTab, setActiveTab] = (0, import_react.useState)("static");
	const [viewportId, setViewportId] = (0, import_react.useState)("mobile");
	const [motion, setMotion] = (0, import_react.useState)("on");
	const [previewKey, setPreviewKey] = (0, import_react.useState)(0);
	const selectedFrame = frames.find((frame) => frame.id === selectedFrameId) ?? frames[0];
	const viewport = viewports.find((candidate) => candidate.id === viewportId) ?? viewports[0];
	const previewUrl = (0, import_react.useMemo)(() => `/${lang}?koa-preview=1&motion=${motion}`, [lang, motion]);
	const draftPartners = partners.filter((partner) => !publicPartners.includes(partner));
	if (!manifest.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioState, {
		title: "Manifest could not be displayed",
		detail: "Correct the invalid frame definitions, then reload this protected workspace.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: manifest.errors.map((error) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: error }, error)) })
	});
	if (!selectedFrame) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioState, {
		title: "No valid cinematic frames",
		detail: "Add at least one validated frame to the canonical manifest before opening the preview."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "design-studio",
		"aria-labelledby": "design-studio-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "design-studio__toolbar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Frame-authored review surface"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "design-studio-title",
						children: "Read the film one deliberate beat at a time."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The rail follows the public story. The preview is the real localized application, never a second studio runtime." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "design-studio__toolbar-actions",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button button--secondary",
							type: "button",
							onClick: () => setPreviewKey((value) => value + 1),
							children: "Reload"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "button button--secondary",
							href: previewUrl,
							target: "_blank",
							rel: "noreferrer",
							children: "Open Full Page"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "button button--quiet",
							href: `/${lang}/admin`,
							children: "Back to dashboard"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "design-studio__controls",
				"aria-label": "Preview controls",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlGroup, {
						label: "Preview viewport",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "design-studio__button-group",
							role: "group",
							"aria-label": "Preview viewport",
							children: viewports.map((candidate) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": candidate.id === viewportId,
								onClick: () => setViewportId(candidate.id),
								children: candidate.label
							}, candidate.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlGroup, {
						label: "Motion",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "design-studio__button-group",
							role: "group",
							"aria-label": "Motion setting",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": motion === "on",
								onClick: () => setMotion("on"),
								children: "Motion on"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": motion === "off",
								onClick: () => setMotion("off"),
								children: "Motion off"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "design-studio__preview-source",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Preview source" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: previewUrl })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "design-studio__partner-review",
				"aria-labelledby": "design-studio-partner-title",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Draft / empty state" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					id: "design-studio-partner-title",
					children: "Partner review"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
					publicPartners.length,
					" public · ",
					draftPartners.length,
					" draft"
				] })] }), partners.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "design-studio__partner-empty",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No partner records are ready for public display." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Add a draft only after a verified relationship source and approved logo-use permission can be recorded." })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: draftPartners.map((partner) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: partner.name }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Relationship: ", partner.relationshipStatus] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Logo permission: ", partner.logoPermission] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Review: ", partner.reviewStatus] })
				] }, partner.id)) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "design-studio__workspace",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "design-studio__frame-rail",
						"aria-label": "Chronological frame rail",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "design-studio__rail-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Chronological frame rail" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [frames.length, " beats"] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							role: "tablist",
							"aria-orientation": "vertical",
							children: frames.map((frame, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "tab",
								"aria-selected": frame.id === selectedFrame.id,
								"aria-controls": "design-studio-frame-inspector",
								"aria-current": frame.id === selectedFrame.id ? "step" : void 0,
								onClick: () => setSelectedFrameId(frame.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "design-studio__frame-index",
									children: String(index + 1).padStart(2, "0")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: frame.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
									formatProgress(frame.entry.progress),
									"–",
									formatProgress(frame.exit.progress)
								] })] })]
							}) }, frame.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "design-studio-frame-inspector",
						className: "design-studio__inspector",
						"aria-labelledby": "selected-frame-title",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
								className: "design-studio__frame-heading",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedFrame.id }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									id: "selected-frame-title",
									children: selectedFrame.title
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									formatProgress(selectedFrame.entry.progress),
									" → ",
									formatProgress(selectedFrame.exit.progress)
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "design-studio__tabs",
								role: "tablist",
								"aria-label": "Frame review mode",
								children: reviewTabs.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									id: `design-studio-tab-${tab.id}`,
									type: "button",
									role: "tab",
									"aria-selected": activeTab === tab.id,
									"aria-controls": `design-studio-panel-${tab.id}`,
									onClick: () => setActiveTab(tab.id),
									children: tab.label
								}, tab.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								id: `design-studio-panel-${activeTab}`,
								className: "design-studio__tab-panel",
								role: "tabpanel",
								"aria-labelledby": `design-studio-tab-${activeTab}`,
								children: [
									activeTab === "static" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaticReview, { frame: selectedFrame }) : null,
									activeTab === "motion" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionReview, { frame: selectedFrame }) : null,
									activeTab === "content" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentReview, {
										frame: selectedFrame,
										cookbook: manifest.cookbook
									}) : null
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "design-studio__preview",
						"aria-labelledby": "preview-title",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Real-app preview" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							id: "preview-title",
							children: viewport.label
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: motion === "on" ? "Motion on" : "Motion off" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "design-studio__preview-canvas",
							"data-viewport": viewport.id,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
								src: previewUrl,
								title: `KOA ${lang} public home preview at ${viewport.label}`,
								style: {
									width: viewport.width,
									height: viewport.height
								}
							}, previewKey)
						})]
					})
				]
			})
		]
	});
}
function StaticReview({ frame }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "design-studio__review-grid",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureList, {
				title: "Foreground",
				items: frame.foreground
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureList, {
				title: "Background",
				items: frame.background
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureList, {
				title: "Settled composition",
				items: frame.staticFeatures
			})
		]
	});
}
function MotionReview({ frame }) {
	const tunables = Object.entries(frame.tunables);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "design-studio__motion-review",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureList, {
				title: "Authored motion",
				items: frame.motionFeatures
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureList, {
				title: `Motion off · ${frame.motionOff.summary}`,
				items: frame.motionOff.result
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "design-studio__tunables",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Safe tunables" }), tunables.length ? tunables.map(([name, tunable]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: humanize(name) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						tunable.value,
						" ",
						tunable.unit
					] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meter", {
						min: tunable.min,
						max: tunable.max,
						value: tunable.value,
						children: tunable.value
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: tunable.description }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
						"Safe range ",
						tunable.min,
						"–",
						tunable.max,
						" ",
						tunable.unit,
						" · reference weight ",
						tunable.referenceWeight
					] })
				] }, name)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No motion tunables are documented for this frame." })]
			})
		]
	});
}
function ContentReview({ frame, cookbook }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "design-studio__content-review",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Story purpose" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: frame.why })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Locale coverage" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: frame.locales.join(" · ") })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureList, {
				title: "Evidence references",
				items: frame.evidence
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "design-studio__cookbook",
				children: [
					"Long-form choreography stays in ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: cookbook }),
					"."
				]
			})
		]
	});
}
function FeatureList({ title, items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "design-studio__feature-list",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: title }), items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item)) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No authored features are recorded." })]
	});
}
function ControlGroup({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "design-studio__control-group",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), children]
	});
}
function StudioState({ title, detail, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "design-studio design-studio__state",
		role: "alert",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Design Studio unavailable"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: title }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: detail }),
			children
		]
	});
}
function formatProgress(progress) {
	return `${Math.round(progress * 100)}%`;
}
function humanize(value) {
	return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
}
//#endregion
export { DesignStudio };
