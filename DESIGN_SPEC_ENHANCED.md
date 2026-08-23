# KOA Enhanced Cinematic Website - Design Specification

## Vision Statement
Transform the existing KOA bilingual site into an award-winning, over-the-top cinematic experience that feels alive, exclusive, and deeply rooted in Karen culture. Every pixel should feel intentional, every interaction delightful, every scroll revealing new layers of meaning.

---

## Core Design Principles

1. **Living Background** - The Karen glyph particle system is the soul of the site, always present, never static
2. **Cinematic Choreography** - Scroll drives everything; speed correlates to visual intensity
3. **Cultural Authenticity** - Loom weaving patterns, Karen script, Burmese numerals as design elements
4. **Premium Exclusivity** - Feels like a limited-edition experience, not a template
5. **Balanced Information** - 50% immersive storytelling, 50% functional content
6. **Respectful Motion** - Reduced motion is a first-class citizen, not an afterthought

---

## Color System: "Midnight Loom"

### Primary Palette
```css
:root {
  /* Dark Hermes Blue + Navy fusion */
  --midnight: #040818;           /* Deepest background */
  --midnight-elevated: #0a1226;  /* Cards, panels */
  --navy-900: #08142e;           /* Primary surface */
  --navy-800: #0e1e42;           /* Elevated surface */
  --navy-700: #142a5a;           /* Borders, subtle elements */
  
  /* Red accent (dominant) */
  --carmine: #c41e3a;            /* Primary red */
  --carmine-glow: #e8435a;       /* Hover, active */
  --carmine-dark: #8b1528;       /* Pressed, depth */
  
  /* Gold accent (subtle, precious) */
  --antique-gold: #c9a227;       /* Primary gold */
  --antique-gold-soft: #e8c85a;  /* Highlights */
  --antique-gold-muted: #9d7d1e; /* Subtle touches */
  
  /* Neutral/Content */
  --cream: #faf6ed;              /* Primary text on dark */
  --cream-soft: #e8e0d0;         /* Secondary text */
  --cream-muted: #b8b0a0;        /* Muted, captions */
  --pearl: #f5f0e8;              /* Light mode base */
  
  /* Functional */
  --focus-ring: #e8c85a;
  --error: #e8435a;
  --success: #2ec4b6;
}
```

### Theme Variants
- **Cinematic Navy** (default): Midnight palette above
- **Bilingual Cream**: Inverted for reading comfort
- **High Contrast**: WCAG AAA compliant variant

---

## Typography System

### English (Latin)
- **Display Serif**: `Libre Caslon Display` — editorial, elegant, high contrast
- **UI Sans**: `DM Sans` — clean, geometric, excellent at small sizes
- **Monospace**: `JetBrains Mono` — code, technical data

### Karen (S'gaw)
- **Display Serif**: `Noto Serif Myanmar` — traditional feel, good Karen support
- **UI Sans**: `Noto Sans Myanmar` — readable, modern
- **Fallback**: System Myanmar fonts

### Scale (Fluid, Clamped)
```css
--step--2: clamp(0.62rem, 0.58rem + 0.2vw, 0.75rem);   /* Eyebrow, labels */
--step--1: clamp(0.87rem, 0.8rem + 0.35vw, 1.1rem);    /* Body small */
--step-0: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);        /* Body base */
--step-1: clamp(1.25rem, 1.1rem + 0.75vw, 1.6rem);     /* Lead */
--step-2: clamp(1.75rem, 1.4rem + 1.75vw, 2.5rem);     /* H3 */
--step-3: clamp(2.5rem, 1.8rem + 3.5vw, 4.5rem);       /* H2 */
--step-4: clamp(3.5rem, 2.2rem + 6.5vw, 7.5rem);       /* H1 Hero */
--step-5: clamp(5rem, 3rem + 10vw, 12rem);             /* Display/Logo */
```

### Bilingual Pairing Rules
- English and Karen always share visual weight
- Karen gets 10-15% more leading (script complexity)
- Never stack same-script lines without visual separation
- Language switch = theme switch (instant, no reflow)

---

## The Karen Glyph Particle System ("The Loom")

### Concept
The entire page background is a living field of Karen script glyphs (consonants, vowels, tones, numbers). They behave like threads on a loom — dispersing, reassembling, forming words, dissolving.

