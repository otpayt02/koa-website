# KOA motion references and component search

Research checked 2026-11-16. These are candidates and implementation references; only source code that fits the feature, license, and KOA accessibility needs should be added.

| Motion feature | Online reference | License / stack notes | KOA use |
| --- | --- | --- | --- |
| Photo and copy move at different scroll rates | [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) | Already installed in the site; scrubbed transforms do not require another package. | Preferred for hero planes and section parallax; use semantic content outside the transform. |
| Text and scroll reveal candidates | [React Bits text animations](https://reactbits.dev/c/text-animations) and [upstream source](https://github.com/DavidHDev/react-bits) | React Bits uses MIT + Commons Clause; inspect the component-level source and license before copying into KOA. | Compare `Scroll Float`, `Scroll Reveal`, and `Split Text`; keep translated sentences as normal text, then adapt timing in GSAP if needed. |
| Animated background / glyph field candidates | [React Bits backgrounds](https://reactbits.dev/c/backgrounds) | Same MIT + Commons Clause caveat; canvas/WebGL backgrounds need touch, battery, contrast, and reduced-motion review. | Compare `Pattern Waves`, `Gradient ASCII`, and `Particle Text`; prefer the existing KOA glyph engine when it protects the custom K/A/seal formation. |
| Small hover and press interactions | [Motion Primitives](https://github.com/ibelick/motion-primitives) | MIT repository, but its components may add Framer Motion or Tailwind assumptions. | Reference for a specific interaction only; current KOA CSS/GSAP is simpler for the hero CTA and image zoom. |
| WebGL / Three.js scene | [Three.js docs](https://threejs.org/docs/) and [React Three Fiber](https://github.com/pmndrs/react-three-fiber) | Adds rendering and device-performance cost; evaluate only when the scene needs real 3D. | Not selected for this photo-led community hero. The current layered image gives the requested depth without a 3D runtime. |

## Current landing synthesis

The public route uses the current multilingual KOA glyph-and-seal introduction and direct action previews, then the editorial photo chapters and different-rate section parallax from the newer story treatment. The hero uses the legacy single oversized Karen-flag illustration at `/koa/assets/karen-flag-capitol-legacy.webp`, composed from the old landing asset `versions/koa-website/runnable/assets/222812ce99b8dc2fdd67f7c0a128900451dfab86218c874be837a6bc14dd4449.png`. It depicts the U.S. Capitol, so its alt text does not call it the White House. A limited GSAP ScrollTrigger range moves the image down while the semantic copy plane recedes upward; motion-off leaves the complete image and copy in place.

## Repeatable online search requirement

For each new motion feature, search the exact component name and inspect its demo, upstream source, and license. Search primary sources for the chosen API. Write the feature-to-source mapping and adaptation decision into the handoff or this document. The project skill `.agents/skills/koa-motion-component-research/SKILL.md` makes this mandatory for later site work.
