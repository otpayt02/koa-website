import { ReadonlyURLSearchParams } from "./readonly-url-search-params.js";
import { GLOBAL_ACCESSORS_KEY, HTTP_ERROR_FALLBACK_ERROR_CODE, RedirectType, ServerInsertedHTMLContext, _registerStateAccessors, clearServerInsertedHTML, flushServerInsertedHTML, forbidden, getAccessFallbackHTTPStatus, getLayoutSegmentContext, getNavigationContext, isHTTPAccessFallbackError, notFound, permanentRedirect, redirect, renderServerInsertedHTML, setNavigationContext, unauthorized } from "./navigation.js";
import { throwClientHookError } from "./client-hook-error.js";
//#region src/shims/navigation.react-server.ts
function usePathname() {
	throwClientHookError("usePathname()");
}
function useSearchParams() {
	throwClientHookError("useSearchParams()");
}
function useParams() {
	throwClientHookError("useParams()");
}
function useRouter() {
	throwClientHookError("useRouter()");
}
function useSelectedLayoutSegment() {
	throwClientHookError("useSelectedLayoutSegment()");
}
function useSelectedLayoutSegments() {
	throwClientHookError("useSelectedLayoutSegments()");
}
function useServerInsertedHTML() {
	throwClientHookError("useServerInsertedHTML()");
}
//#endregion
export { GLOBAL_ACCESSORS_KEY, HTTP_ERROR_FALLBACK_ERROR_CODE, ReadonlyURLSearchParams, RedirectType, ServerInsertedHTMLContext, _registerStateAccessors, clearServerInsertedHTML, flushServerInsertedHTML, forbidden, getAccessFallbackHTTPStatus, getLayoutSegmentContext, getNavigationContext, isHTTPAccessFallbackError, notFound, permanentRedirect, redirect, renderServerInsertedHTML, setNavigationContext, unauthorized, useParams, usePathname, useRouter, useSearchParams, useSelectedLayoutSegment, useSelectedLayoutSegments, useServerInsertedHTML };

//# sourceMappingURL=navigation.react-server.js.map