### Behavior Specification

#### Idle State (Dispersed)
- **Density**: ~200-400 glyphs across viewport (responsive)
- **Size**: 8-24px (random, weighted toward smaller)
- **Opacity**: 0.02-0.08 (subtle, atmospheric)
- **Motion**: Brownian drift + gentle Perlin flow
- **Direction changes**: Every 3-8 seconds, smooth lerp
- **Z-index**: 0 (behind everything)

#### Formation State (Assembling)
- **Trigger**: Scroll position, section entry, user interaction
- **Target**: Specific glyphs form words/phrases (KOA, chapter titles, key concepts)
- **Animation**: 
  - Glyphs accelerate toward target positions
  - Ease-out elastic (spring physics)
  - Staggered by distance (near first, far last)
  - Duration: 800-1500ms based on distance
- **Result**: Legible text holds for dwell time (3-5s)

#### Dispersion State (Breaking)
- **Trigger**: Scroll away, section exit, new formation
- **Animation**:
  - Explode outward in random directions
  - Add rotation, scale variation
  - Fade to idle opacity
  - Duration: 600-1000ms
- **Cleanup**: Return to idle pool

#### Foreground Occlusion
- **Rule**: NO glyphs visible behind any foreground element
- **Implementation**: 
  - Canvas clipped by DOM element bounds (via IntersectionObserver)
  - Or: WebGL depth buffer with DOM mesh
  - Or: Multiple canvas layers (background, mid, foreground)

#### Chapter Number Display
- **Non-image transition scenes**: Full chapter number in Burmese script
- **Flash**: Intermittent flash to Arabic numeral (100-200ms every 2-3s)
- **Timing**: Randomized interval, not metronomic
- **Style**: Large, centered, same glyph material as particles

---

## KOA Logo Intro Sequence ("The Beacon")

### Phase 1: The Spark (0-1.5s)
- Viewport: Dark midnight
- Single point of light emerges from bottom center
- Subtle sunshine rays (barely visible, volumetric)
- Sound: Low harmonic hum (optional, opt-in)

### Phase 2: Statue of Liberty Emerges (1.5-3.5s)
- Silhouette of Statue of Liberty rises from light
- Backlit by growing halo
- Karen glyphs begin streaming from torch
- Glyphs: Individual characters, trailing like embers

### Phase 3: KOA Letters Form (3.5-5.5s)
- Glyphs swarm and assemble into "K" "O" "A"
- Letters are MADE of glyphs (not solid)
- Logo scales up dramatically
- Navy background fades IN behind

### Phase 4: The Reveal (5.5-7.5s)
- Logo continues growing
- "O" remains solid longest
- Then "O" dissolves into glyphs
- K and A stay as glyph-formations
- Letters settle on horizontal axis, level
- Logo mark fades away completely

### Phase 5: The O Forms (7.5-9s)
- Glyphs from off-screen (left, right, top, bottom)
- Converge to form "O" at center
- Fade in together, not sequential
- Settle into final hero lockup

### Phase 6: Idle Breathing (9s+)
- Subtle sunshine ray rotation (scroll-correlated)
- Glyphs in K/A/O gently breathe
- Ready for scroll

---

## Scroll-Driven Cinematic Film

### Structure: 5 Chapters, 2400 Frames

| Chapter | Progress Range | Theme | Visual |
|---------|---------------|-------|--------|
| 01 | 0.00 - 0.20 | National Home | Logo/Seal orbit, glyph formation |
| 02 | 0.20 - 0.42 | Civic Voice | Capitol photo, advocacy |
| 03 | 0.42 - 0.65 | Living Language | Dictionary, community |
| 04 | 0.65 - 0.82 | Culture & Care | Events, humanitarian |
| 05 | 0.82 - 1.00 | Future/Action | CTA, connect |

### Scroll Physics
- **Opening hold**: First 5% = logo scene only
- **Momentum spring**: 115ms response, 0.85 damping
- **Chapter magnets**: Snap on `scrollend` within 7%
- **Progress easing**: Smoothstep for beat reveals

### Sunshine Ray Correlation
```javascript
// Ray intensity = f(scrollVelocity, scrollProgress)
const rayOpacity = clamp(0.02 + velocity * 0.5 + progress * 0.08, 0.02, 0.15);
const rayRotation = progress * 360deg + velocity * 20deg;
// Rays: 3-5 volumetric beams, barely visible, gold-tinted
```

