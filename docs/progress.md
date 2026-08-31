# Progress

## Phase 1 — Reference and runtime audit

- Complete: inspected the current static KOA site, assets, scripts, design conversations, GitHub repository, and existing browser rendering.
- Complete: confirmed the five referenced animation techniques: scroll tracking, viewport detection, sticky positioning, easing, and text splitting.

## Phase 2 — Cinematic redesign

- Complete: implemented the K + seal-as-O + A arrival composition.
- Complete: implemented the empty navigation mark and rendered logo flight.
- Complete: the seal now hands the O position to a second glyph formation that converges from beyond all four viewport edges.
- Complete: expanded the seeded ambient field, added smooth direction retargeting, foreground occlusion geometry, corner loom anchors, and dedicated information-assembly transitions.
- Complete: added scroll-velocity sunshine, Burmese chapter numerals with brief Arabic companions, eased reading corridors, longer scroll pacing, and centralized motion math.
- Complete: corrected the reduced-motion hero and delayed the long mission paragraph until after the O resolves.
- Complete: 4/4 Phase 2 motion contract tests pass; JavaScript syntax and whitespace checks pass.
- Complete: browser QA captured the opener, seal flight, O convergence, complete KOA, first film chapter, and 390px mobile state with zero runtime exceptions and zero horizontal overflow.
- Evidence: `output/playwright/phase2-runtime-evidence.json` and `output/playwright/phase2-*.png`.
- Complete: source assets returned HTTP 200 from the local static server.

## Phase 3 — Living seal and woven identity

- Complete: motion is now on by default; system reduced-motion preference still receives a stable, non-animated composition.
- Complete: the opening seal occupies roughly five times its former visual area, begins as the sole hero anchor, then rises and shrinks slowly toward the KOA centerline.
- Complete: readable upper and lower typography hugs the seal and rotates clockwise from buffered scroll progress.
- Complete: removed the visible transparent KOA guide; an invisible `data-wordmark-reference` remains only for the glyph engine.
- Complete: enlarged the K/A outline sampling, reduced their spacing, slowed their formation, preserved the seal flight, and delayed the glyph O until the header mark lands.
- Complete: added an exact three-second scroll replay buffer plus slower secondary easing; the arrival runway is 520vh and the film runway is 900vh.
- Complete: introduced Bodoni Moda, Manrope, and Noto Serif Myanmar; upgraded the header with a red-led navy woven treatment and rounded interactive navigation.
- Complete: promoted the real crowd-and-flags image to Chapter 1, improved its crop and color grade, and added restrained woven interaction to content cards.
- Verified: 5/5 cinematic contracts pass; rendered evidence reports zero runtime exceptions and zero horizontal overflow at 1440px, 390px, and reduced-motion 1280px.
- Verified: the scroll buffer holds the seal scale at `1.0000` after one second and begins its replay after the three-second threshold.
- Evidence: `output/playwright/phase3-runtime-evidence.json`, `phase3-reduced-runtime-evidence.json`, and `phase3-*.png`.

## Phase 4 — Breathing navigation and mission proof

- Complete: the desktop navigation begins in a slightly expanded cinematic state, eases to a compact state when arrival progress reaches its final beat, and expands again on hover or keyboard focus at any point.
- Complete: each navigation item now carries a quiet supporting label that opens and closes with a slow shared easing instead of snapping or permanently taking space.
- Complete: added the original Commitment Loom—one premium interaction that presents KOA's founding standards and keeps mission status truthful through `Declared`, `In development`, and `Invitation open` labels.
- Complete: the commitment standards use real disclosure buttons, one-open behavior, synchronized `aria-expanded` / `aria-hidden` state, visible focus, and a reduced-motion resting composition.
- Complete: repaired the existing staggered-reveal ordering so newly marked children are registered before IntersectionObserver targets are collected.
- Complete: created and validated the project skill at `skills/mission-led-motion-ui` for reusable first-party premium motion blocks.
- Verified: Playwright observed nav scale states `1.018` (intro), `0.955` (resting), and `1.035` (post-cinematic hover); the hovered detail reached opacity `1`.
- Verified: disclosure interaction produced `false, true, false`; desktop and 390px mobile reported zero horizontal overflow and the browser console reported zero errors or warnings.
- Verified: reduced-motion browser evidence has zero runtime exceptions and zero horizontal overflow.
- Evidence: `output/playwright/phase4-nav-*.png`, `phase4-commitment-*.png`, and `phase4-reduced-runtime-evidence.json`.
- Published to repository history: Phase 1–4 implementation commit `76fc7ab` pushed to `origin/main`; this is a source push, not a public website deployment.

