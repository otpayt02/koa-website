# Request adherence

The long-lived project ledger is [`docs/codex/REQUEST_ADHERENCE_LEDGER.md`](codex/REQUEST_ADHERENCE_LEDGER.md). This file keeps the current implementation slice concise.

## 2026-08-30 — Authentic seal and hero precision pass

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| KOA-PREC-01 | Thin, lower-saturation K/A mini-glyph silhouettes with precise implied edges | implemented | `ScrollScrubIntro.tsx`; contract test |
| KOA-PREC-02 | Authentic original seal typography rotating behind a stationary cropped inner seal | implemented | two uses of the supplied seal asset; no generated text paths; contract test |
| KOA-PREC-03 | One counterclockwise scroll sequence with midpoint acceleration and damped full-turn stop | implemented | single GSAP/ScrollTrigger master timeline; contract test |
| KOA-PREC-04 | Circular eclipse, X glare, and soft red/gold/blue rays without hard edges | implemented | blurred SVG layers inside the same master timeline; contract test |
| KOA-PREC-05 | One-row navigation with touch and wheel horizontal scrolling | implemented | `Header.tsx`; final CSS override; contract test |
| KOA-PREC-06 | Never show the global Burmese chapter numeral over the home hero | implemented | home-route guard in `NumeralConvergence.tsx`; contract test |
| KOA-PREC-07 | Reveal `MANY PLACES · ONE COMMUNITY` and hero copy after formation | implemented | persistent caption/copy reveal in the intro timeline; copy contract |
| KOA-PREC-08 | Desktop/mobile/reduced-motion visual acceptance | blocked | Vinext dev lost its RSC HMR worker; production start returned HTML but 404ed built assets after two bounded recovery attempts |
| KOA-PREC-09 | Publish the Sites project | deferred | Requires explicit owner approval; no deploy performed |

## 2026-08-30 — Round 2 information architecture and shell polish

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| KOA-R2-01 | Exact mission lockup with smaller secondary statement | verified | `content/koa-home-copy.json`; fresh 1440×900 and 390×844 browser captures |
| KOA-R2-02 | Participation-first action with newcomer-facing orientation path | implemented | `Find your way to contribute` and `Why KOA matters` hero routes; phrase remains approval-gated |
| KOA-R2-03 | About, Programs, Stories, Impact, Contact, and coming-soon path | verified | one-row Header, `/[lang]/build`, `/about#impact`, focused contract tests |
| KOA-R2-04 | One-row banner with bounded narrow-screen behavior | verified | served desktop/mobile layout; zero horizontal overflow |
| KOA-R2-05 | Temporary common viewport presets in Design Studio | partially implemented | selector source and contract test pass; protected browser route redirects unauthenticated local session to existing `/signin-with-chatgpt` 404 |
| KOA-R2-06 | No invented mission, impact, testimonial, or program claims | verified | review-gated Build copy and Round 2 page-structure contract |
| KOA-R2-07 | Exact page structure/content for every section | partially implemented | `docs/codex/KOA-ROUND-2-PAGE-STRUCTURE.md`; final editorial slots await owner/community approval |
