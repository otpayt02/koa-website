# KOA Cinematic Website — Cookbook Specification

> **Non-negotiables:** Every animation, transition, and interaction is documented here. This is the single source of truth for the final product. Parameters are tweakable; principles are fixed.

---

## 0. DESIGN PRINCIPLES (Non-Negotiable)

| Principle | Description |
|-----------|-------------|
| **One Message Per Viewport** | Never combine different information types in one viewport. One cinematic presentation = one message. |
| **Anti-Crowding** | Generous spacing. Elements breathe. Minimum 40vh between major content blocks. |
| **Silky Smooth** | 60fps target. No jank. `will-change` used sparingly. GPU-accelerated transforms only. |
| **Eupohoria via Pacing** | Slow, deliberate reveals. Delayed scrolling that slows animation before next section. |
| **Respect Reduced Motion** | `prefers-reduced-motion` honored everywhere. Instant state, no animation. |
| **Foreground Occlusion** | Background glyph matrix NEVER renders over foreground content. |
| **Burmese Numerals as Atmosphere** | Chapter numbers = full-screen glyph fields, transparent/faded, breathing, never solid. |
| **Bilingual First** | English + S'gaw Karen (ကညီ) everywhere. `lang` attributes correct. |

---

## 1. COLOR SYSTEM

```css
:root {
  /* Hermes Blue Family (Primary Background) */
  --hermes-950: #05080E;   /* Deepest - hero bg */
  --hermes-900: #070C15;
  --hermes-800: #0A1220;
  --hermes-700: #0F1A2E;
  --hermes-600: #14233A;

  /* Navy Mix (Secondary Background) */
  --navy-950: #030610;
  --navy-900: #050A18;
  --navy-800: #081226;

  /* Red Accents (More Red Than Gold) */
  --red-600: #D84A4D;      /* Primary red - CTAs, highlights */
  --red-500: #E06265;      /* Hover states */
  --red-400: #E87A7C;      /* Subtle glows */
  --red-300: #F0A0A2;      /* Very subtle */
  --red-glow: rgba(216, 74, 77, 0.4);

  /* Gold Accents (Subtle, Premium) */
  --gold-500: #D4A843;     /* Primary gold - secondary CTAs */
  --gold-400: #DDB85C;
  --gold-300: #E6C87A;     /* Halo rays, subtle highlights */
  --gold-200: #EED898;     /* Very subtle */
  --gold-glow: rgba(212, 168, 67, 0.3);

  /* Typography */
  --text-primary: #F5F0E8;     /* Warm off-white */
  --text-secondary: #C8BFA0;   /* Muted */
  --text-muted: #8A826B;       /* Captions, meta */
  --text-faint: #5A5444;       /* Barely visible */

  /* Surfaces */
  --surface-1: rgba(10, 18, 32, 0.85);   /* Cards, panels */
  --surface-2: rgba(7, 12, 21, 0.92);    /* Modals, dropdowns */
  --surface-glass: rgba(255, 255, 255, 0.03);
  --border-subtle: rgba(212, 168, 67, 0.08);

  /* Shadows */
  --shadow-soft: 0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-glow-red: 0 0 40px rgba(216, 74, 77, 0.15);
  --shadow-glow-gold: 0 0 40px rgba(212, 168, 67, 0.12);

  /* Transitions */
  --ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 200ms;
  --duration-med: 500ms;
  --duration-slow: 1000ms;
  --duration-cinematic: 2000ms;
}
```

---

## 2. TYPOGRAPHY SYSTEM

```css
:root {
  /* Display: ChatGPT.site style - elegant serif */
  --font-display: "Cormorant Garamond", "Noto Serif", Georgia, serif;
  --font-display-weight: 400;
  --font-display-weight-medium: 500;
  --font-display-weight-bold: 600;

  /* Body: Clean, readable */
  --font-body: "Space Grotesk", "Inter", system-ui, sans-serif;
  --font-body-weight: 400;
  --font-body-weight-medium: 500;

  /* S'gaw Karen Script */
  --font-karen: "Noto Sans Myanmar", "Padauk", "Myanmar Text", sans-serif;

  /* Monospace: Frame counter, data */
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* Fluid Scale */
  --fs-hero: clamp(4rem, 12vw, 14rem);       /* KOA hero */
  --fs-title: clamp(2.5rem, 6vw, 5rem);      /* Chapter titles */
  --fs-subtitle: clamp(1.25rem, 2.5vw, 2rem);
  --fs-body: clamp(1rem, 1.5vw, 1.125rem);
  --fs-caption: clamp(0.75rem, 1vw, 0.875rem);
  --fs-micro: clamp(0.625rem, 0.8vw, 0.75rem); /* Frame counter */

  /* Line Heights */
  --lh-tight: 1.05;
  --lh-normal: 1.5;
  --lh-relaxed: 1.75;
}
```

