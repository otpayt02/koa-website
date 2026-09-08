# KOA glyph animation implementation prompt

Use this prompt when assigning a future agent to continue or rebuild the KOA cinematic hero.

```text
You are implementing the canonical React/Vinext cinematic hero for the Karen Organization of America website. Work in C:\Users\olive\Projects\koa-website. The active route is app/[lang]/page.tsx → components/CinematicLanding.tsx. Treat koa-sites-release/dist/koa.html as the physics and glyph-target reference, not as the runtime to extend.

The visual goal is a quiet, premium, dark KOA identity sequence. It is not a generic particle effect. The authentic supplied KOA seal is the only O and must preserve its ring lettering. Do not reconstruct the seal, do not add a second O, and do not add halo rings, arcs, outlines, guide paths, transparent text strokes, or solid K/A letters.

On load, center the supplied seal at roughly half the viewport height. It should feel weighty, crisp, and alone. Its annular lettering may rotate counter-clockwise with restrained motion. It then rises toward the upper portion of the same sticky viewport and shrinks smoothly to half its original scale. The K and A glyph fields rise in the same wrapper as the seal, so a glyph that has already reached its destination travels upward with the seal rather than being left behind.

Build K and A from S’gaw Karen glyphs only. Sample each letter from a private offscreen canvas mask using the koa-sites-release sampler geometry: Noto Sans Myanmar / Space Grotesk stack, K center at -0.32 target widths, A center at +0.32 target widths, letter target width of 0.28 of the combined target width, and a capped letter height. The mask is an internal target generator only. Never mount the sampled letters in SVG, DOM text, CSS outline, border, mask visible to users, or canvas guide lines.

The K and A must be visibly filled across their interiors, as if the font fill color were made of glyphs. Use a dense sampling grid and enough particles to cover the interior without turning the page into a heavy fog. On desktop use about 760 particles, medium widths about 510, and narrow mobile about 280. Cap device-pixel ratio at 1.5. Pause the animation when the canvas is offscreen or the tab is hidden. Preserve a fully readable reduced-motion state.

Every formation must be a new generation. On each fresh mount/resize, create one random generation seed. Shuffle the sampled final targets, randomize each particle’s S’gaw glyph, depth, size, color warmth, start direction, start time, deadline, curve side, and ease. No two generations should look the same. Do not use uncontrolled randomness in the render loop; generate the particle plan once, store it, and render from it.

The arrivals must not occur all at once. Each particle starts from a different direction outside or around the seal, has a staggered start in the formation window, follows a light curved path, and has an individual mandatory deadline. The full K and A must finish at the same global end point even though particles arrive at different times. Use transforms in canvas coordinates and opacity only. Avoid per-frame layout reads, DOM particle nodes, and scroll hijacking.

Use this normalized scroll choreography:
- 0.00–0.06: the large centered seal arrives; glyphs remain quiet.
- 0.06–0.50: staggered glyph formation. Particles begin at varied times and must all reach their target by 0.50.
- 0.16–0.59: overlap the formation with a shared rise. The seal and all arrived glyphs rise together and the seal scales down by half.
- 0.50–0.78: prolonged dramatic hold. The K, seal, and A remain fully formed in the viewport. Allow only a small breathing motion in glyphs and the restrained annular rotation.
- 0.78–0.88: show the full “Karen Organization of America” title below the mark with a slow fade-and-deblur. Reveal the real KOA mission/charter lines from the bottom after the title begins.
- 0.81–0.88: below the title, rotate the left word through Uniting, Providing, Inviting, Defining, Aligning, Deciding, Refining, Exciting, Rewriting, Applying, Supplying, and Combining. Keep “a voice” constantly visible at the right.
- 0.88–0.98: all glyphs begin a simultaneous scatter. They may move outward with individualized curved trajectories and fading, but must stay within the viewport during the scene transition. The seal fades last.
- 0.98–1.00: release into the page’s editorial content.

Keep the scroll native. Do not intercept wheel, touch, keyboard, trackpad, or scrollbar input. You may add a soft, cancellable endpoint attraction after 180 ms of no input: if progress is within 2.2% of 0.05, 0.50, 0.78, or 0.88, smoothly settle at that mark. Immediately cancel when wheel, touch, or pointer input returns. This is a gentle scrub assist, never scroll hijacking.

Typography uses Cormorant Garamond for display and Space Grotesk for body/utility content. Keep all controls rectangular rather than pill-shaped. Preserve the existing responsive header, footer, irregular service-card mosaic, and authentic content. The deleted asset public/koa/assets/story-community-original.png must never return.

When complete, update docs/KOA-CINEMATIC-CHOREOGRAPHY.md with every timing change. Verify start, mid-formation, completion, long hold, title reveal, word cycle, scatter, reverse scroll, refresh-at-position, desktop, mobile, and reduced-motion states. Run the focused cinematic tests plus npm.cmd run build; report unrelated baseline failures separately rather than masking them.
```
