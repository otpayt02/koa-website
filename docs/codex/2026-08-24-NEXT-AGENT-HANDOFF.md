# KOA Website — Next-Agent Handoff Digest

**Date:** 2026-08-24
**Branch:** `feat/cinematic-spec` (verified, ready for fast-forward to `main`)
**Live server:** `http://127.0.0.1:62290/en` (owned PID 21752, stop with `.\scripts\stop-koa.ps1`)
**Author:** Oliver Payton + Qoder agent continuation of the Codex → ChatGPT → Codex thread lineage

---

## TL;DR — Where We Are Right Now

- **60/60 Phase 7 contract tests pass.**
- **Build passes** (`npm run build`) with all four locale routes (en/th/my/ksw) returning HTTP 200, root `/` → `/en` redirect (307), and admin studios rejecting anonymous access (307 to auth).
- **Seal-contract regression fixed** this session — the test was asserting nonexistent `id="seal"` strings; it now verifies the real SVG pattern IDs and the opening scene class.
- **Task 2 runner repair** still deferred: `run-koa.ps1` and `stop-koa.ps1` have unstaged modifications that repair PID-ownership and port-conflict behavior. Tests still pass (2/2).
- **Phase 7 Task 12 (full browser QA + Playwright evidence capture)** is the next obvious code gate before fast-forwarding `main`.

This digest is the map. Start with the sections in this order:

1. **Vision** — the north star
2. **Repository map** — what's where
3. **Test + evidence state** — what's green, what's amber, what's red
4. **Unstaged changes** — what's in the working tree right now
5. **Next concrete actions** — ranked
6. **Ecosystem context** — karen-lang-trans, karen-scraper-web, karen-music, S'gaw-Mango AI

---

## 1. Vision — The North Star

**Product:** Karen Organization of America (KOA) — `koamerica.org` (eventual domain).
A cinematic, bilingual (eventually quad-lingual: EN/TH/MY/KSW) website for the S'gaw Karen diaspora in America. It must feel like a patient documentary, not a marketing site. Rival the prestige of the Karen National Union's `knu.org`.

**Integrated services on KOA:**

| Service | Source repo | Status |
|---|---|---|
| Public cinematic site | `koa-website` (this repo) | Phase 7 verification |
| Admin Language Studio (provenance for translation review) | `koa-website` | Implemented locally |
| Admin Design Studio (frame rail + mobile preview) | `koa-website` | Implemented locally |
| Karen Music Director (chord-chart editor + sheet generator) | `music_director_database/karen_music_website` | Running separately on port 4177 via `/restart-karen-music-sites` skill; needs KOA-service integration spec (see `docs/specs/2026-08-24-music-director-service-integration.md`) |
| S'gaw-Mango AI (multimodal Karen language agent) | `karen-lang-trans` + `karen-scraper-web` + `karen-sentence-builder` + `karen-language-agent` + Roboflow OCR (88.7% mAP) + vast.ai GPU training | Not yet promoted on KOA; needs integration spec (see `docs/specs/2026-08-24-sgaw-mango-ai-integration.md`) |

**Design principles (non-negotiable):**

- K–seal-as-O–A choreography preserved; the supplied KOA seal asset is the only identity.
- Native scrolling — never intercept wheel/touch/keyboard.
- Desktop film = `1800vh`, mobile film = `1440vh`.
- One cinematic message per viewport.
- Hermes blue field, Karen red interaction, torch gold ceremony.
- Bodoni Moda (display) + Manrope (body) + Noto Serif Myanmar (Karen/Myanmar).
- Motion-off / reduced-motion must resolve to complete, truthful, readable states.
- **No deployment, publication, donation processing, translation claim, or cultural assertion is implied by source work.** All of those remain approval-gated.

---

## 2. Repository Map

