# KOA Website — Audit & Build Plan v3

**Repository:** otpayt02/koa-website
**Author:** Oliver P (IT Manager / Web Lead)
**Date:** 2026-08-09
**Status:** DRAFT — awaiting Codex kickoff
**Supersedes:** design-qa.md (v1), SPEC v2 (draft)

---

## 0. What Changed in v3

v3 separates **approved, committed features** from **unapproved ideas**. This file contains only what has been agreed upon as part of the final website. All unapproved, in-progress, unfinished, or unverified features live in `docs/IDEAS.md`.

**New in v3:**
- `docs/IDEAS.md` — parking lot for all unapproved ideas, with attribution and status.
- `docs/TEAM-WORKSPACE.md` — free team collaboration system using GitHub Issues + Projects.
- Removed recursive AI training loop, community lexicon, Karen music, podcast, development board, AI education portal, and scrape project from the committed build — they are now in `IDEAS.md` until approved.
- Added team collaboration workflow as part of the project structure.

---

## 1. Purpose & Scope

This spec covers the **committed, approved** build for the Karen Organization of America (KOA) website. It is a bilingual (S'gaw Karen / English) website that serves the Karen community in the United States with information, programs, and services.

**What this spec commits to:**
- Bilingual Karen/English rendering on every page.
- A clean, mobile-first, accessible, SEO-optimized website.
- Full observability and logging of every request, change, decision, and conversation.
- A team collaboration system for proposing and reviewing content.

**What this spec does NOT commit to (see `docs/IDEAS.md`):**
- Recursive AI training loop
- Community-run lexicon
- Karen AI language agents
- Karen music section
- Podcast
- Development opportunities board
- Karen AI education portal
- Scrape project integration
- Karen language keyboard

These features may be added later when Oliver approves them and they move from `IDEAS.md` to this spec.

---

## 2. Existing Repo Inventory (Audited 2026-08-09)

| Path | Purpose | Status |
|------|---------|--------|
| `app/layout.tsx` | Root layout | Minimal — needs bilingual shell |
| `app/page.tsx` | Home page | Stub (111 bytes) |
| `app/globals.css` | Global styles | 146 bytes — needs design system |
| `app/chatgpt-auth.ts` | ChatGPT auth helper | Present — reuse if AI features approved |
| `db/` | Database layer | Drizzle config present |
| `drizzle/` + `drizzle.config.ts` | Migrations | Present — extend as needed |
| `worker/` | Background worker | Present — use if training pipeline approved |
| `public/` | Static assets | Empty — add fonts, media |
| `tests/` + `qa/` | Test + QA | Present — expand |
| `examples/` | Examples | Present |
| `build/` | Build output | Present |
| `package.json` | Deps | Next + Drizzle + Vite |
| `design-qa.md` | v1 audit | Superseded — move to `docs/history/` |

**Stack:** Next.js (App Router), TypeScript, Drizzle ORM, Vite, ESLint, PostCSS.

---

## 3. Page Architecture (Committed Pages)

### Core Content Pages
1. **Home (`/`)** — Hero, mission, bilingual intro, featured programs, CTA.
2. **About (`/about`)** — Org history, mission, vision, leadership bios, admin team, partners.
3. **Programs & Services (`/services`)** — All KOA services: education, immigration support, health access, workforce dev.
4. **Community (`/community`)** — Stories, events calendar, volunteer portal.
5. **Contact (`/contact`)** — Form, offices, staff directory, social links.

### System & Governance
6. **Admin Dashboard (`/admin`)** — Content management, user management, logs viewer, feature flags.
7. **Changelog & Decisions Log (`/changelog`)** — Public-facing history of decisions, spec versions, and major changes.

### API / System Routes
- `/api/logs` — query logs (admin only)
- `/api/contact` — contact form submission

**Note:** Pages for lexicon, translate, contribute, AI education, music, opportunities, and podcast are NOT committed. They live in `docs/IDEAS.md` until approved.

---

## 4. Bilingual Architecture

### 4.1 Language Toggle
- Global language context (`LanguageProvider`) with `en` and `karen` (S'gaw).
- Every page renders in both languages; toggle in header persists to cookie + localStorage.
- URL strategy: `/en/services` and `/karen/services` via `[lang]` route segment.

### 4.2 Translation Pipeline
- **Content translations** stored in DB as `{ en: string, karen: string }` pairs per content block.
- **UI strings** in `messages/en.json` and `messages/karen.json`.
- **Translation workflow:** Content is entered in one language, translated to the other, and reviewed by a native speaker before publishing.
- **Note:** The recursive AI training loop and automated translation are NOT committed (see `IDEAS.md`). Initial translations are human-produced.

---

## 5. Observability & Logging System

### 5.1 What Gets Logged
- Every page request (method, path, status, user, timestamp, referrer).
- Every API call (input, output, latency, user).
- Every content change (who, what, when, before, after).
- Every admin decision (user role change, feature flag toggle).
- Every spec/decision change (appended to `docs/decisions/`).
- Every conversation and planning session (appended to `docs/conversations/`).

### 5.2 Log Storage
- **App logs:** structured JSON to `logs/` directory (rotated daily).
- **DB logs:** `audit_log` table (user, action, entity, entity_id, before, after, timestamp).
- **Decision log:** `docs/decisions/` — one markdown file per decision (ADR-style).
- **Conversation log:** `docs/conversations/` — timestamped transcripts of planning sessions.
- **Version history:** `docs/history/` — snapshots of spec files with dates.
- **Ideas log:** `docs/IDEAS.md` — all unapproved features with attribution and status.

### 5.3 Log Access
- `/admin/logs` — searchable, filterable admin UI.
- `/changelog` — public-facing summary of decisions and major changes.
- API: `/api/logs` (admin-only, paginated, exportable to CSV/JSON).

### 5.4 Why
- **Legal:** Provenance for content ownership and moderation actions.
- **Engineering:** Debugging, performance, regression tracking.
- **Educational:** Show how the system evolves.
- **Observability:** System health and abuse detection.
- **Locus of control:** Clear audit trail of who changed what and why.
- **Fun:** A living history of the project's growth.

---

## 6. Team Collaboration System

### 6.1 Overview
Oliver runs the system. Team members propose ideas, content changes, and responses to Oliver's questions through a tracked, transparent interface.

### 6.2 Primary System: GitHub Issues + Projects
- **Free** for private repos.
- Team members open Issues with labels: `idea`, `content-change`, `question`, `message`.
- Every Issue shows author name and timestamp.
- Oliver gets email notifications and approves/rejects in comments.
- Approved ideas move from `docs/IDEAS.md` to `docs/SPEC.md`.
- See `docs/TEAM-WORKSPACE.md` for full setup instructions.

### 6.3 Supplement: Google Drive Shared Docs
- For team members who find GitHub too technical.
- Shared Google Docs with suggesting mode (tracks who proposed what).
- Oliver transfers proposals to GitHub Issues for formal tracking.

### 6.4 Workflow
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

## 7. SEO Strategy

### 7.1 Keyword Approach
- Primary: Karen Organization of America, KOA America, Karen community USA.
- Secondary: Karen community resources, Karen services, Karen organization.
- Competitor note: Kanye West dominates Kanye — use KOA and Karen Organization consistently.

### 7.2 Technical SEO
- `sitemap.xml` auto-generated for all pages, both languages.
- `robots.txt` allowing crawl, disallow `/admin`.
- Per-page title, meta description, canonical URL, hreflang for en/karen.
- Schema.org markup: Organization, WebSite, BreadcrumbList.
- Fast load: static generation where possible, image optimization, CDN.

---

## 8. Security & Compliance

- Auth: NextAuth or custom (reuse `chatgpt-auth.ts` patterns if needed).
- Roles: public, editor, admin.
- Rate limiting on `/api/contact`.
- Content moderation: human review for user-submitted content.
- Privacy: GDPR/CCPA notice, cookie consent, data deletion on request.
- Backups: daily DB backup, weekly full repo backup.
- Secrets: never in repo; use environment variables (`.env.local`).

---

## 9. Build Phases

### Phase 1 — Foundation (Week 1-2)
- Bilingual shell: LanguageProvider, header toggle, messages/ files.
- Design system: colors, typography (Karen font support), components.
- DB schema: users, content_translations, audit_log, versions.
- Logging middleware: request logger, audit logger.
- Docs structure: docs/ folder, CHANGELOG.md, IDEAS.md, TEAM-WORKSPACE.md.

### Phase 2 — Core Pages (Week 3-4)
- Home, About, Services, Community, Contact pages (bilingual).
- Contact form API.
- Admin dashboard (content management, logs viewer).

### Phase 3 — Polish & Launch (Week 5-6)
- SEO pass: meta, sitemap, schema, hreflang.
- Accessibility audit (WCAG 2.1 AA).
- Performance audit (Lighthouse > 90).
- Security review.
- Public changelog populated.
- Soft launch, gather feedback, iterate.

### Future Phases (When Ideas Are Approved)
- Features in `docs/IDEAS.md` get their own phase when approved.
- Each approved feature moves from IDEAS.md to SPEC.md and gets a build phase.

---

## 10. Open Questions (Grilling — Answer These)

Answer in `docs/answers.md` so Codex has clarity.

### Language & Translation
1. Which Karen dialect? S'gaw, Pwo, or both?
2. How will initial translations be produced? Human only, or AI-assisted?
3. How will you handle words with no direct English equivalent?
4. Who are the native-speaker reviewers? How many, and availability?
5. What's the quality bar for published translations?

### Content & Sources
6. Where are the leadership bios and program details coming from?
7. Who writes the content for each page?
8. Do you have photos and media for the site?
9. What's the org's mission statement and tagline?
10. What services does KOA currently provide?

### Technical & Ops
11. Where is this hosted? Vercel, Cloudflare, self-hosted?
12. What's the database? (Drizzle supports Postgres, SQLite, MySQL — which?)
13. Do you have a Karen Unicode font that renders correctly on all browsers?
14. What's the backup and disaster recovery plan?
15. Who has admin access? What's the access revocation process?

### Team & Workflow
16. Who are the team members? What are their roles?
17. How many people will have GitHub collaborator access?
18. Will team members use GitHub Issues, or do they need a simpler tool?
19. How quickly do you expect to review and respond to proposals?
20. Who is the backup if you're unavailable?

### SEO & Growth
21. What's the target for comes up first? Karen Organization of America?
22. Are you targeting local SEO (specific US cities with Karen populations)?
23. Do you have Google Search Console set up?
24. How will you measure success (traffic, engagement, community size)?

### Legal & Compliance
25. Who owns the content? KOA copyright?
26. Do you need a privacy policy and terms of service drafted?
27. How do you handle data deletion requests?
28. Are there any grants or funding that require reporting?

---

## 11. File Structure (Proposed)

```
koa-website/
├── app/
│   ├── [lang]/
│   │   ├── about/page.tsx
│   │   ├── services/page.tsx
│   │   ├── community/page.tsx
│   │   ├── contact/page.tsx
│   │   └── changelog/page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   └── logs/page.tsx
│   ├── api/
│   │   ├── contact/route.ts
│   │   └── logs/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── LanguageToggle.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── LogViewer.tsx
├── db/
│   ├── schema.ts
│   └── client.ts
├── drizzle/
│   └── *.sql.ts
├── lib/
│   ├── i18n.ts
│   ├── logger.ts
│   ├── auth.ts
│   └── audit-logger.ts
├── messages/
│   ├── en.json
│   └── karen.json
├── public/
│   ├── fonts/
│   └── media/
├── docs/
│   ├── SPEC.md
│   ├── IDEAS.md
│   ├── TEAM-WORKSPACE.md
│   ├── answers.md
│   ├── answers-needed.md
│   ├── CHANGELOG.md
│   ├── decisions/
│   │   ├── 0001-bilingual-architecture.md
│   │   ├── 0002-team-collaboration.md
│   │   └── 0003-separate-approved-from-ideas.md
│   ├── conversations/
│   │   └── 2026-08-09-planning-v3.md
│   └── history/
│       └── v1-design-qa.md
├── .github/
│   └── ISSUE_TEMPLATE/
│       └── idea.md
├── logs/
├── tests/
├── qa/
└── .env.example
```

---

## 12. Codex Prompt

Paste this into Codex to start implementation:

---

**CODEX PROMPT — KOA Website Build (v3)**

You are working on the `otpayt02/koa-website` repository — a bilingual (S'gaw Karen / English) website for the Karen Organization of America. Read `docs/SPEC.md` for the full specification before doing anything else. Also read `docs/IDEAS.md` to see what is NOT yet approved (do not implement anything from IDEAS.md).

Your job: implement Phase 1 (Foundation) of the build plan in §9 of the spec. Specifically:

1. **Bilingual shell:** Create a `LanguageProvider` context supporting `en` and `karen` (S'gaw). Add a language toggle to the header. Create `messages/en.json` and `messages/karen.json` with UI strings. Use a `[lang]` route segment under `app/`.

2. **Design system:** Set up `globals.css` with a color palette, typography stack (including a Karen Unicode font loaded from `public/fonts/`), spacing scale, and base components (Button, Card, Input, Header, Footer, LanguageToggle).

3. **Database schema:** In `db/schema.ts`, define tables: `users`, `content_translations`, `audit_log`, `versions`. Use Drizzle ORM. Generate a migration in `drizzle/`.

4. **Logging middleware:** Create `lib/logger.ts` with structured JSON logging. Add Next.js middleware to log every request (method, path, status, user, timestamp, referrer). Create `lib/audit-logger.ts` for DB-backed audit logs (who, what, when, before, after).

5. **Documentation structure:** Create the `docs/` folder structure per §11 of the spec. Move `design-qa.md` to `docs/history/v1-design-qa.md`. Create `docs/CHANGELOG.md` with an initial entry. Create `docs/decisions/0001-bilingual-architecture.md` as an ADR. Ensure `docs/IDEAS.md` and `docs/TEAM-WORKSPACE.md` already exist (they do).

6. **GitHub Issue template:** Create `.github/ISSUE_TEMPLATE/idea.md` so team members can propose ideas via a form.

7. **Logging requirement:** For every file you create or modify, append an entry to `docs/CHANGELOG.md` with: date, file path, what changed, and why. Also append a decision record to `docs/decisions/` for any architectural choice you make. Keep `docs/conversations/` updated with a transcript of this session.

8. **Do not** implement Phase 2-3 yet. Do not implement anything from `docs/IDEAS.md`. Focus only on Phase 1. Ask questions in `docs/answers-needed.md` if the spec is ambiguous.

Constraints:
- TypeScript strict mode.
- Next.js App Router.
- Drizzle ORM (keep existing config).
- Mobile-first, responsive.
- WCAG 2.1 AA accessibility.
- Every page must render in both English and Karen.
- Log everything you do.

---

## 13. Should You Give Codex the Whole Document?

**Yes.** Give Codex the entire `docs/SPEC.md` AND `docs/IDEAS.md`. The spec tells Codex what to build; the ideas file tells Codex what NOT to build yet. Then give Codex the prompt in §12 as the instruction for what to do first.

For each subsequent phase, give Codex a new prompt referencing the phase in §9. When an idea in `IDEAS.md` is approved, move it to `SPEC.md`, give it a build phase, and prompt Codex accordingly.

---

## 14. Decision Log Format (ADR)

Every architectural decision gets a file in `docs/decisions/`.

---

## 15. Changelog Format

`docs/CHANGELOG.md` tracks all changes with date, file, what changed, and why.

---

## 16. Conversation Log Format

`docs/conversations/` stores timestamped planning session transcripts.

---

**End of Spec v3.**