### Parallax Text System ("Lazy Loading Words")
- Words/phrases enter from bottom, travel up slowly
- Top/bottom 15% of viewport = fade zones (never fully opaque at edge)
- Scroll speed ≠ text speed (exaggerated parallax)
- Text "slides in, travels slowly, slides out"
- Dwell time at center: 2-3 seconds
- Multiple text layers at different depths

---

## Loom Weave Background Texture

### Diamond Pattern (Handwoven Feel)
- **Base**: Subtle diamond grid (traditional Karen loom pattern)
- **Scale**: ~40px diamonds, rotated 45°
- **Stroke**: 0.5px, --navy-700 at 0.1 opacity
- **Variation**: Random width/opacity per diamond (±20%)
- **Animation**: Extremely slow breath (60s cycle)
- **Layer**: Between particle system and content (z-index: 1)

### Implementation
- SVG pattern or Canvas procedural
- CSS `background-image` with `background-attachment: fixed`
- Respects reduced motion (static when disabled)

---

## Premium Banner / Header

### ChatGPT Site Style Tabs
- **Desktop**: Horizontal pill tabs, glass morphism
- **Active**: Gold underline + subtle glow
- **Hover**: Background wash, scale 1.02
- **Mobile**: Drawer with same styling
- **Tabs**: Home, About, Programs, Stories, Dictionary, Grammar, Community, Connect

### Header Spec
- **Height**: 84px desktop, 70px mobile
- **Background**: `linear-gradient(180deg, rgba(4,8,24,.98), rgba(4,8,24,.7))`
- **Backdrop**: `blur(24px) saturate(1.2)`
- **Border**: Bottom 1px `rgba(184,176,160,.12)`
- **Scrolled state**: Darker, shadow `0 20px 60px rgba(0,0,0,.4)`
- **Logo**: KOA mark + wordmark, hover → gold glow
- **Language toggle**: Pill, bilingual label "EN · ကညီ"

---

## Image Enhancement System

### Crowd with Karen Flags (Hero Image)
- **Source**: `fb-community-group-mobile-enhanced.png`
- **Treatment**:
  - AI upscale 2x (preserve faces)
  - Color grade: Warm gold highlights, deep navy shadows
  - Flag enhancement: Saturation boost on red/blue/white
  - Depth map: Foreground people separated
  - Parallax layers: 3-4 depth planes
  - Subtle Ken Burns on scroll (scale 1.0 → 1.08)

### All Images
- **Aspect**: Portrait-first (mobile native)
- **Object-fit**: Cover with focal point (`--position`)
- **Loading**: `fetchpriority="high"` for hero, `decoding="async"` rest
- **Formats**: WebP/AVIF with JPEG fallback
- **Blur placeholder**: 20px blur, dominant color

---

## Micro-Interactions & Ambient Effects

### 1. Cursor Aurora
- Subtle radial gradient follows cursor
- Tinted gold/red based on section
- Mix-blend-mode: screen
- Disabled on touch

### 2. Scroll Progress Constellation
- Chapter dots connected by hairline
- Active chapter pulses
- Completed chapters stay lit (gold)

### 3. Text Reveal Choreography
- `[data-beat]` elements stagger (80ms)
- Type: blur→sharp, clip-path, translate+fade
- Respects reduced motion

### 4. Card Hover Theater
- Contact cards: Sweep shine (gold→red→gold)
- Link cards: Invert + arrow launch
- Feature cards: Lift + glow shadow

### 5. Audio Texture (Opt-in)
- Ambient: Very quiet loom shuttle sound
- Interaction: Soft chimes on glyph formation
- Master toggle in header

### 6. Loading Sequence
- Frame counter 0000→2400
- Glyphs assemble "KOA" during load
- Seamless handoff to intro sequence

---

## Responsive Breakpoints

| Breakpoint | Width | Adjustments |
|------------|-------|-------------|
| Mobile | < 620px | Single column, stacked film, touch targets |
| Tablet | 620-860px | 2-col grids, condensed header |
| Desktop | 860-1180px | Full layout |
| Wide | > 1180px | Max-width containers, expanded film |

---

