# Cinematic frame story: v0007-phase7

This file is deterministic output from the canonical frame manifest. Edit `content/cinematic-frame-manifest.json`, then rerun the generator; do not hand-edit this snapshot.

## Snapshot metadata

| Field | Value |
|---|---|
| Commit | `c827016` |
| Route | `/[lang]` |
| Locales | `en`, `th`, `my`, `ksw` |
| Frame order | `1:home-arrival-seal` → `2:home-seal-migration` → `3:home-ka-resolve` → `4:home-o-resolve` → `5:home-copy-reveal` → `6:home-scroll-invitation` → `7:home-chapter-belonging` → `8:home-chapter-language` → `9:home-chapter-culture` → `10:home-chapter-service` → `11:home-chapter-future` → `12:home-partner-handoff` → `13:home-final-involvement` |
| Evidence directory | `output/playwright` |
| Source | `content/cinematic-frame-manifest.json` (manifest version 7) |

## Version rationale

Phase 7 records the canonical one-app frame story before browser finalization; evidence remains reviewable and does not imply deployment or publication.

## 1. Seal arrival

- ID: `home-arrival-seal`
- Route: `/[lang]`
- Locales: `en`, `th`, `my`, `ksw`
- Entry: progress `0`
- Exit: progress `0.08`

### Content

Foreground:
  - KOA seal identity
  - Karen Organization of America name

Background:
  - living Karen glyph field
  - quiet cinematic navy

Static features:
  - centered supplied seal
  - semantic organization name

### Motion

  - glyph field gathers toward the arrival anchor
  - seal holds before migration

Motion off: The complete seal identity is present immediately.
  - seal is centered
  - organization name remains readable

### Tunables

| Name | Value | Min | Max | Step | Unit | Reference weight | Description |
|---|---:|---:|---:|---:|---|---:|---|
| `arrivalScale` | 1 | 0.82 | 1.08 | 0.01 | ratio | 1 | Keeps the arriving seal legible without overpowering the title. |

### Evidence

- `output/playwright/phase5-main-desktop.png`
- `output/playwright/phase5-main-motion-off.png`

### Rationale

Begin with the community identity before introducing the letter choreography; see the cookbook for the full narrative rationale.

## 2. Seal migration

- ID: `home-seal-migration`
- Route: `/[lang]`
- Locales: `en`, `th`, `my`, `ksw`
- Entry: progress `0.08`
- Exit: progress `0.16`

### Content

Foreground:
  - migrating seal

Background:
  - persistent glyph trajectories

Static features:
  - one supplied seal asset

### Motion

  - seal travels on the authored path
  - field leaves space around the seal

Motion off: The seal rests at its resolved destination.
  - no flight animation runs
  - the destination composition is complete

### Tunables

| Name | Value | Min | Max | Step | Unit | Reference weight | Description |
|---|---:|---:|---:|---:|---|---:|---|
| `migrationArc` | 0.64 | 0.4 | 0.78 | 0.01 | weight | 0.64 | Balances the seal flight arc against the later K and A convergence. |

### Evidence

- `output/playwright/phase3-desktop-seal-migration.png`

### Rationale

Migration creates the connective gesture between identity and the K/A construction documented in the cookbook.

## 3. K / A resolve

- ID: `home-ka-resolve`
- Route: `/[lang]`
- Locales: `en`, `th`, `my`, `ksw`
- Entry: progress `0.16`
- Exit: progress `0.24`

### Content

Foreground:
  - K glyph
  - seal
  - A glyph

Background:
  - sparse living field

Static features:
  - K–seal–A order
  - shared baseline

### Motion

  - K and A converge around the seal

Motion off: K, seal, and A appear in their resolved positions.
  - K–seal–A order is preserved
  - no convergence animation runs

### Tunables

| Name | Value | Min | Max | Step | Unit | Reference weight | Description |
|---|---:|---:|---:|---:|---|---:|---|
| `opacity` | 0.92 | 0.68 | 1 | 0.01 | alpha | 0.92 | Keeps the K and A strong while retaining the seal as the central identity. |

### Evidence

- `output/playwright/phase5-main-desktop.png`

### Rationale

The letters resolve around the living seal in the deliberate order preserved by the cookbook.

## 4. Delayed O resolve

- ID: `home-o-resolve`
- Route: `/[lang]`
- Locales: `en`, `th`, `my`, `ksw`
- Entry: progress `0.24`
- Exit: progress `0.32`

### Content

Foreground:
  - completed K O A mark

Background:
  - glyph-built O formation

Static features:
  - complete KOA reading

### Motion

  - O resolves after the K and A
  - glyph particles retain their paths

Motion off: The complete KOA mark appears without delay.
  - O is present
  - the final mark is readable

