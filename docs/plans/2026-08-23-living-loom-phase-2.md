# Living Loom Phase 2 Implementation Plan

> **For Claude:** Use `@skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Refine the KOA opening and chapter cinematics into a smooth, readable Living Loom sequence while preserving the existing uncommitted Phase 1 work.

**Architecture:** Extend the existing deterministic canvas engine and native-scroll timeline instead of adding another motion library. Split the hero formation into explicit K/A, seal-flight, and O-arrival states; keep all movement driven by normalized scroll progress, damped velocity, and named easing functions. Foreground content remains normal semantic HTML, while the canvas uses DOM-derived occlusion rectangles and reduced-motion fallbacks.

**Tech Stack:** Static HTML, CSS custom properties and masks, vanilla JavaScript canvas, Node contract tests, local HTTP server, browser runtime verification.

**Commit policy:** Do not commit, push, deploy, or publish during Phase 2. The user authorized commit and push only after Phase 4.

---

### Task 1: Lock the Phase 2 motion contract

**Files:**
- Modify: `tests/cinematic-redesign.test.mjs`
- Modify: `public/koa/index.html`

**Steps:**
1. Add failing contract assertions for a dedicated off-screen glyph O state, scroll-velocity sunshine variables, safe Burmese/Arabic numeral crossfade, reading-corridor markup, and expanded glyph occlusion markers.
2. Run `node --test tests/cinematic-redesign.test.mjs` and confirm the new assertions fail before implementation.
3. Add the smallest semantic hooks to `index.html`: hero O state, cinematic reading corridors, and explicit occlusion markers.

### Task 2: Refine the deterministic glyph and hero engine

**Files:**
- Modify: `public/koa/storytelling.js`
- Test: `tests/cinematic-redesign.test.mjs`

**Steps:**
1. Add named easing helpers for eased hold, damped velocity, and smooth direction changes.
2. Increase the ambient field density while lowering per-glyph alpha and size; use smooth vector retargeting instead of abrupt direction changes.
3. Cache and pad visible foreground occluders so glyphs disappear before touching text, images, navigation, or controls.
4. Split the arrival formation into K/A and O target pools. Keep O particles off-screen until the seal flight is substantially complete, then converge them with eased stagger.
5. Drive the halo-ray intensity and drift from smoothed scroll velocity, with a low maximum opacity.
6. Re-run the contract test and keep the existing K/A and logo-flight assertions passing.

### Task 3: Build the cinematic reading and chapter transitions

**Files:**
- Modify: `public/koa/storytelling.css`
- Modify: `public/koa/storytelling.js`
- Test: `tests/cinematic-redesign.test.mjs`

**Steps:**
1. Add a masked top-and-bottom reading corridor so scene copy enters, holds, drifts, and fades without crossing a hard viewport boundary.
2. Map scene copy movement through hold-heavy easing rather than matching raw scroll distance.
3. Add a low-luminance Burmese-to-Arabic numeral crossfade with long quiet intervals and a static dual-number reduced-motion fallback.
4. Make the loom lattice and ambient field remain beneath all foreground content.
5. Run the contract test and verify reduced-motion selectors still settle all content.

### Task 4: Verify the real Phase 2 artifact

**Files:**
- Update: `docs/codex/REQUEST_ADHERENCE_LEDGER.md`
- Update: `docs/progress.md`
- Update: `docs/decisions.md`
- Create or update: `output/playwright/phase-2-*.png`

**Steps:**
1. Run `node --test tests/cinematic-redesign.test.mjs tests/rendered-html.test.mjs tests/v4-contract.test.mjs tests/rendered-bilingual.test.mjs`.
2. Start the static KOA site from `C:\Users\olive\Projects\koa-website` on an available localhost port.
3. Verify the hero start, seal flight, glyph O completion, chapter numeral transition, reading corridor, foreground occlusion, mobile layout, motion-off state, and console errors.
4. Capture sanitized desktop and mobile proof images under `output/playwright/`.
5. Record verified outcomes and remaining Phase 3 work without claiming deployment or official KOA approval.