## Blockers

- Prompt Refinery's external Gemini call returned HTTP 429 because its prepaid credits are depleted. The original request was preserved and normalized locally.
- `npm.cmd run build` is environment-blocked because `node_modules/.bin/vinext.cmd` is absent. No package installation was performed without approval.

## Phase 5 — Living corona and bilingual parity

- Complete: replaced the tight halo with a sparse boundaryless corona of tiny Karen glyph rays and a clockwise English/Karen type orbit.
- Complete: added life-cycled glyph schools, cursor-revealed Karen dither, smooth randomized course changes, and foreground-safe layering.
- Complete: slowed and normalized cinematic transport, added chapter holds, and connected Burmese chapter convergence/dispersal to visual progress.
- Complete: repaired motion-off so the formation canvas cannot freeze as distracting K/A particle piles; desktop and 390px rendered states are clean.
- Complete: integrated the same system into the bilingual React source, mounted both previously disconnected canvases, restored the single responsive header, removed SSR seed drift, and removed vinext-local font URLs from source.
- Verified: static site 10/10 contracts; bilingual site 4/4 contracts; bilingual TypeScript and targeted changed-component ESLint pass.
- Limitation: fresh bilingual browser navigation was blocked by a continuous HMR loop from three pre-existing vinext dev watchers sharing the same generated workspace. Those processes were preserved; the stale running route was not used as current visual proof.
- Evidence: `output/playwright/phase5-main-final.png`, `phase5-main-nav-hover.png`, and `phase5-main-mobile-motion-off-final.png`.
- Published to repository history: main Phase 5 implementation `89e78e2` and bilingual stabilization `5d5bcfe` were pushed to their respective remote branches; this remains a source push, not a public deployment.

## Next milestone

- Human review of Phase 5 pacing and cultural details before any public deployment.
- Re-run bilingual rendered QA from one clean vinext process after the older watchers are stopped.

## Phase 7 — Canonical one-app consolidation specification

- Approved direction: main's React App Router becomes the sole canonical runtime.
- Documented: one-app architecture, admin-only Language and Design Studios, exact seal annulus, persistent glyph paths, partner marquee, translation provenance, versioned frame manifests, and safe worktree retirement.
- Documented: failed Magic UI install, fragile flight probe, multi-watcher HMR loop, missing vinext binary, duplicate SVG orbit, and static/React drift with canonical remedies.
- Documented: one-paste temporary static preview and planned permanent `scripts/run-koa.ps1` command.
- Recovered: C: now has about 12.2 GB free, removing the prior documentation blocker.
- Approved: the written specification was accepted on 2026-08-24; the task-by-task implementation plan is `docs/plans/2026-08-24-koa-canonical-one-app-phase-7.md`.
- Implemented and verified: Task 1 restored the locked vinext 0.0.50 environment; the focused environment test, TypeScript, and production build pass in commit `8bc67f4`.
- Partially implemented: Task 2's one-command runner is committed at `baa27a7`; review found wrapper-PID and stale-state ownership defects before the task advanced.
- Deferred verification: the preserved direct-vinext repair passes source contracts and stale-state refusal, but owned-runtime shutdown is not verified. A bounded repository diagnostic ran once on port 65241 and timed out before `/en` readiness, so it did not reach Windows termination; evidence is `output/runtime/task2-stop-diagnostic.json`. Cleanup succeeded and PID 14356 was untouched.
- Implemented: Tasks 3–7 added four canonical locale routes, server-side admin guards, revisioned translation provenance, the Language Studio, and the frame-aware Design Studio.
- Implemented and focused-review clean: Task 8 replaces the duplicate orbit copy with the exact supplied seal split into stationary core and rotating annulus in commit `b1f9f47`; focused contracts pass 8/8 and TypeScript passes. Runtime visual proof remains assigned to Task 12.
- Installed: the open-source interface foundation pins `@base-ui/react` 1.7.0 and `motion` 13.1.1 in commit `a5d3ac3`; package resolution and TypeScript pass. These packages are restricted to incremental interface use and do not replace the first-party cinematic runtime.
- Current focus: Task 9 persistent glyph paths and 1800vh pacing. Task 2 remains deferred verification and does not block implementation under the user's explicit override.

## Phase 6 — Cursor matrix, interaction material, and runtime repair