---

## 3. HERO / LANDING ANIMATION (Phase 1)

### 3.1 Overview
The hero is a **single continuous cinematic sequence** from load → scroll → settle.

### 3.2 States & Timing

| Phase | Scroll Range | Duration | Description |
|-------|--------------|----------|-------------|
| **Load** | 0% | 0-2000ms | KOA seal large (80vh), halo rays subtle gold/red, "KAREN ORGANIZATION OF AMERICA" text wrapped clockwise around logo |
| **Revolve Start** | 0-15% | 2000-4000ms | Text begins slow clockwise revolution around logo (0.5°/frame → 2°/frame) |
| **Shrink & Rise** | 15-45% | 4000-8000ms | Logo scales down (1→0.4), rises to top 40% of viewport, text revolution continues |
| **K/A Formation** | 45-75% | 8000-12000ms | Glyphs from revolving text converge to form large K (left) and A (right) at same vertical center as logo O |
| **Logo Settle** | 75-90% | 12000-14000ms | Logo O reaches final size, aligns horizontally with K/A centers. All three lock. |
| **Text Reveal** | 90-100% | 14000-16000ms | "Karen Organization of America" fades in L→R, T→B blur-in. Caption placeholder appears bottom half. |
| **Scroll Cue** | 100% | 16000ms+ | Down arrow bobs + glows, inviting scroll. |

### 3.3 Parameters (Tweakable)

```js
const HERO_CONFIG = {
  // Logo
  logo: {
    initialScale: 1.0,      // 80vh
    finalScale: 0.35,       // Top half
    initialY: 0.5,          // Center viewport
    finalY: 0.25,           // Top 25%
    revolveStartDelay: 2000, // ms after load
    revolveSpeed: {
      initial: 0.008,       // rad/frame
      max: 0.035,
      acceleration: 0.00002
    }
  },

  // Glyph convergence for K/A
  glyphConvergence: {
    startScroll: 0.45,      // 45% through hero
    endScroll: 0.75,
    particleCount: 120,     // Per letter - NOT saturated
    targetOpacity: 0.35,    // Transparent/faded, not solid
    breatheAmplitude: 0.08, // Subtle breathing
    breathePeriod: 4000,    // ms
    dispersionThreshold: 1.5, // Distance from anchor where slowdown starts
    slowdownFactor: 0.3     // Velocity multiplier beyond threshold
  },

  // Text reveal
  textReveal: {
    delayAfterLock: 800,    // ms after K/O/A lock
    direction: "ltr-ttb",   // Left-to-right, top-to-bottom
    blurStart: 20,          // px blur
    blurEnd: 0,
    staggerMs: 30,          // Per character
    fadeDuration: 1200
  },

  // Scroll cue
  scrollCue: {
    appearDelay: 500,
    bobAmplitude: 8,        // px
    bobPeriod: 1200,        // ms
    glowIntensity: 0.6,
    glowPeriod: 2000
  },

  // Halo rays
  halo: {
    rayCount: 24,
    innerRadius: 1.1,       // x logo radius
    outerRadius: 2.8,
    rotationSpeed: 0.0003,  // rad/ms (scroll-correlated)
    colorStops: [
      { offset: 0, color: "rgba(212,168,67,0.15)" },   // Gold
      { offset: 0.5, color: "rgba(216,74,77,0.08)" },  // Red
      { offset: 1, color: "rgba(212,168,67,0)" }
    ],
    blur: 60               // px - soft, not solid
  }
};
```

### 3.4 Revolving Text Behavior

