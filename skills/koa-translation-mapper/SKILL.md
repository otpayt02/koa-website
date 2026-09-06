---
name: koa-translation-mapper
description: Map one English KOA content revision to independent Thai, Burmese, and S'gaw Karen draft proposals with provider, confidence, and provenance for human review.
---

# KOA Translation Mapper

English is the only source. Thai (`th`), Burmese (`my`), and S'gaw Karen (`ksw`) proposals are parallel drafts; never translate one proposal through another locale.

## Trigger

Use this skill when a reviewed English content unit or revision needs traceable locale proposals posted to the protected KOA Language Studio review queue.

## Inputs

- Content-unit ID and exact English source revision.
- English source text and its route, section, and frame context.
- One independently produced proposal per requested locale.
- Provider and model or human-source identifier for each proposal.
- Confidence value, provenance note, and optional superseded proposal ID.
- Authenticated local admin route or an approved local adapter for posting drafts.

## Workflow

1. Confirm the content unit and English revision exist and still match the supplied source text.
2. Reject chained proposals, missing provenance, unsupported locales, confidence outside the accepted range, or proposals derived from a stale English revision.
3. Keep each locale payload independent and record `contentUnitId`, `sourceRevision`, `locale`, `text`, `provider`, `confidence`, `provenance`, and supersession metadata.
4. Post each payload separately to `/api/admin/translation-proposals` with status `draft` or `pending_review`. Stop after two reversible attempts for a concrete failed post and preserve the payload for manual review.
5. Read the response receipt and confirm the proposal remains non-approved and linked to the intended English revision.
6. Present the three proposals side by side with provider, confidence, provenance, receipt ID, and any warning. Flag S'gaw Karen for required human review.

## Output

Return a review packet keyed by locale with the English revision, proposed text, provider/model, confidence, provenance, draft status, receipt ID, supersession link, failure details, and reviewer next action. Do not describe drafts as published, approved, or training data.

## Verification

Verify every proposal cites the same current English revision, no proposal cites another locale, all required metadata is stored, and every successful receipt has `draft` or `pending_review` status. Confirm no content catalog or approved translation was changed.

## Approval boundary

This skill may prepare and post authenticated local review drafts when that write is in scope. It never approves, publishes, exports as training data, creates an external account, starts a hidden background translator, sends content to an unapproved provider, or changes production data without explicit approval.
