# KOA Canonical Website — Code Audit

**Date:** 2026-08-30  
**Source:** `koa-canonical-website/` (static HTML/CSS/JS, served on port 8888)  
**Destination:** `public/canonical/` in the koa-website Next.js repo  
**Auditor:** Automated code review  

---

## 1. Architecture Overview

| Layer | Files | Lines |
|-------|-------|-------|
| HTML | `index.html` | 322 |
| CSS | `css/main.css` | 2,121 |
| JS — Hourglass Loader | `js/hourglass-loader.js` | 415 |
| JS — Glyph Matrix | `js/glyph-matrix.js` | 242 |
| JS — Hero Scroll Controller | `js/hero-scroll-controller.js` | 387 |
| JS — Main (progress, nav, reveals) | `js/main.js` | 358 |
| **Total** | **6 files** | **3,845** |

No build step, no framework, no dependencies. Pure vanilla HTML/CSS/JS with Google Fonts loaded via CDN.

---

## 2. Strengths

### 2.1 Visual Design
- Premium cinematic aesthetic with gold/dark palette (`--accent-gold: #d4af37`)
- Fluid typography via `clamp()` — scales gracefully from mobile to 4K
- Film grain overlay via inline SVG data URI — zero extra HTTP requests
- Cursor glow effect with lerp smoothing (desktop only, correctly gated by `hover: hover`)
- Custom scrollbar styled to match the gold theme

### 2.2 Animation System
- **Scroll-driven hero sequence** (500vh sticky): seal revolve → KOA glyph formation → tagline cycle → scatter → shrink → section reveal
- **Section glyph formation**: Burmese numerals form from scattered particles as user scrolls through chapters
- All animations use `requestAnimationFrame` with proper throttling
- `prefers-reduced-motion` respected at CSS and JS level
- Smooth easing only — no spring physics — scrub-friendly and pausable mid-animation

### 2.3 Accessibility
- Semantic HTML: `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`
- `aria-hidden="true"` on all decorative elements (canvas, film grain, cursor glow)
- `aria-label` on chapter navigation
- `:focus-visible` styled with gold outline + glow
- `role="switch"` on language toggle with `aria-checked`
- Keyboard support on language toggle (Enter/Space)

### 2.4 Performance
- Single HTTP server, no external JS dependencies
- Canvas rendering uses `devicePixelRatio` capped at 2
- IntersectionObserver for scroll reveals (one-shot, unobserves after trigger)
- Passive scroll listeners
- Parallax only applied to elements near viewport
- Font preconnect hints for Google Fonts

### 2.5 Bilingual Support
- EN / S'gaw Karen toggle in header
- Karen script (Myanmar Unicode) integrated throughout
- Language toggle animates smoothly with expanding label on hover

---

## 3. Issues Found

### 3.1 Critical

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| C1 | **Image placeholders only** — all `.image-placeholder` divs use CSS gradients, no real images | `index.html` (chapters 1-5) | Content incomplete; needs real photography |
| C2 | **No favicon** — missing `<link rel="icon">` | `index.html` | Browser tab shows blank icon |

### 3.2 High — CSS Dead Code

| # | Selector | First Definition | Overridden By |
|---|----------|-----------------|---------------|
| H1 | `.chapter::before` (gradient overlay) | Line 633 | Line 1523 (transition blend) |
| H2 | `.chapter::after` (vignette) | Line 646 | Line 1536 (transition blend) |
| H3 | `.reveal` (scroll reveal) | Line 1317 | Line 1702 (premium reveal) |
| H4 | `.reveal-word` (word reveal) | Line 1483 | Line 1713 (premium word reveal) |
| H5 | `.cta-primary::before` | Line 1007 | Line 1617 (radial gradient) |
| H6 | `.scroll-indicator` | Line 583 | Line 1745 (redefined) |

### 3.3 Medium

| # | Issue | Location |
|---|-------|----------|
| M1 | No lazy loading on fonts — 4 font families loaded synchronously | `index.html:10-12` |
| M2 | Particle count unbounded on resize in glyph-matrix | `js/glyph-matrix.js:95` |
| M3 | `setSectionTargets` recreates all particles on chapter change | `js/hourglass-loader.js:298` |
| M4 | `data-parallax` transform includes `scale(1.08)` causing sub-pixel blur | `js/main.js:169` |

### 3.4 Low

| # | Issue | Location |
|---|-------|----------|
| L1 | `console.log` left in production JS | `js/main.js:354`, `js/hero-scroll-controller.js:370` |
| L2 | No `og:image` or social meta tags | `index.html` |
| L3 | `.widget-item` 3D tilt uses inline style.transform — may conflict with CSS hover | `js/main.js:347` |

---

## 4. Integration Notes

The canonical site is served from `public/canonical/` in the Next.js repo.  
Accessible at `/canonical/` when the Next.js dev server or production build runs.

All asset paths are relative — no changes needed for the new location.

### Relationship to Existing Pages
- `public/koa/` — earlier static storytelling site (v4.x)
- `app/[lang]/page.tsx` — current React-based homepage
- `public/canonical/` — **design-target** cinematic experience with scroll-driven animations

---

## 5. Recommendations

### Immediate
1. Remove CSS dead code (~200 lines of overridden rules)
2. Add favicon
3. Add social meta tags (`og:title`, `og:description`, `og:image`)
4. Remove `console.log` statements

### Short-term
5. Replace image placeholders with real photography
6. Lazy-load Noto Sans Myanmar font
7. Particle pool reuse on chapter change
8. Add `<link rel="icon">` tag

### Long-term
9. Port scroll-driven animations to Next.js React components using Framer Motion
10. Unified CSS — merge canonical cinematic styles into `globals.css`
11. Add E2E tests for scroll-driven hero sequence

---

## 6. File Manifest

```
public/canonical/
  index.html              (322 lines)
  css/
    main.css              (2,121 lines)
  js/
    hourglass-loader.js   (415 lines)
    glyph-matrix.js       (242 lines)
    hero-scroll-controller.js (387 lines)
    main.js               (358 lines)
  AUDIT.md                (this file)
```
