Objective: Replicate the exact visual fidelity, motion physics, and rendering performance of the glyph system found in koa.html (local build) into the main Next.js application (components/KarenGlyphField.tsx).
Reference Asset: file:///C:/Users/olive/Projects/koa-website/koa-sites-release/dist/koa.html#/ Target Quality: "Non-laggy," fluid 60fps, ethereal "dust-mote" aesthetic with precise cursor interaction.
- Character Set: Strictly S'gaw Karen Unicode (U+A9E0–U+A9FF) + Latin K, O, A.
- Appearance:
  - Opacity: Extremely low base opacity (0.05–0.15). They should feel like atmospheric noise, not solid text.
  - Size: Variable micro-sizes (8px–14px). No two glyphs exactly alike.
  - Color: Monochromatic gold/red tint matching the theme (#F59E0B at 10% opacity, #DC2626 at 5% opacity).
  - Blur: Slight CSS blur(0.5px) to soften edges and prevent aliasing.
- Idle State: Brownian motion with Perlin noise drift. Do not use linear movement.
  - Velocity: Ultra-slow (0.2px/frame avg).
  - Drift: Gentle sine-wave oscillation on X and Y axes.
- Cursor Interaction (The "Reveal"):
  - Mechanism: When cursor hovers within 150px, glyphs within radius do not flee violently. Instead, they gently swirl around the cursor path (fluid dynamics) and increase opacity slightly (0.1 → 0.4) to "reveal" themselves.
  - Dither Effect: Implement a threshold mask where glyphs only render if the underlying canvas brightness is below a certain value, creating a "hidden until hovered" texture.
- Lifecycle:
  - Spawn: Fade in over 2s.
  - Life: Float for 20–40s.
  - Death: Fade out over 3s.
  - Constraint: Never have hard "pops." All entry/exit must be seamless alpha transitions.
- Trigger: On scroll section change (e.g., Home → About).
- Behavior:
  1. Particles slowly lose their random drift.
  2. They migrate to form a large, faint Burmese/Karen numeral (၁, ၂, ၃, ၄) centered in the viewport.
  3. Density Control: The formed symbol must remain transparent. Do not pack glyphs tightly. Use a sparse distribution (approx. 30% fill) so the background shows through.
  4. Breathing: Once formed, the entire symbol should "breathe" (scale 1.0 → 1.02 → 1.0) via global coordinate modulation, not individual particle movement.
  5. Dispersion: On next scroll, particles drift away from anchor points, slowing down as they move further out (ease-out-quint).
- Rendering Engine: Use HTML5 <canvas> with requestAnimationFrame. Do not use DOM nodes (divs) for particles; it causes lag with >200 elements.
- Performance:
  - Target: Stable 60fps on mid-range laptops.
  - Optimization: Use an off-screen canvas for static background layers if needed.
  - Throttling: Reduce particle count automatically if devicePixelRatio > 2 on mobile.
- Integration:
  - Component: components/KarenGlyphField.tsx
  - Hook: useNormalizedScroll (ensure animation speed is independent of OS scroll settings).
  - Z-Index: Must sit at z-index: 0 (background). Foreground content (z-index: 10+) must strictly occlude glyphs.
- ❌ NO solid blocks of text. The symbol must look like a constellation, not a stamp.
- ❌ NO linear, robotic movement. Everything must have noise/easing.
- ❌ NO high contrast. Glyphs are subtle atmosphere, not primary content.
- ❌ NO lag. If frame rate drops, reduce particle count immediately.
1. Open localhost:3000. Scroll slowly.
2. Verify glyphs form the correct Burmese numeral for the section.
3. Hover mouse over background: Verify gentle swirl and opacity bump (no violent scattering).
4. Check Task Manager: CPU usage < 15% during idle scroll.
5. Compare side-by-side with koa.html reference. The "feel" must be identical.