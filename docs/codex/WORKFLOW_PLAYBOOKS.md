# Workflow playbooks

## Cinematic static-page visual QA

- Trigger: a material change to `public/koa` layout, motion, or responsive behavior.
- Outcome: the exact local route is visually and functionally verified before completion is claimed.
- Inputs: target page, viewport list, motion states, core interaction, and approval boundary.
- Steps: start the static server; run source contracts; open the target route; capture the hero, logo-flight handoff, film chapter, and mobile layout; inspect console; toggle motion off; run the production build.
- Tools and owner: local HTTP server, Playwright CLI, Node tests, and npm build; implementation agent owns execution.
- Bottleneck: animations can look correct in source while timing or layering fails in the rendered page.
- Optimized version: run `node scripts/verify-phase3-cinema.cjs http://127.0.0.1:4187/koa/` for the buffered desktop/mobile sequence; use `verify-phase2-cinema.cjs` with `reduced-only` for the static preference check. Store named evidence in `output/playwright`.
- Timing proof: record a before-scroll scale, a one-second scale, and a post-buffer scale so the three-second hold is verified rather than inferred from source constants.
- Verification: zero page errors, readable foreground, visible focus, stable reduced-motion state, and screenshots at named states.
- Rollback: revert only the scoped motion/markup changes; preserve unrelated working-tree changes.
- Privacy boundary: capture only the local KOA page; no browser profiles, messages, credentials, or customer data.
- Cost and approval: local-only and no paid service required; deployment or publication requires explicit approval.

## Mission-led premium motion block

- Trigger: a KOA information section needs richer interaction without adding a decorative effect or an unverified claim.
- Outcome: one first-party block makes a mission, status, or chapter handoff easier to understand and remains complete without motion.
- Inputs: audience, information job, verified truth states, existing motion tokens, foreground occlusion, and target viewports.
- Steps: select one job from `skills/mission-led-motion-ui`; write visible summaries first; add semantic interaction; use shared easing; add reduced-motion and motion-off states; render desktop/mobile; exercise pointer and keyboard behavior.
- Tools and owner: native HTML/CSS/JavaScript, source contract tests, and Playwright CLI; the implementation owner verifies all states.
- Bottleneck: visually polished blocks can accidentally hide critical content or make planned work look delivered.
- Optimized version: keep essential summaries visible and disclose only supporting detail; label each status as available, in development, planned, or invitation open.
- Verification: disclosure ARIA state, focus visibility, no console errors, no horizontal overflow, reduced motion, and a named screenshot of the selected state.
- Rollback: remove the isolated block markup/styles/initializer and preserve the surrounding content section.
- Privacy, cost, and approval: no proprietary source or paid dependency; public claims and cultural translations remain human-review gated.

## Shared cinematic algorithm release

- Trigger: one KOA motion idea must remain recognizable across the static and bilingual implementations.
- Outcome: both routes share an experience contract without forcing identical frameworks or markup.
- Inputs: motion constant, foreground/occlusion rule, reduced-motion state, bilingual content boundary, route-specific navigation, and proof viewport.
- Steps: encode the behavior in each native runtime; add route-level contracts; type-check React; run targeted lint; render each route from a fresh process; reject stale routes as evidence; stage only intentional source/tests/docs.
- Tools and owner: native canvas/CSS/JavaScript, React/TypeScript, Node contracts, Playwright, and Git; the implementation owner records any process-level limitation.
- Bottleneck: several vinext dev processes can share generated folders, create HMR feedback loops, and make an old page look current.
- Optimized version: record server PID and port at startup, use one dev watcher per checkout, verify the response title/source signature, then close only the process started for QA.
- Verification: contracts pass in both repos, TypeScript passes, changed-component lint has zero errors, current route has no runtime/hydration errors, and responsive proof is named by route/state.
- Rollback: revert the route-specific adapter while preserving the shared behavior contract and unrelated working-tree changes.
- Privacy, cost, and approval: local proof only; no deployment, publishing, or cultural translation approval is implied.

## Cursor-matrix and mobile-chrome QA