- Complete: added a pointer-local matrix limited to reviewed S'gaw Karen identity clusters plus K/O/A; it drifts, dithers, and shares the existing foreground occlusion map.
- Complete: added one 2.35-second red/paper/gold glimmer language to navigation, pills, buttons, cards, and commitment triggers with hover/focus parity and Motion-off/reduced-motion guards.
- Complete: repaired the confirmed 390x844 collision between the film label and frame counter by stacking the chrome with an 18px measured gap.
- Complete: recorded the full choreography, tunable parameters, later-page patterns, fillable section card, SEO rules, accessibility, and approval gates in `docs/KOA-CINEMATIC-COOKBOOK.md`.
- Verified: 20 tests pass with one build-dependent rendered bilingual skip; JavaScript syntax and diff checks pass.
- Verified after rebasing onto remote `ce74fd1`: desktop film resolves to 18 viewport heights (`1800vh`); scroll-reactive halo renders at restrained opacity `0.02`; cursor sample increases from alpha sum `15` to `588`; header occlusion remains `0`; glimmer opacity reaches `0.72`; desktop/mobile overflow is `0`; Motion off settles canvas opacity to `0`; browser error and warning lists are empty.
- Evidence: `output/playwright/phase6-runtime-evidence.json`, `phase6-cursor-matrix.jpg`, `phase6-nav-glimmer.jpg`, `phase6-mobile-film.jpg`, and `phase6-mobile-motion-off.jpg`.
- Limitation: the new condition-based headless verifier timed out twice on the brief seal-flight class window. The K–seal–A source contract remains green and the implementation was not changed, but this run does not claim a fresh runtime observation of that narrow state.
- Blocked: `npx shadcn@latest add @magicui/glyph-matrix` first failed npm dependency resolution and the installer-recommended retry then failed with `ENOSPC`; the partial configuration was removed and disposable npm extraction caches were cleaned.
- Blocked: `npm.cmd run build` cannot start because the local `vinext` binary is absent.
- Repaired: the newly merged remote branch had removed `glyphsDense()` and `ARABIC` while leaving active callers; both targeted restorations were verified in the local browser with zero runtime exceptions.
- Published to repository history: Phase 6 source/test/docs commit `5f6d942` was rebased onto the newer remote work and pushed to `origin/main`; this was a source push only, not a website deployment.

## Phase 7 — Tasks 12–14 and Phase 8 launch

- Complete: Task 12 full browser QA — 19/19 verifier assertions pass. Fixed the `willReadFrequently` Canvas2D warning in `LivingGlyphField.tsx` (added `{ willReadFrequently: true }` to `getContext`), fixed the `cursorRevealIncreasesBackgroundPixels` sampling region and assertion logic in `verify-phase7-one-app.cjs`, and fixed the CRLF-vs-LF line ending issue in the skill contract tests in `documentation-sync.test.mjs`. Evidence: `output/playwright/phase7-runtime-evidence.json` and `phase7-*.jpg` screenshots.
- Complete: Task 13 bilingual worktree retirement — verified commit `5d5bcfe` is ancestor of `main`, archived the bilingual browser evidence to `output/worktree-archive/bilingual-5d5bcfe/`, cleaned generated files, deregistered the git worktree, deleted the local branch `koa-visual-narrative-redesign-994e3`. Remote branch intentionally untouched. Partial directory cleanup due to locked Wrangler SQLite files; remaining files are safe to remove after a reboot. Documented in `docs/history/bilingual-worktree-retirement.md`.
- Complete: Phase 8 AI landing page at `/[lang]/ai` — cinematic landing promoting S'gaw-Mango AI as a KOA program. Six capabilities with truth-state labels (Measured/Declared/In development), data provenance section, community contribution invitation. Built with existing `PageHero`, `Section`, `Card`, and `Button` components. Quad-lingual i18n entries added.
- Complete: Phase 8 Music landing page at `/[lang]/music` with option 4 iframe embed — five-chapter cinematic treatment, bilingual editor feature overview with truth-state labels, live iframe embed of the Karen Music Director chord-chart editor (`http://127.0.0.1:4177`), Karen music style spec section, contribution intake. Quad-lingual i18n entries added.
- Added: CSS for `.truth-label` (Measured/Declared/In development badges), `.chapter-card` (music page chapter layout), and `.music-embed-section` (iframe embed frame) in `app/globals.css`.
- Verified: 60/60 contract tests pass, TypeScript clean, production build includes `/:lang/ai` and `/:lang/music` as dynamic routes.

## Director's Cut — approved direction and written-design gate

- Approved: Living Loom Director's Cut for the static `public/koa` prototype.
- Documented: the seal now dissolves in place before the glyph O converges; the former header-flight choreography is superseded for this prototype only.
- Preserved: one seeded motion engine, native scroll, foreground occlusion, Burmese/Arabic chapter treatment, reading corridor, crowd-led documentary imagery, and reduced motion.
- Current focus: written-spec review before implementation, as required by the creative-design workflow.
- Boundary: the dirty React workstream remains untouched and publication remains approval-gated.