```
Text: "K A R E N   O R G A N I Z A T I O N   O F   A M E R I C A"
       ↑                                              ↑
    Starts at 12 o'clock                         Wraps clockwise

- Each character positioned on ellipse around logo
- Initial: stationary
- On scroll: begins slow clockwise revolution
- Speed increases with scroll progress
- Characters maintain tight wrapping (kerning follows curve)
- At K/A formation phase: characters detach and become glyphs for K/A
- Logo O remains as-is (the seal's center O)
```

---

## 4. BACKGROUND GLYPH MATRIX (Phase 2)

### 4.1 Concept
A full-screen field of S'gaw Karen glyphs + K/O/A that:
- **Constantly drifts** like dust (slow, subtle)
- **Reveals on hover**: Only a small circular area (~150px radius) around cursor fades in
- **Fades out** on leave (800ms ease-out)
- **Occluded by foreground**: NEVER renders over content with `[data-glyph-occlude]`
- **Breathes**: Subtle opacity pulse

### 4.2 Glyph Set

```js
const GLYPH_MATRIX_CONFIG = {
  // S'gaw Karen consonants + vowels + tones + K O A
  glyphs: [
    // Consonants
    "က", "ခ", "ဂ", "ဃ", "င", "စ", "ဆ", "٧", "ည", "တ",
    "ထ", "ဒ", "ဓ", "န", "ပ", "ဖ", "ဗ", "ဘ", "မ", "ယ",
    "ရ", "လ", "ဝ", "သ", "ဟ", "အ",
    // Vowels/tones (smaller)
    "ာ", "ိ", "ီ", "ု", "ူ", "ေ", "ဲ", "္", "်", "့", "း",
    // Latin KOA
    "K", "O", "A"
  ],

  // Visual
  density: 0.0008,        // Particles per px²
  baseSize: { min: 8, max: 16 },
  baseOpacity: { min: 0.02, max: 0.08 },
  breatheAmplitude: 0.4,  // Opacity multiplier
  breathePeriod: 6000,    // ms

  // Wander
  wanderSpeed: 0.0008,
  wanderAmplitude: 30,    // px

  // Cursor reveal
  reveal: {
    radius: 150,          // px
    fadeIn: 300,          // ms
    fadeOut: 800,         // ms
    maxOpacityBoost: 0.6  // Multiply base opacity
  },

  // Glimmer on hover (elements with data-glimmer)
  glimmer: {
    duration: 1200,       // ms
    sweepAngle: 180,      // degrees
    color: "rgba(212,168,67,0.4)", // Gold sweep
    blur: 8
  }
};
```

### 4.3 Occlusion System

```html
<!-- Add to ANY foreground element that should block glyphs -->
<div class="content-card" data-glyph-occlude>...</div>
<header data-glyph-occlude>...</header>
<footer data-glyph-occlude>...</footer>
<section class="scene" data-glyph-occlude>...</section>
```

Occlusion check runs each frame. Glyphs within expanded bounds (element rect + 16px padding) are skipped.

---

## 5. CHAPTER / SECTION SYSTEM (Phase 3)

### 5.1 Structure
Each "tab" (page) = multiple chapters. Each chapter = one cinematic presentation.

```
Home (index.html)
├── Hero (Chapter 0 - the logo animation above)
├── Chapter 1: "A National Home"          → Burmese ၁ background
├── Chapter 2: "One National Body"        → Burmese ၂ background
├── Chapter 3: "Public Leadership"        → Burmese ၃ background
├── Chapter 4: "The Work Continues"       → Burmese ၄ background
├── Chapter 5: "An Invitation"            → Burmese ၅ background
└── Footer / CTA

About (about.html)
├── Chapter 1: Founding Story             → ၁
├── Chapter 2: Twenty States              → ၂
├── Chapter 3: Programs Overview          → ၃
├── Chapter 4: All Generations            → ၄
├── Chapter 5: Coalition                  → ၅
└── Chapter 6: Connection                 -> ၆

Programs (programs.html)
├── Chapter 1: Civic Education            → ၁
├── Chapter 2: Community Engagement       → ၂
├── Chapter 3: Humanitarian Assistance    → ၃
└── ...

Stories (stories.html)
├── Chapter 1: Advocacy Voices            → ၁
├── Chapter 2: Culture & Play             → ၂
├── Chapter 3: Solidarity                 → ၃
└── ...

Music (music.html)
├── Chapter 1: Thra Eh Keh Lah            → ၁
├── Chapter 2: Community Musicians        → ၂
└── ...

Coming Soon (coming-soon.html)
├── Chapter 1: S'gaw-Mango AI             → ၁
├── Chapter 2: National Registry          → ၂
├── Chapter 3: Events & Recipes           → ၃
├── Chapter 4: Podcast                    → ၄
└── ...

Contact (contact.html)
├── Chapter 1: Reach Out                  → ၁
├── Chapter 2: Partner Organizations      → ၂ (3 large logos, rotating)
└── Chapter 3: Visit Us                   → ၃
```

