# Motion Pattern Catalog

## Scroll structure

### Pinned chapter film

Use a tall scroll container with a sticky viewport-height stage. Divide normalized progress into equal or editorially weighted spans. Treat every scene as a complete composition, not a slide floating in a window.

### Precise scrub with magnetic completion

Let scroll position control every frame directly. After `scrollend`, find the nearest completed-scene target. Snap only when the visitor is close enough; otherwise leave the exact scrubbed position untouched.

### Lazy finish easing

Use a long-tail ease such as `1 - (1 - t)^2.3` for marks, text, and camera movement that should approach their destination slowly. This creates a finessed finish without overshoot.

## Scene transitions

### Soft swallow

Blend the outgoing and incoming scenes with overlapping opacity, a small scale difference, and temporary blur. Do not use a visible circular crop. A radial or linear wash can briefly cover both scenes.

### Gradient wipe

Move a broad, feathered gradient across the full stage. Keep the transparent edge wide enough that it reads as changing light rather than a panel.

### Masked glass reveal

Reveal a translucent text field with a `mask-image` that fades to transparency. Combine with `backdrop-filter`, a low-opacity navy gradient, and no border.

### Image drift

Move full-bleed imagery by only a few percent while scaling from about `1.16` to `1.04`. Use one direction per scene and avoid oscillation.

### Text beat sequence

Stagger kicker, heading, description, and action. Use opacity plus modest vertical translation; avoid random origins or letter-by-letter noise when the copy is informational.

### Light-source handoff

Let a meaningful light source expand into the next image’s transition wash. For example, a torch flare can brighten, bloom across the stage, and then resolve into the highlights of the next photograph.

## Identity motion

### Upright seal with rotating atmosphere

Keep the logo fixed in orientation. Rotate an oversized, blurred conic gradient behind it. Brighten the gradient with scroll progress and move the seal slightly upward with long-tail easing.

### Glass occlusion

As the first headline appears, increase the opacity and blur of a borderless glass field while reducing the underlying logo opacity. Preserve enough logo visibility to maintain continuity, then let the next scene take over.

## Interaction patterns

### Single-pass glimmer

Place a skewed translucent highlight outside the left edge of an interactive element. On hover or focus, animate it once past the right edge, then return on pointer exit.

### Magnetic pointer emphasis

For large controls, translate the inner label a few pixels toward the pointer while the outer control remains stable. Disable on touch and reduced motion.

### Direction-aware media reveal

On navigation-card hover, reveal the associated media from the edge nearest the pointer. Keep the destination label visible so the interaction never becomes a guessing game.

### Tab sweep

When switching tabs, move a soft red-to-gold highlight across the selected row, then crossfade the panel. Maintain ARIA selection, arrow-key behavior, and focus order.

## Advanced options

- velocity-sensitive blur that clamps to a low maximum;
- spring-based cursor followers isolated from document layout;
- WebGL displacement for a single flagship transition, with static fallback;
- canvas image sequences for art-directed scenes, lazily decoded and memory capped;
- View Transitions API for same-origin page changes, with progressive enhancement;
- CSS scroll-driven animations where supported, paired with JavaScript fallback;
- inertial horizontal galleries nested only where they do not steal vertical scrolling;
- audio-reactive or haptic cues only when explicitly requested and user controlled.

Use advanced options sparingly. One technically difficult effect executed cleanly is better than several competing effects.