| Path | Owner | Notes |
|---|---|---|
| `app/[lang]/` | Public React App Router | Four locale pivots |
| `app/[lang]/admin/` | Admin-only dashboards | `requirePageAdmin` guarded |
| `app/api/admin/content-units/route.ts` | Content unit CRUD | Admin-only |
| `app/api/admin/translation-proposals/route.ts` | Proposal lifecycle | Admin-only |
| `components/CinematicHome.tsx` | Home film composition | ~400 LOC; owns progress + canvas orchestration |
| `components/cinematic/SealAssembly.tsx` | Two-layer seal (core + rotating annulus) | Phase 7 Task 8 |
| `components/cinematic/LivingGlyphField.tsx` | Ambient + cursor matrix field | Phase 7 Task 9 |
| `components/cinematic/PartnerMarquee.tsx` | Verified partner rows | Phase 7 Task 10 |
| `components/admin/LanguageStudio.tsx` | Translation review UI | Phase 7 Task 6 |
| `components/admin/DesignStudio.tsx` | Frame rail + mobile preview | Phase 7 Task 7 |
| `components/KOALogoIntro.tsx` | K/A glyph formation canvas | Pre-Phase 7, stable |
| `content/cinematic-frame-manifest.json` | Chronological frame rail | Phase 7 Task 7, versioned |
| `content/partners.ts` | Partner records with approval gates | Phase 7 Task 10 |
| `db/schema.ts` | Drizzle schema (D1) | Phase 7 Task 5 translation provenance |
| `drizzle/` | Migrations | `0001_phase7_content_studio.sql` |
| `messages/{en,th,my,ksw}.json` | Locale catalogs | Thai/Burmese/S'gaw Karen are *proposals*, not approved |
| `public/koa/` | Static parity reference (read-only) | Do not modify except for parity tests |
| `scripts/run-koa.ps1` / `scripts/stop-koa.ps1` | One-paste runner | Phase 7 Task 2, has unstaged repairs |
| `scripts/update-understanding.mjs` | Deterministic UNDERSTANDING.md generator | Phase 7 Task 11 |
| `scripts/snapshot-cinematic-spec.mjs` | Frame snapshot generator | Phase 7 Task 11 |
| `skills/` | Four project skills | Phase 7 Task 11 |
| `tests/*.test.mjs` | ~60 contract tests across Phase 7 tasks | All green after this session's seal fix |
| `docs/KOA-CINEMATIC-COOKBOOK.md` | Motion/visual source of truth | Read before any cinematic change |
| `docs/decisions.md` | Decision log | Append only |
| `docs/progress.md` | Phase history | Append only |
| `docs/codex/REQUEST_ADHERENCE_LEDGER.md` | Requirement tracking | Update with evidence |
| `docs/specs/` | **New specs live here** | See `2026-08-24-sgaw-mango-ai-integration.md` and `2026-08-24-music-director-service-integration.md` |

---

## 3. Test + Evidence State

| Gate | Status | Notes |
|---|---|---|
| `npm run build` | ✅ | 64 routes + 16 API endpoints |
| `tsc --noEmit` | ✅ | No type errors |
| `node --test` (12 Phase 7 test files) | ✅ | **60/60 pass** |
| `run-koa-script.test.mjs` | ✅ | 2/2 pass |
| `/` → `/en` redirect | ✅ | 307 |
| `/{en,th,my,ksw}` | ✅ | 200 |
| Admin anon rejection | ✅ | 307 to auth |
| Existing Playwright evidence | ⚠️ | `output/playwright/phase7-*.jpg` and `phase7-runtime-evidence.json` exist from prior run but are **untracked**; verify freshness before committing |
| `npm run lint` | ⚠️ | Not run this session — run before commit |
| `npm test` (build + rendered) | ⚠️ | Not re-run this session — build already passed, but `tests/rendered-*.test.mjs` should be re-run after next build |
| Phase 7 Task 12 fresh browser QA | 🔲 | Not performed this session — recommended next gate |
| Phase 7 Task 13 bilingual worktree retirement | 🔲 | `koa-website-bilingual` worktree still exists locally |
| Phase 7 Task 14 fast-forward to `main` | 🔲 | Blocked on Task 12 + user approval |

---

## 4. Unstaged Changes in the Working Tree

Run `git status` from this repo — you will see:

**Modified (tracked):**
- `scripts/run-koa.ps1` (+83/–15) — wrapper-PID and stale-state ownership repairs from previous Codex
- `scripts/stop-koa.ps1` (+79/–15) — corresponding stop-side repairs
- `tests/run-koa-script.test.mjs` (+12/–2) — additional contract assertions
- `tests/phase7-seal-contract.test.mjs` (+11/–2) — **this session's fix**; now asserts real pattern IDs + opening scene class
- `public/koa/index.html`, `public/koa/storytelling.css` — pre-existing parity edits, NOT part of Phase 7
- `.wrangler/*`, `tsconfig.tsbuildinfo` — generated; safe to discard or ignore
- `install.cmd`, `Downloading`, `Fetching`, `Latest`, `Verifying` — stray download artifacts; safe to delete

