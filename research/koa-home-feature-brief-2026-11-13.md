# Feature: KOA civic and language homepage

## User outcome

Visitors can move from a distinctive KOA introduction to verified community, advocacy, language, contact, and donation paths in one scrollable homepage.

## Current evidence

- Entry point: `app/[lang]/page.tsx` renders `components/HomeLanding.tsx`.
- The existing opening uses KOA's supplied seal, local K/A glyph field, and reviewed localized route labels.
- `components/DonationForm.tsx` already calls `/api/donations`; community updates are linked from the existing community page to KOA's Facebook account.
- `CinematicLanding.tsx` is an alternate component, not the active route.

## Scope and preservation

- Add editorial chapters, access links, existing donation flow, and a scroll-owned K/seal/A finale to the active homepage.
- Preserve navigation, route paths, existing language toggle, payment API, and authentic seal.
- Do not invent event dates, individual volunteer quotes, organization metrics, or new S'gaw translations. These need KOA editorial review before publication.
- No new paid runtime service. GSAP and local image assets were already project dependencies.

## Experience and failure paths

1. The first screen introduces KOA with the current seal and language switcher.
2. Three photographic chapters route to services, translation, and community.
3. Access links route to dictionary, contribution, and contact.
4. Events and stories point to KOA's current update and submission channels until approved entries exist.
5. Donation uses the existing form; its status message handles unavailable checkout.
6. The footer mark forms on downward scroll and scatters on reverse scroll. Reduced motion shows the complete mark without scrubbing.

## Acceptance and rollback

- Verify build, content inventory, desktop/mobile overflow, keyboard focus, reduced motion, finale in both scroll directions, and donation's existing error state.
- Rollback by reverting this feature's commit; no data migration or API change is needed.
- Public deployment is held for KOA's editorial and publication approval because new English copy and existing proposed non-English labels need review.
