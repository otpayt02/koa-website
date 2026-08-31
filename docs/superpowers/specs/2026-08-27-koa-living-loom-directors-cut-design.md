# KOA Living Loom Director's Cut

**Status:** Direction approved; written specification awaiting review

**Target:** `C:\Users\olive\Projects\koa-website\public\koa`

**Date:** 2026-08-27

## Objective

Refine the existing static KOA cinematic experience into one coherent, deliberately maximal "Living Loom" composition. The redesign must feel authored and premium while preserving documentary clarity, native scrolling, keyboard access, mobile readability, and a complete reduced-motion presentation.

## Scope boundary

This pass changes only `public/koa/index.html`, `public/koa/storytelling.css`, `public/koa/storytelling.js`, their focused tests, and local proof artifacts. It does not change the React App Router workstream, install packages, deploy, publish, invent translations, or present the result as KOA-approved. The static prototype and canonical React application remain explicitly unsynchronized until a later parity decision.

## Design direction

### One living motion system

The established seeded canvas remains the only glyph runtime. It exposes five visual states—drift, disperse, form, hold, and release—through one small state interface. Particles continuously retarget their direction with eased interpolation. Density may increase, but contrast and scale remain subordinate to foreground information.

Visible foreground geometry is measured through the existing `data-glyph-occlude` contract. Glyphs are not drawn inside padded rectangles for the navigation, copy, photographs, controls, cards, or footer. This same map governs ambient drift, cursor discovery, chapter formations, and the final KOA wordmark.

### Hero chronology

1. The KOA seal is the opening thesis. A nearly invisible radial field suggests sunlight without a hard halo boundary.
2. Buffered native-scroll progress slowly raises and enlarges the seal while the ray drift responds gently to scroll velocity.
3. K and A particles originate near the Statue of Liberty center and resolve around the seal. No visible guide typography appears.
4. The seal expands until its navy field visually merges with the page, then fades completely in place. The former measured flight into the header is removed.
5. Only after the seal is absent do O particles enter from beyond all four viewport edges and converge between K and A.
6. K, O, and A settle on one horizontal optical axis. A compact header emblem appears afterward through a quiet opacity/material transition, not a travelling clone.
7. The hero formation releases into the ambient field before the first chapter begins.

The sequence remains deterministic for browser proof. The existing three-second visual replay buffer and rate-capped native scroll transport remain unless runtime review shows that they obscure control.

### Chapters and reading corridor

Each non-image interstitial presents one full-screen Burmese chapter numeral. A restrained Arabic numeral replaces it for 96 milliseconds once per transition, then the Burmese numeral returns. Reduced-motion mode displays the Burmese numeral with a persistent small Arabic companion and never flashes.

Chapter copy enters through a vertically masked reading corridor. Text moves only a small distance relative to scroll, holds in the readable center, and fades before reaching the viewport edges. Image chapters remain free of ambient glyph drawing. Dedicated glyph formations may appear only in unoccupied transition space.

The real `assets/fb-outdoor-gathering.jpg` photograph remains the first major image and receives the longest uninterrupted full-bleed hold. Image enhancement is limited to crop, tonal grade, contrast, and restrained scale drift; people, flags, and documentary content are not generated or altered.

### Visual system

- **Midnight navy:** `#030610`
- **Hermes blue:** `#0B3157`
- **Karen red:** `#B92F3A`, primary interaction accent
- **Ceremonial gold:** `#C9A35B`, used less often than red
- **Paper white:** `#F4EFE6`
- **Display:** Bodoni Moda
- **Body/navigation:** Manrope
- **Karen ceremonial type:** Noto Serif Myanmar

Woven diamonds appear as structural dividers, transition lattices, and interaction edges. They never sit over faces, body text, or form controls. The premium banner keeps the live Sites reference's calm information structure while using KOA-specific woven material, breathing tab labels, strong focus states, and the established red-led glimmer.

## Component responsibilities

- `GlyphStage`: particle lifecycle, seeded sampling, formation targets, scroll velocity, and occlusion-aware drawing.
- `HeroDirector`: maps normalized arrival progress to seal, K/A, O, rays, header reveal, and release states.
- `ChapterDirector`: selects chapter, triggers numeral interstitials, controls the reading corridor, and requests glyph formations.
- CSS tokens and state classes: presentation only; JavaScript owns normalized timing and state selection.

No additional animation library, canvas, or general-purpose scene framework is introduced.

## Accessibility and failure behavior

- Native wheel, touch, keyboard, and scrollbar behavior is preserved.
- The Motion control remains keyboard accessible and accurately synchronized with `aria-pressed`.
- `prefers-reduced-motion` receives stable identity, static chapter labels, no particle piles, no numeral flash, and no continuous image drift.
- Canvas and decorative numerals remain hidden from assistive technology; semantic headings and scene copy preserve meaning.
- If canvas initialization fails, the complete page content and navigation remain usable.

## Acceptance criteria

1. The old logo-flight choreography is absent; the seal fades in place before O convergence.
2. K/A formation precedes seal dissolution; O formation begins only after seal opacity reaches zero.
3. O particles originate beyond all four viewport edges and settle on the same optical axis as K/A.
4. Scroll velocity changes the subtle ray field without making it visually dominant.
5. Ambient glyphs continuously move and smoothly retarget, while sampled foreground regions remain clear.
6. Burmese transition numerals receive one 96 ms Arabic confirmation; reduced motion uses a static companion.
7. The crowd photograph is the first major image, full bleed, legible, and not covered by glyphs.
8. Desktop and 390 px mobile layouts have no horizontal overflow or film-chrome collision.
9. Motion on and Motion off each produce complete, readable compositions with zero runtime errors.
10. Existing navigation, forms, disclosures, and links remain functional.

## Verification

- Focused Node contract tests for hero ordering, state boundaries, occlusion, numeral behavior, motion-off behavior, and required assets.
- JavaScript syntax check and whitespace/diff review.
- Local browser proof at desktop and 390 px mobile for opener, K/A, seal dissolution, O convergence, completed KOA, numeral transition, crowd chapter, navigation focus/hover, and Motion off.
- Runtime evidence records console errors, overflow, key computed states, and the tested URL.

## Approval boundaries

No package installation, deployment, public upload, remote push, cultural-copy change, or unreviewed Karen-language addition is authorized by this specification. Publication remains subject to KOA/community review.
