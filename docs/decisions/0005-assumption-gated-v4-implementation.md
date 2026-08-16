# ADR-0005: Assumption-Gated v4 Implementation

**Date:** 2026-08-10  
**Status:** Accepted for implementation; organizational decisions remain unconfirmed  
**Decider:** Implementation team, following Oliver's instruction to build before completing the grilling questions

## Context

The v4 specification commits the dictionary, community audio, AI-training pipeline, translation/interpreter directory, court-partnership pathway, community requests, and donations. The 50 questions in §14 are unanswered. Several answers require organizational authority, source permission, verified credentials, legal advice, insurance, fiscal-status evidence, vendor selection, or external partnerships. Guessing those answers could create false public claims, rights violations, unsafe data transfers, or financial and professional-liability exposure.

Oliver explicitly instructed Codex to complete the implementation even though grilling has not occurred.

## Decision

Implement the complete v4 product surface and internal contracts using conservative assumptions documented in `docs/answers.md`.

The implementation may include bilingual pages, accessible navigation and forms, validation, local/demo data, submission and moderation states, schema and API contracts, audit logging, and disabled/provider-neutral integration boundaries.

The following capabilities remain production-gated until their named evidence and accountable owner are recorded:

- third-party dictionary scraping or publication;
- external AI/model-training data transfer or model deployment;
- real translator/interpreter listing, credential claims, booking, or court-service commitments;
- payment processing, tax-deductibility claims, or tax receipts;
- publication of unverified biographies, services, images, licenses, or partnership claims.

Production-gated operations must fail closed and must not be enabled merely by adding sample content.

## Consequences

- The team can validate the complete architecture and user journeys now.
- Unanswered questions remain visible and traceable instead of becoming hidden product behavior.
- Demo content and submission acknowledgements must not imply a fulfilled service, approved professional, completed donation, or licensed training use.
- Launch requires an explicit readiness review against `docs/answers-needed.md`.
- Some integrations will remain adapters, queues, or non-transactional demonstrations until KOA supplies approvals and credentials.

## Supersession

Each confirmed KOA decision should replace the corresponding assumption in `docs/answers.md` and, when architectural or policy-significant, receive its own ADR. Confirmation of one gate does not activate the others.
