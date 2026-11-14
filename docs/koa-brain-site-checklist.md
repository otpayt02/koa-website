# KOA website and Company Brain checklist

Checked 2026-11-14. `[x]` means verified in this checkout or by the stated HTTP check; `[ ]` is work still to do. A source file or successful build is not proof that a feature is deployed to the public site.

## Open the two experiences

- **Public site:** [koamerica.org/en](https://www.koamerica.org/en) (HTTP 200). [S’gaw Karen entry](https://www.koamerica.org/ksw) and [events](https://www.koamerica.org/en/events) also returned HTTP 200.
- **Local Company Brain:** [localhost:3000](http://127.0.0.1:3000/) returned HTTP 200 with the Vite frontend running directly. Enter the operator token from ignored `brain-app/.env`. Docker Desktop was unavailable, and the working tree has an uncommitted Compose port change to 3001/8001; check `docker compose ps` before using containers.
- **Local Brain API health:** [localhost:8000/health](http://127.0.0.1:8000/health) returned HTTP 200 with a Python 3.11 venv backend. Protected API routes require the operator token.
- **Standalone public site candidate:** [localhost:3004/en](http://127.0.0.1:3004/en) when the built Worker is running with Wrangler. The homepage, commentary page, hero image, and built CSS all returned HTTP 200 in the latest local pass.
- **Code:** [website](https://github.com/otpayt02/koa-website/tree/codex/koa-company-brain-connectors/app), [Brain](https://github.com/otpayt02/koa-website/tree/codex/koa-company-brain-connectors/brain-app).

## 1. Brain frontend

- [x] Local operator-token login, inbox, processed files, and manual source-sync control exist.
- [x] Three.js knowledge map, keyboard-accessible node list, and selected-record detail exist. The graph is a visualization of character similarity; edges do not establish semantic relationships.
- [x] Editorial desk shows attributed news links, source selection, private English draft form, review slots, and draft status. Its production bundle built successfully.
- [x] Authenticated desktop Overview and Editorial desk, plus 390 px mobile Editorial desk, were rendered in a real browser. The index showed 38 nodes and 104 character-similarity links; the Editorial desk displayed 20 attributed public headlines.
- [x] Fixed the mobile workspace navigation so all four destinations remain visible, and moved the Editorial refresh control below its heading at 390 px.
- [ ] Finish the authenticated mobile 3D map, keyboard, and reduced-motion interaction pass.
- [ ] Polish empty/loading/error states, focus order, touch targets, contrast, and reduced-motion behavior based on that pass.
- [ ] Add individual executive accounts and role controls before treating the Brain as a shared team workspace.

## 2. Brain backend and workers

- [x] FastAPI health, token-gated inbox/knowledge/graph/news/commentary/sync routes, SQLite local vector index, and Docker Compose startup exist. The API health check returned HTTP 200.
- [x] GitHub manual sync and an approved-folder Drive connector exist. The approved Drive folder was empty at first live sync; no folder content was indexed then.
- [x] A copy of the KOA website content draft was placed in the approved Drive folder with an **unreviewed** label. One Drive record was ingested; the local index then reported 38 documents and 283 chunks. This is private source material, not approved public copy.
- [x] Hourly public RSS intake from Karen News and KIC News, private review suggestions, and non-publishing commentary drafts exist. The last verified intake returned 20 attributed headlines and 20 suggestions.
- [x] Backend synthetic suite passed 13 tests in the previous build pass.
- [x] Added `tzdata` to the backend requirements so the Central-time commentary schedule starts on Windows Python 3.11. Local API health returned HTTP 200 with the approved Drive connector reported ready.
- [ ] Verify connector freshness, failure/retry behavior, and data retention over time; add team authentication and encryption before executive data ingestion.
- [ ] Connect the exact KOA Signal executive group only after its linked account and group ID are supplied and the privacy scope is approved.
- [ ] Implement a supported, permissioned KOA Facebook media/post intake. Do not substitute invented posts or altered documentary faces.
- [ ] Add reviewed S’gaw Karen translation and an editorial approval path before any public commentary publication.

## 3. Public website frontend

- [x] Public English homepage and S’gaw Karen entry returned HTTP 200. The local site source includes the KOA hero, K–seal–A and Karen-glyph scenes, GSAP/Lenis motion, event navigation, donation form, and language routes.
- [x] Local source includes a commentary review-status page; the root site build passed in the previous pass.
- [x] Local glyph trail ink is 60% opacity; dust motes use 70% peak opacity and a slightly larger size range. Reduced-motion preference now reaches both shared canvas layers. The standalone Worker preview rendered the hero with the authentic seal.
- [ ] Publish and verify the reviewed commentary route: [koamerica.org/en/commentary](https://www.koamerica.org/en/commentary) returned HTTP **404** on 2026-11-14.
- [ ] Run a complete desktop/mobile/reduced-motion visual pass across home, language switch, events, donation, and navigation; fix observed failures while preserving current routes and content.
- [x] Desktop homepage and 390 px mobile homepage/commentary were rendered through the local Worker. The latest homepage browser navigation showed no console errors; a full interaction and reduced-motion pass is still open.
- [ ] Finish the requested event calendar expansion, volunteer quotes, translation flyer, responsive media, and K–seal–A footer choreography where absent or incomplete. Use reviewed people, captions, and rights-cleared photography only.
- [ ] Build the requested accessible component-version browser with real variants and a keyboard alternative; the current protected Design Studio is a frame review surface, not that browser.

## 4. Public website backend and release

- [x] Source includes contact, donation-intent, dictionary, translation-review, and admin API routes. The donation form calls `/api/donations`; without a checkout provider, the API describes the record as an intent only.
- [ ] Establish a KOA-owned Stripe account or approved hosted Payment Link before enabling checkout. Verify signed payment events and receipts; no live payment was tested.
- [ ] Confirm the live deployment’s API, database bindings, admin permissions, and language/content parity against this branch before a release claim.
- [x] Standalone Cloudflare Worker build is the default; Sites packaging is opt-in. Canonical metadata, organization URL, robots, and sitemap now target `www.koamerica.org` and `/ksw`.
- [ ] Authenticate a KOA-owned Cloudflare account, create its D1/R2 resources, migrate/check data, deploy a preview, and switch DNS after candidate review. See [migration runbook](cloudflare-migration.md).
- [ ] Review S’gaw Karen copy, political commentary, partner claims, media rights, and documentary faces with KOA before publishing.
- [ ] Run the site test/build gate and an HTTP/browser smoke pass on the candidate release, then deploy only with explicit release authorization.
- [ ] Reconcile the older repository contract suite before release: the standalone build and bilingual inventory pass, but `node --test tests/*.test.mjs` currently reports 73 passing and 67 failing tests. The failures include legacy expectations for routes and motion phases that already differ from the current checkout; this run is not a clean release gate.

## Run locally

**Brain:** With Docker available, run `docker compose up --build -d` in `brain-app/` and check the printed ports. Without Docker on Windows, create a Python 3.11 venv in `brain-app/.venv`, install `brain-app/backend/requirements.txt`, set `BRAIN_DATA_PATH` to the repository root and the approved Drive paths, and start `uvicorn main:app --app-dir brain-app/backend --env-file brain-app/.env --host 127.0.0.1 --port 8000`. Run `npm.cmd run dev -- --host 127.0.0.1 --port 3000` in `brain-app/frontend/`. Keep the operator token in ignored `brain-app/.env`.

**Website:** In PowerShell, `Set-Location 'C:\Users\olive\Projects\koa-website'; npm.cmd run build; npx.cmd wrangler dev --config dist/server/wrangler.json --port 3004 --local`. Open [localhost:3004/en](http://127.0.0.1:3004/en). The live public site is a separate deployment and currently lags this branch.