- Trigger: a change to the living glyph field, foreground occlusion, premium hover material, mobile film chrome, or Motion-off canvas behavior.
- Outcome: supporting visual states are measured independently of the narrow K–seal–A flight window.
- Inputs: static KOA URL, 1440x900 and 390x844 viewports, pointer background point, foreground sample, Motion toggle, and source contract.
- Steps: run `node scripts\verify-phase6-cinema.cjs http://127.0.0.1:8123/index.html --supporting-only`; inspect the JSON; inspect the cursor, glimmer, mobile film, and Motion-off images; run the cinematic source contract separately.
- Tools and owner: local Python HTTP server, Chrome DevTools Protocol, Node source tests, and visual inspection; implementation owner records blocked choreography observations separately.
- Bottleneck: a fixed sleep can miss the three-second target buffer or a brief flight class, and a screenshot alone cannot prove foreground canvas transparency.
- Optimized version: wait for authored support conditions, sample canvas alpha before/after pointer reveal, sample the header occluder, and record computed mobile rectangles.
- Verification: 18 desktop viewport heights, positive cursor alpha delta, zero foreground alpha, glimmer visible, mobile label below/above counter without overlap, zero overflow, settled Motion-off canvas, and empty runtime problem lists.
- Rollback: revert the isolated matrix/glimmer/mobile CSS and keep prior Phase 5 artifacts intact.
- Privacy, cost, and approval: local pointer coordinates are transient; screenshots contain only the local KOA page; no deployment or paid call.

## Canonical one-app vinext handoff

- Trigger: starting, repairing, or visually verifying the KOA React application after dependency, worktree, or watcher changes.
- Outcome: one known vinext process serves the canonical `koa-website` checkout and opens the correct current route.
- Inputs: canonical repository path, package lock, minimum free-disk threshold, desired port, expected source signature, and stop authority for the process started by this workflow.
- Steps: verify at least 2 GB free; verify or restore locked dependencies; reject a missing `node_modules\.bin\vinext.cmd`; start one process and record its PID; wait for HTTP readiness; confirm the expected route/source signature; open the browser; print the exact stop command.
- Tools and owner: `scripts/run-koa.ps1`, npm, vinext, PowerShell readiness polling, and browser QA; the implementation owner records PID, URL, and verification output.
- Bottleneck: stale watchers and shared generated folders previously caused HMR loops and made old browser output look current.
- Optimized version: the runner owns one PID and port, refuses to silently reuse an unidentified server, and never starts the historical bilingual worktree.
- Verification: English route responds, canonical signature matches, console is clean, desktop/mobile/Motion-off smoke states render, and stopping the recorded PID releases the port.
- Rollback: stop only the runner-owned PID and restore only runner/config changes; preserve generated proof and unrelated user work.
- Privacy, cost, and approval: local-only; no credentials, public deployment, remote branch deletion, or external publication.

## Canonical precision-animation acceptance

- Trigger: any change to the K/O/A formation, authentic seal layering, scroll-scrub timing, hero lighting, one-row banner, or reduced-motion rest state.
- Outcome: one fresh canonical runtime proves desktop start/mid/end, 390×844 formation, reduced motion, safe CTA interaction, and bounded header scrolling.
- Inputs: a completed production build, port 3013, `scripts/playwright-koa-precision-proof.js`, and the supplied seal asset.
- Steps: run focused contracts and TypeScript; build; start exactly one owned runtime; confirm CSS/JS and the seal asset return 200; run the Playwright proof script; inspect every screenshot; correct at most two concrete visual faults; rerun affected states.
- Tools and owner: Node contracts, TypeScript, Vinext, project runner, Playwright CLI, and visual inspection; the implementation owner records runtime failures separately from source/build results.
- Bottleneck: Vinext dev HMR can lose its RSC worker, while `vinext start` can return route HTML even when emitted assets are not being served.
- Optimized version: preflight one CSS bundle, one client chunk, and `/koa/assets/koa-seal-white-lettering-v2.png` before opening Playwright. Abort screenshot capture if any response is not 200.
- Verification: no invented text paths; authentic asset appears twice; orbit reaches a counterclockwise full turn; header remains one row with internal overflow; body has no horizontal overflow; CTA trial-click succeeds; reduced motion is fully hydrated and stable.
- Rollback: stop only the verified owned runtime and preserve all source/build evidence plus unrelated dirty changes.
- Privacy, cost, and approval: local KOA page only; no public Sites deployment or external account mutation without explicit approval.
