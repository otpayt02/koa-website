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