### Tunables

| Name | Value | Min | Max | Step | Unit | Reference weight | Description |
|---|---:|---:|---:|---:|---|---:|---|
| `delay` | 0.55 | 0.35 | 0.75 | 0.01 | weight | 0.55 | Protects the readable beat between the K/A arrival and O convergence. |

### Evidence

- `output/playwright/phase5-main-final.png`
- `output/playwright/phase3-desktop-glyph-o.png`

### Rationale

The delayed O is the authored convergence payoff, not a generic wordmark reveal.

## 5. Purpose copy

- ID: `home-copy-reveal`
- Route: `/[lang]`
- Locales: `en`, `th`, `my`, `ksw`
- Entry: progress `0.32`
- Exit: progress `0.4`

### Content

Foreground:
  - localized purpose statement

Background:
  - settled KOA composition

Static features:
  - one readable purpose statement per locale

### Motion

  - copy enters after the identity resolves

Motion off: Purpose copy is immediately readable beneath the complete identity.
  - copy is not hidden
  - localized text remains semantic

### Tunables

| Name | Value | Min | Max | Step | Unit | Reference weight | Description |
|---|---:|---:|---:|---:|---|---:|---|
| `copyWidth` | 42 | 32 | 54 | 1 | rem | 42 | Keeps localized copy readable without covering the resolved identity. |

### Evidence

- `output/playwright/phase5-main-desktop.png`

### Rationale

Meaning follows identity so visitors understand what KOA does after recognizing who is speaking.

## 6. Scroll invitation

- ID: `home-scroll-invitation`
- Route: `/[lang]`
- Locales: `en`, `th`, `my`, `ksw`
- Entry: progress `0.4`
- Exit: progress `0.46`

### Content

Foreground:
  - scroll invitation

Background:
  - open path into the chapters

Static features:
  - plain-language invitation

### Motion

  - restrained directional cue

Motion off: The invitation remains visible without bouncing.
  - direction remains clear
  - no repeated cue animation runs

### Tunables

| Name | Value | Min | Max | Step | Unit | Reference weight | Description |
|---|---:|---:|---:|---:|---|---:|---|
| `cueAlpha` | 0.72 | 0.48 | 0.86 | 0.01 | alpha | 0.72 | Makes the invitation findable without competing with the story. |

### Evidence

- `output/playwright/phase5-main-desktop.png`

### Rationale

The invitation makes the long-form story discoverable while preserving native scrolling.

## 7. Chapter I · Belonging

- ID: `home-chapter-belonging`
- Route: `/[lang]`
- Locales: `en`, `th`, `my`, `ksw`
- Entry: progress `0.46`
- Exit: progress `0.54`

### Content

Foreground:
  - chapter numeral I
  - belonging story

Background:
  - living community field

Static features:
  - localized chapter content

### Motion

  - numeral forms sparsely
  - chapter door holds for reading

Motion off: The belonging chapter is fully open.
  - numeral and copy are present
  - content order remains intact

### Tunables

| Name | Value | Min | Max | Step | Unit | Reference weight | Description |
|---|---:|---:|---:|---:|---|---:|---|
| `hold` | 2 | 1.4 | 2.8 | 0.1 | seconds | 2 | Preserves a readable pause at the first chapter door. |

### Evidence

- `output/playwright/phase4-commitment-loom.png`

### Rationale

Belonging opens the five-door community story described in the cookbook.

## 8. Chapter II · Language

- ID: `home-chapter-language`
- Route: `/[lang]`
- Locales: `en`, `th`, `my`, `ksw`
- Entry: progress `0.54`
- Exit: progress `0.62`

### Content

Foreground:
  - chapter numeral II
  - language story

Background:
  - Karen glyph paths

Static features:
  - localized chapter content

### Motion

  - glyphs converge into the numeral
  - chapter door holds for reading

Motion off: The language chapter is fully open.
  - numeral and copy are present
  - glyph texture is settled

### Tunables

| Name | Value | Min | Max | Step | Unit | Reference weight | Description |
|---|---:|---:|---:|---:|---|---:|---|
| `numeralAlpha` | 0.34 | 0.2 | 0.48 | 0.01 | alpha | 0.34 | Keeps the glyph-built numeral porous rather than typographically solid. |

### Evidence

- `output/playwright/phase5-main-desktop.png`

### Rationale

Language continuity is shown through persistent glyph material rather than decorative symbols.

## 9. Chapter III · Culture

- ID: `home-chapter-culture`
- Route: `/[lang]`
- Locales: `en`, `th`, `my`, `ksw`
- Entry: progress `0.62`
- Exit: progress `0.7`

### Content