## Phase 9 — Responsive motion pass

- Implemented: reduced the artificial scroll delay and chapter hold so navigation responds promptly while preserving eased interpolation.
- Implemented: adaptive canvas profiles for low-power devices (lower DPR, 30fps budget, smaller work grids), visibility/document gating, and deterministic glyph flutter.
- Implemented: cached Living Loom target geometry and removed a normal-motion per-frame `getBoundingClientRect()` read.
- Verified: TypeScript passes and the live `/en` browser tab renders the cinematic film and canvas layers; browser prefers reduced motion, so the living canvas correctly reports `stopped`.
- Note: the current tab reports an existing 3,005px horizontal overflow from unrelated layout work; this pass did not alter composition-critical overflow rules.
- Added: desktop story chapters now use alternating 50/50 documentary image and copy columns; copy reveals are reversible blur/fade transitions that clear and return with scroll direction.
- Verified: the restarted server is live at `http://127.0.0.1:3013/en`; desktop geometry shows 636px image/copy split with alternating image sides, and mobile geometry shows a 439px image crop above a 625px copy panel at 390px width.
- Added: the logo intro now uses an adaptive denser mini-glyph field (420 capable-device particles / 240 low-power particles) and a capped, resize-safe canvas transform.
- Note: the current app still reports existing horizontal overflow (3,005px desktop / 1,438px mobile); this remains a separate cleanup item.

## Phase 10 — Cross-version audit and grid direction

- Added: `docs/codex/KOA-VARIANT-AUDIT-AND-GRID-SPEC.md` with the local KOA HTML inventory, canonical-source map, detailed strengths/watch-outs per variant, recorded ChatGPT Sites links, and PowerShell preview commands.
- Added: an implementation-ready cursor-only randomized ASCII/Karen grid specification covering independent per-cell randomness, bounded replacement spawning, occlusion, touch/scroll input, and low-power fallbacks.
- Boundary: hosted ChatGPT Sites source was not available as an exported local bundle; links are preserved as owner-controlled references and no external publishing/access changes were made.
- Implemented: the ASCII/Karen grid now clears to transparent when idle and only reveals inside the pointer/touch/scroll halo; nearby cells reseed independently on input so rows do not share uniform glyphs.
- Verification: TypeScript passes after the interactive-grid slice; a fresh visual canvas-pixel capture is still pending.
- Added: meaningful GitHub lineage from Sites conversion through Living Alphabet, Loom, Arrival, React deluxe, persistent glyph paths, and the Director's Cut is now documented with commit hashes and links in the KOA variant audit.
- Expanded: the audit now includes the separate `sons_of_kawthoolei/KOA/koa-sites` V5 history (nine additional meaningful commits) and explicitly distinguishes feature commits from autosync/merge-only history.
- Repaired: audit links now point to localhost preview URLs and include a one-command launcher at `scripts/preview-koa-variants.ps1`; all nine mapped entry points returned HTTP 200 in a smoke check.
- Added: visual comparison gallery at `public/koa/variant-gallery.html`, embedding all nine variants with direct links and a selected best-of merge plan for the canonical React site.
- Verified: gallery returns HTTP 200 and contains nine iframe previews; in-app browser attachment timed out, so screenshot proof remains pending.

## Phase 11 — Canonical React best-of merge and fast motion proof

- Implemented: the React App Router at `/en` is the canonical experience; the selected strengths from the local variants are now merged into one source of truth rather than maintained as competing runtimes.
- Implemented: V4-style normalized scene buffering drives four alternating 50/50 documentary chapters with reversible blur/fade copy, overlapping scene ranges, and a readable crossfade corridor.
- Implemented: the hero now uses denser, chunkier K/A mini-glyph geometry, faster eased formation/deformation, distance-braked dispersion, subtle ambient fields, layered drifting fish, cursor glyph trails, and capped click scatter.
- Implemented: the ASCII grid stays transparent at rest, reseeds independent cells near pointer/touch/scroll input, and remains frame/DPR bounded for slower devices; the global wave remains a restrained background texture.
- Implemented: the seal core is separated from a centered English/Karen halo label layer whose clockwise rotation is scrub-linked through CSS variables; rays and halo intensity follow the same normalized transport.
- Implemented: cold-start runner readiness now allows 300 seconds because vinext can compile lazily; this keeps the one-command preview reliable without intercepting native scrolling.
- Verified: `npm.cmd run build` passed; focused glyph/motion/seal tests pass 13/13; the owned server is live at `http://127.0.0.1:3013/en` with PID 24152 and listener ownership confirmed.
- Verified: fresh Playwright `/en` has title `Home | Karen Organization of America`, 0 console errors/warnings, four scenes, and no horizontal overflow at 390px; reduced-motion `/en?motion=off` and desktop chapter progression were also exercised.
- Limitation: the supplied shared ChatGPT conversation could not be exported or read beyond its page shell, so the implementation follows the accessible local references and preserved audit decisions rather than inventing unavailable source details.