### 5.2 Chapter Background Numerals

```js
const CHAPTER_NUMERAL_CONFIG = {
  // Full-screen Burmese numeral made of glyphs
  numeral: {
    glyphCount: 200,          // Sparse - transparent/faded
    targetOpacity: 0.15,      // Barely visible but readable
    breatheAmplitude: 0.12,
    breathePeriod: 8000,
    formationDuration: 3000,  // ms to form from dispersion
    dispersionDuration: 2000, // ms to disperse

    // Arabic flash
    flash: {
      enabled: true,
      interval: { min: 8000, max: 15000 }, // Random interval
      duration: 400,          // ms visible
      opacity: 0.4,           // Arabic numeral opacity
      fontSize: "clamp(8rem, 20vw, 30rem)",
      fontWeight: 200
    },

    // Dispersion behavior
    dispersion: {
      initialVelocity: 0.8,
      gravity: 0.0002,
      drag: 0.995,
      fadeOut: true,
      maxDistance: 2.5        // x viewport diagonal
    },

    // Respersion (reform)
    respersion: {
      delay: 1500,            // ms after dispersion ends
      attractionForce: 0.02,
      maxSpeed: 4,
      settleThreshold: 2      // px from target
    }
  }
};
```

### 5.3 Unique Transition Per Chapter

| Chapter | Transition Type | Description |
|---------|----------------|-------------|
| 1 | **Rack Focus** | Foreground blurs, next chapter pulls into focus |
| 2 | **Thread Wipe** | Karen woven pattern sweeps across (diamond lattice) |
| 3 | **Iris** | Circular aperture from center |
| 4 | **Rise & Dissolve** | Content lifts like smoke, next rises from below |
| 5 | **Veil** | Full-screen grain/grade breath |
| 6 | **Glyph Swarm** | Glyphs form numeral, then disperse to next |

Each transition: **2000-3000ms**, unique, non-repeating.

---

## 6. BANNER / HEADER (Phase 5)

### 6.1 Behavior

```js
const BANNER_CONFIG = {
  // Initial state
  initialHeight: 96,        // px
  scrolledHeight: 64,       // px
  shrinkStart: 100,         // px scroll
  shrinkEnd: 300,           // px scroll

  // Hover expand
  hoverExpand: {
    enabled: true,
    height: 88,
    delay: 150,             // ms
    duration: 300
  },

  // Elements
  logo: {
    initialSize: 48,
    scrolledSize: 32
  },

  // Bilingual toggle
  langToggle: {
    position: "right",      // After nav
    englishLabel: "EN",
    karenLabel: "ကညီ",
    transition: 200
  },

  // Motion toggle (from chatgpt.site)
  motionToggle: {
    position: "right",
    labels: { on: "Motion on", off: "Motion off" }
  },

  // Frame counter (HUD)
  frameCounter: {
    enabled: true,
    position: "bottom-left",
    format: "FRAME %04d / %04d",
    font: "var(--font-mono)",
    size: "var(--fs-micro)",
    opacity: 0.4
  }
};
```

### 6.2 Scroll Behavior

```
User scrolls down:
  0-100px:   Banner at full height (96px)
  100-300px: Smooth shrink to 64px (--ease-smooth)
  300px+:    Stays at 64px, backdrop-blur increases

User hovers banner (when scrolled):
  Expands to 88px over 300ms
  Reveals full nav labels if truncated

User scrolls up near top:
  Expands back to 96px
```

---

## 7. IMAGE BACKGROUNDS (Phase 6)

### 7.1 Per-Chapter Image Treatment

Each chapter has a **full-screen background image** with subtle motion:

