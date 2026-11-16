---
name: koa-motion-component-research
description: Research and build motion features for the KOA public website. For every requested scroll, parallax, glyph, image, hover, text, transition, or 3D motion feature, search the web for relevant components and primary documentation, check source, license, React fit, accessibility, performance, and reduced-motion behavior, then choose a minimal adapted implementation.
---

# KOA motion component research

Use this workflow for visual or interaction changes on the KOA public website, especially the landing page, scroll narrative, glyph field, footer, events, and bilingual text.

## Read before implementation

1. Read the repository `AGENTS.md` and the most relevant page/component, stylesheet, and existing motion hook.
2. Call the downloaded `$gsap-web`, `$60fps-animation`, and `$accessible-animation` skills when the requested work uses GSAP, frame-sensitive animation, or reduced-motion behavior. For landing-page choreography also call `scroll-craft`, `web-animation-design`, and `impeccable`.
3. Reuse existing GSAP 3, ScrollTrigger, Lenis, `motion`, and KOA glyph components before adding a dependency. Do not introduce Three.js unless a spatial 3D scene materially improves the community story.

## Search online for every requested motion feature

Before coding each distinct feature, search for at least one exact component/demo and its source implementation, plus the official API docs for the library that would run it. Search the library registry or upstream GitHub, then open the actual source and license. Search queries should name the effect (for example: `React scroll parallax image`, `staggered text reveal`, `image hover Ken Burns`, `particle text assemble scatter`, or `cursor proximity glyph field`).

Use primary sources: upstream component code, official library documentation, and package license files. A search snippet is only a lead. Record a compact candidate table in the handoff or motion research note:

| Feature | Candidate component and source | License | Stack fit | Accessibility/performance notes | Decision |
| --- | --- | --- | --- | --- | --- |

For every candidate, verify the license, last meaningful upstream activity, current React/Next compatibility, required dependencies, touch and keyboard behavior, reduced-motion behavior, and whether it preserves the authentic KOA seal, community photography, and translation-ready semantic text. Do not import a component solely because it exists. Adapt the idea with existing dependencies when that is simpler and safer.

## Build and verify

- Keep motion bound to one semantic scene or scroll range; avoid repeated pinned timelines and multiple smooth-scroll owners.
- Animate transforms and opacity where practical. Avoid per-frame React state for decorative movement.
- Use semantic HTML for every heading, link, form, CTA, and translation. Record `alt`, `aria-label`, title, placeholder, and state labels in the text inventory.
- Respect `prefers-reduced-motion` and `?motion=off`; do not leave large blank pinned space or hide essential copy in the static state.
- Check the opening composition, intermediate scroll, handoff to the next section, reverse scroll, keyboard focus, narrow mobile crop, and reduced-motion rendering.
- Report source edit, build, local browser proof, GitHub push, and public deployment as separate outcomes.

## Starting references

- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- React Bits component library and source: https://github.com/DavidHDev/react-bits
- Motion Primitives (MIT): https://github.com/ibelick/motion-primitives
- Three.js documentation: https://threejs.org/docs/
- React Three Fiber: https://github.com/pmndrs/react-three-fiber
