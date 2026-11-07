# Cloudflare backend — setup note

**Status: PREPARED, NOT LIVE.** Everything below was scaffolded on the
`cloudflare-backend` branch. Nothing has been deployed, no DNS has changed,
and koamerica.org still points wherever it points today. The remaining steps
are one-time dashboard actions (about 15 minutes) plus Oliver's go-ahead.

## What this branch adds

| File | Purpose |
| --- | --- |
| `wrangler.toml` | Site worker config. Entry point matches the existing app worker (`worker/index.ts`); D1 binding name `DB` matches `db/index.ts`. |
| `cloudflare/wrangler.forms.toml` | Config for the standalone forms worker, sharing the same D1 database. |
| `cloudflare/forms-worker.ts` | Forms API: `POST /api/contact`, `POST /api/donate-intake`, `POST /api/training-contributions`, `GET /health`. |
| `cloudflare/migrations/0001_forms.sql` | D1 tables: `contact_submissions`, `donation_intakes`, `training_contributions`. |
| `.github/workflows/deploy-cloudflare.yml` | On push to `main`: build, apply D1 migrations, deploy both workers. Inert until the secrets below exist. |

Notes on scope:

- **Donations are intake only.** The form records that a visitor wants to
  give (name, email, intended amount/frequency). No payment is processed and
  no payment details are stored — a real processor (e.g. Stripe) stays a
  separate, later decision.
- **Training contributions are community-supplied S'gaw Karen material.**
  Every submission is stored exactly as sent with status `unreviewed`; the
  worker never generates or edits Karen text. Only a human reviewer may move
  a row to `approved`, and only approved rows may ever be exported into a
  training dataset.
- The app already has in-repo API routes and a training worker built for the
  current ChatGPT Sites hosting. This standalone worker is the portable
  equivalent for the Cloudflare move, so the forms keep working the day the
  site leaves ChatGPT Sites.

## One-time setup (Cloudflare dashboard + GitHub)

Do these in order. Steps 1–4 are safe prep; step 5 is the actual go-live and
needs Oliver's explicit go-ahead.

1. **Create the Pages project (site hosting shell)**
   Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git →
   select `otpayt02/koa-website`. Production branch: `main`. (If the site
   deploys purely as a Worker through the GitHub Action below, this project
   can be skipped — pick ONE deploy path at go-live time; the Action is the
   recommended one because it also runs the D1 migrations and deploys the
   forms worker.)

2. **Create the D1 database**
   Dashboard → Storage & Databases → D1 → Create database, name it
   `koa-website-db`. Copy its database ID and replace
   `REPLACE_WITH_D1_DATABASE_ID` in BOTH `wrangler.toml` and
   `cloudflare/wrangler.forms.toml`, then commit that change.

3. **Create a Cloudflare API token**
   Dashboard → My Profile → API Tokens → Create Token → use the
   "Edit Cloudflare Workers" template, and add D1: Edit permission.
   Copy the token once (it is shown only once) and keep it out of the repo,
   chat, and email — it goes straight into GitHub Secrets in step 4.

4. **Add the GitHub repository secrets**
   GitHub → `otpayt02/koa-website` → Settings → Secrets and variables →
   Actions → New repository secret:
   - `CLOUDFLARE_API_TOKEN` — the token from step 3
   - `CLOUDFLARE_ACCOUNT_ID` — shown on the Cloudflare dashboard's
     Workers & Pages overview page
   Once these exist, the `Deploy to Cloudflare` workflow can run; trigger it
   once manually (Actions tab → Run workflow) to verify before relying on
   push-to-deploy.

5. **DNS for koamerica.org (GO-LIVE STEP — do not do early)**
   The domain already lives on Cloudflare (registrar + email routing), so no
   nameserver change is needed. At go-live only: in the dashboard, attach
   the custom domain `koamerica.org` (and `www`) to the deployed worker /
   Pages project, which creates the proxied DNS records automatically.
   Verify email routing still works afterwards (the `oliver@` / `op@`
   forwards), and only then retire the ChatGPT Sites version.

## After go-live

- Point the site's forms at the forms worker's origin (e.g.
  `https://api.koamerica.org/...` if a custom domain is attached, or the
  `workers.dev` URL) and add that origin pairing to `ALLOWED_ORIGINS` in
  `cloudflare/forms-worker.ts` if a staging origin is introduced.
- Review training contributions regularly; export only `approved` rows for
  training use.
