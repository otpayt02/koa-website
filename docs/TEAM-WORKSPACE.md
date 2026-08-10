# TEAM-WORKSPACE.md — Free Collaboration Options

**Owner:** Oliver P
**Date:** 2026-08-09
**Purpose:** Oliver wants a free, shared interface where team members can propose content changes, submit ideas, respond to his questions, and message him — all tracked and transparent, with each person's name attached to their submissions.

---

## Recommended: GitHub Issues + GitHub Projects (Free, Already Connected)

Your repo `otpayt02/koa-website` is already on GitHub, and GitHub Issues + Projects are **free for private repos**.

### How It Works for Your Team

| Feature | How to Use It |
|---------|---------------|
| Propose an idea | Team member opens a GitHub Issue with label `idea` |
| Propose a content change | Team member opens an Issue with label `content-change` |
| Respond to Oliver's questions | Oliver creates Issues with label `question`; team members comment |
| Message Oliver directly | Team member opens an Issue with label `message` and assigns @otpayt02 |
| Track who said what | Every Issue and comment shows the author's name and timestamp |
| Transparent history | All Issues are visible to all repo collaborators |
| Oliver approves/rejects | Oliver comments with ✅ Approved or ❌ Rejected and moves to a Project column |
| Approved ideas → SPEC | Oliver moves approved ideas from `IDEAS.md` to `docs/SPEC.md` |

### Setup Steps
1. Add team members as **collaborators** on the repo (Settings → Collaborators → Add people by GitHub username).
2. Create a **GitHub Project board** with columns: Ideas, Under Review, Approved, Rejected, Done.
3. Create **Issue labels**: `idea`, `content-change`, `question`, `message`, `approved`, `rejected`.
4. Create an **Issue template** (`.github/ISSUE_TEMPLATE/idea.md`) so team members get a form to fill out.
5. Pin a **welcome Issue** explaining how to use the system.

### Issue Template
See `.github/ISSUE_TEMPLATE/idea.md` in this repo.

### Pros
- Free, already connected, no new tool to learn.
- Full history and traceability — every comment is timestamped and attributed.
- Team members just need a free GitHub account.
- Oliver gets email notifications for every Issue and comment.
- Works on mobile via GitHub's app.

### Cons
- Team members need a GitHub account (free, but some may find it technical).
- Not a real-time chat — it's asynchronous (which is actually better for tracking).

---

## Alternative: Google Drive Shared Docs (Free, Simpler)

Since you have Google Drive connected, you can create a shared Google Drive folder with:

| Document | Purpose |
|----------|---------|
| KOA-Ideas.md (Google Doc) | Team members add ideas with their name |
| KOA-Questions.md (Google Doc) | Oliver posts questions, team responds |
| KOA-Content-Changes.md (Google Doc) | Proposed content changes with attribution |
| KOA-Meeting-Notes.md (Google Doc) | Running notes from discussions |

### Setup
1. Create a Google Drive folder named KOA Website Team.
2. Create the docs above and share with team members' emails (View → Comment → Edit as appropriate).
3. Use Google Docs' **suggesting mode** so changes are tracked with author names.
4. Oliver reviews suggestions and approves/rejects.

### Pros
- Very simple — everyone knows Google Docs.
- Suggesting mode shows who proposed what.
- Free.

### Cons
- Less structured than GitHub Issues.
- Harder to search and filter.
- No labels or status tracking.

---

## Alternative: GitHub Discussions (Free, Forum-Style)

GitHub Discussions (enable in repo Settings → Features → Discussions) gives you a forum where team members can post in categories like Ideas, Questions, Content Changes.

### Pros
- More conversational than Issues.
- Still free and tied to the repo.
- Threaded replies.

### Cons
- Less structured for tracking approval status.

---

## Recommendation

**Use GitHub Issues + Projects as the primary system**, because:
1. It's free and already connected.
2. Every proposal is tracked with author, date, and status.
3. Oliver gets notified and can approve/reject in one place.
4. Approved ideas move cleanly to `docs/SPEC.md` and `IDEAS.md` stays as the parking lot.

**Supplement with a shared Google Drive folder** for team members who find GitHub too technical — they can write their ideas in a Google Doc and Oliver transfers them to GitHub Issues.

---

## Team Workflow Summary

```
Team Member → Opens GitHub Issue (idea/content-change/question/message)
                    ↓
              Oliver gets notified (email)
                    ↓
              Oliver reviews → comments → labels (approved/rejected)
                    ↓
        ✅ Approved → Move to docs/SPEC.md + remove from IDEAS.md
        ❌ Rejected → Label rejected, close Issue
        ⏸ Deferred → Stays in IDEAS.md
```

---

## Access Control

- **Oliver (otpayt02):** Full admin — can approve, reject, edit, merge.
- **Team members (collaborators):** Can open Issues, comment, and edit `IDEAS.md` via PR. Cannot merge to main without Oliver's review.
- **Public:** If repo goes public, anyone can open Issues (optional, toggle in settings).

---

## Changelog

### 2026-08-09
- Created `TEAM-WORKSPACE.md` with free collaboration options analysis.
- Recommended GitHub Issues + Projects as primary system, Google Drive as supplement.
