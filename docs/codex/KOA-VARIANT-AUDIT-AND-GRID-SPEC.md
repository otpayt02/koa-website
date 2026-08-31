# KOA variant audit and cursor-glyph grid specification

Audit date: 2026-08-29  
Workspace searched: `C:\Users\olive\Projects`  
Scope: KOA/Karen Organization of America website artifacts, local HTML prototypes, source notes, and recorded ChatGPT Sites URLs.

## Canonical source map

The current canonical application is the React/Vinext app in `C:\Users\olive\Projects\koa-website`:

- Route source: `app/[lang]/page.tsx`
- Cinematic home composition: `components/CinematicHome.tsx`
- Current browser route: `http://127.0.0.1:3013/en`
- Static parity/reference home: [`public/koa/index.html`](../../public/koa/index.html)
- Static styles and runtime: `public/koa/storytelling.css`, `public/koa/storytelling.js`

The static `public/koa/index.html` is the canonical HTML file requested for direct inspection. It is a 448-line, self-contained opening experience using Cormorant Garamond, Space Grotesk, Noto Sans Myanmar, and JetBrains Mono; a five-chapter frame film; a seal-centered hero; chapter glyph numerals; documentary image scenes; and a deferred `storytelling.js` motion layer. The React route is the canonical production direction; the static file is the stable HTML reference and must not be assumed to include the latest React optimizations.

## Inventory of KOA website instances

### 1. `koa-website/public/koa/index.html` — static cinematic home

