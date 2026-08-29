# KOA identity ritual — design QA

## Evidence

- Design target: the August 29, 2026 KOA Codex handoff and follow-up constraints for the glyph-built K/O/A seal sequence.
- Existing product source: the KOA navy, red, cream, and gold editorial site and its current photography-led chapters.
- Rendered states inspected in the cloud browser: atmospheric opening, partial assembly, completed K/O/A lockup, upper-viewport hold, glyph scatter/seal fade, cursor dither field, and photo-story handoff.
- Browser console: no application errors. The browser extension emitted unrelated metadata messages.

## Findings

- P0: none.
- P1: none.
- P2: none.
- K and A are constructed from 62 live S'gaw Karen glyph fragments and resolve to the seal's optical height.
- The seal scales down as the letterforms finish, then the complete lockup rises to an upper-middle responsive stop.
- The lockup holds across an extended scroll interval before the seal fades and the glyphs scatter.
- Circumference type and rays rotate in opposite directions at dampened scroll-linked speeds; the boundaries remain soft without a full-screen blur layer.
- The post-scatter field uses a fixed glyph grid with a Bayer-style cursor dither threshold, not free-moving cursor particles.
- Atmospheric glyphs vary in scale, opacity, speed, and blur, with lower counts on narrow screens.
- The original photo-led chapters remain intact and begin only after the identity sequence resolves.
- The animation uses one bounded requestAnimationFrame update per scroll event and pauses inactive scene work, preserving the earlier mobile crash fix.
- Reduced motion presents a static completed lockup, visible caption, restrained background field, and normal document flow.

## Primary interactions tested

- Scrub from fragmented opening through K/O/A completion.
- Verify upper-viewport rise and hold interval.
- Scrub through seal fade and glyph scatter.
- Move the pointer across the static dither field.
- Continue into the photography chapters without a crash.
- Toggle Motion off and back on.
- Use the first chapter control to return to the beginning.

final result: passed
