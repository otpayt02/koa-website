# KOA public site: standalone Cloudflare Worker

The source now builds as a standalone vinext Worker by default. `KOA_HOSTING_MODE=sites` is an opt-in compatibility path for the existing Sites deployment. Building this branch does **not** change DNS or the public site. `KOA_WORKER_NAME` can give a preview a separate name. `KOA_R2_BUCKET_NAME=disabled` omits the media binding for a limited preview; audio uploads then return a 503 configuration error and scheduled reviewed-dataset export is off.

The separate preview is [koa-public-website-preview.oliverp789.workers.dev](https://koa-public-website-preview.oliverp789.workers.dev/en). It uses the existing empty `koa-website-db`, no R2 binding, and preview response headers that tell search engines not to index it. Public text, routes, and assets can be inspected there. Forms and database-backed features still need migrations and a checked data transfer before the domain can move. The live `www.koamerica.org` remains on Sites.

## Local candidate

From the repository root:

```powershell
npm.cmd ci
npm.cmd run build
npx.cmd wrangler dev --config dist/server/wrangler.json --port 3004 --local
```

Open `http://127.0.0.1:3004/en`, `/ksw`, and `/en/commentary`. Wrangler serves `dist/client` assets and local D1/R2 bindings. `vinext start` currently returns the HTML but fails to serve the built asset URLs on this Windows setup, so it is not the candidate preview command.

## Production prerequisites

1. Sign into the KOA-owned Cloudflare account with Wrangler. On 2026-11-14, Wrangler OAuth authenticated to Oliver's account. Recheck with `npx.cmd wrangler whoami` before release.
2. Create or identify a KOA D1 database and R2 bucket in that account. `wrangler d1 list` found an empty `koa-website-db` (zero tables), while `wrangler r2 bucket list` failed with Cloudflare code 10042, "Please enable R2 through the Cloudflare Dashboard." Build with `KOA_D1_DATABASE_ID`, `KOA_D1_DATABASE_NAME`, and `KOA_R2_BUCKET_NAME` set to their real values. The generated `dist/server/wrangler.json` must contain those exact names and a non-placeholder D1 ID. Never commit credentials.
3. Apply and verify the repository's `drizzle` migrations against the new D1 database. Inventory any live Sites data and transfer it with a checked count/hash before routing write APIs to the new database. The existing Sites bindings are not automatically migrated.
4. Deploy a Workers preview URL, then check homepage, Karen language route, commentary, images, forms, API responses, mobile layout, keyboard navigation, and reduced motion. Compare the new deployment with the public site. Keep donation as an intent until KOA has its own payment account.
5. After the preview and data checks pass, change the `www` DNS target from `custom-domains.chatgpt.site` to the Worker custom domain. Verify HTTPS, redirects, canonical URLs, robots, sitemap, and API writes on the public domain. Retain a rollback record for the previous DNS target.

The Brain is a separate private Docker application. Do not publish its operator token, database, or executive material with the public Worker.
