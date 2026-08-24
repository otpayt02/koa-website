# KOA cinematic redesign proof

- Capture date: 2026-08-23
- Project: `C:\Users\olive\Projects\koa-website`
- Tested route: `http://127.0.0.1:4187/koa/`
- Redaction status: no private data, credentials, messages, or browser-profile content captured
- Publication status: local evidence only; not deployed or published

## Captures

- `koa-before-hero.png` — 1440 × 1000; pre-change baseline used for visual comparison.
- `koa-after-hero.png` — 1440 × 1000; empty header logo anchor and resolved K + seal-as-O + A hero.
- `koa-logo-flight.png` — 1440 × 1000; measured logo transfer in progress.
- `koa-logo-landed.png` — 1440 × 1000; header mark resolved after the transfer.
- `koa-film-chapter.png` — 1440 × 1000; chapter 3 with Burmese rail marker and corner loom glyph formation.
- `koa-mobile-hero.png` — 390 × 844; corrected mobile header and hero, with no horizontal overflow.
- `phase2-*` — expanded glyph field, seal-to-O handoff, chapter numeral, reading corridor, and motion-off proof.
- `phase3-*` — living seal, three-second scroll buffer, woven identity, crowd-led chapter, and responsive proof.
- `phase4-nav-intro.png` / `phase4-nav-resting.png` / `phase4-nav-hover-after-cinema.png` — expanded, compact, and post-cinematic hover states.
- `phase4-commitment-truth-open.png` / `phase4-commitment-mobile.png` — the Commitment Loom disclosure and responsive state.

## Runtime checks

- Motion-off state: button label changed to `Motion off`; counters settled to `1000+`, `3`, and `15B`; logo flight hidden; halo animation disabled.
- Static resources: HTML, CSS, JavaScript, and KOA logo returned HTTP 200.
- Phase 4 navigation transforms observed in-browser: `1.018` intro, `0.955` resting, and `1.035` post-cinematic hover; expanded label opacity reached `1`.
- Commitment disclosure state after selecting “Say what is ready”: `false, true, false`; associated panel `aria-hidden` values: `true, false, true`.
- Browser console: zero errors and zero warnings; desktop and 390px mobile horizontal overflow: zero.
- Node verification: 16 passed, 1 skipped across the cinematic redesign, v4, and bilingual contracts.
- Production build limitation: `vinext` is absent from local `node_modules`; packages were not installed without approval.
