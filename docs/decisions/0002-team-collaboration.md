# ADR-0002: Team Collaboration via GitHub Issues + Projects

**Date:** 2026-08-09
**Status:** Proposed (pending Oliver's approval)
**Decider:** Oliver P
**Context:**
Oliver needs a free, transparent system where team members can propose content changes, submit ideas, respond to his questions, and message him — all tracked with each person's name attached. The system must be accessible to non-technical team members.

**Decision:**
Use GitHub Issues + GitHub Projects as the primary team collaboration system. Team members are added as collaborators on the `otpayt02/koa-website` repo. They open Issues with labels (`idea`, `content-change`, `question`, `message`) and Oliver reviews, approves, or rejects via comments. A GitHub Project board tracks status (Ideas → Under Review → Approved → Rejected → Done). Supplement with a shared Google Drive folder for team members who find GitHub too technical.

**Consequences:**
- (+) Free for private repos.
- (+) Full history and traceability — every Issue and comment is timestamped and attributed.
- (+) Oliver gets email notifications for every proposal.
- (+) Works on mobile via GitHub app.
- (+) Approved ideas move cleanly to `docs/SPEC.md`; unapproved stay in `docs/IDEAS.md`.
- (-) Team members need a free GitHub account.
- (-) Some team members may find GitHub Issues too technical (mitigated by Google Drive supplement).

**Alternatives considered:**
- Slack/Discord: Real-time chat but poor for tracking and attribution over time.
- Google Docs only: Simple but lacks structured status tracking and search.
- Notion/Linear: Good tools but not free for private teams.
- Email only: No transparency for the rest of the team.
