import { normalizePageExtensions } from "../routing/file-matcher.js";
import { isExternalUrl } from "./config-matchers.js";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "../shims/constants.js";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
//#region src/config/next-config.ts
/**
* next.config.js / next.config.mjs / next.config.ts parser
*
* Loads the Next.js config file (if present) and extracts supported options.
* Unsupported options are logged as warnings.
*/
/**
* Parse a body size limit value (string or number) into bytes.
* Accepts Next.js-style strings like "1mb", "500kb", "10mb", bare number strings like "1048576" (bytes),
* and numeric values. Supports b, kb, mb, gb, tb, pb units.
* Returns the default 1MB if the value is not provided or invalid.
* Throws if the parsed value is less than 1.
*/
function parseBodySizeLimit(value) {
	if (value === void 0 || value === null) return 1 * 1024 * 1024;
	if (typeof value === "number") {
		if (value < 1) throw new Error(`Body size limit must be a positive number, got ${value}`);
		return value;
	}
	const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb|pb)?$/i);
	if (!match) {
		console.warn(`[vinext] Invalid bodySizeLimit value: "${value}". Expected a number or a string like "1mb", "500kb". Falling back to 1MB.`);
		return 1 * 1024 * 1024;
	}
	const num = parseFloat(match[1]);
	const unit = (match[2] ?? "b").toLowerCase();
	let bytes;
	switch (unit) {
		case "b":
			bytes = Math.floor(num);
			break;
		case "kb":
			bytes = Math.floor(num * 1024);
			break;
		case "mb":
			bytes = Math.floor(num * 1024 * 1024);
			break;
		case "gb":
			bytes = Math.floor(num * 1024 * 1024 * 1024);
			break;
		case "tb":
			bytes = Math.floor(num * 1024 * 1024 * 1024 * 1024);
			break;
		case "pb":
			bytes = Math.floor(num * 1024 * 1024 * 1024 * 1024 * 1024);
			break;
		default: return 1 * 1024 * 1024;
	}
	if (bytes < 1) throw new Error(`Body size limit must be a positive number, got ${bytes}`);
	return bytes;
}
const CONFIG_FILES = [
	"next.config.ts",
	"next.config.mjs",
	"next.config.js",
	"next.config.cjs"
];
const DEFAULT_EXPIRE_TIME = 31536e3;
/**
* Check whether an error indicates a CJS module was loaded in an ESM context
* (i.e. the file uses `require()` which is not available in ESM).
*/
function isCjsError(e) {
	if (!(e instanceof Error)) return false;
	const msg = e.message;
	return msg.includes("require is not a function") || msg.includes("require is not defined") || msg.includes("exports is not defined") || msg.includes("module is not defined") || msg.includes("__dirname is not defined") || msg.includes("__filename is not defined");
}
const DEFAULT_PHASE = PHASE_DEVELOPMENT_SERVER;
/**
* Emit a warning when config loading fails, with a targeted hint for
* known plugin wrappers that are unnecessary in vinext.
*/
function warnConfigLoadFailure(filename, err) {
	const msg = err.message ?? "";
	const stack = err.stack ?? "";
	const isNextIntlPlugin = msg.includes("next-intl") || stack.includes("next-intl/plugin") || stack.includes("next-intl/dist");
	console.log();
	console.error(`[vinext] Failed to load ${filename}: ${msg}`);
	console.log();
	if (isNextIntlPlugin) console.warn("[vinext] Hint: createNextIntlPlugin() is not needed with vinext. Remove the next-intl/plugin wrapper from your next.config — vinext auto-detects next-intl and registers the i18n config alias automatically.");
}
/**
* Resolve a Next-style config value, calling it if it's a function-form config
* (Next.js supports `module.exports = (phase, opts) => config`).
*/
async function resolveConfigValue(config, phase = DEFAULT_PHASE) {
	if (typeof config === "function") return await config(phase, { defaultConfig: {} });
	return config;
}
/**
* Unwrap the config value from a loaded module namespace.
*/
async function unwrapConfig(mod, phase = PHASE_DEVELOPMENT_SERVER) {
	return await resolveConfigValue(mod.default ?? mod, phase);
}
function findNextConfigPath(root) {
	for (const filename of CONFIG_FILES) {
		const configPath = path.join(root, filename);
		if (fs.existsSync(configPath)) return configPath;
	}
	return null;
}
async function resolveNextConfigInput(config, phase = PHASE_DEVELOPMENT_SERVER) {
	return await resolveConfigValue(config, phase);
}
/**
* Find and load the next.config file from the project root.
* Returns null if no config file is found.
*
* Attempts Vite's module runner first so TS configs and extensionless local
* imports (e.g. `import "./env"`) resolve consistently. If loading fails due
* to CJS constructs (`require`, `module.exports`), falls back to `createRequire`
* so common CJS plugin wrappers (nextra, @next/mdx, etc.) still work.
*/
async function loadNextConfig(root, phase = DEFAULT_PHASE) {
	const configPath = findNextConfigPath(root);
	if (!configPath) return null;
	const filename = path.basename(configPath);
	try {
		const { runnerImport } = await import("vite");
		const { module: mod } = await runnerImport(configPath, {
			root,
			logLevel: "error",
			clearScreen: false
		});
		return await unwrapConfig(mod, phase);
	} catch (e) {
		if (isCjsError(e) && (filename.endsWith(".js") || filename.endsWith(".cjs"))) try {
			return await unwrapConfig(createRequire(path.join(root, "package.json"))(configPath), phase);
		} catch (e2) {
			warnConfigLoadFailure(filename, e2);
			throw e2;
		}
		warnConfigLoadFailure(filename, e);
		throw e;
	}
}
/**
* Generate a UUID that doesn't contain "ad" to avoid false-positive ad-blocker hits.
* Mirrors Next.js's own nanoid retry loop.
*/
function safeUUID() {
	let id = randomUUID();
	while (/ad/i.test(id)) id = randomUUID();
	return id;
}
/**
* Call the user's generateBuildId function and validate its return value.
* Follows Next.js semantics: null return falls back to a random UUID; any
* other non-string throws. Leading/trailing whitespace is trimmed.
*
* @see https://nextjs.org/docs/app/api-reference/config/next-config-js/generateBuildId
*/
async function resolveBuildId(generate) {
	if (!generate) return safeUUID();
	const result = await generate();
	if (result === null) return safeUUID();
	if (typeof result !== "string") throw new Error("generateBuildId did not return a string. https://nextjs.org/docs/messages/generatebuildid-not-a-string");
	const trimmed = result.trim();
	if (trimmed.length === 0) throw new Error("generateBuildId returned an empty string. https://nextjs.org/docs/messages/generatebuildid-not-a-string");
	return trimmed;
}
function resolveDeploymentId(configDeploymentId) {
	const deploymentId = configDeploymentId !== void 0 ? configDeploymentId : process.env.NEXT_DEPLOYMENT_ID;
	if (deploymentId === void 0 || deploymentId === "") return void 0;
	if (typeof deploymentId !== "string") throw new Error("Invalid `deploymentId` configuration: must be a string. https://nextjs.org/docs/messages/deploymentid-not-a-string");
	if (!/^[a-zA-Z0-9_-]+$/.test(deploymentId)) throw new Error("Invalid `deploymentId` configuration: contains invalid characters. Only alphanumeric characters, hyphens, and underscores are allowed. https://nextjs.org/docs/messages/deploymentid-invalid-characters");
	return deploymentId;
}
/**
* Converts a cache handler path to a filesystem path.
* ESM's import.meta.resolve() returns file:// URLs which break when concatenated
* with path operations like path.join or path.relative.
* @param filePath - Absolute path, relative path, or file:// URL (e.g. from import.meta.resolve)
* @returns A filesystem path suitable for path operations
*/
function resolveCacheHandlerPathToFilesystem(filePath) {
	if (filePath.startsWith("file://")) return fileURLToPath(filePath);
	return filePath;
}
/**
* Resolve a NextConfig into a fully-resolved ResolvedNextConfig.
* Awaits async functions for redirects/rewrites/headers.
*/
async function resolveNextConfig(config, root = process.cwd()) {
	if (!config) {
		const buildId = await resolveBuildId(void 0);
		const deploymentId = resolveDeploymentId(void 0);
		const resolved = {
			env: {},
			basePath: "",
			trailingSlash: false,
			output: "",
			pageExtensions: normalizePageExtensions(),
			cacheComponents: false,
			redirects: [],
			rewrites: {
				beforeFiles: [],
				afterFiles: [],
				fallback: []
			},
			headers: [],
			images: void 0,
			i18n: null,
			mdx: null,
			aliases: {},
			allowedDevOrigins: [],
			serverActionsAllowedOrigins: [],
			optimizePackageImports: [],
			serverActionsBodySizeLimit: 1 * 1024 * 1024,
			expireTime: DEFAULT_EXPIRE_TIME,
			serverExternalPackages: [],
			cacheHandler: void 0,
			cacheMaxMemorySize: void 0,
			enablePrerenderSourceMaps: true,
			hashSalt: process.env.NEXT_HASH_SALT ?? "",
			buildId,
			deploymentId
		};
		detectNextIntlConfig(root, resolved);
		return resolved;
	}
	let redirects = [];
	if (config.redirects) {
		const result = await config.redirects();
		redirects = Array.isArray(result) ? result : [];
	}
	let rewrites = {
		beforeFiles: [],
		afterFiles: [],
		fallback: []
	};
	if (config.rewrites) {
		const result = await config.rewrites();
		if (Array.isArray(result)) rewrites.afterFiles = result;
		else rewrites = {
			beforeFiles: result.beforeFiles ?? [],
			afterFiles: result.afterFiles ?? [],
			fallback: result.fallback ?? []
		};
	}
	{
		const externalRewrites = [
			...rewrites.beforeFiles,
			...rewrites.afterFiles,
			...rewrites.fallback
		].filter((rewrite) => isExternalUrl(rewrite.destination));
		if (externalRewrites.length > 0) {
			const noun = externalRewrites.length === 1 ? "external rewrite" : "external rewrites";
			const listing = externalRewrites.map((rewrite) => `  ${rewrite.source} → ${rewrite.destination}`).join("\n");
			console.warn(`[vinext] Found ${externalRewrites.length} ${noun} that proxy requests to external origins:\n${listing}\nRequest headers, including credential headers (cookie, authorization, proxy-authorization, x-api-key), are forwarded to the external origin to match Next.js behavior. If you do not want to forward credentials, use an API route or route handler where you control exactly which headers are sent.`);
		}
	}
	let headers = [];
	if (config.headers) headers = await config.headers();
	const webpackProbe = await probeWebpackConfig(config, root);
	const mdx = webpackProbe.mdx;
	const aliases = {
		...extractTurboAliases(config, root),
		...webpackProbe.aliases
	};
	const allowedDevOrigins = Array.isArray(config.allowedDevOrigins) ? config.allowedDevOrigins : [];
	const experimental = config.experimental;
	const serverActionsConfig = experimental?.serverActions;
	const serverActionsAllowedOrigins = Array.isArray(serverActionsConfig?.allowedOrigins) ? serverActionsConfig.allowedOrigins : [];
	const serverActionsBodySizeLimit = parseBodySizeLimit(serverActionsConfig?.bodySizeLimit);
	const hashSalt = (experimental?.outputHashSalt ?? "") + (process.env.NEXT_HASH_SALT ?? "");
	const rawOptimize = experimental?.optimizePackageImports;
	const optimizePackageImports = Array.isArray(rawOptimize) ? rawOptimize.filter((x) => typeof x === "string") : [];
	const legacyServerComponentsExternal = experimental?.serverComponentsExternalPackages;
	const serverExternalPackages = Array.isArray(config.serverExternalPackages) ? config.serverExternalPackages : Array.isArray(legacyServerComponentsExternal) ? legacyServerComponentsExternal : [];
	if (experimental?.swcEnvOptions !== void 0) console.warn("[vinext] next.config option \"experimental.swcEnvOptions\" is not applicable and will be ignored (vinext uses Vite, not SWC). A Vite-compatible polyfill solution may be explored in the future.");
	if (config.webpack !== void 0) if (mdx || Object.keys(webpackProbe.aliases).length > 0) console.warn("[vinext] next.config option \"webpack\" is only partially supported. vinext preserves resolve.alias entries and MDX loader settings, but other webpack customization is ignored");
	else console.warn("[vinext] next.config option \"webpack\" is not yet supported and will be ignored");
	const output = config.output ?? "";
	if (output && output !== "export" && output !== "standalone") console.warn(`[vinext] Unknown output mode "${output}", ignoring`);
	const pageExtensions = normalizePageExtensions(config.pageExtensions);
	let i18n = null;
	if (config.i18n) i18n = {
		locales: config.i18n.locales,
		defaultLocale: config.i18n.defaultLocale,
		localeDetection: config.i18n.localeDetection ?? true,
		domains: config.i18n.domains
	};
	const buildId = await resolveBuildId(config.generateBuildId);
	const deploymentId = resolveDeploymentId(config.deploymentId);
	const cacheHandler = typeof config.cacheHandler === "string" ? resolveCacheHandlerPathToFilesystem(config.cacheHandler) : void 0;
	const cacheMaxMemorySize = typeof config.cacheMaxMemorySize === "number" ? config.cacheMaxMemorySize : void 0;
	const resolved = {
		env: config.env ?? {},
		basePath: config.basePath ?? "",
		trailingSlash: config.trailingSlash ?? false,
		output: output === "export" || output === "standalone" ? output : "",
		pageExtensions,
		cacheComponents: config.cacheComponents ?? false,
		redirects,
		rewrites,
		headers,
		images: config.images,
		i18n,
		mdx,
		aliases,
		allowedDevOrigins,
		serverActionsAllowedOrigins,
		optimizePackageImports,
		serverActionsBodySizeLimit,
		expireTime: typeof config.expireTime === "number" ? config.expireTime : DEFAULT_EXPIRE_TIME,
		serverExternalPackages,
		cacheHandler,
		cacheMaxMemorySize,
		enablePrerenderSourceMaps: config.enablePrerenderSourceMaps ?? true,
		hashSalt,
		buildId,
		deploymentId
	};
	detectNextIntlConfig(root, resolved);
	return resolved;
}
function normalizeAliasEntries(aliases, root) {
	if (!aliases) return {};
	const normalized = {};
	for (const [key, value] of Object.entries(aliases)) {
		if (typeof value !== "string") continue;
		normalized[key] = path.isAbsolute(value) ? value : path.resolve(root, value);
	}
	return normalized;
}
function extractTurboAliases(config, root) {
	const experimentalTurbo = config.experimental?.turbo;
	const topLevelTurbopack = config.turbopack;
	return {
		...normalizeAliasEntries(experimentalTurbo?.resolveAlias, root),
		...normalizeAliasEntries(topLevelTurbopack?.resolveAlias, root)
	};
}
async function probeWebpackConfig(config, root) {
	if (typeof config.webpack !== "function") return {
		aliases: {},
		mdx: null
	};
	const mockModuleRules = [];
	const mockConfig = {
		context: root,
		resolve: { alias: {} },
		module: { rules: mockModuleRules },
		plugins: []
	};
	const mockOptions = {
		defaultLoaders: { babel: { loader: "next-babel-loader" } },
		isServer: false,
		dev: false,
		dir: root
	};
	try {
		const finalConfig = await config.webpack(mockConfig, mockOptions) ?? mockConfig;
		const rules = finalConfig.module?.rules ?? mockModuleRules;
		return {
			aliases: normalizeAliasEntries(finalConfig.resolve?.alias, root),
			mdx: extractMdxOptionsFromRules(rules)
		};
	} catch {
		return {
			aliases: {},
			mdx: null
		};
	}
}
/**
* Extract MDX compilation options (remark/rehype/recma plugins) from
* a Next.js config that uses @next/mdx.
*
* @next/mdx wraps the config with a webpack function that injects an MDX
* loader rule. The remark/rehype plugins are captured in that closure.
* We probe the webpack function with a mock config to extract them.
*/
async function extractMdxOptions(config, root = process.cwd()) {
	return (await probeWebpackConfig(config, root)).mdx;
}
/**
* Probe file candidates relative to root. Returns the first one that exists,
* or null if none match.
*/
function probeFiles(root, candidates) {
	for (const candidate of candidates) {
		const abs = path.resolve(root, candidate);
		if (fs.existsSync(abs)) return abs;
	}
	return null;
}
const I18N_REQUEST_CANDIDATES = [
	"i18n/request.ts",
	"i18n/request.tsx",
	"i18n/request.js",
	"i18n/request.jsx",
	"src/i18n/request.ts",
	"src/i18n/request.tsx",
	"src/i18n/request.js",
	"src/i18n/request.jsx"
];
/**
* Detect next-intl in the project and auto-register the `next-intl/config`
* alias if needed.
*
* next-intl's `createNextIntlPlugin()` crashes in vinext because it calls
* `require('next/package.json')` to check the Next.js version. Instead,
* vinext detects next-intl and registers the alias automatically.
*
* Note: `require.resolve('next-intl')` walks up to parent `node_modules`
* directories via standard Node module resolution. In a monorepo, next-intl
* installed at the workspace root will trigger detection even if not listed
* in the project's own package.json. This is acceptable since a workspace-root
* install implies the user wants it available.
*
* Mutates `resolved.aliases` and `resolved.env` in place.
*/
function detectNextIntlConfig(root, resolved) {
	if (resolved.aliases["next-intl/config"]) return;
	const require = createRequire(path.join(root, "package.json"));
	try {
		require.resolve("next-intl");
	} catch {
		return;
	}
	const configPath = probeFiles(root, I18N_REQUEST_CANDIDATES);
	if (!configPath) return;
	resolved.aliases["next-intl/config"] = configPath;
	if (resolved.trailingSlash) resolved.env._next_intl_trailing_slash = "true";
}
function extractMdxOptionsFromRules(rules) {
	for (const rule of rules) {
		const loaders = extractMdxLoaders(rule);
		if (loaders) return loaders;
	}
	return null;
}
/**
* Recursively search a webpack rule (which may have nested `oneOf` arrays)
* for an MDX loader and extract its remark/rehype/recma plugin options.
*/
function extractMdxLoaders(rule) {
	if (!rule) return null;
	if (Array.isArray(rule.oneOf)) for (const child of rule.oneOf) {
		const result = extractMdxLoaders(child);
		if (result) return result;
	}
	const use = Array.isArray(rule.use) ? rule.use : rule.use ? [rule.use] : [];
	for (const loader of use) {
		const loaderPath = typeof loader === "string" ? loader : loader?.loader;
		if (typeof loaderPath === "string" && isMdxLoader(loaderPath)) return extractPluginsFromOptions(typeof loader === "object" ? loader.options : {});
	}
	if (typeof rule.loader === "string" && isMdxLoader(rule.loader)) return extractPluginsFromOptions(rule.options);
	return null;
}
function isMdxLoader(loaderPath) {
	return loaderPath.includes("mdx") && (loaderPath.includes("@next") || loaderPath.includes("@mdx-js") || loaderPath.includes("mdx-js-loader") || loaderPath.includes("next-mdx"));
}
function extractPluginsFromOptions(opts) {
	if (!opts || typeof opts !== "object") return null;
	const remarkPlugins = Array.isArray(opts.remarkPlugins) ? opts.remarkPlugins : void 0;
	const rehypePlugins = Array.isArray(opts.rehypePlugins) ? opts.rehypePlugins : void 0;
	const recmaPlugins = Array.isArray(opts.recmaPlugins) ? opts.recmaPlugins : void 0;
	if (remarkPlugins && remarkPlugins.length > 0 || rehypePlugins && rehypePlugins.length > 0 || recmaPlugins && recmaPlugins.length > 0) return {
		...remarkPlugins && remarkPlugins.length > 0 ? { remarkPlugins } : {},
		...rehypePlugins && rehypePlugins.length > 0 ? { rehypePlugins } : {},
		...recmaPlugins && recmaPlugins.length > 0 ? { recmaPlugins } : {}
	};
	return null;
}
//#endregion
export { PHASE_PRODUCTION_BUILD, detectNextIntlConfig, extractMdxOptions, findNextConfigPath, loadNextConfig, parseBodySizeLimit, resolveNextConfig, resolveNextConfigInput };

//# sourceMappingURL=next-config.js.map