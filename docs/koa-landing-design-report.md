# KOA Landing Motion Design Report

## Executive summary

The owner selected the bottom panel of the five direction contact sheet for the KOA landing: a compact glyph built K and A around the supplied seal, above a dark mountain horizon. The local implementation now uses that direction, stages the existing English and S’gaw Karen organization names, and gives each glyph its own scroll responsive path and spring. This is a local design and implementation report; it does not establish published state or new KOA facts.

## Key findings

1. The prior glyph field drew readable letters but entered mainly from the sides and locked each glyph to its target. The new field begins outside all four viewport edges, follows individual Bezier paths, and settles through a stable spring. A browser check initially exposed numeric instability after delayed frames; the spring integration was corrected and the canvas rendered again.
2. The supplied seal is the only O. Its core stays veiled behind a moon outline at the start, then clears through blur. Annular lettering reveals later and rotates counterclockwise. This uses the existing seal asset; no generated replacement seal is used.
3. English and Karen organization names were not presented together in the cinematic title. The existing S’gaw Karen name is now visibly placed beneath the English long form, with body text on a later scroll gate.
4. The ambient field previously raised opacity under the pointer. Its local ripple now bends and substitutes characters while keeping each mote’s opacity fixed. Motes move at more varied, slightly faster speeds and pause outside the viewport.
5. The local page renders in the browser at desktop and mobile sizes, including a motion off state. A full production build remains blocked by the unrelated missing `requireAdminPage` export in `lib/page-auth.ts` imported from an admin route. The Impeccable detector reports pre-existing Space Grotesk and header layout-transition warnings.
6. Sites lists version 34 as the latest saved and deployed version, with earlier deployed versions including 20 and 13. That history supplies source SHAs and still screenshots, not comparable motion recordings. It does not establish which historical version had the best glyph choreography. The owner selected the bottom visual direction as the base for this local pass.

## Implications

The landing now gives the mark a longer, more legible formation period and gives the title two distinct language beats. The scroll playhead sets destinations, while the glyph field owns its own movement. Browser frames confirm the K/seal/A composition and bilingual title. The photographic dusk landscape concept is retained as an alternative asset; the current page uses CSS scenery and the supplied seal so the final visual can be changed without touching identity artwork.

## Recommendations

- Review the local page at the arrival, assembly, seal reveal, and bilingual title frames on desktop and mobile. The selected direction image remains the visual reference.
- Confirm the primary audience before the Impeccable `PRODUCT.md` and `DESIGN.md` init is finalized. The init workflow calls for one confirmed durable product fact.
- Fix the existing admin export build blocker in a separate task, then run a full build and production preview. Keep local browser evidence distinct from publish proof.
- Choose whether the photographic dusk alternative should replace the CSS landscape after reviewing text contrast and geographic implications.

## Appendix

### Assets

- [Five glyph directions](design-assets/koa-five-directions.png): the bottom panel is selected; other panels are rejected or motion references only.
- [Dusk landscape alternative](design-assets/koa-dusk-landscape-alternative.png): generated scenery concept only; it is not used as the live page background.

### Motion and component specification

See [KOA landing choreography](koa-landing-choreography.md) for every scroll beat, component owner, before and after motion decision, and review criterion.

### Verification scope

Local `vinext dev` loaded `/en` in the in-app browser. Desktop and 390 × 844 mobile frames were inspected, including reduced motion. `npm.cmd run build` compiled client references and server references, then failed at the pre-existing admin export. Impeccable `detect --json` completed and found two CSS warnings. No deployment or external publication was performed.

Sources: owner supplied requests and selected reference image in this chat; existing KOA landing source and supplied seal asset in this repository; local browser and command outputs from this task.
