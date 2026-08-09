import { getOrCreateAls } from "./internal/als-registry.js";
import { getRequestContext, isInsideUnifiedScope, runWithUnifiedStateMutation } from "./unified-request-context.js";
import { getRequestExecutionContext, runWithExecutionContext } from "./request-context.js";
import { getHeadersAccessPhase, markDynamicUsage } from "./headers.js";
import { fnv1a64 } from "../utils/hash.js";
import { workUnitAsyncStorage } from "./internal/work-unit-async-storage.js";
import { makeHangingPromise } from "./internal/make-hanging-promise.js";
import { readCacheControlNumberField } from "../utils/cache-control-metadata.js";
import { encodeCacheTag, encodeCacheTags } from "../utils/encode-cache-tag.js";
//#region src/shims/cache.ts
/**
* next/cache shim
*
* Provides the Next.js caching API surface: revalidateTag, revalidatePath,
* unstable_cache. Backed by a pluggable CacheHandler that defaults to
* in-memory but can be swapped for Cloudflare KV, Redis, DynamoDB, etc.
*
* The CacheHandler interface matches Next.js 16's CacheHandler class, so
* existing community adapters (@neshca/cache-handler, @opennextjs/aws, etc.)
* can be used directly.
*
* Configuration (in vite.config.ts or next.config.js):
*   vinext({ cacheHandler: './my-cache-handler.ts' })
*
* Or set at runtime:
*   import { setCacheHandler } from 'next/cache';
*   setCacheHandler(new MyCacheHandler());
*/
/** @internal Set by cache-runtime.ts on import to avoid circular dependency */
let _getCacheContextFn = null;
/**
* Register the cache context accessor. Called by cache-runtime.ts on load.
* @internal
*/
function _registerCacheContextAccessor(fn) {
	_getCacheContextFn = fn;
}
var NoOpCacheHandler = class {
	async get(_key, _ctx) {
		return null;
	}
	async set(_key, _data, _ctx) {}
	async revalidateTag(_tags, _durations) {}
};
function readStringArrayField(ctx, field) {
	const value = ctx?.[field];
	if (!Array.isArray(value)) return [];
	return value.filter((item) => typeof item === "string");
}
var MemoryCacheHandler = class {
	store = /* @__PURE__ */ new Map();
	tagRevalidatedAt = /* @__PURE__ */ new Map();
	async get(key, _ctx) {
		const entry = this.store.get(key);
		if (!entry) return null;
		for (const tag of entry.tags) {
			const revalidatedAt = this.tagRevalidatedAt.get(tag);
			if (revalidatedAt && revalidatedAt >= entry.lastModified) {
				this.store.delete(key);
				return null;
			}
		}
		for (const tag of readStringArrayField(_ctx, "softTags")) {
			const revalidatedAt = this.tagRevalidatedAt.get(tag);
			if (revalidatedAt && revalidatedAt >= entry.lastModified) return null;
		}
		if (entry.expireAt !== null && Date.now() > entry.expireAt) {
			this.store.delete(key);
			return null;
		}
		if (entry.revalidateAt !== null && Date.now() > entry.revalidateAt) return {
			lastModified: entry.lastModified,
			value: entry.value,
			cacheState: "stale",
			cacheControl: entry.cacheControl
		};
		return {
			lastModified: entry.lastModified,
			value: entry.value,
			cacheControl: entry.cacheControl
		};
	}
	async set(key, data, ctx) {
		const tagSet = /* @__PURE__ */ new Set();
		if (data && "tags" in data && Array.isArray(data.tags)) for (const t of data.tags) tagSet.add(t);
		for (const t of readStringArrayField(ctx, "tags")) tagSet.add(t);
		const tags = [...tagSet];
		let effectiveRevalidate;
		let effectiveExpire;
		effectiveRevalidate = readCacheControlNumberField(ctx, "revalidate");
		effectiveExpire = readCacheControlNumberField(ctx, "expire");
		if (data && "revalidate" in data && typeof data.revalidate === "number") effectiveRevalidate = data.revalidate;
		if (effectiveRevalidate === 0) return;
		const now = Date.now();
		const revalidateAt = typeof effectiveRevalidate === "number" && effectiveRevalidate > 0 ? now + effectiveRevalidate * 1e3 : null;
		const expireAt = typeof effectiveExpire === "number" && effectiveExpire > 0 ? now + effectiveExpire * 1e3 : null;
		const cacheControl = typeof effectiveRevalidate === "number" ? effectiveExpire === void 0 ? { revalidate: effectiveRevalidate } : {
			revalidate: effectiveRevalidate,
			expire: effectiveExpire
		} : void 0;
		this.store.set(key, {
			value: data,
			tags,
			lastModified: now,
			revalidateAt,
			expireAt,
			cacheControl
		});
	}
	async revalidateTag(tags, _durations) {
		const tagList = Array.isArray(tags) ? tags : [tags];
		const now = Date.now();
		for (const tag of tagList) this.tagRevalidatedAt.set(tag, now);
	}
	resetRequestCache() {}
};
const _HANDLER_KEY = Symbol.for("vinext.cacheHandler");
const _gHandler = globalThis;
function _getActiveHandler() {
	return _gHandler[_HANDLER_KEY] ?? (_gHandler[_HANDLER_KEY] = new MemoryCacheHandler());
}
/**
* Set a custom CacheHandler. Call this during server startup to
* plug in Cloudflare KV, Redis, DynamoDB, or any other backend.
*
* The handler must implement the CacheHandler interface (same shape
* as Next.js 16's CacheHandler class).
*/
function setCacheHandler(handler) {
	_gHandler[_HANDLER_KEY] = handler;
}
/**
* Get the active CacheHandler (for internal use or testing).
*/
function getCacheHandler() {
	return _getActiveHandler();
}
/**
* Revalidate cached data associated with a specific cache tag.
*
* Works with both `fetch(..., { next: { tags: ['myTag'] } })` and
* `unstable_cache(fn, keys, { tags: ['myTag'] })`.
*
* Next.js 16 updated signature: accepts a cacheLife profile as second argument
* for stale-while-revalidate (SWR) behavior. The single-argument form is
* deprecated but still supported for backward compatibility.
*
* @param tag - Cache tag to revalidate
* @param profile - cacheLife profile name (e.g. 'max', 'hours') or inline { expire: number }
*/
async function revalidateTag(tag, profile) {
	let durations;
	if (typeof profile === "string") {
		const resolved = cacheLifeProfiles[profile];
		if (resolved) durations = { expire: resolved.expire };
	} else if (profile && typeof profile === "object") durations = profile;
	if (!profile || !durations || durations.expire === 0) markActionRevalidation(ACTION_DID_REVALIDATE_STATIC_AND_DYNAMIC);
	await _getActiveHandler().revalidateTag(encodeCacheTag(tag), durations);
}
/**
* Revalidate cached data associated with a specific path.
*
* Invalidation works through implicit tags generated at render time by
* `buildAppPageCacheTags`, matching Next.js's getDerivedTags:
*
* - `type: "layout"` → invalidates `_N_T_<path>/layout`, cascading to all
*   descendant pages (they carry ancestor layout tags from render time).
* - `type: "page"` → invalidates `_N_T_<path>/page`, targeting only the
*   exact route's page component.
* - No type → invalidates `_N_T_<path>` (broader, exact path).
*
* The `type` parameter is App Router only — Pages Router does not generate
* layout/page hierarchy tags, so only no-type invalidation applies there.
*/
async function revalidatePath(path, type) {
	markActionRevalidation(ACTION_DID_REVALIDATE_STATIC_AND_DYNAMIC);
	const stem = path.endsWith("/") ? path.slice(0, -1) : path;
	const tag = type ? `_N_T_${stem}/${type}` : `_N_T_${stem || "/"}`;
	await _getActiveHandler().revalidateTag(encodeCacheTag(tag));
}
/**
* No-op shim for API compatibility.
*
* In Next.js, calling `refresh()` inside a Server Action triggers a
* client-side router refresh so the user immediately sees updated data.
* vinext reports the dynamic-only invalidation through the Server Action
* response header that the client router already understands.
*/
function refresh() {
	markActionRevalidation(ACTION_DID_REVALIDATE_DYNAMIC_ONLY);
}
/**
* Expire a cache tag immediately (Next.js 16).
*
* Server Actions-only API that expires a tag so the next request
* fetches fresh data. Unlike `revalidateTag`, which uses stale-while-revalidate,
* `updateTag` invalidates synchronously within the same request context.
*/
async function updateTag(tag) {
	markActionRevalidation(ACTION_DID_REVALIDATE_STATIC_AND_DYNAMIC);
	await _getActiveHandler().revalidateTag(encodeCacheTag(tag));
}
/**
* Opt out of static rendering and indicate a particular component should not be cached.
*
* In Next.js, calling noStore() inside a Server Component ensures the component
* is dynamically rendered. In our implementation, this is a no-op since we don't
* have the same static/dynamic rendering split — all server rendering is on-demand.
* It's provided for API compatibility so apps importing it don't break.
*/
function unstable_noStore() {
	markDynamicUsage();
}
/**
* A fulfilled thenable that React can unwrap synchronously via `use()`
* without ever suspending. Reusing a single instance avoids allocating
* on every call — matching Next.js's browser/client implementation.
*
* @see https://github.com/vercel/next.js/blob/canary/packages/next/src/client/request/io.browser.ts
*/
const _resolvedIOPromise = Promise.resolve(void 0);
_resolvedIOPromise.status = "fulfilled";
_resolvedIOPromise.value = void 0;
/**
* Marks an IO boundary in server components by returning a resolved promise
* during requests and a hanging promise during prerendering.
*
* See: https://github.com/vercel/next.js/pull/92521
* Guard removed: https://github.com/vercel/next.js/pull/92923
* Stabilized (renamed from unstable_io): https://github.com/vercel/next.js/pull/93621
*
* Ported from Next.js: packages/next/src/server/request/io.ts
* https://github.com/vercel/next.js/blob/canary/packages/next/src/server/request/io.ts
*
* Behavior by work unit type:
* - request → resolve immediately (no delay needed for dynamic SSR)
* - prerender / prerender-client / prerender-runtime → hang (prevent
*   execution past IO boundary during static generation)
* - cache / private-cache / unstable-cache → resolve immediately
*   (caches capture IO results at fill time)
* - generate-static-params → resolve immediately (build time, no prerender to stall)
* - prerender-legacy → resolve immediately (no cache components)
*
* When no work unit store is present (e.g. client-side, standalone script),
* resolves immediately — matching the browser/client implementation.
*/
function io() {
	const workUnitStore = workUnitAsyncStorage.getStore();
	if (workUnitStore) switch (workUnitStore.type) {
		case "request": return _resolvedIOPromise;
		case "prerender":
		case "prerender-client":
		case "prerender-runtime": return makeHangingPromise(workUnitStore.renderSignal, workUnitStore.route ?? "unknown", "`io()`");
		case "cache":
		case "private-cache":
		case "unstable-cache":
		case "generate-static-params":
		case "prerender-legacy": return _resolvedIOPromise;
		default: return _resolvedIOPromise;
	}
	return _resolvedIOPromise;
}
/**
* @deprecated Use `io` instead. Kept as a transitional alias since vinext
* shipped the unstable name longer than upstream Next.js (see #805). Will be
* removed in a future minor.
*/
function unstable_io() {
	if (!_unstableIoWarned) {
		_unstableIoWarned = true;
		console.warn("[vinext] `unstable_io` is deprecated. Import `io` from 'next/cache' instead.");
	}
	return io();
}
let _unstableIoWarned = false;
const _FALLBACK_KEY = Symbol.for("vinext.cache.fallback");
const _g = globalThis;
const _cacheAls = getOrCreateAls("vinext.cache.als");
const _cacheFallbackState = _g[_FALLBACK_KEY] ??= {
	actionRevalidationKind: 0,
	requestScopedCacheLife: null,
	unstableCacheRevalidation: "foreground"
};
const ACTION_DID_NOT_REVALIDATE = 0;
const ACTION_DID_REVALIDATE_STATIC_AND_DYNAMIC = 1;
const ACTION_DID_REVALIDATE_DYNAMIC_ONLY = 2;
function _getCacheState() {
	if (isInsideUnifiedScope()) return getRequestContext();
	return _cacheAls.getStore() ?? _cacheFallbackState;
}
function _runWithCacheState(fn) {
	if (isInsideUnifiedScope()) return runWithUnifiedStateMutation((uCtx) => {
		uCtx.actionRevalidationKind = ACTION_DID_NOT_REVALIDATE;
		uCtx.requestScopedCacheLife = null;
		uCtx.unstableCacheRevalidation = "foreground";
	}, fn);
	const state = {
		actionRevalidationKind: ACTION_DID_NOT_REVALIDATE,
		requestScopedCacheLife: null,
		unstableCacheRevalidation: "foreground"
	};
	return _cacheAls.run(state, fn);
}
/**
* Initialize cache ALS for a new request. Call at request entry.
* Only needed when not using _runWithCacheState() (legacy path).
* @internal
*/
function _initRequestScopedCacheState() {
	const state = _getCacheState();
	state.actionRevalidationKind = ACTION_DID_NOT_REVALIDATE;
	state.requestScopedCacheLife = null;
}
function markActionRevalidation(kind) {
	if (getHeadersAccessPhase() !== "action") return;
	const state = _getCacheState();
	state.actionRevalidationKind = state.actionRevalidationKind === ACTION_DID_REVALIDATE_STATIC_AND_DYNAMIC ? ACTION_DID_REVALIDATE_STATIC_AND_DYNAMIC : kind;
}
function getAndClearActionRevalidationKind() {
	const state = _getCacheState();
	const kind = state.actionRevalidationKind;
	state.actionRevalidationKind = ACTION_DID_NOT_REVALIDATE;
	return kind;
}
/**
* Set a request-scoped cache life config. Called by cacheLife() so the route
* render can inherit cache policy from file-level and nested "use cache" work.
* @internal
*/
function _setRequestScopedCacheLife(config) {
	const state = _getCacheState();
	if (state.requestScopedCacheLife === null) state.requestScopedCacheLife = { ...config };
	else {
		if (config.stale !== void 0) state.requestScopedCacheLife.stale = state.requestScopedCacheLife.stale !== void 0 ? Math.min(state.requestScopedCacheLife.stale, config.stale) : config.stale;
		if (config.revalidate !== void 0) state.requestScopedCacheLife.revalidate = state.requestScopedCacheLife.revalidate !== void 0 ? Math.min(state.requestScopedCacheLife.revalidate, config.revalidate) : config.revalidate;
		if (config.expire !== void 0) state.requestScopedCacheLife.expire = state.requestScopedCacheLife.expire !== void 0 ? Math.min(state.requestScopedCacheLife.expire, config.expire) : config.expire;
	}
}
/**
* Read the request-scoped cache life without clearing it. Prerender response
* shaping needs the metadata before the manifest writer consumes it after the
* body has been fully rendered.
* @internal
*/
function _peekRequestScopedCacheLife() {
	const config = _getCacheState().requestScopedCacheLife;
	return config === null ? null : { ...config };
}
/**
* Consume and reset the request-scoped cache life. Returns null if none was set.
* @internal
*/
function _consumeRequestScopedCacheLife() {
	const state = _getCacheState();
	const config = state.requestScopedCacheLife;
	state.requestScopedCacheLife = null;
	return config;
}
/**
* Built-in cache life profiles matching Next.js 16.
*/
const cacheLifeProfiles = {
	default: {
		revalidate: 900,
		expire: 4294967294
	},
	seconds: {
		stale: 30,
		revalidate: 1,
		expire: 60
	},
	minutes: {
		stale: 300,
		revalidate: 60,
		expire: 3600
	},
	hours: {
		stale: 300,
		revalidate: 3600,
		expire: 86400
	},
	days: {
		stale: 300,
		revalidate: 86400,
		expire: 604800
	},
	weeks: {
		stale: 300,
		revalidate: 604800,
		expire: 2592e3
	},
	max: {
		stale: 300,
		revalidate: 2592e3,
		expire: 31536e3
	}
};
/**
* Set the cache lifetime for a "use cache" function.
*
* Accepts either a built-in profile name (e.g., "hours", "days") or a custom
* configuration object. In Next.js, this only works inside "use cache" functions.
*
* When called inside a "use cache" function, this sets the cache TTL.
* The "minimum-wins" rule applies: if called multiple times, the shortest
* duration for each field wins.
*
* When called outside a "use cache" context, this is a validated no-op.
*/
function cacheLife(profile) {
	let resolvedConfig;
	if (typeof profile === "string") {
		if (!cacheLifeProfiles[profile]) {
			console.warn(`[vinext] cacheLife: unknown profile "${profile}". Available profiles: ${Object.keys(cacheLifeProfiles).join(", ")}`);
			return;
		}
		resolvedConfig = { ...cacheLifeProfiles[profile] };
	} else if (typeof profile === "object" && profile !== null) {
		if (profile.expire !== void 0 && profile.revalidate !== void 0 && profile.expire < profile.revalidate) console.warn("[vinext] cacheLife: expire must be >= revalidate");
		resolvedConfig = {
			...cacheLifeProfiles.default,
			...profile
		};
	} else return;
	try {
		const ctx = _getCacheContextFn?.();
		if (ctx) {
			ctx.lifeConfigs.push(resolvedConfig);
			_setRequestScopedCacheLife(resolvedConfig);
			return;
		}
	} catch {}
	_setRequestScopedCacheLife(resolvedConfig);
}
/**
* Tag a "use cache" function's cached result for on-demand revalidation.
*
* Tags set here can be invalidated via revalidateTag(). In Next.js, this only
* works inside "use cache" functions.
*
* When called inside a "use cache" function, tags are attached to the cached
* entry. They can later be invalidated via revalidateTag().
*
* When called outside a "use cache" context, this is a no-op.
*/
function cacheTag(...tags) {
	try {
		const ctx = _getCacheContextFn?.();
		if (ctx) ctx.tags.push(...encodeCacheTags(tags));
	} catch {}
}
/**
* @deprecated Use `cacheLife` instead. `unstable_cacheLife` was stabilized
* upstream and the `unstable_`-prefixed name will be removed in a future
* version of Next.js. Kept as a delegating alias for parity.
*
* Emits a one-time deprecation warning via `console.error` (matching Next.js),
* then delegates to `cacheLife`.
*
* Ported from Next.js: packages/next/cache.js
* https://github.com/vercel/next.js/blob/canary/packages/next/cache.js
*
* Asserted by Next.js test:
* test/e2e/app-dir/cache-components-errors/cache-components-unstable-deprecations.test.ts
*/
let _unstableCacheLifeWarned = false;
function unstable_cacheLife(profile) {
	if (!_unstableCacheLifeWarned) {
		_unstableCacheLifeWarned = true;
		console.error(/* @__PURE__ */ new Error("`unstable_cacheLife` was recently stabilized and should be imported as `cacheLife`. The `unstable` prefixed form will be removed in a future version of Next.js."));
	}
	return cacheLife(profile);
}
/**
* @deprecated Use `cacheTag` instead. `unstable_cacheTag` was stabilized
* upstream and the `unstable_`-prefixed name will be removed in a future
* version of Next.js. Kept as a delegating alias for parity.
*
* Emits a one-time deprecation warning via `console.error` (matching Next.js),
* then delegates to `cacheTag`.
*
* Ported from Next.js: packages/next/cache.js
* https://github.com/vercel/next.js/blob/canary/packages/next/cache.js
*
* Asserted by Next.js test:
* test/e2e/app-dir/cache-components-errors/cache-components-unstable-deprecations.test.ts
*/
let _unstableCacheTagWarned = false;
function unstable_cacheTag(...tags) {
	if (!_unstableCacheTagWarned) {
		_unstableCacheTagWarned = true;
		console.error(/* @__PURE__ */ new Error("`unstable_cacheTag` was recently stabilized and should be imported as `cacheTag`. The `unstable` prefixed form will be removed in a future version of Next.js."));
	}
	return cacheTag(...tags);
}
/**
* AsyncLocalStorage to track whether we're inside an unstable_cache() callback.
* Stored on globalThis via Symbol so headers.ts can detect the scope without
* a direct import (avoiding circular dependencies).
*/
const _unstableCacheAls = getOrCreateAls("vinext.unstableCache.als");
function serializeUnstableCacheResult(value) {
	return JSON.stringify(value === void 0 ? { undef: true } : { v: value });
}
function deserializeUnstableCacheResult(body) {
	const wrapper = JSON.parse(body);
	return "undef" in wrapper ? void 0 : wrapper.v;
}
function tryDeserializeUnstableCacheResult(body) {
	try {
		return {
			ok: true,
			value: deserializeUnstableCacheResult(body)
		};
	} catch {
		return { ok: false };
	}
}
/**
* Check if the current execution context is inside an unstable_cache() callback.
* Used by headers(), cookies(), and connection() to throw errors when
* dynamic request APIs are called inside a cache scope.
*/
function isInsideUnstableCacheScope() {
	return _unstableCacheAls.getStore() === true;
}
const _UNSTABLE_CACHE_PENDING_REVALIDATIONS_KEY = Symbol.for("vinext.unstableCache.pendingRevalidations");
function getPendingUnstableCacheRevalidations() {
	const existing = _g[_UNSTABLE_CACHE_PENDING_REVALIDATIONS_KEY];
	if (existing instanceof Map) return existing;
	const pending = /* @__PURE__ */ new Map();
	_g[_UNSTABLE_CACHE_PENDING_REVALIDATIONS_KEY] = pending;
	return pending;
}
function shouldServeStaleUnstableCacheEntry() {
	return _getCacheState().unstableCacheRevalidation === "background";
}
function waitUntilUnstableCacheRevalidation(promise) {
	if (!isInsideUnifiedScope()) return;
	getRequestContext().executionContext?.waitUntil(promise);
}
function scheduleUnstableCacheBackgroundRevalidation(cacheKey, refresh) {
	const pending = getPendingUnstableCacheRevalidations();
	if (pending.has(cacheKey)) return;
	const trackedRevalidation = refresh().then(() => void 0).catch((err) => {
		console.error(`[vinext] unstable_cache background revalidation failed for ${cacheKey}:`, err);
	}).finally(() => {
		if (pending.get(cacheKey) === trackedRevalidation) pending.delete(cacheKey);
	});
	pending.set(cacheKey, trackedRevalidation);
	waitUntilUnstableCacheRevalidation(trackedRevalidation);
}
async function refreshUnstableCacheResult(fn, args, cacheKey, tags, revalidateSeconds) {
	const result = await _unstableCacheAls.run(true, () => fn(...args));
	const cacheValue = {
		kind: "FETCH",
		data: {
			headers: {},
			body: serializeUnstableCacheResult(result),
			url: cacheKey
		},
		tags,
		revalidate: typeof revalidateSeconds === "number" ? revalidateSeconds : false
	};
	await _getActiveHandler().set(cacheKey, cacheValue, {
		fetchCache: true,
		tags,
		revalidate: revalidateSeconds
	});
	return result;
}
/**
* Wrap an async function with caching.
*
* Returns a new function that caches results. The cache key is derived
* from keyParts + serialized arguments.
*/
function unstable_cache(fn, keyParts, options) {
	const baseKey = keyParts ? keyParts.join(":") : fnv1a64(fn.toString());
	const tags = encodeCacheTags(options?.tags ?? []);
	const revalidateSeconds = options?.revalidate;
	const cachedFn = async (...args) => {
		const cacheKey = `unstable_cache:${baseKey}:${JSON.stringify(args)}`;
		const existing = await _getActiveHandler().get(cacheKey, {
			kind: "FETCH",
			tags
		});
		if (existing?.value && existing.value.kind === "FETCH") {
			const cached = tryDeserializeUnstableCacheResult(existing.value.data.body);
			if (cached.ok) if (existing.cacheState === "stale") {
				if (shouldServeStaleUnstableCacheEntry()) {
					scheduleUnstableCacheBackgroundRevalidation(cacheKey, () => refreshUnstableCacheResult(fn, args, cacheKey, tags, revalidateSeconds));
					return cached.value;
				}
			} else return cached.value;
		}
		return await refreshUnstableCacheResult(fn, args, cacheKey, tags, revalidateSeconds);
	};
	return cachedFn;
}
//#endregion
export { MemoryCacheHandler, NoOpCacheHandler, _consumeRequestScopedCacheLife, _initRequestScopedCacheState, _peekRequestScopedCacheLife, _registerCacheContextAccessor, _runWithCacheState, _setRequestScopedCacheLife, cacheLife, cacheLifeProfiles, cacheTag, getAndClearActionRevalidationKind, getCacheHandler, getRequestExecutionContext, io, isInsideUnstableCacheScope, unstable_noStore as noStore, unstable_noStore, refresh, revalidatePath, revalidateTag, runWithExecutionContext, setCacheHandler, unstable_cache, unstable_cacheLife, unstable_cacheTag, unstable_io, updateTag };

//# sourceMappingURL=cache.js.map