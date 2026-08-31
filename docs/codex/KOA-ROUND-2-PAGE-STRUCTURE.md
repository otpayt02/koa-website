# KOA Round 2 — page structure and content contract

Status: proposed content structure with a verified implementation slice. The exact mission lockup is approved; all other new editorial copy is either operational UI copy or explicitly marked for KOA/community review.

## Locked editorial hierarchy

The first ten seconds should move in this order:

1. Find KOA and understand what it is.
2. Feel why finding it matters.
3. Choose a way to participate.

The visual target is awe, relief, curiosity, and determination. Motion earns attention, then gets out of the way so the visitor can read and act.

### Approved hero copy

- Mission / H1: `America's home for the Karen community.`
- Secondary statement, directly below at a smaller size: `Providing, combining, and inviting a national Karen voice.`

No new mission claim, impact number, testimonial, or program detail is approved by this document.

## Action hierarchy

- Primary action: `Find your way to contribute` → `/{lang}/contribute`.
- Secondary action: `Why KOA matters` → `/{lang}/about`.
- The cinematic scroll itself is the discovery path; it does not need another competing hero button.

The primary action represents contribution in any form: money, labor, language knowledge, collaboration, attendance, or a useful introduction. The secondary action gives a newcomer a plain-language reason to continue before asking them to act.

## Launch shell

The header is one horizontal row at every width. The centered seal remains the home control, and the information architecture is:

`About` · `Programs` · `Stories` · `Impact` · `Contact` · `Build` + `soon`

Route mapping stays honest to the current app:

- `About` → `/{lang}/about`
- `Programs` → `/{lang}/services`
- `Stories` → `/{lang}/community`
- `Impact` → `/{lang}/about#impact` until a reviewed standalone impact source exists
- `Contact` → `/{lang}/contact`
- `Build` → `/{lang}/build`

Dictionary, translation, events, culture, history, and collaboration remain discoverable through page content and footer navigation; they are not removed from the application.

## Home page sequence

### 0. Header / orientation

- One-row navigation.
- Centered KOA seal as the home control.
- Burmese numerals as quiet section identifiers.
- Language control remains keyboard reachable.
- On narrow screens, each side of the rail scrolls internally; the page itself must not gain horizontal overflow.

### 1. Hero / find KOA

- Signature: the existing GSAP seal → K/A glyph assembly and restrained red/gold/navy light field.
- H1: the approved mission sentence above.
- Smaller line: the approved secondary statement above.
- Visibility: both lines are readable in the first viewport; the identity motion supports orientation instead of hiding the thesis until scroll.
- Primary CTA: `Find your way to contribute`.
- Secondary CTA: `Why KOA matters`.
- Fallback: a static readable seal, both lines of copy, both links, and no required animation.

### 2. Why KOA matters / orientation

- Heading: `Why KOA matters` (proposed navigational label).
- Body: `[Approved explanation of why KOA matters — KOA/community review required]`.
- Required evidence slot: `Source or owner: [pending]`.
- Do not fill this section with invented history, impact, or beneficiary language.

### 3. Programs / what exists

- Heading: `Programs`.
- Content rule: show only reviewed program names, descriptions, locations, dates, and participation instructions.
- Empty state: `Program details will appear here after KOA review.`
- Action: `Ask about programs` → `/{lang}/contact`.

### 4. Stories / who is speaking

- Heading: `Stories`.
- Content rule: publish only consented, attributed community stories.
- Empty state: `Community stories will appear here after consent and editorial review.`
- Action: `Share a story` → `/{lang}/contact`.

### 5. Impact / what can be evidenced

- Heading: `Impact`.
- Content rule: use verified measures, dates, methodology, and source links only; no placeholder numbers.
- Empty state: `Impact reporting will appear here when the measures and sources are approved.`
- Action: `Ask about the work` → `/{lang}/contact`.

### 6. Build / what is coming next

- Heading: `Build with KOA`.
- Status label: `Coming soon`.
- Body: `This space will share what KOA is preparing next, when the details are ready for community review.`
- Primary action: `Tell us what to build` → `/{lang}/contact`.
- Secondary action: `Contribute now` → `/{lang}/contribute`.

This section is allowed to be specific about the review state of the website. It must not imply that an unapproved initiative, partnership, result, or launch already exists.

### 7. Contact / make participation possible

- Heading: `Contact KOA`.
- Body: `Tell us what you need, where you are, or how you would like to take part.`
- Action: use the existing contact form; preserve its validation, success, and failure states.

### 8. Footer / persistent routes

- Keep About, Programs, Stories, Impact, Contact, Build, Dictionary, Translation, and Collaboration available.
- Keep privacy and external-link behavior unchanged.

## Identity and interaction contract

- Keep the current navy/Hermès-blue field, red-led gold accents, current typography, Karen glyphs, ASCII/Karen dither, and seal-as-O composition.
- Keep the banner to one row.
- Prefer the existing GSAP and canvas systems; do not add a second animation runtime.
- Microinteractions should clarify focus, state, or invitation. Remove any effect that competes with reading.
- Respect `prefers-reduced-motion`, keyboard focus, touch input, and low-power frame budgets.
- The protected Design Studio uses a temporary viewport selector with common mobile, tablet, desktop, and fluid presets. It is a review aid, not a public product claim.

## Approval questions for the next design pass

1. Approve or replace the newcomer-facing phrase `Why KOA matters`.
2. Supply the approved explanation for the Why KOA matters section.
3. Supply reviewed content or mark the Programs, Stories, and Impact empty states as launch-default.