Foreground:
  - chapter numeral III
  - culture story

Background:
  - cultural memory field

Static features:
  - localized chapter content

### Motion

  - field breathes around the chapter
  - chapter door holds for reading

Motion off: The culture chapter is fully open.
  - chapter copy is unobscured
  - background remains quiet

### Tunables

| Name | Value | Min | Max | Step | Unit | Reference weight | Description |
|---|---:|---:|---:|---:|---|---:|---|
| `fieldDensity` | 0.42 | 0.24 | 0.58 | 0.01 | weight | 0.42 | Retains a living cultural field while leaving the chapter copy unobscured. |

### Evidence

- `output/playwright/phase5-main-desktop.png`

### Rationale

Culture receives a distinct readable door while remaining connected to the same living field.

## 10. Chapter IV · Service

- ID: `home-chapter-service`
- Route: `/[lang]`
- Locales: `en`, `th`, `my`, `ksw`
- Entry: progress `0.7`
- Exit: progress `0.78`

### Content

Foreground:
  - chapter numeral IV
  - service story

Background:
  - community action field

Static features:
  - localized chapter content

### Motion

  - paths shift toward action
  - chapter door holds for reading

Motion off: The service chapter is fully open.
  - action copy remains complete
  - the field is settled

### Tunables

| Name | Value | Min | Max | Step | Unit | Reference weight | Description |
|---|---:|---:|---:|---:|---|---:|---|
| `pathEnergy` | 0.46 | 0.28 | 0.62 | 0.01 | weight | 0.46 | Adds forward intent without creating frantic motion behind service copy. |

### Evidence

- `output/playwright/phase5-main-desktop.png`

### Rationale

Service turns the story outward while keeping action evidence separate from aspirational copy.

## 11. Chapter V · Future

- ID: `home-chapter-future`
- Route: `/[lang]`
- Locales: `en`, `th`, `my`, `ksw`
- Entry: progress `0.78`
- Exit: progress `0.86`

### Content

Foreground:
  - chapter numeral V
  - future story

Background:
  - open forward field

Static features:
  - localized chapter content

### Motion

  - field opens toward the partner handoff
  - chapter door holds for reading

Motion off: The future chapter is fully open.
  - future copy is present
  - the transition remains visually clear

### Tunables

| Name | Value | Min | Max | Step | Unit | Reference weight | Description |
|---|---:|---:|---:|---:|---|---:|---|
| `opening` | 0.58 | 0.38 | 0.72 | 0.01 | weight | 0.58 | Creates forward space for the transition from story to participation. |

### Evidence

- `output/playwright/phase5-main-final.png`

### Rationale

The fifth door prepares the shift from narrated identity to shared future action.

## 12. Partner handoff

- ID: `home-partner-handoff`
- Route: `/[lang]`
- Locales: `en`, `th`, `my`, `ksw`
- Entry: progress `0.86`
- Exit: progress `0.94`

### Content

Foreground:
  - verified partner presentation boundary

Background:
  - settled chapter field

Static features:
  - only approved relationship records may appear

### Motion

  - opposed partner rows when verified data exists

Motion off: Approved partners use a static accessible grid.
  - no marquee movement runs
  - unapproved records remain unpublished

### Tunables

| Name | Value | Min | Max | Step | Unit | Reference weight | Description |
|---|---:|---:|---:|---:|---|---:|---|
| `rowTempo` | 36 | 28 | 48 | 1 | seconds | 36 | Keeps autonomous partner motion slow enough for recognition and focus pausing. |

### Evidence

- `Task 10 partner policy contract`

### Rationale

The public story can hand off to real relationships only when source and logo permission are verified.

## 13. Final involvement action

- ID: `home-final-involvement`
- Route: `/[lang]`
- Locales: `en`, `th`, `my`, `ksw`
- Entry: progress `0.94`
- Exit: progress `1`

### Content

Foreground:
  - final involvement invitation
  - clear action destinations

Background:
  - complete settled film

Static features:
  - direct action labels
  - complete semantic content

### Motion

  - final composition settles rather than looping

Motion off: Every involvement action is immediately available.
  - complete content is present
  - all destinations remain keyboard reachable

### Tunables

| Name | Value | Min | Max | Step | Unit | Reference weight | Description |
|---|---:|---:|---:|---:|---|---:|---|
| `actionEmphasis` | 0.78 | 0.58 | 0.9 | 0.01 | weight | 0.78 | Makes the primary involvement path clear without turning the ending into a sales panel. |

### Evidence

- `output/playwright/phase5-main-final.png`
- `output/playwright/phase5-main-mobile-motion-off-final.png`

### Rationale

The film ends with a concrete path to participate after the full KOA story has been read.