## Phase 12 — Round 2 information architecture and shell polish

- Locked: the English hero mission remains exactly `America's home for the Karen community.` with `Providing, combining, and inviting a national Karen voice.` directly below at a smaller size.
- Chosen: `Find your way to contribute` is the primary hero action; `Why KOA matters` is the newcomer-facing secondary action and remains explicitly approval-gated as editorial language.
- Added: `docs/codex/KOA-ROUND-2-PAGE-STRUCTURE.md` with the proposed home sequence, launch navigation, content-safe empty states, approval questions, and identity/motion contract.
- Implemented: one-row About / Programs / Stories / Impact / Contact / Build navigation; `Build` routes to a real coming-soon page and `Impact` anchors to the existing About reporting surface.
- Implemented: common mobile, tablet, desktop, and fluid viewport presets in the protected Design Studio through a temporary selector.
- Repaired: the first-viewport hero mission lockup is now visible before scroll scrub begins; the seal/glyph assembly remains the motion layer around readable orientation copy.
- Verified: `npm.cmd exec tsc -- --noEmit`, the six Round 2/home-copy contracts, and `npm.cmd run build` pass; the build includes `/:lang/build`.
- Verified: fresh Playwright proof at 1440×900 and 390×844 shows the exact hero lockup, one-row navigation, responsive no-overflow behavior, `/en/build` review-gated content, and the `/en/about#impact` anchor landing below the fixed header. Reduced motion keeps the mission visible and the console reports zero errors.
- Limitation: the protected Design Studio redirects this unauthenticated local session to the existing `/signin-with-chatgpt` 404, so its selector interaction is source/test verified but not browser verified here.
- Known baseline gap: the older combined static `public/koa` suite remains 17/26 because its pre-existing `.reading-corridor` and seal-contract expectations do not match the canonical React source; no broad static parity rewrite was made in Round 2.

## Current focus

- Complete the Round 2 approval pass, then wait for owner approval of `Why KOA matters` and the content slots before filling Programs, Stories, or Impact with new editorial material.

## Phase 13 — Authentic seal and hero precision

- Implemented: replaced invented orbit strings with the supplied authentic seal asset rendered twice around one center: a counterclockwise rear layer and a stationary cropped inner seal in front.
- Implemented: reduced K/A glyph count, size, jitter, color saturation, stroke, and opacity so the invisible letter fields read as fine, precise silhouettes.
- Implemented: moved the circular eclipse, X glare, and independently rotating red/gold/blue ray layers into the single ScrollTrigger master timeline; removed the unrelated CSS ray loop.
- Implemented: kept the banner to one row at all widths, added bounded touch/wheel horizontal strip scrolling, and repaired locale-prefixed navigation URLs.
- Implemented: removed the home-route global numeral collision and kept the final tagline plus mission/CTA reveal visible after formation.
- Verified: 7/7 focused contracts pass, TypeScript passes, and the production build completes.
- Blocked: fresh rendered acceptance. The clean dev attempt failed in Vinext RSC HMR with `Network connection lost`; the production-server fallback returned route HTML but 404ed the emitted CSS/JS/public assets. Two bounded recovery attempts were exhausted, and their unstyled screenshots are excluded from proof.
- Boundary: no public Sites deployment, publication, or external account change occurred.

## Current focus — Phase 13

- Repair one local served runtime, then rerun `scripts/playwright-koa-precision-proof.js` and inspect desktop start/mid/end, 390×844 formation, reduced motion, internal header scrolling, and route transitions before visual acceptance.

## Phase 14 — Round 2 verification and approval gate

- Completed: the canonical local runtime is serving the Round 2 slice at `http://127.0.0.1:3014/en`; the first viewport, Build route, Impact anchor, and reduced-motion state have fresh browser evidence.
- Completed: fixed the shared fixed-header safe area for `PageHero` routes and kept the active narrow-screen nav tab discoverable without horizontal page overflow.
- Pending approval: confirm `Why KOA matters` as the newcomer-facing secondary action and provide or approve final editorial content for Programs, Stories, and Impact.
- Pending access: authenticate the protected Design Studio before claiming browser verification of its temporary viewport selector.
