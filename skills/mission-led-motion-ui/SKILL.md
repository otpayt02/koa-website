---
name: mission-led-motion-ui
description: Design and implement premium-feeling motion components for mission-led, cultural, nonprofit, and community websites when interaction must deepen trust, reading, or belonging. Use for cinematic navigation, truthful status blocks, commitment disclosures, woven transitions, or ambient motion; do not use for decorative motion with no informational job.
---

# Mission-led motion UI

Create one memorable interaction that makes the mission easier to understand. Build it from first-party HTML, CSS, and JavaScript or the repository's existing component system. Do not copy proprietary source, imitate a commercial block pixel-for-pixel, or add a paid dependency unless the user explicitly chooses it.

## Choose the block by its job

- **Breathing navigation:** an expanded introductory state, a quieter reading state, and a hover/focus expansion that preserves orientation.
- **Commitment loom:** always-visible promise summaries with optional supporting standards and honest status labels.
- **Truth rail:** separate `available`, `in development`, `planned`, and `invitation open`; never convert ambition into evidence.
- **Journey threshold:** use one choreographed transition to hand the visitor between story chapters or page modes.
- **Image threshold:** let motion change crop, focus, or depth only when it directs attention to documentary material.

If none of these jobs matches the content, do not add a motion block.

## Build contract

1. Name the audience, the block's information job, and the truth state of every claim before styling.
2. Keep essential content visible. Hide only supporting detail behind disclosures, and use real buttons with `aria-expanded` and `aria-controls`.
3. Derive motion from a small token set: one expressive easing, a fast feedback duration, a slow reading duration, and a longer atmospheric duration.
4. Let scroll set meaningful phase state; do not hijack wheel or touch input. Hover and keyboard focus must produce equivalent discovery.
5. Keep foreground content opaque to ambient glyph or canvas fields. Pointer-linked light must be subtle, bounded to the component, and disabled with reduced motion.
6. Give `prefers-reduced-motion` and the site's own motion-off mode a complete, readable resting composition.
7. Verify the served route at desktop and mobile sizes. Exercise hover, keyboard focus, disclosure open/close, reduced motion, horizontal overflow, and console errors.

## Quality gate

Remove the component if it cannot answer all four questions:

- What does this help the visitor understand?
- What changes when the visitor interacts?
- What remains readable without motion?
- Which visible claims are verified, developing, planned, or invitations?

Prefer one strong block over several competing effects. Motion should leave visitors with clearer confidence in the work, not awareness of the animation system.
