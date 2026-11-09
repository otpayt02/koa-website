# KOA motion kit

Selected source-owned components, adapted to the existing KOA application. No additional animation runtime is installed: Motion 13.1.1 is already installed and now drives the shared cinematic text reveals through `motion/mini`.

- **React Bits Glare Hover:** https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/Animations/GlareHover — source and CSS retained, explicit KOA static-mode policy replaces the OS-only gate. `REACT-BITS-LICENSE.md` preserves MIT + Commons Clause terms. Used on the primary Home action, with one slow restrained sweep.
- **Magic UI Shine Border:** https://magicui.design/r/shine-border.json — source-owned component; local CSS replaces Tailwind utility dependencies and `cn`. `MAGIC-UI-LICENSE.md` preserves MIT terms. Used around the three-pillar composition, activated on hover or keyboard focus.
- **Animata Shining Button:** https://github.com/codse/animata/blob/main/animata/button/shining-button.tsx — adapted into `ShiningLink` with semantic links, an inline arrow, and KOA styling; used by Home/pillar navigation. MIT terms retained in `ANIMATA-LICENSE.md`.
- **Motion:** https://motion.dev/docs/react-installation — existing dependency, used through the small native WAAPI runtime.

The persistent glyph field and layered K/A remain KOA's own canvas implementation. One scene owns each effect; no competing cursor engine, scroll hijacking, timer-driven idle scrambling, generated faces, or decorative numeral layer is introduced. `?motion=off` freezes motion while keeping all content and controls available.
