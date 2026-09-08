# KOA landing page master specification

**Status:** Draft v0.1 — design interview in progress  
**Last updated:** 2026-09-07  
**Scope:** the localized React/Vinext landing route, `app/[lang]/page.tsx` → `components/CinematicLanding.tsx`

## Authority and precedence

This document is the working contract for the next KOA landing pass. It records the current user direction before implementation. It does not authorize publication, donations, payment processing, unreviewed S'gaw Karen copy, or an invented organizational claim.

When the design interview is complete, sources resolve in this order:

1. The user's current approved answers and corrections.
2. This master specification.
3. `koa-sites-release/dist/koa.html` for glyph motion feel, canvas discipline, and seal behavior.
4. Existing source code and historical KOA documents.

The release artifact is a motion and rendering reference, not a constraint on the requested large K–seal–A composition. Earlier documents remain useful historical records; where they conflict with a later approved decision, this document wins.

## Locked direction

| Area | Required behavior |
| --- | --- |
| Opening mark | Start with the authentic KOA seal large and centered, over dither and dispersed background motes only. K and A do not appear in the first frame. They emerge later as large, dense glyph-filled letterforms using the selected display shape. They have no visible outlines, construction guides, vertical rails, or solid faces. |
| Scale and movement | At formation, K, seal, and A read as one wide mark, with K/A at approximately 90% of the seal's visible height. They share the same lift and scale transition, then settle together toward the upper viewport. |
| Seal | The seal's inner artwork remains stationary. Only the supplied annular typography rotates counterclockwise, accelerating through the early lift. Pointer movement may impart a small bounded axis lean to the annulus, never a synthetic replacement ring or copied seal text. |
| K/A formation | Individual glyphs arrive one after another from different directions, paths, delays, and speeds. Each particle is assigned a deterministic arrival window within the assembly phase, and may not enter its target state before that window. Every glyph reaches a sampled target inside the type shape by the shared formation deadline. The filled area varies per session, so no two resolved K/A fields look identical. |
| Hold and release | The completed K–seal–A mark has a long, dramatic readable hold before a coordinated scatter. The scatter remains inside the cinematic viewport until the next editorial scene owns the screen. |
| Text | The full organization name and readable charter enter after the mark begins its lift, using a bottom-up fade and blur resolution. Display and gold-accent text must be legible at a glance, not utility-sized. |
| Voice line | The stable right-hand phrase is `a voice`; the changing left-hand word cycles through approved verbs such as Uniting, Providing, Inviting, Defining, Aligning, Deciding, Refining, Exciting, Rewriting, Applying, Supplying, and Combining. |
| Ambient field | Low-opacity S'gaw Karen glyph motes remain distributed behind content. A full-depth dark ink / dithered aurora layer slowly changes underneath, with a restrained pointer-local reveal. Background glyphs never collect into the identity mark. |
| Rays | Red, blue, and gold light is a soft, low-contrast directional veil around the seal. It may suggest a halo through masked light and parallax, but cannot create hard radial rays, closed rings, vertical guide lines, or a competing second emblem. |
| Interaction language | Controls use clear edges and shallow radii, never pills. Hover, focus, cursor response, and glimmer are smooth, brief, and meaningful. Canvas layers never take pointer events. |
| Layout | Header, thin banner, sections, cards, and footer compress and expand without clipping. Copy reflows deliberately across desktop and narrow mobile. Foreground controls and copy remain above all canvas work. |
| Motion quality | Native scroll remains native. Canvas work uses `requestAnimationFrame`, transforms, opacity, capped DPR and particle counts, visibility pausing, and a complete reduced-motion static state. |

## Proposed scroll choreography

These ranges are a starting choreography to review, not final code values. They preserve a single sticky viewport and give each event time to read.

| Phase | Normalized progress | Scene | Observable behavior |
| --- | --- | --- | --- |
| 0. Arrival | `0.00–0.08` | Seal introduction | Large centered seal, quiet aurora, faint ambient motes. K/A is absent and there is no competing headline. |
| 1. Assembly | `0.08–0.34` | K/A resolve | Distributed glyph cohorts enter in sequence: each particle has its own scheduled window, path, speed, and easing, then accelerates and decelerates independently into the dense, complete K and A fields. The annular type starts counterclockwise and gathers speed. |
| 2. Presence | `0.34–0.51` | Full mark hold | Fully formed, large K–seal–A mark rests in the middle. Pointer reveal, annular lean, and the light veil remain subtle. |
| 3. Elevation | `0.51–0.66` | Shared rise | K, seal, and A lift and scale down together. Annular rotation reaches its controlled peak, then settles. |
| 4. Statement | `0.64–0.80` | Name and charter | Title enters first, then the charter resolves line by line from lower blur. The voice cycle begins only after the title can be read. |
| 5. Editorial threshold | `0.80–0.92` | Landing invitation | The completed identity and statement stay readable while the first editorial function begins to appear. |
| 6. Release | `0.92–1.00` | Glyph scatter | K/A glyphs leave their targets in coordinated but varied paths. Ambient glyphs retain background-only behavior. |

The final timing will use soft endpoint attraction only if it can preserve native wheel and touch behavior. There will be no wheel interception, forced snap, or broken reverse-scroll state.

## Landing-page content draft

The copy below is a structure for review; it avoids claims that have not been supplied or approved.

1. **Identity:** `Karen Organization of America`
2. **Voice line:** `[cycling action] a voice`
3. **Charter position:** a concise, evidence-reviewed statement of community connection, cultural continuity, language, and civic participation. The exact final wording remains open until KOA-provided mission or charter language is selected.
4. **Editorial functions:** discover ways to connect, contribute, receive support, and learn through intentionally varied image/service cards. One card can transition at a time; each rotation needs an accurate service title, image provenance, and destination.
5. **Contribution:** show a clear donation invitation only after a payment provider, recipient account, offer, and settlement approval are supplied. A visible test/rehearsal surface is acceptable before then.
6. **Footer:** durable pathways to contact, programs, language resources, governance, privacy, and contribution information; it contracts cleanly into a reading-order-first mobile layout.