```js
const IMAGE_BG_CONFIG = {
  // Ken Burns style - subtle zoom + pan
  kenBurns: {
    zoomRange: [1.0, 1.08],      // 8% zoom over chapter
    panRange: 0.03,              // 3% of dimension
    duration: 20000,             // ms per chapter
    ease: "linear"
  },

  // Alternative: Parallax depth
  parallax: {
    layers: 3,                   // Foreground, mid, background
    speed: [0.02, 0.05, 0.08],   // Scroll speed multipliers
    scale: [1.1, 1.05, 1.0]      // Scale compensation
  },

  // Image enhancement overlay
  overlay: {
    vignette: "radial-gradient(ellipse at center, transparent 40%, rgba(5,8,14,0.6) 100%)",
    grain: "url('data:image/svg+xml,...')", // Subtle film grain
    colorGrade: "var(--chapter-tint)"       // Per-chapter tint
  }
};
```

### 7.2 Chapter-Specific Image Motions

| Chapter | Motion Type | Direction |
|---------|-------------|-----------|
| 1 | Slow zoom out | Center → Wide |
| 2 | Subtle pan right | Left → Right |
| 3 | Slow zoom in | Wide → Detail |
| 4 | Pan up | Bottom → Top |
| 5 | Parallax depth | Multi-layer |

---

## 8. DONATE / CTA SYSTEM (Phase 8)

### 8.1 Placement Rules

| Page | Placement |
|------|-----------|
| All pages | Fixed bottom-right "Support KOA" button (subtle, gold accent) |
| Hero | After text reveal, before scroll cue |
| Chapter end | Between chapters, full-width subtle banner |
| Footer | Prominent "Donate" link + email signup |
| Contact | Dedicated section |

### 8.2 Donate Button Config

```js
const DONATE_CONFIG = {
  fixed: {
    position: "fixed",
    bottom: 32,
    right: 32,
    zIndex: 9999,
    label: "Support KOA",
    icon: "heart",           // Or hands-helping
    variant: "gold-outline", // Gold border, transparent bg
    hover: "gold-fill",      // Gold bg, white text
    pulse: {
      enabled: true,
      interval: 8000,        // ms
      duration: 1500
    }
  },

  inline: {
    variant: "red-fill",     --red-600 bg
    label: "Donate Now",
    size: "lg"
  },

  banner: {
    variant: "gradient",     // Red → Gold gradient
    label: "Help Build the Karen Home in America",
    sublabel: "Every contribution strengthens our community.",
    cta: "Donate Today"
  }
};
```

---

## 9. SEO SPECIFICATION (Phase 9)

### 9.1 Per-Page Meta

```html
<!-- index.html -->
<title>Karen Organization of America (KOA) — A National Home for the S'gaw Karen People</title>
<meta name="description" content="KOA connects Karen communities across the United States through civic education, cultural preservation, humanitarian aid, and the S'gaw-Mango AI language initiative. Join us.">
<meta property="og:title" content="Karen Organization of America — One People. One Home.">
<meta property="og:description" content="A national home for the S'gaw Karen people in America. Language, culture, advocacy, and community.">
<meta property="og:image" content="https://koa.org/assets/og-hero.jpg">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://koa.org/">

<!-- Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NonprofitOrganization",
  "name": "Karen Organization of America",
  "alternateName": "KOA",
  "url": "https://koa.org",
  "logo": "https://koa.org/assets/koa-logo.png",
  "description": "A national home for the S'gaw Karen people in America.",
  "foundingDate": "2018",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Omaha",
    "addressRegion": "NE",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://www.facebook.com/koamerica"
  ]
}
</script>
```

### 9.2 Technical SEO

- Semantic HTML5 (`<main>`, `<section>`, `<article>`, `<header>`, `<footer>`)
- Proper heading hierarchy (h1 → h2 → h3)
- `lang="en"` on root, `lang="khw"` on Karen content
- `hreflang` for bilingual pages
- Sitemap.xml auto-generated
- Robots.txt allowing all
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms

---

## 10. CINEMATIC COOKBOOK UI (Phase 10)

### 10.1 Concept
A hidden developer/designer panel (`Ctrl+Shift+K` or `?cinematic=1`) that exposes ALL parameters as live controls.

### 10.2 UI Sections

