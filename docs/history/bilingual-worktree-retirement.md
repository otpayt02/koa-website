# Bilingual Worktree Retirement

**Date:** 2026-08-25
**Retired worktree:** `C:\Users\olive\Projects\koa-website-bilingual`
**Retired branch (local):** `koa-visual-narrative-redesign-994e3`
**Remote branch:** `remotes/origin/koa-visual-narrative-redesign-994e3` — **untouched**

---

## Why

The bilingual worktree served Phase 5 — it proved the cinematic glyph system could run in both the static reference and the React App Router. Its single deliverable commit `5d5bcfe` was already merged into `main` via `feat/cinematic-spec`. After Phase 7's canonical one-app consolidation, all four locale pivots (en/th/my/ksw) live in the single canonical checkout at `C:\Users\olive\Projects\koa-website`. The bilingual worktree has no remaining unique source code.

## What was preserved

| Artifact | Source path | Archive path |
|---|---|---|
| Phase 5 bilingual browser evidence | `koa-website-bilingual/output/playwright/phase5-bilingual-en-intro.png` | `output/worktree-archive/bilingual-5d5bcfe/phase5-bilingual-en-intro.png` |

No other unique artifacts existed. The bilingual worktree's `output/` contained only the single PNG above and a `.playwright-cli/` cache directory (generated, not preserved).

## Ancestry proof

```
git merge-base --is-ancestor 5d5bcfe main → exit 0 (confirmed ancestor)
```

Commit `5d5bcfe` is fully contained in `main`'s history. No source code is lost by removing the worktree.

## What was cleaned

- `.wrangler/` — generated Wrangler state (restored via `git restore`)
- `tsconfig.tsbuildinfo` — generated TypeScript build info (restored via `git restore`)
- `.playwright-cli/` — generated browser automation cache (cleaned via `git clean -fd`)
- `output/` — archived evidence above, then cleaned via `git clean -fd`

## Where locales live now

All four canonical locales are served from the single React App Router:

| Locale | Route | Source |
|---|---|---|
| English | `/en` | `app/[lang]/page.tsx` |
| Thai | `/th` | `app/[lang]/page.tsx` |
| Burmese | `/my` | `app/[lang]/page.tsx` |
| S'gaw Karen | `/ksw` | `app/[lang]/page.tsx` |

Translation provenance is managed through the Language Studio (`/en/admin/language-studio`) and the `translationProposals` table in the Drizzle/D1 schema.

## Remote branch

The remote branch `remotes/origin/koa-visual-narrative-redesign-994e3` is deliberately **not** deleted. It preserves the original bilingual development history on GitHub. Remote cleanup remains approval-gated.