## Performance Budget

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| CLS | < 0.05 |
| TBT | < 150ms |
| JS Bundle | < 150KB gzipped |
| CSS | < 50KB gzipped |
| Images | WebP/AVIF, responsive |
| Fonts | Preload critical, subset |

---

## Accessibility Checklist

- [ ] `prefers-reduced-motion` disables ALL animation
- [ ] Manual motion toggle persists (localStorage)
- [ ] Semantic HTML5 landmarks
- [ ] ARIA labels on all interactive elements
- [ ] Focus visible states (gold ring)
- [ ] Skip link (first tab)
- [ ] Language attributes on all text
- [ ] Contrast ratios WCAG AA (AAA for text)
- [ ] Keyboard navigation for all features
- [ ] Screen reader tested (NVDA, VoiceOver)
- [ ] No seizure triggers (flash < 3Hz)

---

## Technical Architecture

### Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: CSS Custom Properties + CSS Modules
- **Animation**: Native CSS + Web Animations API + Canvas/WebGL
- **Scroll**: Lenis (smooth scroll) + Custom engine
- **3D/Particles**: Three.js (instanced meshes) or Canvas 2D
- **Fonts**: Self-hosted WOFF2, preload critical

### File Structure (New/Modified)
```
app/
├── globals.css              # Complete token + component system
├── layout.tsx               # Providers, font loading, theme
├── page.tsx                 # Redirect to locale
├── [lang]/
│   ├── layout.tsx           # Header, footer, providers
│   ├── page.tsx             # Cinematic home
│   └── ...other pages
components/
├── CinematicHome.tsx        # Enhanced film component
├── KarenGlyphField.tsx      # Particle system (Canvas/WebGL)
├── KOALogoIntro.tsx         # Intro sequence orchestrator
├── ChapterDisplay.tsx       # Burmese↔Arabic flasher
├── LoomWeave.tsx            # Diamond pattern background
├── SunshineRays.tsx         # Volumetric rays
├── ParallaxText.tsx         # Lazy-loading word system
├── PremiumHeader.tsx        # ChatGPT-style tabs
├── EnhancedImage.tsx        # Multi-layer parallax images
├── GlyphFormation.tsx       # Text formation from particles
└── MotionToggle.tsx         # Global motion control
lib/
├── glyph-data.ts            # Karen character dataset
├── scroll-engine.ts         # Enhanced cinematic engine
├── particle-physics.ts      # Spring/Brownian simulation
└── theme.ts                 # Theme management
public/
├── fonts/
│   ├── libre-caslon-display.woff2
│   ├── dm-sans.woff2
│   ├── noto-serif-myanmar.woff2
│   └── noto-sans-myanmar.woff2
└── koa/assets/              # Existing + new enhanced images
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Token system overhaul
- [ ] Loom weave background
- [ ] Karen glyph particle system (idle state)
- [ ] Premium header with tabs
- [ ] Color system implementation

### Phase 2: Cinematic Core (Week 2)
- [ ] KOA Logo Intro sequence
- [ ] Enhanced scroll film engine
- [ ] Chapter display with Burmese flash
- [ ] Sunshine rays + scroll correlation
- [ ] Parallax text system

### Phase 3: Content & Polish (Week 3)
- [ ] Image enhancement pipeline
- [ ] Bilingual typography system
- [ ] Micro-interactions suite
- [ ] Motion toggle + reduced motion
- [ ] Performance optimization

### Phase 4: Integration & QA (Week 4)
- [ ] Cross-browser testing
- [ ] Accessibility audit
- [ ] Performance profiling
- [ ] Content review with community
- [ ] Deploy to staging

---

## Success Criteria

1. **Emotional**: "I've never seen a website feel this alive and cultural"
2. **Technical**: Lighthouse > 90 across all categories
3. **Cultural**: Karen community members recognize and feel pride
4. **Functional**: All existing features work, navigation intuitive
5. **Exclusive**: Feels like a bespoke digital artifact, not a template

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Particle performance on mobile | Canvas 2D fallback, reduce count, `will-change` |
| Font loading flash | Preload, `font-display: swap`, fallback stack |
| Reduced motion gaps | Test early, design static states first |
| Complexity overwhelm | Modular components, clear boundaries |
| Cultural misrepresentation | Community review at each phase |

---

*This specification is a living document. Update as discoveries emerge during implementation.*