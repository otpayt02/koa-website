# KOA cinematic choreography ledger

This is the canonical choreography ledger for the React/Vinext KOA landing route. It records the intended observable behavior, not permission to publish, translate, claim partnerships, or process a payment. `docs/KOA-REFERENCE-CANONICAL-SPEC.md` records the source-level rules and takes priority over older timing notes.

## Sources and boundaries

- Canonical runtime: `app/[lang]/page.tsx` → `components/CinematicLanding.tsx`.
- Glyph motion reference: `koa-sites-release/dist/koa.html`. Its timing and canvas-first physics are reference material; it is not the active runtime.
- Visual influences: the supplied KOA release, the supplied recording, and the requested dark, object-complete AI Studio feeling. KOA’s content, seal, typography, and visual identity remain distinct.
- The supplied KOA seal is the only circular O. It keeps its authentic ring lettering. K and A are filled only by S’gaw glyph particles; no construction outline, stroke, guide, or solid letterform may be mounted in the foreground.
- The non-public S’gaw Mango reference catalog is described in `C:/Users/olive/Projects/karen-language-agent/docs/KOA_REFERENCE_HANDOFF.md`.

## Hero scroll chronology

Progress is normalized from `0.00` at the top of the film to `1.00` at its end. The desktop film has 620svh of scroll runway; the mobile film has 520svh. These are scroll positions rather than video durations.

| Progress | Scene | Observable result | Implementation guardrail |
| --- | --- | --- | --- |
| 0.00–0.06 | Seal arrival | The supplied seal occupies roughly half the viewport height at center. | No header distraction; no pointer capture by the canvas. |
| 0.06–0.50 | Staggered formation | Individual glyphs approach from different directions, curves, start times, and velocities. Every particle reaches its sampled K/A target by 0.50. | A private filled mask supplies targets; no K/A path, stroke, guide, or solid letterform is mounted. |
| 0.16–0.59 | Shared rise and contraction | As glyphs arrive, the K, seal, and A rise together; the seal scales from one half to one quarter of the viewport. | One wrapper transform moves the glyph canvas and seal together. |
| 0.50–0.78 | Dramatic hold | K, seal, and A are fully formed and remain on-screen, with only restrained glyph breathing and annular seal rotation. | No paragraph or scatter yet. |
| 0.78–0.88 | Title and charter | “Karen Organization of America” fades and de-blurs in beneath the mark; the mission lines reveal from the bottom. | Use transform, opacity, and clip-path only; copy remains real KOA mission copy. |
| 0.81–0.88 | Voice cycle | The left word rotates through `Uniting`, `Providing`, `Inviting`, `Defining`, `Aligning`, `Deciding`, `Refining`, `Exciting`, `Rewriting`, `Applying`, `Supplying`, and `Combining`; `a voice` remains visible at right. | The cycle starts after the title; reduced motion shows a stable word. |
| 0.88–0.98 | Simultaneous scatter | The held glyphs leave their positions together but remain within the viewport while the title scene completes. | Particle alpha decays late and the seal fades last. |
| 0.98–1.00 | Release | The scene clears into the editorial story. | Story content remains readable and links remain keyboard reachable. |

## Components and permitted behavior

| Block | Files | Behavior |
| --- | --- | --- |
| Header | `components/Header.tsx`, `app/globals.css` | Slim, rectangular chrome. It compresses on scroll and uses the mobile menu at constrained widths. |
| Hero glyph field | `components/cinematic/KAGlyphField.tsx` | Bounded canvas. Its K/A target sampler mirrors `koa-sites-release/dist/koa.html` and adds denser three-pixel sampling, a fresh generation seed per formation, and per-particle arrival windows. DPR is capped at 1.5, the loop pauses when offscreen or the tab is hidden, and it has a complete static reduced-motion state. |
| Ambient glyphs | `components/KarenGlyphField.tsx`, `hooks/useNormalizedScroll.ts` | A background-only canvas field with the strict U+A9E0–U+A9FF set plus K/O/A. Each mote stays in its own slowly wandering territory with low-alpha Brownian drift, a 150px cursor swirl, lifecycle fades, and a procedural dither threshold. It receives no numeral target or shared destination. The rAF loop pauses while hidden/offscreen and reduces its active count after sustained slow frames. |
| Seal | `components/cinematic/SealAssembly.tsx` | Authentic supplied seal; it is centered between K and A and moves with them. |
| Charter | `components/CinematicLanding.tsx`, `app/cinematic-landing.css` | A slow bottom-up copy reveal in the sticky viewport. It does not impersonate a quote or add unverified claims. |
| Chapter images | `components/CinematicLanding.tsx` | Use approved repo assets. `story-community-original.png` is retired and must not be reintroduced. |
| Mission mosaic | `components/CinematicLanding.tsx`, `app/cinematic-landing.css` | Uneven, photographic service grid. One occupied slot changes every six seconds, keeping its local position while a real existing KOA service rotates in. Reduced motion leaves the initial set static. |
| Donation form | `components/DonationForm.tsx`, `app/api/donations/route.ts` | Creates a donation intent, then redirects only if `DONATION_CHECKOUT_URL` is configured. Google Pay is an availability note for a configured provider; it is not enabled by this repository alone. |
| Footer | `components/Footer.tsx`, `app/globals.css` | Adaptive two-column grid that becomes one column on narrow screens. |

## Interaction rules

- No pill-shaped navigation, language controls, motion controls, or donation controls. Small seal and status dots may remain circular because they are symbols rather than controls.
- Interactive elements may use a fine gold highlight, shallow lift, restrained glimmer, and clear focus outline. They must retain a visible resting state and support keyboard focus.
- Typography roles are deliberate: Cormorant Garamond for the cinematic/editorial display, Space Grotesk for navigation and readable body copy.
- Do not animate layout through per-frame measurements. Drive scroll through one `requestAnimationFrame` update and use transforms/opacity/clip-path for the scene.
- Default wheel cadence remains the browser’s native value. A non-blocking soft snap waits 180 ms after scrolling stops, then only attracts the scrub to 0.05, 0.50, 0.78, or 0.88 when the cursor is within 2.2% of that landmark. Wheel, touch, or pointer input cancels it immediately; no input is intercepted.

## Verification checklist

- Build the React runtime with `npm.cmd run build`.
- Verify hero start, form, hold, rise, charter, scatter, and reverse-scroll states at desktop and mobile widths.
- Confirm no `.koa-ka-outline`, `K_OUTLINE`, `A_OUTLINE`, or foreground stroked K/A text exists.
- Confirm the retired Chapter 02 image is absent from all source references and public assets.
- Test `?motion=off` and a reduced-motion media setting.
- Exercise the donation form only against a configured test checkout before enabling a live provider.