**Untracked (intentional):**
- `cinematic-cookbook.md` (root) — pre-existing preserved artifact
- `output/playwright/phase*.{jpg,png,json}` — named evidence, inspectable
- `scripts/verify-phase7-one-app.cjs` — Phase 7 Task 12 verifier (created, not yet exercised)
- `scripts/diagnose-koa-stop.ps1` — diagnostic from prior session
- `tests/run-koa-behavior.test.mjs` — prior extension, currently unused

**Action before commit:** review each group, stage only Phase-7-relevant edits, discard generated noise. The seal-contract fix is the smallest, cleanest commit: `git add tests/phase7-seal-contract.test.mjs && git commit -m "test: align seal-contract assertions with real SVG pattern IDs"`.

---

## 5. Next Concrete Actions (Ranked)

1. **Commit the seal-contract test fix** — it's a one-line source repair with zero product change.
2. **Stage the run-koa.ps1 / stop-koa.ps1 / test repairs** from prior Codex, review them, commit as `fix: harden one-paste runner ownership checks`.
3. **Task 12 browser QA** — use `scripts/verify-phase7-one-app.cjs` against `http://127.0.0.1:62290/en`. Capture fresh `phase7-*.jpg` evidence. Update `docs/codex/REQUEST_ADHERENCE_LEDGER.md`.
4. **Task 13 bilingual worktree retirement** — verify `5d5bcfe` is ancestor of `main`, archive generated evidence to `output/worktree-archive/`, then remove.
5. **Task 14 fast-forward** — only after Tasks 12+13 are green and the user confirms.
6. **S'gaw-Mango AI integration spec** — drafted at `docs/specs/2026-08-24-sgaw-mango-ai-integration.md`. Implementation belongs in a future phase (likely Phase 8).
7. **Music Director service integration spec** — drafted at `docs/specs/2026-08-24-music-director-service-integration.md`. Also future-phase work.

---

## 6. Ecosystem Context

The KOA website is the **public face**. Behind it, Oliver has been building the Karen-language AI stack across multiple repos:

| Repo | Role | Current state |
|---|---|---|
| `karen-lang-trans` | Translation model training (vast.ai GPU) | Trained runs exist; dataset artifacts in `dataset_part_*.bin` |
| `karen-scraper-web` | Dictionary scraper + ground-truth routes + Flask UI | Working local; SQLite `karen_dictionary.db` ~2.3MB |
| `karen-sentence-builder` | Sentence construction tool | Flask app with translations |
| `karen-language-agent` | Agent shell around the above | Early, has tests + UI |
| Roboflow project | OCR for Karen glyphs/syllables | **88.7% mAP** — production-quality vision |
| `music_director_database/karen_music_website` | Chord-chart editor + sheet generator | Running locally on port 4177 |

The integration spec docs in `docs/specs/` describe how each becomes a service on KOA without collapsing them into the React App Router. Keep them as separate repos that KOA links to, embeds, or fronts via API.

---

## One-Paste Commands

Start the canonical KOA site:

```powershell
Set-Location 'C:\Users\olive\Projects\koa-website'; powershell -NoProfile -ExecutionPolicy Bypass -File '.\scripts\run-koa.ps1'
```

Stop it:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File 'C:\Users\olive\Projects\koa-website\scripts\stop-koa.ps1'
```

Run the Phase 7 contract suite:

```powershell
Set-Location 'C:\Users\olive\Projects\koa-website'; node --test tests\vinext-environment.test.mjs tests\locale-contract.test.mjs tests\admin-access.test.mjs tests\translation-schema.test.mjs tests\translation-policy.test.mjs tests\language-studio-contract.test.mjs tests\frame-manifest.test.mjs tests\design-studio-contract.test.mjs tests\phase7-seal-contract.test.mjs tests\glyph-motion.test.mjs tests\partner-marquee.test.mjs tests\documentation-sync.test.mjs
```

---

## Approval Boundaries

- Local source changes, tests, docs: **allowed**.
- Deployment, publication, translation publication, donation processing, cultural claims: **approval-gated**.
- Deleting remote branches: **approval-gated**.
- Pushing `main` (source-only): previously authorized but confirm before each push.
- Never invent partner relationships, Karen phrases, or official claims.
