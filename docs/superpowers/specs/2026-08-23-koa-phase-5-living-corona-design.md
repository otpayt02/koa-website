# KOA Phase 5 — Living Corona and Equal-Pace Cinematic

## Goal

Make the KOA opening feel like a living cultural artifact: the Statue of Liberty seal sits inside a boundaryless sunrise made from nearly invisible Karen glyphs, while the page background behaves like a quiet school of letters that reveals itself only where foreground content is absent.

This contract covers both public surfaces:

- `C:\Users\olive\Projects\koa-website\public\koa\` for the cinematic site.
- `C:\Users\olive\Projects\koa-website-bilingual\components\CinematicHome.tsx` and `app\globals.css` for the English/Karen site.

The user has explicitly approved implementation without another option-selection round. This document records that chosen direction rather than reopening it.

## Audience and screen job

The primary audience is S'gaw Karen people in America, including elders, families, youth, partner organizations, and future contributors. The opening screen's single job is to establish KOA as a serious national home, then hand visitors into readable chapters without making them fight the motion system.

## Visual system

- **Night silk** `#050914`: the deepest background.
- **Hermes navy** `#0b1830`: the primary luminous field.
- **Karen red** `#c43b4d`: the leading accent and warm ray color.
- **Torch gold** `#d4a24e`: a restrained highlight, secondary to red.
- **Woven paper** `#f2ead9`: editorial text and white-orbit substitute.
- **Quiet mist** `rgba(242,234,217,.08)`: ambient glyphs and dither.

English display type remains high-contrast editorial rather than geometric. Body copy remains a readable humanist sans. Karen/Myanmar text uses `Noto Serif Myanmar`, with no invented translation. The existing verified bilingual strings are reused for the Karen orbit.

## Signature: the living corona

The seal has no visible ring boundary. A soft radial mask dissolves its field into the navy background. Three layers make the corona:

1. a slow spiral of white, red, and gold light;
2. tiny Karen glyph rays, generated as real glyphs with irregular radii and very low opacity;
3. two white circumference paths, English and Karen, rotating clockwise slowly enough to read.

The orbit advances gently with the normalized cinematic timeline but also has a very slow ambient turn. The seal remains the only dominant object in the opening.

## Living-water glyph field

The existing canvas becomes a two-speed, life-cycled field:

- most glyphs drift slowly; a smaller school glides somewhat faster;
- direction targets change smoothly, never snapping;
- individual glyphs fade in, hold, and fade out before respawning elsewhere;
- a cursor-radius reveal increases contrast in empty background areas through a dithered threshold;
- foreground elements, links, controls, text panels, and images remain opaque occluders;
- the effect never captures pointer or wheel input.

The field is ambient at rest. It becomes more legible only within the cursor reveal, during KOA dispersion, and during the chapter-numeral convergence.

## Chapter thresholds

Each chapter begins with sparse glyph convergence into its Burmese numeral. The numeral is allowed to become readable before the photograph and copy arrive, then disperses back into the field. The existing brief Arabic flash remains short and intermittent. The loom frame is supporting texture, not a second focal point.

## Equal-pace scroll transport

Native scrolling remains untouched for keyboard, touch, assistive technology, and browser accessibility. Cinematic progress is decoupled from raw wheel distance:

- raw document position becomes a target;
- a delayed transport releases it after the reading buffer;
- each animation frame clamps the maximum progress delta;
- chapter boundaries add a short visual hold;
- large operating-system wheel jumps therefore queue more distance instead of making the animation play faster.

This is deliberately not a wheel-event hijack. The document can move normally while the visual story catches up at its authored pace.

## Premium supporting interactions

The implementation borrows interaction principles—not source—from contemporary component libraries: cursor falloff, dither reveal, orbital type, slow hover magnification, and focus-equivalent expansion. It remains dependency-free and project-owned.

The header has three states: expanded during the opening, compact after the cinematic handoff, and gently expanded on hover/focus in either state. Individual labels reveal their supporting line slowly. The bilingual menu keeps its working click behavior and gains the same breathing tempo without hiding destinations.

## Accessibility and performance

- `prefers-reduced-motion` and the manual motion-off control render a complete, readable composition.
- Reduced motion freezes orbit, removes pointer reveal and convergence, and exposes every scene without scroll gating.
- Canvas density is capped by viewport class and device pixel ratio.
- No essential meaning exists only in the canvas or orbit text.
- Focus styles and real buttons/links are preserved.

## Verification

- Source contract tests cover the glyph rays, bilingual orbit, cursor dither, normalized transport, chapter holds, and reduced-motion paths.
- The static cinematic route is checked at desktop, mobile, hover, motion-off, and reduced-motion.
- The bilingual English and Karen routes are checked with the same viewports when the local build is available.
- Horizontal overflow and browser console errors are checked before commit and push.

## Self-review

The design has no placeholder decisions. The apparent conflict between “banner expand on hover” and “banner collapse on hover” is resolved in favor of the user's repeated prior instruction: compact resting state after the cinematic, expanded hover/focus state. The work stays within the two named KOA surfaces and does not change APIs, content truth states, or external integrations.
