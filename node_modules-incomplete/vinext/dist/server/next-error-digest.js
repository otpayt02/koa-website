//#region src/server/next-error-digest.ts
/**
* Pulls a stringified `digest` off an unknown thrown value, or returns null
* when the value is not a digest-bearing error.
*/
function getNextErrorDigest(error) {
	if (!error || typeof error !== "object" || !("digest" in error)) return null;
	return String(error.digest);
}
/**
* Parses a `NEXT_REDIRECT;<type>;<encodedUrl>;<status>` digest. Returns null
* when the digest is not a redirect digest or the encoded URL segment is
* missing. The `url` is decoded with `decodeURIComponent`; the `status`
* defaults to 307 when omitted; an omitted `type` is left as null so the
* caller can apply the correct context-sensitive default.
*/
function parseNextRedirectDigest(digest) {
	if (!digest.startsWith("NEXT_REDIRECT;")) return null;
	const parts = digest.split(";");
	const encodedUrl = parts[2];
	if (!encodedUrl) return null;
	const type = parts[1];
	return {
		status: parts[3] ? parseInt(parts[3], 10) : 307,
		type: type || null,
		url: decodeURIComponent(encodedUrl)
	};
}
/**
* Parses a `NEXT_NOT_FOUND` or `NEXT_HTTP_ERROR_FALLBACK;<status>` digest.
* Returns `{ status: 404 }` for `NEXT_NOT_FOUND` and the parsed status code
* for the fallback form. Returns null otherwise.
*/
function parseNextHttpErrorDigest(digest) {
	if (digest === "NEXT_NOT_FOUND") return { status: 404 };
	if (digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;")) return { status: parseInt(digest.split(";")[1], 10) };
	return null;
}
//#endregion
export { getNextErrorDigest, parseNextHttpErrorDigest, parseNextRedirectDigest };

//# sourceMappingURL=next-error-digest.js.map