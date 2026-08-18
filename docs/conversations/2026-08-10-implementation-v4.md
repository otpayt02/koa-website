# Implementation Session — 2026-08-10 (v4)

**Participants:** Oliver P and Codex  
**Topic:** Complete KOA v4 implementation before the grilling interview

## User direction

Oliver supplied the v4 handoff summary and the repository/spec artifacts, invoked implementation and planning capabilities, and directed Codex to perform the entire implementation even though the 50 grilling questions had not yet been answered.

## Materials reviewed

- `docs/SPEC.md` v4, including 14 committed page routes, 12 API routes, six build phases, and 50 open questions.
- `docs/IDEAS.md`, whose standalone music, podcast, AI education portal, and Karen keyboard remain outside approved scope.
- Existing application, worker, database, static-site, QA, ADR, changelog, and conversation artifacts.

## Implementation interpretation

The instruction to continue overrides the grilling workflow's normal pause-before-action rule. It does not authorize Codex to invent KOA decisions or activate risky external operations. Codex therefore separated:

1. **Committed product surface:** implement and verify now.
2. **Unconfirmed operational assumptions:** document transparently in `docs/answers.md`.
3. **Production gates:** keep scraping, external model training, real interpreter/court commitments, payment/tax receipt flows, and rights-sensitive publication disabled until evidence and approval exist.

This boundary is recorded in ADR-0005 and summarized in `docs/answers-needed.md`.

## QA approach

Codex added deterministic Node test contracts that do not require a development server. They verify the bilingual route inventory, API handler surface, exclusion of standalone IDEAS routes, accessibility/SEO source signals, and Drizzle schema/migration structure. Built HTML is exercised separately where the repository's build artifact makes that practical.

## Open decisions

All 50 questions still require confirmation by an authorized KOA decision-maker. The highest-risk dependencies are source permissions, language reviewers, audio/data licenses, approved interpreters and court contacts, donation processor and nonprofit status, authoritative content, and production ownership/security.

## Traceability

- Provisional assumptions: `docs/answers.md`
- Decision frontier and evidence requests: `docs/answers-needed.md`
- Architectural boundary: `docs/decisions/0005-assumption-gated-v4-implementation.md`
- Verification contracts: `tests/v4-contract.test.mjs`
- Historical QA snapshot: `docs/history/v1-design-qa.md`
