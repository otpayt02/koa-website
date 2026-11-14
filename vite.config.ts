import vinext from "vinext";
import { defineConfig } from "vite";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

// The standalone Worker is the default. Sites packaging remains opt-in for
// maintaining the existing deployment while the domain is migrated.
const sitesMode = process.env.KOA_HOSTING_MODE === "sites";

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

export default defineConfig(async () => {
  const bindings = sitesMode
    ? JSON.parse(await (await import("node:fs/promises")).readFile(".openai/hosting.json", "utf8")) as { d1?: string; r2?: string }
    : { d1: "DB", r2: "MEDIA" };
  const localBindingConfig = {
    name: "koa-public-website",
    main: "./worker/index.ts",
    compatibility_flags: ["nodejs_compat"],
    d1_databases: bindings.d1
    ? [
        {
          binding: bindings.d1,
          database_name: process.env.KOA_D1_DATABASE_NAME || "koa-public-d1",
          database_id: process.env.KOA_D1_DATABASE_ID || SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
    r2_buckets: bindings.r2
    ? [
        {
          binding: bindings.r2,
          bucket_name: process.env.KOA_R2_BUCKET_NAME || "koa-public-media",
        },
      ]
    : [],
  };
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      ...(sitesMode ? [sites()] : []),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    ],
  };
});
