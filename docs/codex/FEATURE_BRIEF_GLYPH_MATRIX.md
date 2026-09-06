# Feature: background-only cultural glyph reveal

## User outcome

Visitors discover a subtle S’gaw Karen and K/O/A glyph matrix around the pointer while foreground content stays completely readable.

## Current evidence

- Existing behavior: seeded ambient glyph particles already drift, fade, retarget, and use a DOM occlusion map.
- Entry point: `public/koa/index.html` with `storytelling.js` and `storytelling.css`.
- Data and persistence: visual-only deterministic state; no user data or persistence.
- Verification command or route: `node --test tests\cinematic-redesign.test.mjs`; `http://127.0.0.1:8123/index.html`.

## Scope

- In: cursor-local matrix, S’gaw Karen plus K/O/A vocabulary, foreground occlusion, reduced-motion guard, restrained hover glimmer, mobile film-chrome repair.
- Out: new routes, API changes, payment integration, full later-page redesign, deployment.
- Behavior to preserve: K–seal–A formation, logo flight, 1800vh desktop film, chapter holds, Motion off.
- Assumptions: reviewed S’gaw identity clusters already used by the site are safe for an ornamental non-semantic field.
- Dependencies: existing canvas and CSS only. The requested shadcn/Magic UI installer is environment-blocked and is not a runtime dependency.

## Experience flow

1. User moves the pointer across an empty background.
2. A small dithered matrix fades into view and drifts subtly.
3. The pointer crosses text, media, navigation, or a control.
4. The shared occlusion map suppresses matrix cells beneath that foreground.
5. Leaving the viewport or switching Motion off removes the reveal.

## Implementation contract

- UI: no new control; existing Motion button remains authoritative.
- Domain logic: deterministic cell glyph selection and radius/dither falloff.
- API or service: none.
- Data shape: fixed array of allowed glyph clusters.
- Loading: no separate loading state; the existing canvas boot applies.
- Empty: pointer inactive means no matrix.
- Failure: canvas-disabled and Motion-off states retain the complete page.
- Accessibility: decorative canvas is `aria-hidden`; focus glimmer mirrors hover; reduced motion disables wipes and matrix.
- Responsive behavior: smaller grid/radius on narrow screens; touch is not required to simulate hover.
- Observability: browser evidence records matrix visibility, occluded-point transparency, overlap, overflow, and runtime exceptions.

## Safety and cost

- Secret boundary: none.
- Private data: pointer coordinates remain in memory and are never logged or transmitted.
- Paid calls: none.
- External actions: source push only after verification; no deployment.
- Approval gates: cultural copy, donation processing, public release, and official KOA status remain human-controlled.

## Acceptance

- [x] Primary cursor-reveal path works in the real runtime.
- [x] Pointer inactive/Motion-off states are clean.
- [x] Existing choreography remains source-contract verified; a fresh timed seal-flight browser capture is deferred after two verifier timeouts.
- [x] Source and supporting browser checks pass; the production build remains blocked by the missing local `vinext` executable.
- [x] Evidence matches the rendered canvas and DOM.
- [x] Rollback is isolated to the Phase 6 source/test/doc commit.

## Proof

- Commands: source contract, JavaScript syntax, project test/build where available.
- Runtime interaction: background pointer reveal, foreground occlusion, glimmer hover, film chapter, mobile, Motion off.
- Screenshot or artifact: `output/playwright/phase6-*.png` and `phase6-runtime-evidence.json`.
- Remaining limitation: shadcn component installation failed first on dependency resolution and then on zero free disk space; the first-party canvas implementation is the verified fallback.
