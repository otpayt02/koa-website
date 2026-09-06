import { C as stripBasePath, T as __toESM, b as require_react, t as require_jsx_runtime, u as ReadonlyURLSearchParams } from "../index.js";
import { t as Link } from "./link-DiLTuv2w.js";
//#region node_modules/vinext/dist/shims/navigation.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var _SERVER_INSERTED_HTML_CTX_KEY = Symbol.for("vinext.serverInsertedHTMLContext");
function getServerInsertedHTMLContext() {
	if (typeof import_react.createContext !== "function") return null;
	const globalState = globalThis;
	if (!globalState[_SERVER_INSERTED_HTML_CTX_KEY]) globalState[_SERVER_INSERTED_HTML_CTX_KEY] = import_react.createContext(null);
	return globalState[_SERVER_INSERTED_HTML_CTX_KEY] ?? null;
}
getServerInsertedHTMLContext();
var _GLOBAL_ACCESSORS_KEY = Symbol.for("vinext.navigation.globalAccessors");
var _GLOBAL_HYDRATION_CONTEXT_KEY = Symbol.for("vinext.navigation.clientHydrationContext");
function _getGlobalAccessors() {
	return globalThis[_GLOBAL_ACCESSORS_KEY];
}
function _getClientHydrationContext() {
	const globalState = globalThis;
	if (Object.prototype.hasOwnProperty.call(globalState, _GLOBAL_HYDRATION_CONTEXT_KEY)) return globalState[_GLOBAL_HYDRATION_CONTEXT_KEY] ?? null;
}
var _serverContext = null;
var _getServerContext = () => {
	if (typeof window !== "undefined") {
		const hydrationContext = _getClientHydrationContext();
		return hydrationContext !== void 0 ? hydrationContext : _serverContext;
	}
	const g = _getGlobalAccessors();
	return g ? g.getServerContext() : _serverContext;
};
var isServer = typeof window === "undefined";
var _CLIENT_NAV_STATE_KEY = Symbol.for("vinext.clientNavigationState");
function getClientNavigationState() {
	if (isServer) return null;
	const globalState = window;
	globalState[_CLIENT_NAV_STATE_KEY] ??= {
		listeners: /* @__PURE__ */ new Set(),
		cachedSearch: window.location.search,
		cachedReadonlySearchParams: new ReadonlyURLSearchParams(window.location.search),
		cachedPathname: stripBasePath(window.location.pathname, ""),
		clientParams: {},
		clientParamsJson: "{}",
		pendingClientParams: null,
		pendingClientParamsJson: null,
		pendingPathname: null,
		pendingPathnameNavId: null,
		originalPushState: window.history.pushState.bind(window.history),
		originalReplaceState: window.history.replaceState.bind(window.history),
		patchInstalled: false,
		hasPendingNavigationUpdate: false,
		suppressUrlNotifyCount: 0,
		navigationSnapshotActiveCount: 0
	};
	return globalState[_CLIENT_NAV_STATE_KEY];
}
function notifyNavigationListeners() {
	const state = getClientNavigationState();
	if (!state) return;
	for (const fn of state.listeners) fn();
}
/**
* Get cached pathname snapshot for useSyncExternalStore.
* Note: Returns cached value from ClientNavigationState, not live window.location.
* The cache is updated by syncCommittedUrlStateFromLocation() after navigation commits.
* This ensures referential stability and prevents infinite re-renders.
* External pushState/replaceState while URL notifications are suppressed won't
* be visible until the next commit.
*/
function getPathnameSnapshot() {
	return getClientNavigationState()?.cachedPathname ?? "/";
}
function syncCommittedUrlStateFromLocation() {
	const state = getClientNavigationState();
	if (!state) return false;
	let changed = false;
	const pathname = stripBasePath(window.location.pathname, "");
	if (pathname !== state.cachedPathname) {
		state.cachedPathname = pathname;
		changed = true;
	}
	const search = window.location.search;
	if (search !== state.cachedSearch) {
		state.cachedSearch = search;
		state.cachedReadonlySearchParams = new ReadonlyURLSearchParams(search);
		changed = true;
	}
	return changed;
}
var _CLIENT_NAV_RENDER_CTX_KEY = Symbol.for("vinext.clientNavigationRenderContext");
function getClientNavigationRenderContext() {
	if (typeof import_react.createContext !== "function") return null;
	const globalState = globalThis;
	if (!globalState[_CLIENT_NAV_RENDER_CTX_KEY]) globalState[_CLIENT_NAV_RENDER_CTX_KEY] = import_react.createContext(null);
	return globalState[_CLIENT_NAV_RENDER_CTX_KEY] ?? null;
}
function useClientNavigationRenderSnapshot() {
	const ctx = getClientNavigationRenderContext();
	if (!ctx || typeof import_react.useContext !== "function") return null;
	try {
		return import_react.useContext(ctx);
	} catch {
		return null;
	}
}
function subscribeToNavigation(cb) {
	const state = getClientNavigationState();
	if (!state) return () => {};
	state.listeners.add(cb);
	return () => {
		state.listeners.delete(cb);
	};
}
/**
* Returns the current pathname.
* Server: from request context. Client: from window.location.
*/
function usePathname() {
	if (isServer) return _getServerContext()?.pathname ?? "/";
	const renderSnapshot = useClientNavigationRenderSnapshot();
	const pathname = import_react.useSyncExternalStore(subscribeToNavigation, getPathnameSnapshot, () => _getServerContext()?.pathname ?? "/");
	if (renderSnapshot && (getClientNavigationState()?.navigationSnapshotActiveCount ?? 0) > 0) return renderSnapshot.pathname;
	return pathname;
}
/**
* Commit pending client navigation state to committed snapshots.
*
* navId is optional: callers that don't own pendingPathname (for example,
* superseded pre-paint cleanup) may pass undefined to flush URL/params state
* without clearing pendingPathname owned by the active navigation. Such callers
* must opt in explicitly if they also own an activated render snapshot.
*/
function commitClientNavigationState(navId, options) {
	if (isServer) return;
	const state = getClientNavigationState();
	if (!state) return;
	if ((navId !== void 0 || options?.releaseSnapshot === true) && state.navigationSnapshotActiveCount > 0) state.navigationSnapshotActiveCount -= 1;
	const urlChanged = syncCommittedUrlStateFromLocation();
	if (state.pendingClientParams !== null && state.pendingClientParamsJson !== null) {
		state.clientParams = state.pendingClientParams;
		state.clientParamsJson = state.pendingClientParamsJson;
		state.pendingClientParams = null;
		state.pendingClientParamsJson = null;
	}
	if (state.pendingPathnameNavId === null || navId !== void 0 && state.pendingPathnameNavId === navId) {
		state.pendingPathname = null;
		state.pendingPathnameNavId = null;
	}
	const shouldNotify = urlChanged || state.hasPendingNavigationUpdate;
	state.hasPendingNavigationUpdate = false;
	if (shouldNotify) notifyNavigationListeners();
}
/**
* Restore scroll position from a history state object (used on popstate).
*
* When an RSC navigation is in flight (back/forward triggers both this
* handler and the browser entry's popstate handler which calls
* __VINEXT_RSC_NAVIGATE__), we must wait for the new content to render
* before scrolling. Otherwise the user sees old content flash at the
* restored scroll position.
*
* This handler fires before the browser entry's popstate handler (because
* navigation.ts is loaded before hydration completes), so we defer via a
* microtask to give the browser entry handler a chance to set
* __VINEXT_RSC_PENDING__. Promise.resolve() schedules a microtask
* that runs after all synchronous event listeners have completed.
*/
function restoreScrollPosition(state) {
	if (state && typeof state === "object" && "__vinext_scrollY" in state) {
		const { __vinext_scrollX: x, __vinext_scrollY: y } = state;
		Promise.resolve().then(() => {
			const pending = window.__VINEXT_RSC_PENDING__ ?? null;
			if (pending) pending.then(() => {
				requestAnimationFrame(() => {
					window.scrollTo(x, y);
				});
			});
			else requestAnimationFrame(() => {
				window.scrollTo(x, y);
			});
		});
	}
}
if (!isServer) {
	const state = getClientNavigationState();
	if (state && !state.patchInstalled) {
		state.patchInstalled = true;
		window.addEventListener("popstate", (event) => {
			if (typeof window.__VINEXT_RSC_NAVIGATE__ !== "function") {
				commitClientNavigationState();
				restoreScrollPosition(event.state);
			}
		});
		window.history.pushState = function patchedPushState(data, unused, url) {
			state.originalPushState.call(window.history, data, unused, url);
			if (state.suppressUrlNotifyCount === 0) commitClientNavigationState();
		};
		window.history.replaceState = function patchedReplaceState(data, unused, url) {
			state.originalReplaceState.call(window.history, data, unused, url);
			if (state.suppressUrlNotifyCount === 0) commitClientNavigationState();
		};
	}
}
//#endregion
//#region components/i18n.ts
var languages = [
	"en",
	"th",
	"my",
	"ksw"
];
var localeMeta = {
	en: {
		label: "English",
		nativeLabel: "English",
		htmlLang: "en"
	},
	th: {
		label: "Thai",
		nativeLabel: "ไทย",
		htmlLang: "th"
	},
	my: {
		label: "Burmese",
		nativeLabel: "မြန်မာ",
		htmlLang: "my"
	},
	ksw: {
		label: "S'gaw Karen",
		nativeLabel: "ကညီ",
		htmlLang: "ksw"
	}
};
//#endregion
//#region components/LanguageToggle.tsx
var import_jsx_runtime = require_jsx_runtime();
function LanguageToggle({ lang, messages }) {
	const pathname = usePathname();
	const localePrefix = new RegExp(`^/(${languages.join("|")})(?=/|$)`);
	const pathFor = (locale) => localePrefix.test(pathname) ? pathname.replace(localePrefix, `/${locale}`) : `/${locale}${pathname === "/" ? "" : pathname}`;
	(0, import_react.useEffect)(() => {
		localStorage.setItem("koa-language", lang);
		document.cookie = `koa-language=${lang}; path=/; max-age=31536000; samesite=lax`;
		document.documentElement.lang = localeMeta[lang].htmlLang;
	}, [lang]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "language-toggle",
		"aria-label": messages.language,
		children: languages.map((locale) => {
			const meta = localeMeta[locale];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				href: pathFor(locale),
				hrefLang: meta.htmlLang,
				lang: meta.htmlLang,
				"aria-current": locale === lang ? "page" : void 0,
				"aria-label": `${messages.language}: ${meta.label}`,
				children: meta.nativeLabel
			}, locale);
		})
	});
}
//#endregion
//#region components/Header.tsx
var navCategories = [
	{
		label: "Language + AI",
		slug: "language-ai",
		items: [
			{
				slug: "mango",
				label: "S'gaw Mango"
			},
			{
				slug: "translate",
				label: "Translate"
			},
			{
				slug: "tutor",
				label: "Tutor"
			},
			{
				slug: "dictionary",
				label: "Dictionary"
			},
			{ isDivider: true },
			{
				slug: "ocr",
				label: "OCR"
			},
			{
				slug: "vision",
				label: "Vision"
			},
			{
				slug: "corpus",
				label: "Corpus Discovery"
			}
		]
	},
	{
		label: "Community Knowledge",
		slug: "community-knowledge",
		items: [
			{
				slug: "contributions",
				label: "Contributions"
			},
			{
				slug: "voices",
				label: "Voices"
			},
			{
				slug: "translation",
				label: "Translation"
			},
			{
				slug: "verification",
				label: "Verification"
			},
			{
				slug: "provenance",
				label: "Provenance"
			}
		]
	},
	{
		label: "National Community",
		slug: "national-community",
		items: [
			{
				slug: "churches",
				label: "Churches"
			},
			{
				slug: "businesses",
				label: "Businesses"
			},
			{
				slug: "restaurants",
				label: "Restaurants"
			},
			{
				slug: "organizations",
				label: "Organizations"
			},
			{
				slug: "resources",
				label: "Resources"
			}
		]
	},
	{
		label: "Culture",
		slug: "culture",
		items: [
			{
				slug: "podcast",
				label: "Podcast"
			},
			{
				slug: "music",
				label: "Music"
			},
			{
				slug: "recipes",
				label: "Recipes"
			},
			{
				slug: "stories",
				label: "Stories"
			}
		]
	},
	{
		label: "Events",
		slug: "events",
		items: [
			{
				slug: "sepak-takraw",
				label: "Sepak Takraw"
			},
			{
				slug: "soccer",
				label: "Soccer"
			},
			{
				slug: "volleyball",
				label: "Volleyball"
			},
			{
				slug: "community-events",
				label: "Community Events"
			}
		]
	},
	{
		label: "History + Resources",
		slug: "history-resources",
		items: [
			{
				slug: "karen-history",
				label: "Karen History"
			},
			{
				slug: "koa-history",
				label: "KOA History"
			},
			{
				slug: "advocacy",
				label: "Advocacy"
			},
			{
				slug: "news",
				label: "News"
			},
			{
				slug: "practical-resources",
				label: "Practical Resources"
			}
		]
	}
];
function Header({ lang, messages }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [openDropdown, setOpenDropdown] = (0, import_react.useState)(null);
	const [compact, setCompact] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		document.body.classList.toggle("nav-open", open);
		return () => document.body.classList.remove("nav-open");
	}, [open]);
	(0, import_react.useEffect)(() => {
		const update = () => setCompact(window.scrollY > window.innerHeight * .18);
		update();
		window.addEventListener("scroll", update, { passive: true });
		return () => window.removeEventListener("scroll", update);
	}, []);
	const closeDropdown = () => setOpenDropdown(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: `site-header${compact ? " is-compact" : ""}`,
		"data-breathing-header": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				className: "brand",
				href: `/${lang}`,
				"aria-label": `${messages.siteName} — ${messages.home}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/koa/assets/koa-logo.png",
					alt: "",
					width: "52",
					height: "52"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "KOA" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: messages.siteName })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "header-actions",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageToggle, {
					lang,
					messages
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "menu-button",
					type: "button",
					"aria-expanded": open,
					"aria-controls": "site-navigation",
					onClick: () => setOpen((value) => !value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "menu-lines",
						"aria-hidden": "true"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: open ? messages.close : messages.menu })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				id: "site-navigation",
				className: "site-nav",
				"aria-label": "Primary navigation",
				"data-open": open,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "nav-lead",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "eyebrow",
						children: [messages.explore, " KOA"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: messages.tagline })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "nav-grid",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							href: `/${lang}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "01" }), messages.home]
						}),
						navCategories.map((category, catIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "nav-dropdown",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "nav-dropdown__trigger",
								"aria-haspopup": "true",
								"aria-expanded": openDropdown === category.slug,
								onClick: () => setOpenDropdown(openDropdown === category.slug ? null : category.slug),
								onKeyDown: (e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										setOpenDropdown(openDropdown === category.slug ? null : category.slug);
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: category.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
									className: "nav-dropdown__detail",
									"aria-hidden": "true",
									children: category.items.flatMap((item) => "label" in item ? [item.label] : []).slice(0, 2).join(" · ")
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "nav-dropdown__menu",
								role: "menu",
								children: category.items.map((item, itemIndex) => "isDivider" in item ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", {}, `divider-${catIndex}-${itemIndex}`) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									href: `/${lang}/${item.slug}`,
									role: "menuitem",
									onClick: closeDropdown,
									children: item.label
								}, item.slug))
							})]
						}, category.slug)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							href: `/${lang}/collaborate`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "09" }), messages.collaborate]
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { Header };
