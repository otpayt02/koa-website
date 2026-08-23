# Performance and Accessibility

## Performance

- Read layout once per animation frame, then write CSS custom properties.
- Animate opacity, transform, filter, and masks; avoid changing layout properties during scroll.
- Use responsive image dimensions, compressed modern formats where practical, and deliberate focal positions.
- Preload only the first critical image. Lazy-load noncritical content below the scroll film.
- Clamp blur and large shadow radii on mobile GPUs.
- Avoid multiple full-screen WebGL canvases and continuous pointer loops.
- Pause nonessential animation when the document is hidden.

## Accessibility

- Provide a reduced-motion document flow that reveals every scene as readable sections.
- Keep real buttons and links for every interactive destination.
- Use visible focus outlines; a glow or glimmer alone is not enough.
- Ensure motion controls expose `aria-pressed` and clear text.
- Give chapter controls meaningful labels and keyboard activation.
- Do not hide essential text only inside animation frames.
- Use useful photo alternative text that describes the pictured community activity.
- Avoid flashing, rapid luminance changes, and motion that implies a false spatial direction.

## Mobile checks

- Test `320×568`, `390×844`, and a tall Android viewport.
- Check browser chrome changes with `svh` units.
- Keep touch targets at least `42px`.
- Ensure the sticky stage releases normally into page content.
- Confirm large headings do not cover faces or critical image details.
- Verify that one-finger vertical scrolling always remains available.