```
┌─ KOA CINEMATIC COOKBOOK ────────────────────────────┐
│ 🎬 Hero Animation                                    │
│   Logo Scale: [████████░░] 0.35  (0.2 - 0.6)        │
│   Revolve Speed: [████░░░░░░] 0.035 (0.01 - 0.1)    │
│   Glyph Count K: [███████░░░] 120  (50 - 300)       │
│   Glyph Opacity: [███░░░░░░░] 0.35  (0.1 - 0.6)     │
│   Text Reveal Delay: [██████░░░░] 800ms (0 - 3000)  │
│                                                     │
│ 🌌 Glyph Matrix                                      │
│   Density: [████████░░] 0.0008 (0.0002 - 0.002)    │
│   Reveal Radius: [███████░░░] 150px (50 - 300)      │
│   Glimmer Duration: [██████░░░░] 1200ms (500 - 3000)│
│                                                     │
│ 🔢 Chapter Numerals                                  │
│   Glyph Count: [█████░░░░░] 200 (50 - 500)          │
│   Target Opacity: [██░░░░░░░░] 0.15 (0.05 - 0.4)    │
│   Flash Interval: [█████░░░░░] 12s (5s - 30s)       │
│   Breathe Period: [███████░░░] 8000ms (3000 - 20000)│
│                                                     │
│ 🎨 Color Theme                                       │
│   Red Intensity: [██████████] 1.0 (0.5 - 1.5)       │
│   Gold Intensity: [█████░░░░░] 0.7 (0.3 - 1.2)      │
│   Hermes Mix: [████████░░] 0.8 (0.3 - 1.0)          │
│                                                     │
│ ⏱ Timing                                             │
│   Chapter Duration: [████████░░] 2400 frames        │
│   Transition Duration: [██████░░░░] 2500ms          │
│   Scroll Sensitivity: [███████░░░] 1.0 (0.5 - 2.0)  │
│                                                     │
│ [Export Config] [Reset to Defaults] [Copy JSON]     │
└─────────────────────────────────────────────────────┘
```

### 10.3 Persistence
- Changes saved to `localStorage` (`koa-cinematic-config`)
- Export/import JSON for team sharing
- URL hash sync (`#config=base64json`)

---

## 11. CONTENT MAP (All Pages)

### 11.1 Home (index.html)

| Chapter | Title | Burmese | Content Focus | Image |
|---------|-------|---------|---------------|-------|
| Hero | — | — | KOA Seal → K/O/A formation | Seal logo |
| 1 | A National Home | ၁ | Belonging, community, diaspora | Community gathering |
| 2 | One National Body | ၂ | Founding, 20 states, 50+ leaders | Founding gathering |
| 3 | Public Leadership | ၃ | Advocacy, Capitol, youth leadership | Capitol group |
| 4 | The Work Continues | ၄ | Programs: civic, community, humanitarian | National gathering |
| 5 | An Invitation | ၅ | Volunteer, contribute, follow | Doors open |

### 11.2 About (about.html)

| Chapter | Title | Burmese | Content |
|---------|-------|---------|---------|
| 1 | Founded 2018 | ၁ | Omaha gathering, purpose rooted in unity |
| 2 | Twenty States | ၂ | 50+ leaders, national voice |
| 3 | Three Programs | ၃ | Civic, Community, Humanitarian |
| 4 | All Generations | ၄ | Youth, families, elders |
| 5 | Eleven Orgs | ৫ | Coalition map |
| 6 | One Channel | ၆ | Facebook, email, Messenger |

### 11.3 Programs (programs.html)

| Chapter | Title | Burmese | Content |
|---------|-------|---------|---------|
| 1 | Civic Education | ၁ | Advocacy 101, DC visits, Youth Conference |
| 2 | Community Engagement | ၂ | Visits, workshops, sports, art, culture |
| 3 | Humanitarian Assistance | ၃ | Food, water, shelter, education, vocational |

### 11.4 Stories (stories.html)

| Chapter | Title | Burmese | Content |
|---------|-------|---------|---------|
| 1 | Advocacy Voices | ၁ | First-person advocacy stories |
| 2 | Culture & Play | ၂ | Sepak takraw, music, festivals |
| 3 | Solidarity | ၃ | Community support, mutual aid |

### 11.5 Music (music.html)