## Interaction inventory

| Element | Idle | Pointer / keyboard response | Reduced-motion behavior |
| --- | --- | --- | --- |
| Ambient dither aurora | Deep, low-contrast shifting field | Local brightness and character reveal under the pointer | Static textured wash, foreground stays readable |
| Ambient glyph field | Low-opacity Brownian drift | Gentle swirl and alpha increase within a bounded radius | Static sparse glyph distribution |
| K/A glyph mark | Fully formed glyph-filled type field during its hold | Small give-space / directional lean, never a violent scatter | Stable resolved K/A appearance |
| Seal annulus | Counterclockwise scroll-linked rotation | Bounded axis lean from pointer location | Stationary annulus and seal |
| Cards and controls | Quiet edge, shallow corner, no pill silhouette | Short transform, focus ring, and single glimmer pass | Focus and color state only |
| Header / footer | Responsive hierarchy | Clear navigation and disclosure states | Same readable structure |

## Ambient S'gaw glyph-field contract

This requirement applies to `components/KarenGlyphField.tsx` when the approved build begins. The K/A assembly remains a distinct identity layer and may not pull this ambient field into the hero mark.

| Concern | Contract |
| --- | --- |
| Character set | Restrict glyph motes to S'gaw Karen Unicode `U+A9E0–U+A9FF` plus Latin `K`, `O`, and `A`. |
| Rendering | One HTML canvas driven by `requestAnimationFrame`; never mount particle DOM nodes. It sits at `z-index: 0`, is pointer-transparent, and foreground content occludes it at `z-index: 10+`. |
| Dust-mote appearance | Base opacity is `0.05–0.15`, particle sizes vary from `8–14px`, and the palette uses low-alpha gold `#F59E0B` and red `#DC2626`. A roughly `0.5px` softening avoids harsh raster edges. |
| Idle physics | Use bounded Brownian/noise drift with sine modulation and an average speed near `0.2px` per frame. Never use a constant-direction linear path. |
| Pointer reveal | Inside a 150px radius, background motes swirl gently around pointer velocity and may brighten toward `0.4` opacity. They do not flee, form a dense cluster, or cross foreground masks. A canvas-brightness threshold dither makes the reveal feel discovered rather than switched on. |
| Lifecycle | Spawn fades over about 2 seconds, lives for a randomized 20–40 seconds, then fades out over about 3 seconds. Reuse/reseed gradually so no particle pops. |
| Chapter transitions | On an editorial chapter change, the ambient field may slowly resolve a large, sparse, translucent Burmese/Karen numeral (`၁`, `၂`, `၃`, `၄`) at roughly 30% fill. It breathes globally between `1` and `1.02`, then disperses with ease-out-quint distance damping. |
| Performance | Cap DPR and particle count on high-DPR/mobile devices; pause when hidden or off screen. The goal is stable 60fps on a mid-range laptop. CPU under 15% is a performance target to measure in a local system profile, not a claim until measured. |

## K/A scheduled-arrival contract

The formation must be visibly sequential. Particle `i` receives a seed-derived arrival interval, a source direction, an easing profile, and a target. Before its interval begins it remains absent or stays in background-safe travel; within the interval it follows an eased, noise-influenced path; at the shared assembly deadline it is within the target tolerance. This produces a formation that is progressively written into place, rather than a field that snaps in as one solved calculation.

## Responsive and accessibility requirements

- Preserve the authentic supplied seal as the sole O; never redraw its circular wording.
- Use `clamp()` and content-led wrapping for the organization name, charter, and cycling line. Do not solve narrow layouts by reducing important copy to unreadable text.
- Keep header actions, language navigation, banner, and footer in normal document flow when space is constrained.
- Canvas is `aria-hidden`, `pointer-events: none`, and lower than foreground content.
- Respect `prefers-reduced-motion`, a local motion control, keyboard focus, contrast, and readable tap targets.
- Cap backing resolution and particle count by viewport/DPR; pause animation while the page is hidden or effect is off screen.

## Verification gates for the approved build

1. Inspect initial, partial-assembly, formation, hold, lift, text reveal, scatter, reverse-scroll, and refresh-at-position states.
2. Inspect a desktop viewport and a narrow mobile viewport for mark scale, readable copy, header/footer compression, and zero horizontal overflow.
3. Hover the background, K/A field, seal annulus, and cards. Confirm each response is subtle, bounded, and does not block interaction.
4. Confirm no K/A outline, vertical construction line, duplicate hero, synthetic annular text, hard ray, or pill-shaped control is visible.
5. Run focused motion contracts, `npm.cmd run build`, and browser-visible proof before reporting the visual pass as complete.

## Design interview: open decisions

The next implementation pass waits for these decisions so it does not repeat the prior proportion mismatch:

1. **Resolved:** at the completed central mark, K and A are approximately 90% of the seal's visible height.
2. **Resolved:** first paint presents only the centered seal, dither, and dispersed floating background glyphs. K/A arrives only during assembly.
3. **Under review:** choose the K/A shape after inspecting the historical comparison artifact, `koa-ka-type-review.html`.
4. Should the charter use approved existing KOA wording, or should this pass carry a clearly marked draft until you provide final mission/charter copy?
5. Does the proposed six-phase pacing feel right, especially the hold (`0.34–0.51`) and late scatter (`0.92–1.00`), before it becomes the final scroll timeline?