Link (after running the preview launcher): [canonical static prototype](http://127.0.0.1:8143/index.html)  
PowerShell: `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\olive\Projects\koa-website\scripts\preview-koa-variants.ps1 -Open`

Strongest parts:

- Clear chapter grammar: the page declares a single film, a total frame count, chapter dots, a hero scene, and a sequence of image-led story scenes. This gives the interaction a legible beginning, middle, and end.
- Strong subject alignment: the seal, Karen glyph numerals, community photography, civic voice, language, and care are in the same narrative system rather than being generic product sections.
- Typography is intentionally editorial: Cormorant Garamond supplies a premium display voice, Space Grotesk handles utility/navigation, Noto Sans Myanmar supports script, and JetBrains Mono provides frame/status metadata.
- The `data-glyph-letter` hooks and `storytelling.js` separation make the K/A glyph formation portable: geometry is authored separately from the render loop, and glyph elements can be swapped without rewriting the page structure.
- Preload hints for the seal and documentary images communicate a useful performance priority: reveal the identity asset and first human image first.
- Dedicated `data-beat` elements create a natural place for blur, translation, opacity, and staggered text entrance without making every paragraph a separate animation system.

Watch-outs:

- The HTML is a static reference, not the current React production route.
- Full-scene image layers can create expensive paint regions if combined with multiple filters or large backdrop blurs.

### 2. `koa-website/public/koa/index-enhanced.html` — maximal single-file exploration

Link (after running the preview launcher): [enhanced static prototype](http://127.0.0.1:8144/index-enhanced.html)  
PowerShell: `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\olive\Projects\koa-website\scripts\preview-koa-variants.ps1 -Open`

Strongest parts:

- It contains the richest visual vocabulary in one file: a diamond/loom texture, a dynamic glyph canvas, halo/ray treatment, large editorial type, and more explicit motion states.
- The CSS variables create a reusable design-token layer for display, body, script, color, border, and glow values.
- The `glyph-canvas` concept is the best source for the requested “many glyphs, but only where the interaction is” direction: it can act as a veil that is revealed by a local interaction rather than a permanent noisy background.
- It uses more considered type pairing than the older mocks: Cormorant plus Playfair gives two editorial voices while Space Grotesk keeps controls modern.
- The loom pattern is an important KOA-specific texture. It should be kept as a low-contrast material layer, not promoted to a dashboard-like repeating decoration.

Watch-outs:

- At 1,975 lines, it is a strong idea archive but a poor long-term runtime source. Port the concepts into focused components rather than copying the entire file into React.
- Multiple full-screen layers, blur filters, and animated canvases must be budgeted together.

### 3. `koa-url-clone/public/koa/index.html` — strongest compact glyph/chapter reference

Link (after running the preview launcher): [URL-clone static prototype](http://127.0.0.1:8145/index.html)  
PowerShell: `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\olive\Projects\koa-website\scripts\preview-koa-variants.ps1 -Open`

Strongest parts:

- This is the clearest compact implementation of the earlier mini-glyph idea. It has explicit `.glyph-letter--k` and `.glyph-letter--a` anchors beside a centered seal/logo, so K and A can resolve around the identity mark without competing with the O.
- `buildGlyphLetters()` creates many small marks from segment definitions, assigns seeded characters, and stores each mark's distance/angle/rotation. This is the best behavioral reference for a natural-looking K/A made from mini glyphs.
- `renderGlyphLetters(progress)` gives the glyphs a continuous formation model rather than a one-off opacity toggle. The marks ease from radial orbits into letter anchors.
- The film uses `smoothstep`, momentum, local scene progress, separate fade-in/fade-out windows, and a small scale settle. This is a strong model for cinematic motion that remains readable.
- The runtime keeps the documentary scenes distinct: Capitol/civic work, community, and a dedicated civic image note. That restraint is valuable.
- The local clone has a clear source-site mapping in `storytelling.js`, which makes provenance and parity boundaries explicit.

Watch-outs:

- The compact implementation intentionally avoids the larger ambient glyph field. It should be combined with the enhanced prototype's interaction veil, not replaced by a permanently dense canvas.

### 4. `sons_of_kawthoolei/KOA/koa-sites/public/koa-v5/index.html` and `mock-site-v5/index.html` — strongest chapter system

Links (after running the preview launcher): [koa-sites v5](http://127.0.0.1:8146/index.html), [mock v5](http://127.0.0.1:8151/index.html)  
PowerShell: `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\olive\Projects\koa-website\scripts\preview-koa-variants.ps1 -Open`

Strongest parts:

- V5 has the clearest semantic chapter inventory: Connection, Leadership, Care, and Memory. It gives the cinematic layer a meaningful editorial spine.
- Each chapter has one image, one headline, one short explanation, and one next action. This is the best information-to-image balance in the local variants.
- `loading="lazy"` and `decoding="async"` on chapter photography are good defaults for the non-hero images.
- The programs chapter uses a compact rail of actionable program links instead of a wall of cards. This is a strong pattern for keeping motion and information from competing.
- The impact chapter provides three distinct next steps—give, volunteer, partner—which is more useful than a generic “learn more” button.
- `v5.js` uses a single timeline update plus IntersectionObserver for chapter photos and header state. That is a good low-complexity motion architecture.

Watch-outs:

- V5's conceptual images are visually coherent but must remain truth-labeled as concept imagery until community-approved photography is selected.
- The chapter runtime is image-first and does not contain the mini-glyph K/A formation; borrow its chapter discipline, not its identity choreography.

### 5. `sons_of_kawthoolei/KOA/koa-sites/public/koa/index.html` and `mock-site-v4/index.html` — strongest operational navigation

Links (after running the preview launcher): [koa v4](http://127.0.0.1:8147/index.html), [mock v4](http://127.0.0.1:8148/index.html)  
PowerShell: `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\olive\Projects\koa-website\scripts\preview-koa-variants.ps1 -Open`

Strongest parts:

- V4 has an explicit ordered chapter list with labels such as Civic leadership, Community connection, Practical support, and National coordination. This makes the narrative inspectable even when motion is disabled.
- The CSS has a dedicated Myanmar/Karen font face and a strong surface system with focused header states.
- The script combines smooth section navigation with IntersectionObserver-based header state, which is a simple and robust fallback model.
- It demonstrates how a cinematic page can retain normal anchor navigation and semantic headings instead of turning the entire site into an inaccessible canvas.

Watch-outs:

- The v4 stack is split across several CSS override files. Use its behaviors and chapter labels, but consolidate tokens before porting.

### 6. `sons_of_kawthoolei/KOA/mock-site-v3/index.html` — strongest bilingual/prototype disclosure baseline

Link (after running the preview launcher): [mock v3](http://127.0.0.1:8149/index.html)  
PowerShell: `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\olive\Projects\koa-website\scripts\preview-koa-variants.ps1 -Open`

Strongest parts:

- Uses a local Noto Sans Myanmar font with `font-display: swap`, which is a better offline/runtime pattern than relying entirely on remote fonts.
- Keeps explicit `ksw` language tagging and includes a prototype disclosure explaining what is and is not verified.
- Its restrained sans-serif typography and simple glass surfaces are a useful fallback for low-power or reduced-motion modes.

### 7. `sons_of_kawthoolei/KOA/mock-site-v2/index.html` — strongest early visual hierarchy

Link (after running the preview launcher): [mock v2](http://127.0.0.1:8150/index.html)  
PowerShell: `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\olive\Projects\koa-website\scripts\preview-koa-variants.ps1 -Open`

Strongest parts:

- Large display headings, clear kicker labels, and generous whitespace establish a strong first-read hierarchy.
- The design demonstrates how premium typography can survive without a large animation engine.

### 8. `sons_of_kawthoolei/KOA/mock-site/index.html` — earliest content baseline

Link (after running the preview launcher): [original mock](http://127.0.0.1:8151/index.html)  
PowerShell: `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\olive\Projects\koa-website\scripts\preview-koa-variants.ps1 -Open`

Strongest parts:

- Useful baseline for content coverage, navigation, and early information architecture.
- Good comparison point for identifying which later visual effects are genuinely improving comprehension.

### 9. `koa-url-clone/index.html` — local Vite wrapper

Link: [local clone shell](../../koa-url-clone/index.html)

Strongest parts:

- Provides a runnable local shell around the compact static prototype.
- Good for comparing a fast local rendering path against the full canonical application.

## Recorded ChatGPT Sites links

These URLs are recorded in project notes and metadata. They are external/owner-controlled references, not local source files. Access may require the signed-in owner session.

- [KOA ChatGPT Site](https://karen-organization-of-america.oliverp789.chatgpt.site)
- [KOA shared conversation: cinematic references](https://chatgpt.com/share/6a88ef30-bbf0-83ea-9cfc-f1ef808e87c4)
- [KOA shared conversation: additional reference](https://chatgpt.com/share/6a88eee4-1b64-83ea-980c-c683c11e199e)

The local audit found the KOA Sites URL in `sons_of_kawthoolei/KOA/docs/koa_v4_run_handoff.md`, the canonical app metadata, and the URL-clone redirect adapter. No exported ChatGPT Sites source bundle was found under `C:\Users\olive\Projects`; therefore the hosted site is recorded as a reference link, while the local variants above are the evidence-backed implementation sources.

## Recommended synthesis for the next Codex prompt

Use this order of authority:

1. Identity choreography: borrow the mini-glyph K/A segment and seeded formation behavior from `koa-url-clone/public/koa/storytelling.js`.
2. Interaction veil: borrow the enhanced prototype's canvas/loom concept from `koa-website/public/koa/index-enhanced.html`, but reveal it only inside a cursor/touch/scroll influence field.
3. Story structure: borrow V5's four-chapter editorial discipline and action rails.
4. Typography and accessibility: borrow the static canonical pairing and V3's local Myanmar font fallback.
5. Runtime architecture: keep one seeded renderer, one passive input sampler, capped DPR, adaptive frame budget, IntersectionObserver visibility gating, and a complete reduced-motion/static fallback.

## Cursor-only randomized ASCII/Karen grid behavior

Desired behavior:

- The grid is not a permanent full-page texture. It is a dormant layer until the cursor, touch point, or active scroll interaction creates an influence region.
- Every cell has an independent seeded position, glyph choice, size, rotation, opacity, drift vector, replacement timer, and depth value. Do not generate one shared value per row or column.
- On every meaningful input movement, spawn replacement glyphs near the new influence boundary and retire a small sample of older glyphs. Use a bounded pool so the effect cannot grow without limit.
- Replace glyphs with deterministic randomness derived from `(seed, cellId, inputSequence, spawnCount)`. This gives visual variation without calling `Math.random()` in the hot render loop.
- Cursor motion should distort the field with a short-lived velocity vector; touch should use the same sampler; scroll should bias the field's drift direction but never make the grid appear attached to the page.
- Draw only cells inside the influence radius plus a small feather band. The rest of the canvas stays transparent. This keeps the ChatGPT Sites-like quiet baseline while preserving the surprise of local glyph emergence.
- Use a two-stage life cycle: `spawn -> resolve -> drift -> dissolve`. New characters should not pop in at full opacity; resolve them over roughly 180–320ms with cubic easing, then dissolve them over roughly 300–700ms.
- Use an occlusion mask from foreground elements so glyphs never paint over copy, controls, faces, or primary images.
- On slow devices, reduce the influence radius, pool size, DPR, and update frequency before removing the effect entirely. Respect `prefers-reduced-motion` and `prefers-reduced-data` by using a static sparse sample or no canvas.

Suggested implementation boundary:

- `components/cinematic/CursorGlyphHalo.tsx`: input sampling and influence state.
- `components/cinematic/RandomizedGlyphGrid.tsx`: bounded glyph pool and deterministic replacement logic.
- `components/CinematicHome.tsx`: provide foreground occlusion rectangles and chapter/input context.
- `app/globals.css`: keep the canvas behind foreground layers and disable expensive blur/backdrop effects for reduced-data profiles.

Implementation status (2026-08-29): the first vertical slice is now in `components/AsciiDitherCanvas.tsx`. Idle frames clear to transparent; pointer, touch, and scroll input spawn/reseed independent nearby cells; each cell carries its own replacement seed; and the bounded grid fades away outside the reveal halo. The K/A intro separately uses an adaptive 420/240 particle budget in `components/KOALogoIntro.tsx`.

Acceptance criteria:

- No glyphs are visible when the pointer/touch/scroll interaction is idle outside the influence field.
- Two adjacent cells in the same row can visibly differ in glyph, opacity, rotation, size, and velocity.
- Moving the pointer by a few pixels creates replacement glyphs without a full-screen redraw of visible DOM content.
- Foreground copy and controls remain unobstructed.
- Desktop and mobile remain responsive; TypeScript, lint, production build, and browser smoke checks pass.
- Reduced-motion and keyboard-only users receive readable content without needing the effect.

## PowerShell preview commands

### Canonical React app

```powershell
cd C:\Users\olive\Projects\koa-website
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\run-koa.ps1 -Port 3013
Start-Process http://127.0.0.1:3013/en
```

Stop it:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\stop-koa.ps1
```

### Static canonical HTML

```powershell
cd C:\Users\olive\Projects\koa-website\public\koa
$global:KoaStaticPreview = Start-Process python -ArgumentList '-m','http.server','8123' -WorkingDirectory (Get-Location) -PassThru
Start-Process http://127.0.0.1:8123/index.html
```

Stop it:

```powershell
Stop-Process -Id $global:KoaStaticPreview.Id
```

### Local URL clone

```powershell
cd C:\Users\olive\Projects\koa-url-clone
npm.cmd run dev -- --host 127.0.0.1 --port 4173
Start-Process http://127.0.0.1:4173/koa/
```

Do not publish or change access on the ChatGPT Sites URL without explicit approval.

## GitHub commit lineage with meaningful website differences

Repository: [otpayt02/koa-website](https://github.com/otpayt02/koa-website)  
Remote verified from the local checkout: `https://github.com/otpayt02/koa-website.git`  
Method: `git log --all` plus targeted `git show --stat` for website/runtime commits. Automated `autosync` commits and pure merge commits are intentionally collapsed because they do not represent independent visual versions.

### Foundation and hosted-site conversion

1. [`c7f849f`](https://github.com/otpayt02/koa-website/commit/c7f849f48d44a34f7627b1f948c004bfc9065353) — **Create KOA Sites conversion** (2026-08-02). Established the Sites-compatible Next/Vinext application shell, hosting metadata, database scaffolding, and the first deployable application boundary. Good: a real product/runtime foundation instead of a static mock. Keep: deployment-aware structure and explicit route ownership.
2. [`0299657`](https://github.com/otpayt02/koa-website/commit/0299657069d178c542cf0b4f5cca4dd02c6bc16c) — **Fix Sites redirect test** (2026-08-02). Corrected the rendered-HTML redirect contract. Good: proves the hosted shell's navigation behavior was tested early. Keep: route/redirect smoke coverage.
3. [`0d259e4`](https://github.com/otpayt02/koa-website/commit/0d259e417f05bf34a58821789622ae53eb2f41e3) — **Build cinematic multi-page KOA story** (2026-08-08). Introduced the first coherent multi-page static story: home, About, Programs, Stories, Contact, shared storytelling CSS/JS, and a story-network image. Good: established page-level narrative and reusable static film primitives. Keep: shared chapter scaffolding and page continuity.
4. [`a8bb0dd`](https://github.com/otpayt02/koa-website/commit/a8bb0dd606dd28b2804579827987e16e7cc587ab) — **Replace illustrated scenes with real KOA photography** (2026-08-08). Replaced an illustrative scene asset with real KOA imagery. Good: documentary credibility and emotional specificity. Keep: real photographs as the primary image language, with concept art explicitly labeled when used.
5. [`9e13f34`](https://github.com/otpayt02/koa-website/commit/9e13f3435afd61a6ee69c40e434c92d2731f8b26) — **Redesign KOA website with cinematic mobile-first storytelling** (2026-08-08). Added enhanced Capitol/community/history/program imagery, mobile-first chapter sizing, and a stronger visual story contract. Good: mobile was treated as a first-class composition, not a shrunken desktop. Keep: mobile crop choices and documentary image hierarchy.
6. [`520c594`](https://github.com/otpayt02/koa-website/commit/520c5949f57bad51ad2943e3b435df2be5c92e81) — **Build 2400-frame cinematic KOA stories** (2026-08-09). Added the 2,400-frame scroll film, OG cinematic image, richer chapter transitions, and cross-page story beats. Good: scroll becomes a measurable narrative timeline. Keep: frame meter, chapter boundaries, and clear pacing model.
7. [`b1b84cf`](https://github.com/otpayt02/koa-website/commit/b1b84cfd7e0258dd97f708a98285229772c2653a) — **Combine cloud features with published photography** (2026-08-09). Added community-care, national-community, and sepak-takraw imagery while tying the cloud direction to published photography. Good: image variety became grounded in actual programs and community life. Keep: human-scale program evidence.
8. [`50fd378`](https://github.com/otpayt02/koa-website/commit/50fd378ae937ad8fb4fa232bc5d9b846bdf7e1f2) — **Enhance cinematic motion and restore review content** (2026-08-09). Tuned motion timing and restored review-oriented content across pages. Good: motion was treated as editorial pacing rather than decoration. Keep: readable copy during transitions.
9. [`65eac0a`](https://github.com/otpayt02/koa-website/commit/65eac0a35eff1f2e46dd6e478d7531d6d18601c5) — **Refine logo gradient and editorial interactions** (2026-08-09). Refined the identity mark, gradient treatment, and interaction details. Good: small identity refinements materially improved perceived quality. Keep: restrained gradient and editorial hover behavior.

### Production-kit, bilingual, and Living Alphabet direction

10. [`6f33cce`](https://github.com/otpayt02/koa-website/commit/6f33cce732e8f4cd3d68f305f904d95e52675a5c) — **Build out the Karen Organization of America website** (2026-08-16). Added the cinematic-scroll skill kit, reference pages, v5 Sites archive, and motion/accessibility notes. Good: captured repeatable motion patterns and performance constraints. Keep: the documented motion/accessibility contract and reference archive.
11. [`83d4065`](https://github.com/otpayt02/koa-website/commit/83d406515069685bbc2e7cf86b5da113530ca9c3) — **Sync KOA across devices** (2026-08-18). Added the device-sync workflow and adjusted static story files. Good: protected cross-machine continuity. Keep: explicit sync/run handoff, but do not treat synchronization commits as visual redesigns.
12. [`2b0024b`](https://github.com/otpayt02/koa-website/commit/2b0024b5241da9bfe945d88733f3c0e8100b113a) — **Complete bilingual counterparts beta** (2026-08-18). Added the bilingual content catalog and generated inventory. Good: language parity became inspectable data instead of scattered copy. Keep: source-language ownership and reviewable locale records.
13. [`a0a1a6d`](https://github.com/otpayt02/koa-website/commit/a0a1a6d4477d6e29f899d7aa7d39be2e204b712b) — **Enhanced KOA Website with Premium Visual Design and Advanced Interactivity** (2026-08-23). Qwen-authored enhancement checkpoint. Good: marks the premium visual/interactivity branch that later became the React cinematic direction. Keep: its visual ambition, but verify every effect against performance and accessibility.
14. [`e941e02`](https://github.com/otpayt02/koa-website/commit/e941e02f30ebac3e79e64938a3e3f02f100e053e) — **Add KarenAsciiArt component** (2026-08-23). Added an explicit S'gaw Karen Unicode ASCII-art component. Good: turned script characters into a designed visual material. Keep: use culturally meaningful glyph sets rather than arbitrary Latin noise.
15. [`40370cb`](https://github.com/otpayt02/koa-website/commit/40370cbc6bd70bc58ebed0b028f2c6c1d9ca065a) — **Living Alphabet cinematic pass** (2026-08-20). Added a glyph canvas engine, white wordmark opener, six-frame film, letterbox/grain/veil, interior chapter staging, Music and Coming Soon pages, and glyph probes. Good: the site gained a distinct identity system based on language, not generic particles. Keep: wordmark opener, chapter staging, grain/veil restraint, and verification probes.
16. [`20f31b7`](https://github.com/otpayt02/koa-website/commit/20f31b743eabff344f1527772e813c273a29cc58) — **The Loom pass** (2026-08-20). Added volumetric glyph depth, Karen diamond-loom formations per chapter, rack-focus dissolves, color-temperature grading, and humanized copy. Good: the weave metaphor became a real spatial system. Keep: diamond loom geometry, depth separation, chapter tint, and material continuity.
17. [`8f7a4c6`](https://github.com/otpayt02/koa-website/commit/8f7a4c6a440a629b5e254d969c794ce33f050b5c) — **The Arrival pass** (2026-08-21). Added halo-seal opening, hundreds of cursor-reactive glyphs, glyph-rain dispersal, KOA rise/stick/dissolve choreography, word-by-word paragraph assembly, six transition families, chapter numerals, warm navy/cream/gold/red grading, and an honest partner wall. Good: this is the richest single static choreography and the closest reference for the requested mini-glyph K/A formation. Keep: halo, cursor-reactive formation, dispersal/reassembly, numeral transitions, and mission-first copy.
18. [`7e1a292`](https://github.com/otpayt02/koa-website/commit/7e1a292c4e210ce607f88a4b9f2c9df2d90eb837) — **Cinematic React redesign** (2026-08-23). Added the seven-phase logo intro, glyph particle field, sunshine rays, loom weave, parallax text, premium header, `CinematicHome`, `KOALogoIntro`, `KarenGlyphField`, `LoomWeave`, `ParallaxTextReveal`, and `SunshineRays`. Good: consolidated the visual system into reusable React components. Keep: component boundaries and the seven-phase identity sequence.
19. [`07f5539`](https://github.com/otpayt02/koa-website/commit/07f5539d2f4a79dd371267d038185d69a6a34098) — **Complete cinematic KOA redesign — Deluxe bilingual experience** (2026-08-23). Added local Inter, Libre Caslon Display, and Noto Sans Myanmar assets and completed the deluxe bilingual runtime package. Good: local font delivery improves consistency and offline performance. Keep: local font assets, bilingual typography, and explicit truth-state copy.
20. [`89e78e2`](https://github.com/otpayt02/koa-website/commit/89e78e28091b8fb3a1abfc2c15cc7aecec0031e4) — **Add living corona cinematic phase 5** (2026-08-23). Added the living-corona phase, design note, contracts, and tests. Good: pushed the glyph field from static decoration toward a living, breathing chapter state. Keep: bounded phase-specific motion and contract tests.
21. [`5f6d942`](https://github.com/otpayt02/koa-website/commit/5f6d94204e9c71ff6bff0a1853658be2a73117bb) — **Add cultural cursor matrix and cinematic QA** (2026-08-24). Added the cultural cursor matrix, cinematic cookbook, and verification tooling. Good: interaction ideas became explicit, reviewable, and culturally scoped. Keep: matrix-driven interaction decisions and browser evidence.

### Canonical React stabilization and current direction

22. [`fa530ad`](https://github.com/otpayt02/koa-website/commit/fa530ad3fc3421451dbbf39944467dcf2cb10601) — **Make four-locale React routes canonical** (2026-08-24). Made localized React routes the canonical application surface. Good: one route system prevents static/React drift. Keep: React as production source; static HTML as a reference prototype.
23. [`a5d3ac3`](https://github.com/otpayt02/koa-website/commit/a5d3ac31d2a23c7a18aafd3ac42d120d6d3fcc0f) — **Add accessible UI motion foundation** (2026-08-24). Added Base UI and Motion dependencies. Good: interaction primitives gained accessibility and reduced-motion support. Keep: use Motion at component boundaries, not as a second canvas engine.
24. [`c827016`](https://github.com/otpayt02/koa-website/commit/c8270160dae0ca356f11491e8c1974eff680fdf8) — **Add verified cinematic partner rows** (2026-08-24). Added partner marquee data, layout, and tests. Good: the partner wall gained evidence-aware content rather than invented logos. Keep: verified partner records and opposing row motion.
25. [`2825249`](https://github.com/otpayt02/koa-website/commit/28252490bf1bf92acb9652a82e01a547642ee0c5) — **Keep cinematic glyph paths persistent** (2026-08-24). Added `LivingGlyphField`, glyph-motion utilities, persistent paths, and tests. Good: glyph motion gained continuity and a reusable motion model. Keep: persistent paths and deterministic target generation; this is the best base for the requested randomized replacement grid.
26. [`b1f9f47`](https://github.com/otpayt02/koa-website/commit/b1f9f47c8d421780ef3266f948008cc90e2ac101) — **Rotate only the supplied KOA seal lettering** (2026-08-24). Isolated seal-letter rotation in `SealAssembly` and added contracts. Good: corrected a visual ownership bug where the whole seal could rotate. Keep: rotate only authored lettering layers.
27. [`e99534e`](https://github.com/otpayt02/koa-website/commit/e99534e0aedc73141e318f438d4b1cc008815b03) — **Add AI and Music landing pages** (2026-08-25). Added truth-state AI/Music landing pages and a Music Director embed. Good: extended the visual system into useful program destinations while labeling claims. Keep: evidence labels and functional embeds.
28. [`2b33607`](https://github.com/otpayt02/koa-website/commit/2b33607a9c71c4d5cfe94a57bf21a06a8e3e81dc) — **Add cinematic cookbook and consolidate public storytelling CSS** (2026-08-25). Consolidated static storytelling CSS and documented reusable patterns. Good: reduced stylesheet fragmentation and preserved the design rationale. Keep: cookbook as the source of motion intent.
29. [`5113bc1`](https://github.com/otpayt02/koa-website/commit/5113bc176527b0a5ac85d115fee8ed7cbd025dd7) — **Recover impossible KOA runtime state** (2026-08-26). Repaired the one-command runtime state guard. Good: makes local demonstrations safer and repeatable. Keep: refuse unidentified processes rather than killing them.
30. [`bdf4ecb`](https://github.com/otpayt02/koa-website/commit/bdf4ecb44e801153463464397e5ed9b6922f2cfa) — **Specify KOA Living Loom Director's Cut** (2026-08-27). Recorded the current static prototype direction: seal dissolution followed by offscreen glyph-O convergence, dense subtle motion, foreground occlusion, chapter numeral flash, reading corridor, woven styling, and crowd-led imagery. Good: preserves creative intent before another static implementation pass. Keep: one seeded engine and explicit choreography.

### Separate `sons_of_kawthoolei/KOA/koa-sites` history

This nested repository has no configured GitHub remote in the local checkout, so these are local commit references rather than public commit URLs:

31. `cc7fb82` — **Add AI counterpart image library and staged reveals** (2026-08-02). Good: introduced a larger image library and staged reveal concept; keep the separation between conceptual AI imagery and documentary photography.
32. `fe1d2b3` — **Keep brochure photos in visible lazy reveal** (2026-08-03). Good: made brochure imagery visible without eager-loading everything; keep lazy reveal/loading discipline.
33. `e28e797` — **Create KOA V5 cinematic nonprofit experience** (2026-08-16). Good: the initial V5 chapter/landing system with a dedicated cinematic stage; keep its focused chapter model.
34. `c89ea20` — **Use Capitol advocacy photo on V5 landing** (2026-08-16). Good: put civic leadership imagery at the entry point; keep the immediate human/purpose signal.
35. `a684714` — **Add V5 language review surfaces and interaction polish** (2026-08-16). Good: added review-oriented language surfaces and polished interactions; keep explicit language review affordances.
36. `a97a95e` — **Use enhanced Capitol landing image in V5** (2026-08-16). Good: improved the first-frame image quality and crop; keep image-specific art direction instead of generic crop defaults.
37. `c76a0c9` — **Make V5 navigation destinations cinematic photo chapters** (2026-08-16). Good: navigation destinations became image-led chapters rather than plain pages; keep route continuity with visual memory.
38. `81d2d2a` — **Use supplied Karen script around V5 emblem** (2026-08-16). Good: used supplied script around the emblem, strengthening cultural specificity; keep authored script assets and review provenance.
39. `1c2ebcf` — **Use light yellow lettering for V5 emblem** (2026-08-16). Good: improved emblem contrast and premium warmth; keep light-yellow lettering as a restrained accent against navy.

### Commits intentionally collapsed

- `autosync: ...` commits: synchronization snapshots, not independent website versions.
- `acd7d43`, `0f67403`, and `ce74fd`: merge/alignment commits; their meaningful changes are represented by the feature commits above.
- `fc5d6cb`, `3836ac8`, and similar metadata corrections: important route/SEO maintenance, but not separate visual versions.

## Recommended “best version” composition from Git history

Use `8f7a4c6` for the mini-glyph K/A arrival behavior; `20f31b7` for loom/depth/material language; `7e1a292` and `07f5539` for the React component and local-font foundation; `2825249` for persistent glyph paths; `5f6d942` for interaction governance and QA; V5's local HTML for chapter/action discipline; and the current Phase 9/10 changes for adaptive performance and cursor-only randomized grid behavior. Do not merge every historical effect literally: preserve one renderer, one input sampler, bounded pools, foreground occlusion, and reduced-motion fallbacks.
