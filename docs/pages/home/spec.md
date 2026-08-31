# Home cinematic specification

## Canonical inputs

- Route: `/[lang]`
- Source implementation: `components/CinematicHome.tsx`
- Frame source of truth: `content/cinematic-frame-manifest.json`
- Versioned snapshot: `docs/cinematic/versions/v0007-phase7.{json,md}`
- Choreography reference: `docs/KOA-CINEMATIC-COOKBOOK.md`
- Supported locale keys: `en`, `th`, `my`, `ksw`

## Chronological contract

The canonical manifest owns frame order and progress bounds. The opening order is seal arrival, seal migration, K/seal/A resolve, delayed O resolve, purpose copy, and scroll invitation. Belonging, Language, Culture, Service, and Future follow before the partner handoff and final involvement action.

Each frame records route, locale coverage, entry and exit progress, foreground and background content, static features, motion features, tunables, Motion-off result, evidence, and rationale. Change the canonical manifest first, then regenerate the versioned snapshot.

## Runtime contract

- Preserve stable particle IDs and page-lifetime paths across formation and dispersion.
- Keep glyph drawing outside measured foreground rectangles.
- Preserve desktop/mobile runway values unless fresh browser evidence demonstrates a readability defect.
- Pause partner motion on hover and focus; use a static wrapped grid with Motion off or reduced motion.
- Never chain locale proposals. Every non-English proposal derives independently from the same English source revision and remains review-gated.

## Verification

Run `node --test tests/documentation-sync.test.mjs` for documentation determinism and `node --test tests/frame-manifest.test.mjs` for canonical manifest structure. Phase 7 browser finalization separately verifies the real `/en` route at `1440×900` and `390×844`, Motion off, overflow, phase telemetry, partner behavior, and runtime exceptions.

## Approval boundary

Source and local tests do not authorize deployment, public claims, relationship approval, translation approval, external account creation, payment handling, or deletion of the static reference/worktree.
