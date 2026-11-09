import { T as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
//#region components/TranslationStudio.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var statusLabels = {
	all: "All entries",
	missing: "Missing Karen",
	draft: "Draft",
	unverified: "Unverified",
	verified: "Verified",
	session: "Changed this session"
};
function TranslationStudio({ lang }) {
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [savingKey, setSavingKey] = (0, import_react.useState)(null);
	const [editingKey, setEditingKey] = (0, import_react.useState)(null);
	const [drafts, setDrafts] = (0, import_react.useState)({});
	const [sessionKeys, setSessionKeys] = (0, import_react.useState)([]);
	const [route, setRoute] = (0, import_react.useState)("*");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const [showPublish, setShowPublish] = (0, import_react.useState)(false);
	const [importChanges, setImportChanges] = (0, import_react.useState)([]);
	const cardRefs = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const previewRef = (0, import_react.useRef)(null);
	async function load() {
		setLoading(true);
		setError("");
		try {
			const response = await fetch("/api/admin/translations", { cache: "no-store" });
			const payload = await response.json();
			if (!response.ok) throw new Error(payload.error || "Could not load the Translation Studio");
			setData(payload);
		} catch (loadError) {
			setError(loadError instanceof Error ? loadError.message : "Could not load the Translation Studio");
		} finally {
			setLoading(false);
		}
	}
	(0, import_react.useEffect)(() => {
		const timer = window.setTimeout(() => {
			load();
		}, 0);
		return () => window.clearTimeout(timer);
	}, []);
	const routes = (0, import_react.useMemo)(() => {
		if (!data) return [];
		return Array.from(new Set(data.entries.map((entry) => entry.route))).sort((a, b) => a.localeCompare(b));
	}, [data]);
	const visibleEntries = (0, import_react.useMemo)(() => {
		if (!data) return [];
		const needle = query.trim().toLocaleLowerCase();
		return data.entries.filter((entry) => {
			if (route !== "*" && entry.route !== route) return false;
			if (filter === "session" && !sessionKeys.includes(entry.key)) return false;
			if (filter !== "all" && filter !== "session" && entry.status !== filter) return false;
			return !needle || [
				entry.key,
				entry.section,
				entry.enState.value,
				entry.karenState.value
			].join(" ").toLocaleLowerCase().includes(needle);
		});
	}, [
		data,
		filter,
		query,
		route,
		sessionKeys
	]);
	const progress = (0, import_react.useMemo)(() => {
		if (!data?.entries.length) return 0;
		return Math.round(data.entries.filter((entry) => entry.karenState.value.trim()).length / data.entries.length * 100);
	}, [data]);
	const previewValues = (0, import_react.useMemo)(() => {
		if (!data) return {};
		return Object.fromEntries(data.entries.map((entry) => {
			const values = drafts[entry.key] ?? {
				en: entry.enState.value,
				karen: entry.karenState.value
			};
			return [entry.key, lang === "karen" ? values.karen || values.en : values.en];
		}));
	}, [
		data,
		drafts,
		lang
	]);
	(0, import_react.useEffect)(() => {
		const timer = window.setTimeout(() => {
			previewRef.current?.contentWindow?.postMessage({
				type: "koa-translation-preview",
				values: previewValues
			}, window.location.origin);
		}, 0);
		return () => window.clearTimeout(timer);
	}, [previewValues, route]);
	const updatePreview = () => {
		previewRef.current?.contentWindow?.postMessage({
			type: "koa-translation-preview",
			values: previewValues
		}, window.location.origin);
	};
	function openEntry(entry) {
		setDrafts((current) => ({
			...current,
			[entry.key]: current[entry.key] ?? {
				en: entry.enState.value,
				karen: entry.karenState.value
			}
		}));
		setEditingKey(entry.key);
		setError("");
	}
	function cancelEntry(entry) {
		setDrafts((current) => ({
			...current,
			[entry.key]: {
				en: entry.enState.value,
				karen: entry.karenState.value
			}
		}));
		setEditingKey(null);
	}
	async function saveEntry(entry, direction = 0, imported = false, values) {
		const nextValues = values ?? drafts[entry.key] ?? {
			en: entry.enState.value,
			karen: entry.karenState.value
		};
		setSavingKey(entry.key);
		setError("");
		try {
			const response = await fetch("/api/admin/translations", {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					key: entry.key,
					en: nextValues.en,
					karen: nextValues.karen,
					expected: {
						en: entry.enState.revisionId,
						karen: entry.karenState.revisionId
					},
					imported
				})
			});
			const payload = await response.json();
			if (!response.ok || !payload.entry) throw new Error(payload.error || "The entry could not be saved");
			setData((current) => current ? {
				...current,
				entries: current.entries.map((item) => item.key === entry.key ? payload.entry : item)
			} : current);
			setDrafts((current) => ({
				...current,
				[entry.key]: {
					en: payload.entry.enState.value,
					karen: payload.entry.karenState.value
				}
			}));
			setSessionKeys((current) => current.includes(entry.key) ? current : [...current, entry.key]);
			setEditingKey(null);
			setNotice(`${entry.key} saved and locked.`);
			moveFocus(entry.key, direction);
			return payload.entry;
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : "The entry could not be saved");
			return null;
		} finally {
			setSavingKey(null);
		}
	}
	function moveFocus(key, direction) {
		if (!direction) return;
		requestAnimationFrame(() => {
			const target = visibleEntries[visibleEntries.findIndex((entry) => entry.key === key) + direction];
			if (target) cardRefs.current.get(target.key)?.focus();
		});
	}
	function editorKeyDown(event, entry) {
		if (event.key === "Tab") {
			event.preventDefault();
			saveEntry(entry, event.shiftKey ? -1 : 1);
		} else if (event.key === "Escape") {
			event.preventDefault();
			cancelEntry(entry);
		}
	}
	async function publishSession() {
		if (!data) return;
		const selected = data.entries.filter((entry) => sessionKeys.includes(entry.key));
		if (!selected.length) return;
		setError("");
		try {
			const response = await fetch("/api/admin/translations", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					action: "publish",
					entries: selected.map((entry) => ({
						key: entry.key,
						enRevisionId: entry.enState.revisionId,
						karenRevisionId: entry.karenState.revisionId
					}))
				})
			});
			const payload = await response.json();
			if (!response.ok) throw new Error(payload.error || "The session could not be published");
			setNotice(`${payload.published ?? selected.length} bilingual entries verified and published.`);
			setSessionKeys([]);
			setShowPublish(false);
			await load();
		} catch (publishError) {
			setError(publishError instanceof Error ? publishError.message : "The session could not be published");
		}
	}
	async function downloadExport(kind) {
		setError("");
		try {
			const response = await fetch(`/api/admin/translations?export=${kind}`);
			if (!response.ok) {
				const payload = await response.json();
				throw new Error(payload.error || "The export could not be created");
			}
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = kind === "backup" ? "koa-bilingual-backup.json" : "koa-verified-en-ksw-corpus.jsonl";
			anchor.click();
			URL.revokeObjectURL(url);
		} catch (exportError) {
			setError(exportError instanceof Error ? exportError.message : "The export could not be created");
		}
	}
	async function previewImport(event) {
		const file = event.target.files?.[0];
		if (!file || !data) return;
		setError("");
		try {
			const backup = JSON.parse(await file.text());
			if (backup.format !== "koa-bilingual-backup" || !Array.isArray(backup.revisions)) throw new Error("Choose a KOA bilingual backup JSON file");
			const latest = /* @__PURE__ */ new Map();
			for (const revision of backup.revisions) {
				const pair = latest.get(revision.contentKey) ?? {};
				const current = pair[revision.language];
				if (!current || revision.version > current.version) pair[revision.language] = {
					value: revision.value,
					version: revision.version
				};
				latest.set(revision.contentKey, pair);
			}
			const changes = [];
			for (const entry of data.entries) {
				const imported = latest.get(entry.key);
				if (!imported) continue;
				const en = imported.en?.value ?? entry.enState.value;
				const karen = imported.karen?.value ?? entry.karenState.value;
				if (en !== entry.enState.value || karen !== entry.karenState.value) changes.push({
					key: entry.key,
					en,
					karen
				});
			}
			setImportChanges(changes);
			setNotice(changes.length ? `Review ${changes.length} imported differences before applying them.` : "The backup matches the current entries.");
		} catch (importError) {
			setError(importError instanceof Error ? importError.message : "The backup could not be read");
		} finally {
			event.target.value = "";
		}
	}
	async function applyImport() {
		if (!data) return;
		for (const change of importChanges) {
			const entry = data.entries.find((item) => item.key === change.key);
			if (!entry) continue;
			if (!await saveEntry(entry, 0, true, {
				en: change.en,
				karen: change.karen
			})) return;
		}
		setImportChanges([]);
		setNotice("Imported differences saved as unverified drafts.");
		await load();
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "translation-studio translation-studio--loading",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Loading the private Translation Studio…" })
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "translation-studio translation-studio--loading",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Translation Studio unavailable" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: error }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "button button--secondary",
				type: "button",
				onClick: () => void load(),
				children: "Try again"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "translation-studio",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "studio-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Private beta · Administrator only"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "KOA Bilingual Translation Studio" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"English and ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							lang: "ksw",
							children: "ကညီကျိာ်"
						}),
						" counterparts · signed in as ",
						data.user.displayName
					] })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "studio-header__actions",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "button button--quiet",
							href: `/${lang}`,
							children: "Open website"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button button--quiet",
							type: "button",
							onClick: () => void downloadExport("backup"),
							children: "Export backup"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button button--quiet",
							type: "button",
							onClick: () => void downloadExport("corpus"),
							children: "Export clean corpus"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "button button--quiet studio-import",
							children: ["Import backup", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "application/json,.json",
								onChange: previewImport
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "button button--primary",
							type: "button",
							disabled: !sessionKeys.length,
							onClick: () => setShowPublish(true),
							children: [
								"Review & publish (",
								sessionKeys.length,
								")"
							]
						})
					]
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "studio-banner studio-banner--error",
				role: "alert",
				children: error
			}) : null,
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "studio-banner",
				"aria-live": "polite",
				children: notice
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "studio-progress",
				"aria-label": `${progress}% of Karen counterparts filled`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${progress}%` } }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [progress, "% filled"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [data.entries.length, " content units"] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "studio-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "studio-sidebar",
						"aria-label": "Translation pages and filters",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "studio-search",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Search entries" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "search",
									value: query,
									onChange: (event) => setQuery(event.target.value),
									placeholder: "Key, English, or Karen"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Pages" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": route === "*",
								onClick: () => setRoute("*"),
								children: "All pages"
							}),
							routes.filter((item) => item !== "*").map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": route === item,
								onClick: () => setRoute(item),
								children: item === "/" ? "Home" : item
							}, item)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Status" }),
							Object.keys(statusLabels).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": filter === item,
								onClick: () => setFilter(item),
								children: statusLabels[item]
							}, item))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "studio-entries",
						"aria-label": "Bilingual content entries",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "studio-entries__heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: route === "*" ? "All pages" : route
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [visibleEntries.length, " bilingual entries"] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Tab saves, locks, and advances. Enter adds a new line. Escape cancels." })]
						}), visibleEntries.map((entry) => {
							const editing = editingKey === entry.key;
							const values = drafts[entry.key] ?? {
								en: entry.enState.value,
								karen: entry.karenState.value
							};
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "studio-entry",
								"data-status": entry.status,
								"data-studio-card": entry.key,
								tabIndex: editing ? -1 : 0,
								ref: (node) => {
									if (node) cardRefs.current.set(entry.key, node);
									else cardRefs.current.delete(entry.key);
								},
								onDoubleClick: () => openEntry(entry),
								onKeyDown: (event) => {
									if (!editing && event.key === "Enter") {
										event.preventDefault();
										openEntry(entry);
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "studio-status",
									children: statusLabels[entry.status]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: entry.key })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
									entry.section,
									" · ",
									entry.type
								] }), !editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "studio-edit",
									onClick: () => openEntry(entry),
									children: "Edit"
								}) : null] })] }), editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "studio-pair studio-pair--editing",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "English" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											lang: "en",
											autoFocus: true,
											value: values.en,
											onChange: (event) => setDrafts((current) => ({
												...current,
												[entry.key]: {
													...values,
													en: event.target.value
												}
											})),
											onKeyDown: (event) => editorKeyDown(event, entry)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											lang: "ksw",
											children: "ကညီကျိာ်"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											lang: "ksw",
											value: values.karen,
											placeholder: "Enter the S'gaw Karen counterpart",
											onChange: (event) => setDrafts((current) => ({
												...current,
												[entry.key]: {
													...values,
													karen: event.target.value
												}
											})),
											onKeyDown: (event) => editorKeyDown(event, entry)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "studio-entry__actions",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "button button--primary",
												type: "button",
												disabled: savingKey === entry.key,
												onClick: () => void saveEntry(entry, 1),
												children: savingKey === entry.key ? "Saving…" : "Save & next"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "button button--quiet",
												type: "button",
												onClick: () => cancelEntry(entry),
												children: "Cancel"
											})]
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "studio-pair",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "English" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										lang: "en",
										children: entry.enState.value
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										lang: "ksw",
										children: "ကညီကျိာ်"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										lang: "ksw",
										"data-empty": !entry.karenState.value,
										children: entry.karenState.value || "Empty — readers receive the English fallback"
									})] })]
								})]
							}, entry.key);
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "studio-preview",
						"aria-label": "Live draft page preview",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Live draft preview"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `/${lang}${route === "*" || route === "/" ? "" : route}`,
							target: "_blank",
							rel: "noreferrer",
							children: "Open published page"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
							ref: previewRef,
							title: "Live draft website preview",
							src: `/${lang}${route === "*" || route === "/" ? "" : route}`,
							onLoad: updatePreview
						})]
					})
				]
			}),
			showPublish ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "studio-modal",
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": "publish-title",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Verify & publish session"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						id: "publish-title",
						children: [
							"Review ",
							sessionKeys.length,
							" changed entries"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "These paired revisions will become public together. If validation or conflict checking fails for one entry, none publish." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: data.entries.filter((entry) => sessionKeys.includes(entry.key)).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: entry.key }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							entry.enState.publishedValue ?? "No published English",
							" → ",
							entry.enState.value
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							lang: "ksw",
							children: [
								entry.karenState.publishedValue ?? "No published Karen",
								" → ",
								entry.karenState.value || "Missing"
							]
						})
					] }, entry.key)) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "button-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button button--primary",
							type: "button",
							onClick: () => void publishSession(),
							children: "Verify & publish session"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button button--quiet",
							type: "button",
							onClick: () => setShowPublish(false),
							children: "Keep editing"
						})]
					})
				] })
			}) : null,
			importChanges.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "studio-modal",
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": "import-title",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Import comparison"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						id: "import-title",
						children: [
							"Review ",
							importChanges.length,
							" differences"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Importing saves unverified drafts. It never silently publishes or overwrites work without this confirmation." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: importChanges.slice(0, 50).map((change) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: change.key }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: change.en }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							lang: "ksw",
							children: change.karen || "Missing Karen"
						})
					] }, change.key)) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "button-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button button--primary",
							type: "button",
							onClick: () => void applyImport(),
							children: "Import as drafts"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button button--quiet",
							type: "button",
							onClick: () => setImportChanges([]),
							children: "Cancel import"
						})]
					})
				] })
			}) : null
		]
	});
}
//#endregion
export { TranslationStudio };
