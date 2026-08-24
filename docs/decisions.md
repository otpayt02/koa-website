# Decisions

## 2026-08-22 — Preserve native scrolling

- Chosen: lengthen the cinematic runways and lerp normalized progress.
- Considered: intercept wheel/touch input with a smooth-scroll library.
- Why: native scrolling keeps keyboard, touch, and assistive behavior predictable while still giving each chapter more reading time.

## 2026-08-22 — Use one seeded canvas engine

- Chosen: extend the existing glyph canvas with deterministic randomness and corner anchors.
- Considered: add p5.js, GSAP, or a second scene engine.
- Why: one engine reduces accidental complexity, avoids duplicate animation loops, and makes visual QA reproducible.

## 2026-08-22 — Treat the seal as the O

- Chosen: sample only K and A into glyph particles and reserve the center for the KOA seal.
- Considered: sample all three letters behind the logo.
- Why: the blank center makes the requested identity choreography legible and prevents glyph clutter around the emblem.

## 2026-08-22 — Keep publication approval-gated

- Chosen: modify and verify the local artifact only.
- Why: KOA wording, cultural symbols, official status, and publication require KOA/community review.

## 2026-08-23 — Let the seal complete its flight before the glyph O arrives

- Chosen: K and A resolve around the seal; the seal grows subtly, flies into the header, then glyphs enter from beyond the four viewport edges and form the O.
- Considered: morphing the seal directly into the O or assembling all three letters at once.
- Why: the separated handoff keeps the KOA identity sequence readable and gives the O formation its own cinematic beat.

## 2026-08-23 — Keep motion native and deterministic

- Chosen: use scroll-normalized timelines, eased interpolation, seeded particle targets, and velocity-linked CSS variables inside the existing canvas engine.
- Considered: installing a smooth-scroll or animation dependency.
- Why: the existing engine can deliver the requested inertia and easing without hijacking scrolling or adding a second animation runtime.

## 2026-08-23 — Treat foreground geometry as a glyph mask

- Chosen: measure visible foreground elements and suppress glyph drawing inside padded rectangles; hide the departed halo as an occluder before the new O arrives.
- Why: the field can remain dense across the page while text, photographs, navigation, and controls stay clean and legible.

## 2026-08-23 — Arabic numerals are a brief companion, not a strobe

- Chosen: keep the full Burmese chapter numeral dominant and expose the Arabic value for 96 milliseconds at restrained luminance, with a static companion in reduced-motion mode.
- Why: it preserves the bilingual reveal while avoiding an aggressive flash.

## 2026-08-23 — Buffer the cinematic scroll by three seconds

- Chosen: record normalized arrival and film targets, replay them three seconds later, then apply a slower interpolation pass.
- Considered: longer CSS durations without delaying the scroll signal.
- Why: the explicit buffer gives the visitor a real reading pause while preserving native wheel, touch, keyboard, and scrollbar behavior.

## 2026-08-23 — Make the seal the opening thesis

- Chosen: increase the seal to approximately five times its former visual area, remove the visible KOA outline, and let K/A emerge around the shrinking seal.
- Considered: begin with the full glyph wordmark or retain the transparent outline as scaffolding.
- Why: the identity starts with the organization mark itself and the sampled letters no longer compete with a clear typographic duplicate.

## 2026-08-23 — Use a readable two-arc identity orbit

- Chosen: place the organization name on the upper arc and “One people · One home” upright on the lower arc, rotating no more than 68 degrees from scroll progress.
- Why: the type visibly hugs the Statue of Liberty mark while remaining readable at the opening and during the slow migration.

## 2026-08-23 — Promote the real gathering photograph

- Chosen: move `fb-outdoor-gathering.jpg` to Chapter 1 with a more open crop and restrained documentary grade.
- Why: the first image now shows the scale of the Karen community and balances the site’s informational narrative with immediate human presence.

## 2026-08-23 — Let the navigation breathe with the cinematic

- Chosen: a slightly expanded arrival state, a compact post-arrival state, and a slow hover/focus expansion that works in both phases.
- Considered: hiding the navigation during the opener or making the compact state permanent.
- Why: the navigation remains usable from the first frame, settles out of the reading corridor when the identity sequence ends, and still rewards deliberate exploration.

## 2026-08-23 — Build one original premium block around truthful commitments

- Chosen: a first-party Commitment Loom with always-visible summaries, one-open supporting detail, and explicit truth states.
- Considered: importing a paid motion library, recreating several commercial blocks, or adding multiple decorative components.
- Why: one subject-specific interaction expresses care without turning the mission into a showcase reel. Native HTML, CSS, and JavaScript keep it portable and accessible.

## 2026-08-23 — Do not invent bilingual mission copy

- Chosen: preserve existing bilingual typography while keeping new Phase 4 mission copy in verified English until KOA/community translation review.
- Why: a visually convincing but unverified S'gaw Karen phrase would weaken the trust the new block is designed to establish.

## 2026-08-23 — Make the halo a corona, not a ring

- Chosen: place tiny Karen glyphs at real viewport-unit orbital distances behind a soft radial mask, with white English/Karen type on two readable clockwise arcs.
- Considered: a visible circumference, a dense particle ring, or generic CSS light beams.
- Why: the seal reads as the source of quiet sunlight while the glyphs stay atmospheric and the outer edge never becomes a hard graphic boundary.

## 2026-08-23 — Normalize visual transport, not the user's physical scroll

- Chosen: keep native wheel, touch, keyboard, and scrollbar behavior while replaying normalized targets after a three-second buffer with a fixed maximum visual-progress rate and chapter holds.
- Why: visitors receive the same readable cinematic pacing without accessibility-hostile wheel interception.

## 2026-08-23 — Share algorithms, preserve each site's information architecture

- Chosen: use the same living-field, corona, chapter, and motion principles in the static and bilingual sites while keeping one established header implementation in each.
- Considered: rendering two competing bilingual headers or cloning the static markup into React.
- Why: parity comes from a shared experience contract, not duplicated structure; navigation remains maintainable and semantically native to each site.

## 2026-08-24 — Add the cursor matrix inside the existing cultural field

- Chosen: render a second, pointer-local matrix from reviewed S'gaw Karen identity clusters plus K/O/A inside the established seeded canvas and foreground occlusion map.
- Considered: a separate Magic UI/shadcn component, a second canvas runtime, or increasing the opacity of every ambient particle.
- Why: one animation loop preserves Motion off, deterministic QA, foreground masking, and the K–seal–A choreography while the matrix remains a small discoverable background event.

## 2026-08-24 — Use one material wipe instead of many hover effects

- Chosen: a shared 2.35-second red-to-paper-to-gold glimmer on meaningful interactive surfaces, mirrored on focus and removed with reduced motion.
- Why: a single interaction grammar adds premium material response without crowding the site with unrelated microinteractions.

## 2026-08-24 — Separate verified support states from the blocked flight probe

- Chosen: keep condition-based proof for the matrix, occlusion, glimmer, 1800vh geometry, mobile chrome, Motion off, overflow, and console; disclose the two timed-out headless seal-flight checks separately.
- Why: source contracts and older proof are not a substitute for a new browser observation, and a blocked narrow state must not erase the supporting runtime evidence that did complete.
