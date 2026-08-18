---
name: "Cinematic Scroll UI"
description: "Design and implement professional scroll-led websites with pinned scenes, magnetic chapter endpoints, soft image transitions, glass typography, masked reveals, inertial motion, and luminous interactions. Use when building or refining immersive editorial sites, portfolios, cultural storytelling, or mobile-first motion systems."
---

# Cinematic Scroll UI

## Overview

Build an immersive page as a controlled visual sequence, not a pile of effects. Use factual content, strong photography, restrained typography, and motion that explains where the visitor is going.

The default system is mobile-first, keyboard accessible, reduced-motion aware, and capable of precise scroll scrubbing. It favors soft gradients and masks over hard geometric transition borders.

## Quick Start

1. Identify four to six distinct story chapters.
2. Give the scroll film at least `2000` logical frames and about `700–900svh` of physical scroll distance.
3. Pin a `100svh` stage and map normalized scroll progress to each chapter.
4. Make photographs full-bleed unless the content explicitly calls for an inline editorial image.
5. Put short, literal headings in translucent gradient glass fields.
6. Crossfade, blur, and scale adjacent scenes; never reveal them through a hard circle or visible frame boundary.
7. Add magnetic settling only near completed chapter endpoints so visitors retain precise mid-transition control.
8. Test touch, keyboard, narrow mobile viewports, and reduced motion before publishing.

## Core Workflow

### 1. Write the story map

For every chapter, define:

- one factual subject;
- one image motif that is not repeated on the same page;
- one literal heading;
- one supporting detail row;
- one completed-frame endpoint.

Avoid slogans that obscure what is shown. A heading such as “Civic education and public advocacy” is stronger than an unexplained metaphor.

### 2. Build the visual layers

Use this order:

1. full-bleed media;
2. color grading and readable image veil;
3. primary glass text field;
4. supporting information row;
5. progress and navigation controls.

Keep overlays borderless. Create separation with blur, tonal contrast, gradient opacity, and shadow falloff.

### 3. Choreograph scroll progress

Drive animation from a normalized `0..1` progress value. Each scene receives a local progress value and uses it for:

- opacity crossfades;
- subtle scale and camera drift;
- blur during entry;
- staggered text reveal;
- scene-specific motion such as a torch flare or gradient rotation.

Keep identity marks upright. Animate a light field or gradient behind a seal instead of rotating the seal itself.

### 4. Add magnetic endpoints

Place snap targets after a scene has resolved and immediately before the next transition begins. Settle only when the visitor stops close to a target. Do not force snapping from the middle of a transition.

Recommended behavior:

- target around `78–82%` of each scene span;
- magnetic capture radius around `5–8%` of a span;
- precision dead zone around `0.5–1%`;
- smooth programmatic settle after `scrollend`;
- no magnetic behavior under reduced motion.

### 5. Add interaction light

Buttons, links, tabs, and cards can use a single diagonal highlight sweep on hover or keyboard focus. The sweep should brighten and then return to the original color. Do not loop it continuously.

Use motion to confirm intent:

- hover: one restrained glimmer;
- click: short compression or highlight;
- navigation: immediate destination label plus smooth page transition when supported;
- focus: visible outline independent of the glimmer.

## Required Quality Rules

- Design mobile-first, then expand the composition at larger breakpoints.
- Preserve readable text contrast across every image crop.
- Do not repeat a White House, Capitol, or other dominant motif more than once per page.
- Do not rotate official marks or change their proportions.
- Do not add decorative outer rings to circular marks unless the identity system already includes them.
- Avoid hard reveal boundaries, noisy particles, gratuitous parallax, random pop-ins, and continuous hover loops.
- Keep main-thread scroll work inside `requestAnimationFrame` and update CSS custom properties.
- Honor `prefers-reduced-motion` and offer an explicit motion control when the experience is animation-heavy.
- Keep semantic headings, link destinations, keyboard tabs, focus styles, and useful alternative text.

## Reference Files

- Read [Motion Pattern Catalog](docs/MOTION_PATTERNS.md) when selecting or implementing a transition.
- Read [Performance and Accessibility](docs/PERFORMANCE_ACCESSIBILITY.md) before validation.
- Read [Creative Reference Notes](docs/REFERENCE_NOTES.md) when translating inspiration into an original system.

## Validation

Confirm all of the following:

- first screen communicates the organization or product immediately;
- each page has at least one complete scroll story and a non-animated content fallback;
- chapter endpoints settle without hijacking mid-scene scrubbing;
- images cover their frames at common phone aspect ratios;
- text remains readable at `320px` width;
- hover treatments also work on keyboard focus;
- reduced-motion mode exposes all content in document order;
- no scene produces horizontal overflow;
- animations remain smooth without layout reads inside per-scene loops;
- copy describes the actual content rather than the visual effect.

## Troubleshooting

**Scene feels trapped or jerky:** reduce the magnetic capture radius, keep a dead zone, and settle only after scrolling stops.

**Transition shows a visible edge:** remove clipping geometry and replace it with opacity, blur, masked gradients, or a full-stage wash.

**Glass panel looks like a card:** remove the solid border, widen the gradient falloff, and use a transparent mask at the far edge.

**Mobile crop loses people:** set a mobile-first `object-position`, test tall screens, and avoid assuming desktop focal points.

**Logo feels unstable:** remove rotation from the mark and animate only the surrounding gradient, glow, or light source.