| Chapter | Title | Burmese | Content |
|---------|-------|---------|---------|
| 1 | Thra Eh Keh Lah | ၁ | Featured artist, songs, legacy |
| 2 | Community Musicians | ၂ | Directory, submissions, features |
| 3 | Song Archive | ၃ | Lyrics, translations, recordings |

### 11.6 Coming Soon (coming-soon.html)

| Chapter | Title | Burmese | Content |
|---------|-------|---------|---------|
| 1 | S'gaw-Mango AI | ၁ | 15B param, Thai/Burmese, vision, OCR |
| 2 | National Registry | ၂ | Churches, businesses, resources |
| 3 | Events & Recipes | ၃ | Tournaments, community voting |
| 4 | Podcast | ၄ | Audio storytelling |
| 5 | Early Access | ၅ | Waitlist, beta, contribute voice |

### 11.7 Contact (contact.html)

| Chapter | Title | Burmese | Content |
|---------|-------|---------|---------|
| 1 | Reach Out | ၁ | Email, Messenger, form |
| 2 | Partners | ၂ | 3 large logos, rotating (real only) |
| 3 | Visit Us | ৩ | Map, office hours, directions |

---

## 12. ACCESSIBILITY CHECKLIST

- [ ] `prefers-reduced-motion`: All animations disabled, instant final state
- [ ] `prefers-contrast: high`: Enhanced contrast mode
- [ ] Keyboard navigation: All interactive elements reachable
- [ ] Screen readers: ARIA labels, live regions for frame counter
- [ ] Color contrast: WCAG AA minimum (4.5:1 text, 3:1 UI)
- [ ] Focus indicators: Visible, gold outline (`--gold-500`)
- [ ] Language attributes: `lang="en"` / `lang="khw"` correct
- [ ] Alt text: All images descriptive
- [ ] Skip links: "Skip to main content"

---

## 13. PERFORMANCE BUDGETS

| Metric | Target |
|--------|--------|
| Initial JS (gzipped) | < 80 KB |
| CSS (gzipped) | < 30 KB |
| Fonts (woff2, subset) | < 150 KB total |
| Images (per page, WebP) | < 500 KB |
| LCP | < 2.5s |
| CLS | < 0.1 |
| FID/INP | < 100ms |
| Frame rate (animation) | 60fps sustained |

---

## 14. IMPLEMENTATION PHASES

| Phase | Branch | Deliverable | Verification |
|-------|--------|-------------|--------------|
| 0 | `feat/cinematic-spec` | This cookbook.md | Spec review |
| 1 | `feat/hero-animation` | Hero logo + K/A formation | Visual + scroll perf |
| 2 | `feat/glyph-matrix` | Background field + cursor reveal + occlusion | DevTools perf |
| 3 | `feat/chapter-transitions` | 6 unique transitions + numeral BG | Cross-browser |
| 4 | `feat/theme-colors` | Full color system + halo rays | Design review |
| 5 | `feat/banner-header` | Shrink/expand, bilingual, frame counter | Mobile + desktop |
| 6 | `feat/image-backgrounds` | Ken Burns + parallax per chapter | Lighthouse |
| 7 | `feat/typography` | Bilingual system, slow reveals | aXe audit |
| 8 | `feat/donate-cta` | Fixed + inline + banner CTAs | Conversion test |
| 9 | `feat/seo` | Meta, structured data, sitemap | Search Console |
| 10 | `feat/cookbook-ui` | Live parameter panel | Designer sign-off |
| **Integration** | `feat/cinematic-integration` | All merged, tested | Full regression |

---

## 15. GLOSSARY

| Term | Definition |
|------|------------|
| **Glyph** | A single S'gaw Karen character or Latin K/O/A |
| **Field** | The full-screen background particle system |
| **Occlusion** | Foreground elements blocking background glyphs |
| **Breathing** | Slow opacity/scale oscillation on formed numerals |
| **Dispersion** | Glyphs flying away from formation |
| **Respersion** | Glyphs returning to formation |
| **Rack Focus** | Depth-of-field transition (blur→sharp) |
| **Thread Wipe** | Woven pattern transition (Karen diamond lattice) |
| **Ken Burns** | Slow zoom+pan on background image |
| **Semantic Motion** | Animation that represents meaning (chaos→structure) |

---

*Last Updated: 2026-08-24*
*Version: 1.0.0*
*Branch: `feat/cinematic-spec`*