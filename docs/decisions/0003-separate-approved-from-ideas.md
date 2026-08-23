# ADR-0003: Separate Approved Features from Ideas

**Date:** 2026-08-09
**Status:** Accepted
**Decider:** Oliver P
**Context:**
The v2 spec draft mixed committed features with unapproved ideas (recursive AI training, community lexicon, Karen music, podcast, etc.). This made it unclear what was actually being built and what was still under consideration.

**Decision:**
Split features into two files:
- `docs/SPEC.md` — only approved, committed features that will be built.
- `docs/IDEAS.md` — all unapproved, in-progress, unfinished, or unverified features with attribution, date, and status.

Ideas move from `IDEAS.md` to `SPEC.md` only when Oliver explicitly approves them. The Codex prompt instructs the AI to read both files and implement only what's in `SPEC.md`.

**Consequences:**
- (+) Clear separation between committed work and proposals.
- (+) Team members can see what's being considered in `IDEAS.md`.
- (+) Codex knows exactly what to build and what to skip.
- (+) Full audit trail of what was approved, when, and by whom.
- (-) Requires discipline to keep both files updated.
- (-) Two files to maintain instead of one.
