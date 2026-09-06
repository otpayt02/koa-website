import { C as stripBasePath, T as __toESM, b as require_react, g as toSameOriginAppPath, h as toBrowserNavigationHref, p as isHashOnlyBrowserUrlChange } from "../index.js";
import { a as urlQueryToSearchParams, i as appendSearchParamsToUrl, o as addLocalePrefix, r as addQueryParam, s as getDomainLocaleUrl } from "./link-DiLTuv2w.js";
//#region node_modules/vinext/dist/shims/internal/router-context.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* Shim for next/dist/shared/lib/router-context.shared-runtime
*
* Used by: some testing utilities and older libraries.
* Provides the Pages Router context.
*/
var RouterContext = (0, import_react.createContext)(null);
//#endregion
//#region node_modules/vinext/dist/client/validate-module-path.js
/**
* Defense-in-depth: validate module paths before passing them to dynamic import().
*
* Shared between entry.ts (initial hydration) and router.ts (client-side navigation)
* to ensure all dynamic imports of page/app modules go through the same validation.
*
* Blocks:
* - Non-string or empty values
* - Paths that don't start with `/` or `./` (e.g., `https://evil.com/...`)
* - Protocol URLs (`://`)
* - Protocol-relative URLs (`//...`)
* - Directory traversal (`..`)
*/
function isValidModulePath(p) {
	if (typeof p !== "string" || p.length === 0) return false;
	if (!p.startsWith("/") && !p.startsWith("./")) return false;
	if (p.startsWith("//")) return false;
	if (p.includes("://")) return false;
	if (p.includes("..")) return false;
	return true;
}
//#endregion
//#region node_modules/vinext/dist/client/window-next.js
/**
* Build-time replacement for the vinext package version, injected by the
* Vite plugin via `define` (see `index.ts` — `process.env.__NEXT_VERSION`
* is mirrored from `packages/vinext/package.json#version` so library
* callers that read `process.env.__NEXT_VERSION` see a real value).
*
* In environments where the define did not run (standalone unit tests
* that import this module without going through the plugin), the
* `?? "vinext"` fallback prevents a literal `undefined` from landing on
* `window.next.version`.
*/
var VINEXT_VERSION = "0.0.50";
/**
* Install `window.next` if it has not already been installed in this
* document. Subsequent calls update fields in place so both the Pages
* Router and the App Router bootstraps can call this without clobbering
* each other (e.g. for hybrid `pages/` + `app/` setups).
*
* When called a second time, `router` and `appDir` overwrite the previous
* values. This mirrors Next.js's load order: in a hybrid app the App
* Router's `app-bootstrap.ts` runs after Pages Router's `next.ts` and the
* App Router instance wins.
*
* No module-level cache: we read and write through `window.next` directly
* so that a test (or userland code) that deletes `window.next` cleanly
* resets state.
*/
function installWindowNext(fields) {
	if (typeof window === "undefined") return;
	const existing = window.next;
	if (existing) {
		if (fields.version !== void 0) existing.version = fields.version;
		if (fields.appDir !== void 0) existing.appDir = fields.appDir;
		if (fields.router !== void 0) existing.router = fields.router;
		if (fields.__pendingUrl !== void 0) existing.__pendingUrl = fields.__pendingUrl;
		if (fields.__internal_src_page !== void 0) existing.__internal_src_page = fields.__internal_src_page;
		return;
	}
	window.next = {
		version: fields.version ?? VINEXT_VERSION,
		...fields
	};
}
//#endregion
//#region node_modules/vinext/dist/shims/router.js
/**
* next/router shim
*
* Provides useRouter() hook and Router singleton for Pages Router.
* Backed by the browser History API. Supports client-side navigation
* by fetching new page data and re-rendering the React root.
*/
/** basePath from next.config.js, injected by the plugin at build time */
var __basePath = "";
function createRouterEvents() {
	const listeners = /* @__PURE__ */ new Map();
	return {
		on(event, handler) {
			if (!listeners.has(event)) listeners.set(event, /* @__PURE__ */ new Set());
			listeners.get(event).add(handler);
		},
		off(event, handler) {
			listeners.get(event)?.delete(handler);
		},
		emit(event, ...args) {
			listeners.get(event)?.forEach((handler) => handler(...args));
		}
	};
}
var routerEvents = createRouterEvents();
function resolveUrl(url) {
	if (typeof url === "string") return url;
	let result = url.pathname ?? "/";
	if (url.query) {
		const params = urlQueryToSearchParams(url.query);
		result = appendSearchParamsToUrl(result, params);
	}
	return result;
}
/**
* When `as` is provided, use it as the navigation target. This is a
* simplification: Next.js keeps `url` and `as` as separate values (url for
* data fetching, as for the browser URL). We collapse them because vinext's
* navigateClient() fetches HTML from the target URL, so `as` must be a
* server-resolvable path. Purely decorative `as` values are not supported.
*/
function resolveNavigationTarget(url, as, locale) {
	return applyNavigationLocale(as ?? resolveUrl(url), locale);
}
function getDomainLocales() {
	return window.__NEXT_DATA__?.domainLocales;
}
function getCurrentHostname() {
	return window.location?.hostname;
}
function getDomainLocalePath(url, locale) {
	return getDomainLocaleUrl(url, locale, {
		basePath: __basePath,
		currentHostname: getCurrentHostname(),
		domainItems: getDomainLocales()
	});
}
/**
* Apply locale prefix to a URL for client-side navigation.
* Same logic as Link's applyLocaleToHref but reads from window globals.
*/
function applyNavigationLocale(url, locale) {
	if (!locale || typeof window === "undefined") return url;
	if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//")) return url;
	const domainLocalePath = getDomainLocalePath(url, locale);
	if (domainLocalePath) return domainLocalePath;
	return addLocalePrefix(url, locale, window.__VINEXT_DEFAULT_LOCALE__ ?? "");
}
/** Check if a URL is external (any URL scheme per RFC 3986, or protocol-relative) */
function isExternalUrl(url) {
	return /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//");
}
/** Resolve a hash URL to a basePath-stripped app URL for event payloads */
function resolveHashUrl(url) {
	if (typeof window === "undefined") return url;
	if (url.startsWith("#")) return stripBasePath(window.location.pathname, __basePath) + window.location.search + url;
	try {
		const parsed = new URL(url, window.location.href);
		return stripBasePath(parsed.pathname, __basePath) + parsed.search + parsed.hash;
	} catch {
		return url;
	}
}
/** Check if a href is only a hash change relative to the current URL */
function isHashOnlyChange(href) {
	if (href.startsWith("#")) return true;
	if (typeof window === "undefined") return false;
	return isHashOnlyBrowserUrlChange(href, window.location.href, __basePath);
}
/** Scroll to hash target element, or top if no hash */
function scrollToHash(hash) {
	if (!hash || hash === "#") {
		window.scrollTo(0, 0);
		return;
	}
	const el = document.getElementById(hash.slice(1));
	if (el) el.scrollIntoView({ behavior: "auto" });
}
/** Save current scroll position into history state for back/forward restoration */
function saveScrollPosition() {
	const state = window.history.state ?? {};
	window.history.replaceState({
		...state,
		__vinext_scrollX: window.scrollX,
		__vinext_scrollY: window.scrollY
	}, "");
}
/** Restore scroll position from history state */
function restoreScrollPosition(state) {
	if (state && typeof state === "object" && "__vinext_scrollY" in state) {
		const { __vinext_scrollX: x, __vinext_scrollY: y } = state;
		requestAnimationFrame(() => window.scrollTo(x, y));
	}
}
var _ssrContext = null;
var _getSSRContext = () => _ssrContext;
/**
* Extract param names from a Next.js route pattern.
* E.g., "/posts/[id]" → ["id"], "/docs/[...slug]" → ["slug"],
* "/shop/[[...path]]" → ["path"], "/blog/[year]/[month]" → ["year", "month"]
* Also handles internal format: "/posts/:id" → ["id"], "/docs/:slug+" → ["slug"]
*/
function extractRouteParamNames(pattern) {
	const names = [];
	const bracketMatches = pattern.matchAll(/\[{1,2}(?:\.\.\.)?([^\]]+)\]{1,2}/g);
	for (const m of bracketMatches) names.push(m[1]);
	if (names.length > 0) return names;
	const colonMatches = pattern.matchAll(/:([^/+*]+)[+*]?/g);
	for (const m of colonMatches) names.push(m[1]);
	return names;
}
function getPathnameAndQuery() {
	if (typeof window === "undefined") {
		const _ssrCtx = _getSSRContext();
		if (_ssrCtx) {
			const query = {};
			for (const [key, value] of Object.entries(_ssrCtx.query)) query[key] = Array.isArray(value) ? [...value] : value;
			return {
				pathname: _ssrCtx.pathname,
				query,
				asPath: _ssrCtx.asPath
			};
		}
		return {
			pathname: "/",
			query: {},
			asPath: "/"
		};
	}
	const resolvedPath = stripBasePath(window.location.pathname, __basePath);
	const pathname = window.__NEXT_DATA__?.page ?? resolvedPath;
	const routeQuery = {};
	const nextData = window.__NEXT_DATA__;
	if (nextData && nextData.query && nextData.page) {
		const routeParamNames = extractRouteParamNames(nextData.page);
		for (const key of routeParamNames) {
			const value = nextData.query[key];
			if (typeof value === "string") routeQuery[key] = value;
			else if (Array.isArray(value)) routeQuery[key] = [...value];
		}
	}
	const searchQuery = {};
	const params = new URLSearchParams(window.location.search);
	for (const [key, value] of params) addQueryParam(searchQuery, key, value);
	return {
		pathname,
		query: {
			...searchQuery,
			...routeQuery
		},
		asPath: resolvedPath + window.location.search + window.location.hash
	};
}
/**
* Error thrown when a navigation is superseded by a newer one.
* Matches Next.js's convention of an Error with `.cancelled = true`.
*/
var NavigationCancelledError = class extends Error {
	cancelled = true;
	constructor(route) {
		super(`Abort fetching component for route: "${route}"`);
		this.name = "NavigationCancelledError";
	}
};
/**
* Error thrown after queueing a hard navigation fallback for a known failure
* mode. Callers can use this to avoid scheduling the same hard navigation twice.
*/
var HardNavigationScheduledError = class extends Error {
	hardNavigationScheduled = true;
	constructor(message) {
		super(message);
		this.name = "HardNavigationScheduledError";
	}
};
/**
* Monotonically increasing ID for tracking the current navigation.
* Each call to navigateClient() increments this and captures the value.
* After each async boundary, the navigation checks whether it is still
* the active one. If a newer navigation has started, the stale one
* throws NavigationCancelledError so the caller can emit routeChangeError
* and skip routeChangeComplete.
*
* Replaces the old boolean `_navInProgress` guard which silently dropped
* the second navigation, causing URL/content mismatch.
*/
var _navigationId = 0;
/** AbortController for the in-flight fetch, so superseded navigations abort network I/O. */
var _activeAbortController = null;
function scheduleHardNavigationAndThrow(url, message) {
	if (typeof window === "undefined") throw new HardNavigationScheduledError(message);
	window.location.href = url;
	throw new HardNavigationScheduledError(message);
}
/**
* Perform client-side navigation: fetch the target page's HTML,
* extract __NEXT_DATA__, and re-render the React root.
*
* Throws NavigationCancelledError if a newer navigation supersedes this one.
* Throws on hard-navigation failures (non-OK response, missing data) so the
* caller can distinguish success from failure for event emission.
*/
async function navigateClient(url) {
	if (typeof window === "undefined") return;
	const root = window.__VINEXT_ROOT__;
	if (!root) {
		window.location.href = url;
		return;
	}
	_activeAbortController?.abort();
	const controller = new AbortController();
	_activeAbortController = controller;
	const navId = ++_navigationId;
	/** Check if this navigation is still the active one. If not, throw. */
	function assertStillCurrent() {
		if (navId !== _navigationId) throw new NavigationCancelledError(url);
	}
	try {
		let res;
		try {
			res = await fetch(url, {
				headers: { Accept: "text/html" },
				signal: controller.signal
			});
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") throw new NavigationCancelledError(url);
			throw err;
		}
		assertStillCurrent();
		if (!res.ok) scheduleHardNavigationAndThrow(url, `Navigation failed: ${res.status} ${res.statusText}`);
		const html = await res.text();
		assertStillCurrent();
		const match = html.match(/<script>window\.__NEXT_DATA__\s*=\s*(.*?)<\/script>/);
		if (!match) scheduleHardNavigationAndThrow(url, "Navigation failed: missing __NEXT_DATA__ in response");
		const nextData = JSON.parse(match[1]);
		const { pageProps } = nextData.props;
		let pageModuleUrl = nextData.__vinext?.pageModuleUrl;
		if (!pageModuleUrl) {
			const moduleMatch = html.match(/import\("([^"]+)"\);\s*\n\s*const PageComponent/);
			const altMatch = html.match(/await import\("([^"]+pages\/[^"]+)"\)/);
			pageModuleUrl = moduleMatch?.[1] ?? altMatch?.[1] ?? void 0;
		}
		if (!pageModuleUrl) scheduleHardNavigationAndThrow(url, "Navigation failed: no page module URL found");
		if (!isValidModulePath(pageModuleUrl)) {
			console.error("[vinext] Blocked import of invalid page module path:", pageModuleUrl);
			scheduleHardNavigationAndThrow(url, "Navigation failed: invalid page module path");
		}
		const pageModule = await import(
			/* @vite-ignore */
			pageModuleUrl
);
		assertStillCurrent();
		const PageComponent = pageModule.default;
		if (!PageComponent) scheduleHardNavigationAndThrow(url, "Navigation failed: page module has no default export");
		const React = (await import("../index.js").then((n) => /* @__PURE__ */ __toESM(n.b(), 1))).default;
		assertStillCurrent();
		let AppComponent = window.__VINEXT_APP__;
		const appModuleUrl = nextData.__vinext?.appModuleUrl;
		if (!AppComponent && appModuleUrl) if (!isValidModulePath(appModuleUrl)) console.error("[vinext] Blocked import of invalid app module path:", appModuleUrl);
		else try {
			AppComponent = (await import(
				/* @vite-ignore */
				appModuleUrl
)).default;
			window.__VINEXT_APP__ = AppComponent;
		} catch {}
		assertStillCurrent();
		let element;
		if (AppComponent) element = React.createElement(AppComponent, {
			Component: PageComponent,
			pageProps
		});
		else element = React.createElement(PageComponent, pageProps);
		element = wrapWithRouterContext(element);
		window.__NEXT_DATA__ = nextData;
		root.render(element);
	} finally {
		if (navId === _navigationId) _activeAbortController = null;
	}
}
/**
* Run navigateClient and handle errors: emit routeChangeError on failure,
* and fall back to a hard navigation for non-cancel errors so the browser
* recovers to a consistent state.
*
* Returns:
* - "completed" — navigation finished, caller should emit routeChangeComplete
* - "cancelled" — superseded by a newer navigation, caller should return true
*   without emitting routeChangeComplete (matches Next.js behaviour)
* - "failed" — genuine error, caller should return false (hard nav is already
*   scheduled as recovery)
*/
async function runNavigateClient(fullUrl, resolvedUrl) {
	try {
		await navigateClient(fullUrl);
		return "completed";
	} catch (err) {
		routerEvents.emit("routeChangeError", err, resolvedUrl, { shallow: false });
		if (err instanceof NavigationCancelledError) return "cancelled";
		if (typeof window !== "undefined" && !(err instanceof HardNavigationScheduledError)) window.location.href = fullUrl;
		return "failed";
	}
}
/**
* Build the full router value object from the current pathname, query, asPath,
* and a set of navigation methods.  Shared by useRouter() (which passes
* hook-derived callbacks) and wrapWithRouterContext() (which passes the Router
* singleton methods) so the shape stays in sync.
*/
function buildRouterValue(pathname, query, asPath, methods) {
	const _ssrState = _getSSRContext();
	const nextData = typeof window !== "undefined" ? window.__NEXT_DATA__ : void 0;
	const locale = typeof window === "undefined" ? _ssrState?.locale : window.__VINEXT_LOCALE__;
	const locales = typeof window === "undefined" ? _ssrState?.locales : window.__VINEXT_LOCALES__;
	const defaultLocale = typeof window === "undefined" ? _ssrState?.defaultLocale : window.__VINEXT_DEFAULT_LOCALE__;
	const domainLocales = typeof window === "undefined" ? _ssrState?.domainLocales : nextData?.domainLocales;
	return {
		pathname,
		route: typeof window !== "undefined" ? nextData?.page ?? pathname : pathname,
		query,
		asPath,
		basePath: __basePath,
		locale,
		locales,
		defaultLocale,
		domainLocales,
		isReady: true,
		isPreview: false,
		isFallback: typeof window !== "undefined" && nextData?.isFallback === true,
		...methods,
		events: routerEvents
	};
}
var _beforePopStateCb;
var _lastPathnameAndSearch = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
if (typeof window !== "undefined") window.addEventListener("popstate", (e) => {
	const browserUrl = window.location.pathname + window.location.search;
	const appUrl = stripBasePath(window.location.pathname, __basePath) + window.location.search;
	const isHashOnly = browserUrl === _lastPathnameAndSearch;
	if (_beforePopStateCb !== void 0) {
		if (!_beforePopStateCb({
			url: appUrl,
			as: appUrl,
			options: { shallow: false }
		})) return;
	}
	_lastPathnameAndSearch = browserUrl;
	if (isHashOnly) {
		const hashUrl = appUrl + window.location.hash;
		routerEvents.emit("hashChangeStart", hashUrl, { shallow: false });
		scrollToHash(window.location.hash);
		routerEvents.emit("hashChangeComplete", hashUrl, { shallow: false });
		window.dispatchEvent(new CustomEvent("vinext:navigate"));
		return;
	}
	const fullAppUrl = appUrl + window.location.hash;
	routerEvents.emit("routeChangeStart", fullAppUrl, { shallow: false });
	routerEvents.emit("beforeHistoryChange", fullAppUrl, { shallow: false });
	(async () => {
		if (await runNavigateClient(browserUrl, fullAppUrl) === "completed") {
			routerEvents.emit("routeChangeComplete", fullAppUrl, { shallow: false });
			restoreScrollPosition(e.state);
			window.dispatchEvent(new CustomEvent("vinext:navigate"));
		}
	})();
});
/**
* Wrap a React element in a RouterContext.Provider so that
* next/compat/router's useRouter() returns the real Pages Router value.
*
* This is a plain function, NOT a React component — it builds the router
* value object directly from the current SSR context (server) or
* window.location + Router singleton (client), avoiding duplicate state
* that a hook-based component would create.
*/
function wrapWithRouterContext(element) {
	const { pathname, query, asPath } = getPathnameAndQuery();
	const routerValue = buildRouterValue(pathname, query, asPath, {
		push: Router.push,
		replace: Router.replace,
		back: Router.back,
		reload: Router.reload,
		prefetch: Router.prefetch,
		beforePopState: Router.beforePopState
	});
	return (0, import_react.createElement)(RouterContext.Provider, { value: routerValue }, element);
}
var Router = {
	push: async (url, as, options) => {
		let resolved = resolveNavigationTarget(url, as, options?.locale);
		if (isExternalUrl(resolved)) {
			const localPath = toSameOriginAppPath(resolved, __basePath);
			if (localPath == null) {
				window.location.assign(resolved);
				return true;
			}
			resolved = localPath;
		}
		const full = toBrowserNavigationHref(resolved, window.location.href, __basePath);
		if (isHashOnlyChange(full)) {
			const eventUrl = resolveHashUrl(full);
			routerEvents.emit("hashChangeStart", eventUrl, { shallow: options?.shallow ?? false });
			const hash = resolved.includes("#") ? resolved.slice(resolved.indexOf("#")) : "";
			window.history.pushState({}, "", resolved.startsWith("#") ? resolved : full);
			_lastPathnameAndSearch = window.location.pathname + window.location.search;
			scrollToHash(hash);
			routerEvents.emit("hashChangeComplete", eventUrl, { shallow: options?.shallow ?? false });
			window.dispatchEvent(new CustomEvent("vinext:navigate"));
			return true;
		}
		saveScrollPosition();
		routerEvents.emit("routeChangeStart", resolved, { shallow: options?.shallow ?? false });
		routerEvents.emit("beforeHistoryChange", resolved, { shallow: options?.shallow ?? false });
		window.history.pushState({}, "", full);
		_lastPathnameAndSearch = window.location.pathname + window.location.search;
		if (!options?.shallow) {
			const result = await runNavigateClient(full, resolved);
			if (result === "cancelled") return true;
			if (result === "failed") return false;
		}
		routerEvents.emit("routeChangeComplete", resolved, { shallow: options?.shallow ?? false });
		const hash = resolved.includes("#") ? resolved.slice(resolved.indexOf("#")) : "";
		if (hash) scrollToHash(hash);
		else if (options?.scroll !== false) window.scrollTo(0, 0);
		window.dispatchEvent(new CustomEvent("vinext:navigate"));
		return true;
	},
	replace: async (url, as, options) => {
		let resolved = resolveNavigationTarget(url, as, options?.locale);
		if (isExternalUrl(resolved)) {
			const localPath = toSameOriginAppPath(resolved, __basePath);
			if (localPath == null) {
				window.location.replace(resolved);
				return true;
			}
			resolved = localPath;
		}
		const full = toBrowserNavigationHref(resolved, window.location.href, __basePath);
		if (isHashOnlyChange(full)) {
			const eventUrl = resolveHashUrl(full);
			routerEvents.emit("hashChangeStart", eventUrl, { shallow: options?.shallow ?? false });
			const hash = resolved.includes("#") ? resolved.slice(resolved.indexOf("#")) : "";
			window.history.replaceState({}, "", resolved.startsWith("#") ? resolved : full);
			_lastPathnameAndSearch = window.location.pathname + window.location.search;
			scrollToHash(hash);
			routerEvents.emit("hashChangeComplete", eventUrl, { shallow: options?.shallow ?? false });
			window.dispatchEvent(new CustomEvent("vinext:navigate"));
			return true;
		}
		routerEvents.emit("routeChangeStart", resolved, { shallow: options?.shallow ?? false });
		routerEvents.emit("beforeHistoryChange", resolved, { shallow: options?.shallow ?? false });
		window.history.replaceState({}, "", full);
		_lastPathnameAndSearch = window.location.pathname + window.location.search;
		if (!options?.shallow) {
			const result = await runNavigateClient(full, resolved);
			if (result === "cancelled") return true;
			if (result === "failed") return false;
		}
		routerEvents.emit("routeChangeComplete", resolved, { shallow: options?.shallow ?? false });
		const hash = resolved.includes("#") ? resolved.slice(resolved.indexOf("#")) : "";
		if (hash) scrollToHash(hash);
		else if (options?.scroll !== false) window.scrollTo(0, 0);
		window.dispatchEvent(new CustomEvent("vinext:navigate"));
		return true;
	},
	back: () => window.history.back(),
	reload: () => window.location.reload(),
	prefetch: async (url) => {
		if (typeof document !== "undefined") {
			const link = document.createElement("link");
			link.rel = "prefetch";
			link.href = url;
			link.as = "document";
			document.head.appendChild(link);
		}
	},
	beforePopState: (cb) => {
		_beforePopStateCb = cb;
	},
	events: routerEvents
};
if (typeof window !== "undefined") installWindowNext({ router: Router });
//#endregion
export { Router as default };
