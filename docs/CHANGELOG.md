# KOA Website — Changelog

All notable changes to this project are documented here.
Each entry includes: date, what changed, why, and who.

---

## 2026-08-09 (v3)

### Added
- `docs/SPEC.md` (v3) — revised spec with only committed features. Unapproved ideas removed and moved to `docs/IDEAS.md`.
- `docs/IDEAS.md` — parking lot for all unapproved, in-progress, unfinished, or unverified features. Includes attribution (who proposed), date, and status (Proposed / Under Review / Approved / Rejected / Deferred).
- `docs/TEAM-WORKSPACE.md` — free team collaboration system using GitHub Issues + Projects (recommended), with Google Drive as a supplement. Includes setup steps, issue template, and workflow.
- `.github/ISSUE_TEMPLATE/idea.md` — GitHub Issue template for team members to propose ideas with their name attached.
- `docs/decisions/0001-bilingual-architecture.md` — ADR for bilingual [lang] route segment.
- `docs/decisions/0002-team-collaboration.md` — ADR for GitHub Issues + Projects collaboration system.
- `docs/decisions/0003-separate-approved-from-ideas.md` — ADR for splitting SPEC.md and IDEAS.md.
- `docs/conversations/2026-08-09-planning-v3.md` — transcript of v3 planning session.

### Changed (from v2 draft)
- Recursive AI training loop moved from SPEC → IDEAS.md (unapproved).
- Community-run lexicon moved from SPEC → IDEAS.md (unapproved).
- Karen AI language agents moved from SPEC → IDEAS.md (unapproved).
- Karen music section moved from SPEC → IDEAS.md (unapproved).
- Podcast moved from SPEC → IDEAS.md (unapproved).
- Development opportunities board moved from SPEC → IDEAS.md (unapproved).
- Karen AI education portal moved from SPEC → IDEAS.md (unapproved).
- Scrape project integration moved from SPEC → IDEAS.md (unapproved).
- Karen language keyboard moved from SPEC → IDEAS.md (unapproved).
- Page count reduced from 16 to 7 committed pages (Home, About, Services, Community, Contact, Admin, Changelog).
- Build phases reduced from 6 to 3 (Foundation, Core Pages, Polish). Future phases added when ideas are approved.
- Open questions reduced from 35 to 28 (removed AI-training-specific questions).

### Decisions
- ADR-0001: Bilingual architecture via Next.js [lang] dynamic route segment.
- ADR-0002: Team collaboration via GitHub Issues + Projects.
- ADR-0003: Separate approved features from ideas (SPEC.md + IDEAS.md split).

### Notes
- v2 was a draft that mixed approved and unapproved features. v3 separates them cleanly.
- `docs/IDEAS.md` is the single source of truth for unapproved features. Oliver approves → move to SPEC.
- Team members can propose ideas via GitHub Issues (see `docs/TEAM-WORKSPACE.md`).
- Spec includes Codex prompt (§12) for Phase 1 kickoff.
- 28 open questions in §10 require answers in `docs/answers.md` before Phase 2.
