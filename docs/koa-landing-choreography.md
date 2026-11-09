# KOA landing choreography

This is the implementation map for the local cinematic landing at `app/[lang]/page.tsx`. The selected visual direction is the bottom panel of the owner supplied contact sheet: a restrained K O A mark above a dusk mountain horizon. The supplied KOA seal is the O. The English organization name and the existing S’gaw Karen name appear beneath it. This document describes motion and presentation, not new claims about KOA.

## Five glyph directions considered

| Direction | Entrance | Formation | Decision |
| --- | --- | --- | --- |
| Converging streams | Loose rivers from left and right | Broad K and A with a luminous central ring | Too much visual traffic near the seal |
| Celestial scatter | Glyphs enter from all four edges at different depths | Fine, readable particle silhouettes | Useful arrival behavior |
| Calligraphic sweep | Long arcs from opposite corners | Gestural K and A strokes | Too close to solid drawn letters |
| Rain of letters | Vertical descents toward the horizon | Thin K and A columns | Too narrow and disconnected from the seal |
| Dusk horizon | All direction arrivals, with a quiet sunrise | Compact K and A flanking the supplied seal | Selected by owner; matches bottom panel |

The contact sheet is a concept reference. The implemented landscape is CSS, and the center artwork is the existing supplied seal asset.

## Scene and element pipeline

| Scroll progress | Scene | Element behavior |
| --- | --- | --- |
| 0–0.08 | Moon | Thin circle in the O position; dark horizon; faint ambient motes. The seal artwork is still veiled. |
| 0.02–0.59 | Gathering | K/A glyphs arrive one by one from golden-angle bearings beyond every viewport edge on individual quadratic Bezier routes. Cubic ease out advances each path; a short damped spring follows the path destination. The sun rises behind the mountain layers. |
| 0.55–0.71 | Alignment | K, seal, and A rise as a single horizontal assembly. Glyph springs trail the scroll driven destination briefly, catch up in either scroll direction, then settle. Edge glyphs move less than interior glyphs. |
| 0.70–0.79 | Identity | The moon outline yields to the supplied seal through blur and opacity. Its annular lettering clears and begins continuous counterclockwise rotation. |
| 0.79–0.85 | English name | The long English name clears from blur and rises into place beneath the mark. The mark holds still as a group apart from fine glyph breathing. |
| 0.85–0.94 | Karen name | The existing S’gaw Karen organization name clears below the English name. It remains in the DOM at all times for reading and accessibility. |
| 0.94–1.00 | Charter and scatter | Existing body lines reveal one by one, followed by the existing voice phrase. From 0.96, K/A glyphs peel away one by one on curved paths and decelerate as they travel out, handing off to the existing story chapters. |

Progress is scroll reversible. The canvas receives a destination from the scroll playhead and keeps its own spring state, so it never hard locks to a scrub position. When motion is off, the completed mark and all text are shown without entrance or perpetual rotation.

The K/A field samples 19 rows on desktop and 14 on mobile. Glyph shapes are rasterized once per character and tone, then reused as small canvas sprites while the scroll and independent spring update their positions; this cuts repeat text shaping during animation. The mobile K/A geometry expands within the available width so the larger individual glyphs still make a legible mark.

## Motion decisions before and after

| Element | Before | After |
| --- | --- | --- |
| K/A glyph entrance | K entered from left, A from right, largely within view | Every bearing contributes; particles begin outside the viewport and arrive in an individual stagger |
| K/A formation | Fixed follow coefficient and hard settled lock | Per glyph damped spring, individual Bezier path, subtle settled float |
| K/A contour | Uniform glyph size across the grid | More even boundary glyphs and varied interior sizes; no solid outline |
| Scroll migration | Short shared scrub catch up | Shared K/O/A rise plus independent glyph spring lag in forward and reverse scroll |
| Center O | Seal visible throughout | Moon outline first, then existing KOA seal core and annular lettering clear through blur |
| Ambient cursor response | Mouse attracted particles and increased opacity | Local ring substitutes glyphs and bends positions; opacity remains constant |
| Ambient drift | Similar slow velocities | Slightly faster and more varied speeds, paused outside viewport |
| Name and body | English title and body arrived in one narrative phase | English name, S’gaw Karen name, and body follow separate scroll gates |

## Element ownership and constraints

- `CinematicLanding.tsx` owns scene progress and element gates. GSAP and Lenis remain the only scroll engine.
- `KAGlyphField.tsx` owns individual K/A paths, spring integration, target sampling, and the boundary/interior distinction.
- `KarenGlyphField.tsx` owns ambient dust and cursor ripple. It never shapes the K/A mark and never increases local brightness.
- `SealAssembly.tsx` supplies the approved seal art. CSS masks divide core from annular lettering.
- `cinematic-landing.css` owns landscape, sunrise, seal reveal, annular rotation, text transitions, and reduced motion presentation.
- Existing story chapters, links, and their sourced copy remain in place. New public facing factual claims require source review.

## Full landing element inventory

| Element | Trigger and response | Motion off / input behavior |
| --- | --- | --- |
| Site header and language links | Existing compact header responds to page scroll; locale links stay above the film | Navigation stays usable by keyboard and touch |
| Scroll cue | Visible only at arrival and fades with scene progress | Hidden |
| Motion toggle | Switches the entire film between native still presentation and animated scrolling | Pressed state identifies the chosen mode |
| Ambient characters | Time based drift and pointer local substitution wave | Still character field, no hover animation |
| K/A characters | Staggered offscreen Bezier entrance, scroll destination and independent spring follow, tiny settled breathing | Complete stationary K/A silhouettes |
| Moon, seal core and lettering | Moon outline fades, seal core clears, then outer lettering clears and turns CCW | Complete stationary supplied seal |
| Sunrise and ridges | Sun emerges while glyphs form; three layered CSS silhouettes stay behind content | Still dusk scene |
| English name, Karen name and body | Separate scroll gates; opacity, blur and slight vertical movement; body lines cascade | All text readable at once |
| Voice phrase | Existing word cycle begins after the narrative phase | Decorative cycle stops |
| Chapter photographs and copy | Existing one time IntersectionObserver reveals as each chapter enters | Immediate presentation |
| Mission cards and links | Existing slot rotation and small hover/focus responses | Card rotation stops; links remain accessible |
| Partner marquee | Existing horizontal track motion | Track stops and remains horizontally browsable |

## Review criteria

Review desktop and mobile at the moon, mid assembly, aligned mark, and bilingual title frames. The K/A edges should read cleanly without turning into solid strokes. The seal must remain the only O. Confirm that reverse scroll sends the mark back smoothly, pointer movement makes a local glyph pattern without a bright spot, reduced motion reveals complete text, and the next chapter loads without a blank handoff. Build and browser checks should be recorded separately from deployment.

Sources: owner supplied direction image and requests in this chat; existing KOA landing text and seal asset in this repository.
