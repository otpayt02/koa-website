# KOA Website — Audit & Build Plan v4

**Repository:** otpayt02/koa-website
**Author:** Oliver P (IT Manager / Web Lead)
**Date:** 2026-08-09
**Status:** DRAFT — awaiting Codex kickoff
**Supersedes:** design-qa.md (v1), SPEC v2 (draft), SPEC v3

---

## 0. What Changed in v4

v4 promotes several ideas from `docs/IDEAS.md` to the committed spec, because Oliver has confirmed they are core to the nonprofit's mission. The community lexicon, community audio uploads, translation/interpretation services, and community contribution features are now committed — not just proposed.

**Promoted from IDEAS.md to SPEC (now committed):**
- Community-moderated Karen dictionary (scraped + community-uploaded)
- Community audio uploads for speech-to-text and text-to-speech training
- Karen large language model development (hearing + understanding spoken Karen)
- Synonyms, antonyms, and multiple translation variants per word
- Approved translator/interpreter directory and service offerings
- Court interpretation partnership (addressing the Karen interpreter shortage)
- Community feature requests, service suggestions, and collaboration requests
- Donations and contributions portal

**Still in IDEAS.md (not yet approved):**
- Karen music section
- Podcast
- Karen AI education portal (as a standalone feature)
- Karen language keyboard (as a standalone feature)

---

## 1. Purpose & Scope

This spec covers the **committed, approved** build for the Karen Organization of America (KOA) website. It is a bilingual (S'gaw Karen / English), community-driven, nonprofit website that serves the Karen community in the United States.

**What this spec commits to:**
1. Bilingual Karen/English rendering on every page.
2. A clean, mobile-first, accessible, SEO-optimized website.
3. A community-moderated Karen dictionary with scraped and community-uploaded definitions, translations, synonyms, antonyms, and audio.
4. Community audio uploads for training speech-to-text and text-to-speech models for Karen language.
5. A Karen large language model development pipeline (understanding spoken Karen).
6. An approved translator/interpreter directory with service offerings.
7. Court interpretation partnership to address the Karen interpreter shortage.
8. Community contribution features: feature requests, service suggestions, collaboration requests, donations.
9. Full observability and logging of every request, change, decision, and conversation.
10. A team collaboration system for proposing and reviewing content.

---

## 2. Existing Repo Inventory (Audited 2026-08-09)

| Path | Purpose | Status |
|------|---------|--------|
| `app/layout.tsx` | Root layout | Minimal — needs bilingual shell |
| `app/page.tsx` | Home page | Stub (111 bytes) |
| `app/globals.css` | Global styles | 146 bytes — needs design system |
| `app/chatgpt-auth.ts` | ChatGPT auth helper | Present — reuse for AI features |
| `db/` | Database layer | Drizzle config present |
| `drizzle/` + `drizzle.config.ts` | Migrations | Present — extend for lexicon + audio |
| `worker/` | Background worker | Present — use for training pipeline |
| `public/` | Static assets | Empty — add fonts, media, audio |
| `tests/` + `qa/` | Test + QA | Present — expand |
| `examples/` | Examples | Present — add translation pairs |
| `build/` | Build output | Present |
| `package.json` | Deps | Next + Drizzle + Vite |
| `design-qa.md` | v1 audit | Superseded — move to `docs/history/` |

**Stack:** Next.js (App Router), TypeScript, Drizzle ORM, Vite, ESLint, PostCSS.

---

## 3. Page Architecture (14 Committed Pages + API Routes)

### Core Content Pages
1. **Home (`/`)** — Hero, mission, bilingual intro, featured programs, latest dictionary entries, community spotlight, CTA.
2. **About (`/about`)** — Org history, mission, vision, leadership bios, admin team, partners, annual report.
3. **Programs & Services (`/services`)** — All KOA services: education, immigration support, health access, workforce dev, translation/interpretation services.
4. **Community (`/community`)** — Stories, events calendar, volunteer portal, community board, feature requests, service suggestions.
5. **Contact (`/contact`)** — Form, offices, staff directory, social links, collaboration requests.

### Karen Dictionary & Language
6. **Karen Dictionary (`/dictionary`)** — Searchable bilingual dictionary; browse by letter/category; community-uploaded definitions; multiple translations per word; synonyms and antonyms; audio pronunciation; scraped from community resources.
7. **Dictionary Entry Detail (`/dictionary/[id]`)** — Word/phrase, definitions, translations (multiple variants), synonyms, antonyms, examples, etymology, contributor, edit history, audio, related terms, community discussion.
8. **Contribute (`/contribute`)** — Upload definitions, translations, audio, sentences; side-by-side editor; review queue status; contributor dashboard; audio recording interface.

### Translation & Interpretation Services
9. **Translation Services (`/translation`)** — Translation and interpretation service offerings; approved translator/interpreter directory; booking/request form; court interpretation partnership info; pricing (free for community, sliding scale for orgs).

### Community & Contributions
10. **Contribute & Collaborate (`/collaborate`)** — Community feature requests (what features/services they want on the website), service suggestions (what the organization should provide), collaboration requests (partner with KOA), donations and contributions.
11. **Contributor Profile (`/u/[username]`)** — Public profile, contributions, badges, languages spoken, translator/interpreter credentials.

### System & Governance
12. **Admin Dashboard (`/admin`)** — Moderation queue, user management, dictionary review, training data review, logs viewer, feature flags.
13. **Changelog & Decisions Log (`/changelog`)** — Public-facing history of decisions, spec versions, and major changes.
14. **Community Board (`/community/board`)** — Community-driven suggestions, requests, and discussions (moderated).

### API / System Routes
- `/api/dictionary` — CRUD for dictionary entries
- `/api/dictionary/[id]` — Entry detail, versions, discussion
- `/api/contribute` — Upload definitions, translations, audio
- `/api/audio/upload` — Audio file upload for speech training
- `/api/translation/request` — Request translation/interpretation service
- `/api/translation/interpreters` — Interpreter directory
- `/api/collaborate` — Feature requests, service suggestions, collaboration requests
- `/api/donations` — Donation processing
- `/api/logs` — Query logs (admin only)
- `/api/contact` — Contact form submission
- `/api/training/pair` — Generate synthetic training pair from dictionary data
- `/api/training/feedback` — Human feedback on AI output

---

## 4. Bilingual Architecture

### 4.1 Language Toggle
- Global language context (`LanguageProvider`) with `en` and `karen` (S'gaw).
- Every page renders in both languages; toggle in header persists to cookie + localStorage.
- URL strategy: `/en/services` and `/karen/services` via `[lang]` route segment.

### 4.2 Translation Pipeline
- **Content translations** stored in DB as `{ en: string, karen: string }` pairs per content block.
- **UI strings** in `messages/en.json` and `messages/karen.json`.
- **Dictionary translations** support multiple variants per word (different valid translations, dialect variations, contextual meanings).
- **Community review:** Translations are reviewed by approved translators/interpreters before publishing.

---

## 5. Community-Moderated Karen Dictionary

### 5.1 Overview
The dictionary is the heart of the website. It is a community-driven, moderated, living dictionary for the S'gaw Karen language [web:43]. It combines:
- **Scraped definitions** from existing community resources (with provenance tracking).
- **Community-uploaded definitions** (moderated by approved reviewers).
- **Multiple translations** per word (different valid English translations).
- **Synonyms and antonyms** for each entry.
- **Audio pronunciation** for each entry (community-recorded).
- **Example sentences** (bilingual).
- **Edit history** (versioned, attributed).
- **Community discussion** per entry.

### 5.2 Roles
| Role | Permissions |
|------|------------|
| Public | Browse, search, view entries, listen to audio |
| Contributor | Submit definitions, translations, audio, examples |
| Reviewer | Review and approve/reject submissions |
| Approved Translator/Interpreter | All Contributor + Reviewer permissions + listed in directory |
| Moderator | All permissions + manage disputes, flag content, ban users |
| Admin (Oliver) | Full control |

### 5.3 Moderation Workflow
```
Contributor submits definition/translation/audio
     ↓
Enters review queue (status: pending)
     ↓
Reviewer approves / rejects / requests changes
     ↓
✅ Approved → Published (status: approved, attributed to contributor + reviewer)
❌ Rejected → Returned to contributor with feedback
🔄 Changes requested → Contributor revises → resubmits
```

### 5.4 Scraping Integration
- Scrape existing Karen dictionary resources (with permission and attribution).
- Each scraped entry is logged with: source URL, scrape date, content hash, raw content, processed content.
- Scraped entries enter the review queue like community submissions (they are not auto-published).
- Provenance is tracked for legal and ethical purposes.

### 5.5 Data Model (Dictionary Entry)
```json
{
  "id": "entry_001",
  "word": "မဲ",
  "translations": [
    { "lang": "en", "text": "mother", "context": "general", "contributor": "user_123", "status": "approved" },
    { "lang": "en", "text": "mom", "context": "informal", "contributor": "user_456", "status": "approved" }
  ],
  "synonyms": ["အမဲ"],
  "antonyms": [],
  "examples": [
    { "karen": "မဲ ဒီတာ ကြိုက်တယ်", "en": "Mom likes this", "contributor": "user_123" }
  ],
  "audio": [
    { "url": "audio/entry_001_user_789.mp3", "contributor": "user_789", "duration": 2.3 }
  ],
  "etymology": "...",
  "part_of_speech": "noun",
  "category": "family",
  "source": "community|scraped",
  "provenance": { "source_url": "...", "scrape_date": "...", "content_hash": "..." },
  "version": 3,
  "edit_history": [
    { "version": 1, "editor": "user_123", "date": "2026-08-01", "change": "Created entry" },
    { "version": 2, "editor": "user_456", "date": "2026-08-05", "change": "Added informal translation" },
    { "version": 3, "editor": "user_789", "date": "2026-08-09", "change": "Added audio" }
  ],
  "status": "approved",
  "created_at": "2026-08-01T10:00:00Z",
  "updated_at": "2026-08-09T22:00:00Z"
}
```

---

## 6. Community Audio Uploads & Karen LLM Development

### 6.1 Overview
Community members upload audio recordings of Karen speech. This audio is used to train:
- **Speech-to-text (STT)** models that understand spoken Karen.
- **Text-to-speech (TTS)** models that generate spoken Karen.
- **Karen large language model (LLM)** that understands Karen language and can converse.

### 6.2 Audio Collection
- Contributors record themselves speaking Karen words, sentences, or paragraphs.
- Each audio upload is paired with a text transcription (creating training pairs).
- Audio is validated by reviewers (is it clear? is the transcription accurate?).
- Inspired by Mozilla Common Voice's community audio collection model [web:48].

### 6.3 Training Pipeline
```
Community member records audio + provides transcription
     ↓
Reviewer validates audio quality + transcription accuracy
     ↓
Validated pair enters training dataset
     ↓
Worker job trains/fine-tunes STT, TTS, and LLM models
     ↓
Improved models deployed → better website features
     ↓
Community uses improved features → generates more data → loop repeats
```

### 6.4 Data Model (Audio Training Pair)
```json
{
  "id": "audio_001",
  "audio_url": "audio/audio_001.mp3",
  "transcription": "မဲ ဒီတာ ကြိုက်တယ်",
  "translation": "Mom likes this",
  "contributor": "user_789",
  "duration_seconds": 2.3,
  "language": "karen",
  "dialect": "sgaw",
  "quality": "validated",
  "reviewer": "user_100",
  "status": "approved",
  "created_at": "2026-08-09T22:00:00Z"
}
```

### 6.5 Model Training
- Minimum 100 hours of audio for initial STT model training [web:41].
- Models trained via worker job (using existing `worker/` directory).
- Model versions tracked with metrics (WER for STT, BLEU/COMET for translation).
- Every training run is logged with dataset size, model version, metrics, and date.

---

## 7. Translation & Interpretation Services

### 7.1 Overview
KOA offers translation and interpretation services to the Karen community. Approved translators and interpreters are listed in a directory. Services include:
- Document translation (Karen ↔ English)
- In-person interpretation (medical, legal, community events)
- Phone/video interpretation
- Court interpretation (partnering with courts that lack Karen interpreters)

### 7.2 Court Interpretation Partnership
- There is a documented shortage of court interpreters nationwide, especially for less-common languages like Karen [web:42][web:49][web:54].
- KOA can partner with courts to provide Karen interpretation services.
- Public defenders often cannot find Karen interpreters [web:13].
- This service is listed on the Translation Services page with a request form for courts and public defenders.

### 7.3 Interpreter Directory
- Approved translators/interpreters have profiles with: name, languages, certifications, availability, service areas, contact info.
- Community members can search and request interpreters.
- Interpreters can be rated by community members (moderated reviews).

### 7.4 Data Model (Interpreter)
```json
{
  "id": "interp_001",
  "user_id": "user_100",
  "name": "Saw Doe",
  "languages": ["karen", "english"],
  "dialects": ["sgaw"],
  "certifications": ["court_interpreter", "medical_interpreter"],
  "service_types": ["in_person", "phone", "video", "court"],
  "service_areas": ["louisville_ky", "statewide_ky"],
  "availability": "weekdays_9to5",
  "bio": "...",
  "rating": 4.8,
  "status": "active"
}
```

---

## 8. Community Contribution Features

### 8.1 Feature Requests
- Community members can request features/services they want on the website.
- Submitted via `/collaborate` page or GitHub Issues (see `docs/TEAM-WORKSPACE.md`).
- Tracked with status: Proposed → Under Review → Approved → In Progress → Done.

### 8.2 Service Suggestions
- Community members can suggest services the organization should provide.
- Same submission flow as feature requests.

### 8.3 Collaboration Requests
- Organizations or individuals can propose partnerships or collaborations.
- Submitted via `/collaborate` or `/contact` page.

### 8.4 Donations & Contributions
- Donation portal on the website.
- One-time and recurring donations.
- Donor attribution (optional — anonymous donations allowed).
- Donation receipts for tax purposes (nonprofit).
- Log every donation with donor, amount, date, purpose (if restricted).

---

## 9. Observability & Logging System

### 9.1 What Gets Logged
- Every page request (method, path, status, user, timestamp, referrer).
- Every API call (input, output, latency, user).
- Every dictionary entry creation, edit, approval, rejection.
- Every audio upload, validation, training pair creation.
- Every translation/interpretation request and assignment.
- Every content change (who, what, when, before, after).
- Every admin decision (moderation, user role change, feature flag toggle).
- Every donation (donor, amount, date, purpose).
- Every spec/decision change (appended to `docs/decisions/`).
- Every conversation and planning session (appended to `docs/conversations/`).

### 9.2 Log Storage
- **App logs:** structured JSON to `logs/` directory (rotated daily).
- **DB logs:** `audit_log` table (user, action, entity, entity_id, before, after, timestamp).
- **Decision log:** `docs/decisions/` — one markdown file per decision (ADR-style).
- **Conversation log:** `docs/conversations/` — timestamped transcripts of planning sessions.
- **Version history:** `docs/history/` — snapshots of spec files with dates.
- **Ideas log:** `docs/IDEAS.md` — all unapproved features with attribution and status.

### 9.3 Log Access
- `/admin/logs` — searchable, filterable admin UI.
- `/changelog` — public-facing summary of decisions and major changes.
- API: `/api/logs` (admin-only, paginated, exportable to CSV/JSON).

### 9.4 Why
- **Legal:** Provenance for dictionary entries, audio ownership, translation rights, donation records.
- **Engineering:** Debugging, performance, regression tracking.
- **Educational:** Show contributors how the system evolves.
- **Observability:** System health, abuse detection, training data quality.
- **Locus of control:** Clear audit trail of who changed what and why.
- **Fun:** A living history of the project's growth.

---

## 10. Team Collaboration System

### 10.1 Primary System: GitHub Issues + Projects
- Free for private repos.
- Team members open Issues with labels: `idea`, `content-change`, `question`, `message`.
- Every Issue shows author name and timestamp.
- Oliver gets email notifications and approves/rejects in comments.
- See `docs/TEAM-WORKSPACE.md` for full setup instructions.

### 10.2 Community Contribution
- Community members contribute via the website (`/contribute`, `/collaborate`).
- Submissions enter review queues for moderators.
- GitHub Issues are for the internal team; the website forms are for the community.

---

## 11. SEO Strategy

### 11.1 Keyword Approach
- Primary: Karen Organization of America, KOA America, Karen community USA.
- Secondary: Karen dictionary, Karen translation, Karen interpreter, Karen language resources.
- Long-tail: how to say [X] in Karen, Karen interpreter near me, Karen translation services.
- Competitor note: Kanye West dominates Kanye — use KOA and Karen Organization consistently.

### 11.2 Technical SEO
- `sitemap.xml` auto-generated for all pages, both languages.
- `robots.txt` allowing crawl, disallow `/admin`.
- Per-page title, meta description, canonical URL, hreflang for en/karen.
- Schema.org markup: Organization, WebSite, EducationalOrganization, BreadcrumbList.
- Every dictionary entry is an indexable page with bilingual title and content.
- Fast load: static generation where possible, image optimization, CDN.

---

## 12. Security & Compliance

- Auth: NextAuth or custom (reuse `chatgpt-auth.ts` patterns).
- Roles: public, contributor, reviewer, approved_translator, moderator, admin.
- Rate limiting on `/api/audio/upload`, `/api/contribute`, `/api/translation/request`.
- Content moderation: profanity filter, human review queue, community flagging.
- Privacy: GDPR/CCPA notice, cookie consent, data deletion on request.
- Audio rights: contributors grant KOA a license to use audio for training (consent required at upload).
- Donation compliance: nonprofit tax receipts, transparent donation logging.
- Backups: daily DB backup, weekly full repo backup.
- Secrets: never in repo; use environment variables (`.env.local`).

---

## 13. Build Phases

### Phase 1 — Foundation (Week 1-2)
- Bilingual shell: `LanguageProvider`, header toggle, `messages/` files.
- Design system: colors, typography (Karen font support), components.
- DB schema: `users`, `dictionary_entries`, `dictionary_versions`, `audio_pairs`, `interpreters`, `content_translations`, `audit_log`, `donations`, `feature_requests`.
- Logging middleware: request logger, audit logger.
- Docs structure: `docs/` folder, `CHANGELOG.md`, `IDEAS.md`, `TEAM-WORKSPACE.md`.
- GitHub Issue template for team proposals.

### Phase 2 — Dictionary & Community (Week 3-5)
- `/dictionary` browse + search + detail pages.
- `/contribute` upload definitions, translations, audio, examples.
- Dictionary moderation queue in `/admin`.
- Audio upload API (`/api/audio/upload`).
- Contributor profiles (`/u/[username]`).

### Phase 3 — Translation & Interpretation (Week 6-7)
- `/translation` service page with interpreter directory.
- Translation/interpretation request form.
- Court interpretation partnership info.
- Interpreter profile pages.

### Phase 4 — Community & Contributions (Week 8-9)
- `/collaborate` feature requests, service suggestions, collaboration requests.
- `/community/board` community board (moderated).
- Donations portal (`/api/donations`).
- Community stories and events.

### Phase 5 — AI Training Pipeline (Week 10-12)
- Audio training pair storage and export.
- Worker job for STT/TTS/LLM fine-tuning.
- Feedback API (`/api/training/feedback`).
- Admin dashboard for training data review.
- Model version tracking and metrics logging.

### Phase 6 — Polish & Launch (Week 13-14)
- SEO pass: meta, sitemap, schema, hreflang.
- Accessibility audit (WCAG 2.1 AA).
- Performance audit (Lighthouse > 90).
- Security review.
- Public changelog + decision log populated.
- Soft launch, gather feedback, iterate.

### Future Phases (When Ideas Are Approved)
- Features in `docs/IDEAS.md` get their own phase when approved.

---

## 14. Open Questions (Grilling — Answer These)

Answer in `docs/answers.md` so Codex has clarity.

### Language & Dictionary
1. Which Karen dialect? S'gaw, Pwo, or both?
2. What existing Karen dictionary resources will you scrape? Do you have permission?
3. How will you handle words with no direct English equivalent?
4. Who are the approved translators/interpreters? How many, and availability?
5. What's the quality bar for approved dictionary entries vs pending?
6. How do you verify someone is a Karen speaker before approving their submissions?
7. Will you support multiple dialects within the same dictionary, or separate dictionaries?

### Audio & AI Training
8. What model are you fine-tuning for STT? Open-source (Whisper, Coqui) or API-based?
9. What model for TTS?
10. What Karen LLM are you building? Fine-tuning an existing model or from scratch?
11. Where does training run? Local, cloud GPU, or API?
12. How do you prevent model collapse from feedback loops?
13. What's the minimum dataset size before the first STT/TTS fine-tune? (Google requires 100 hours minimum.)
14. How do you measure translation quality (BLEU, COMET, human eval)?
15. What consent do contributors give when uploading audio? (License terms.)

### Translation & Interpretation
16. Are your translators/interpreters certified? Through which program?
17. Which courts have you contacted about the interpreter shortage?
18. What's the pricing model? Free for community, paid for orgs?
19. How do you handle liability for court interpretation?
20. Do you have malpractice insurance for interpreters?

### Community & Contributions
21. Who are the moderators? How are they trained?
22. What's the dispute resolution process for dictionary entries?
23. How do you handle harmful or incorrect submissions?
24. What's the donor management system? (Stripe, PayPal, custom?)
25. Are donations tax-deductible? Do you have 501(c)(3) status?

### Content & Sources
26. Where are the leadership bios and program details coming from?
27. Who writes the content for each page?
28. Do you have photos and media for the site?
29. What's the org's mission statement and tagline?
30. What services does KOA currently provide?

### Technical & Ops
31. Where is this hosted? Vercel, Cloudflare, self-hosted?
32. What's the database? (Drizzle supports Postgres, SQLite, MySQL — which?)
33. Do you have a Karen Unicode font that renders correctly on all browsers?
34. What's the backup and disaster recovery plan?
35. Who has admin access? What's the access revocation process?

### Team & Workflow
36. Who are the team members? What are their roles?
37. How many people will have GitHub collaborator access?
38. How quickly do you expect to review and respond to proposals?
39. Who is the backup if you're unavailable?

### SEO & Growth
40. What's the target for comes up first? Karen Organization of America?
41. Are you targeting local SEO (specific US cities with Karen populations)?
42. Do you have Google Search Console set up?
43. How will you measure success (traffic, dictionary entries, audio hours, community members)?

### Legal & Compliance
44. Who owns the dictionary entries? Public domain, CC, or KOA copyright?
45. Who owns the audio recordings? What license do contributors grant?
46. Do you need a privacy policy and terms of service drafted?
47. How do you handle data deletion requests?
48. Are there any grants or funding that require reporting?
49. What happens to the data if KOA shuts down?
50. Do you have a fiscal sponsor or are you an independent 501(c)(3)?

---

## 15. File Structure (Proposed)

```
koa-website/
├── app/
│   ├── [lang]/
│   │   ├── about/page.tsx
│   │   ├── services/page.tsx
│   │   ├── community/
│   │   │   ├── page.tsx
│   │   │   └── board/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── dictionary/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── contribute/page.tsx
│   │   ├── translation/page.tsx
│   │   ├── collaborate/page.tsx
│   │   ├── changelog/page.tsx
│   │   └── u/[username]/page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   └── logs/page.tsx
│   ├── api/
│   │   ├── dictionary/route.ts
│   │   ├── dictionary/[id]/route.ts
│   │   ├── contribute/route.ts
│   │   ├── audio/upload/route.ts
│   │   ├── translation/request/route.ts
│   │   ├── translation/interpreters/route.ts
│   │   ├── collaborate/route.ts
│   │   ├── donations/route.ts
│   │   ├── contact/route.ts
│   │   ├── training/pair/route.ts
│   │   ├── training/feedback/route.ts
│   │   └── logs/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── LanguageToggle.tsx
│   ├── DictionarySearch.tsx
│   ├── DictionaryEntry.tsx
│   ├── AudioRecorder.tsx
│   ├── AudioPlayer.tsx
│   ├── ContributionForm.tsx
│   ├── ReviewQueue.tsx
│   ├── InterpreterCard.tsx
│   ├── DonationForm.tsx
│   ├── FeatureRequestForm.tsx
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
│   ├── audit-logger.ts
│   ├── training.ts
│   └── moderation.ts
├── messages/
│   ├── en.json
│   └── karen.json
├── worker/
│   ├── training-worker.ts
│   └── scrape-worker.ts
├── public/
│   ├── fonts/
│   └── media/
│       └── audio/
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
│   │   ├── 0003-separate-approved-from-ideas.md
│   │   └── 0004-community-dictionary-and-audio-training.md
│   ├── conversations/
│   │   ├── 2026-08-09-planning-v3.md
│   │   └── 2026-08-09-planning-v4.md
│   └── history/
│       └── v1-design-qa.md
├── .github/
│   └── ISSUE_TEMPLATE/
│       └── idea.md
├── logs/
├── tests/
├── qa/
├── examples/
│   ├── translation-pairs.json
│   └── dictionary-entries.json
└── .env.example
```

---

## 16. Codex Prompt

Paste this into Codex to start implementation:

---

**CODEX PROMPT — KOA Website Build (v4)**

You are working on the `otpayt02/koa-website` repository — a bilingual (S'gaw Karen / English), community-driven, nonprofit website for the Karen Organization of America. Read `docs/SPEC.md` for the full specification before doing anything else. Also read `docs/IDEAS.md` to see what is NOT yet approved (do not implement anything from IDEAS.md).

Your job: implement Phase 1 (Foundation) of the build plan in §13 of the spec. Specifically:

1. **Bilingual shell:** Create a `LanguageProvider` context supporting `en` and `karen` (S'gaw). Add a language toggle to the header. Create `messages/en.json` and `messages/karen.json` with UI strings. Use a `[lang]` route segment under `app/`.

2. **Design system:** Set up `globals.css` with a color palette, typography stack (including a Karen Unicode font loaded from `public/fonts/`), spacing scale, and base components (Button, Card, Input, Header, Footer, LanguageToggle, AudioRecorder).

3. **Database schema:** In `db/schema.ts`, define tables: `users`, `dictionary_entries`, `dictionary_versions`, `audio_pairs`, `interpreters`, `content_translations`, `audit_log`, `donations`, `feature_requests`. Use Drizzle ORM. Generate a migration in `drizzle/`.

4. **Logging middleware:** Create `lib/logger.ts` with structured JSON logging. Add Next.js middleware to log every request (method, path, status, user, timestamp, referrer). Create `lib/audit-logger.ts` for DB-backed audit logs (who, what, when, before, after).

5. **Documentation structure:** Create the `docs/` folder structure per §15 of the spec. Move `design-qa.md` to `docs/history/v1-design-qa.md`. Create `docs/CHANGELOG.md` with an initial entry. Create `docs/decisions/0001-bilingual-architecture.md` as an ADR. Ensure `docs/IDEAS.md` and `docs/TEAM-WORKSPACE.md` already exist (they do).

6. **GitHub Issue template:** Create `.github/ISSUE_TEMPLATE/idea.md` so team members can propose ideas via a form.

7. **Logging requirement:** For every file you create or modify, append an entry to `docs/CHANGELOG.md` with: date, file path, what changed, and why. Also append a decision record to `docs/decisions/` for any architectural choice you make. Keep `docs/conversations/` updated with a transcript of this session.

8. **Do not** implement Phase 2-6 yet. Do not implement anything from `docs/IDEAS.md`. Focus only on Phase 1. Ask questions in `docs/answers-needed.md` if the spec is ambiguous.

Constraints:
- TypeScript strict mode.
- Next.js App Router.
- Drizzle ORM (keep existing config).
- Mobile-first, responsive.
- WCAG 2.1 AA accessibility.
- Every page must render in both English and Karen.
- Log everything you do.

---

## 17. Should You Give Codex the Whole Document?

**Yes.** Give Codex the entire `docs/SPEC.md` AND `docs/IDEAS.md`. The spec tells Codex what to build; the ideas file tells Codex what NOT to build yet. Then give Codex the prompt in §16 as the instruction for what to do first.

For each subsequent phase, give Codex a new prompt referencing the phase in §13. When an idea in `IDEAS.md` is approved, move it to `SPEC.md`, add a build phase, and prompt Codex accordingly.

---

## 18. Decision Log Format (ADR)

Every architectural decision gets a file in `docs/decisions/`.

---

## 19. Changelog Format

`docs/CHANGELOG.md` tracks all changes with date, file, what changed, and why.

---

## 20. Conversation Log Format

`docs/conversations/` stores timestamped planning session transcripts.

---

## 21. Design Direction (Added 2026-08-26)

### Navigation Banner
- **Collapsible banner** with 10 tabs split left and right of center logo
- **Left tabs:** Home, Community, Dictionary, Programs, Contribute
- **Right tabs:** Events, Translation, Culture, History, Beta (coming soon)
- **Three states:** seal (full-screen on page load), expanded (hover/scroll-top), collapsed (default)
- **Logo protrusion:** Circular protrusion when expanded, disappears when collapsed
- **Tab labels:** Full names when expanded, fade/blur to section numbers (01, 02, 03...) when collapsed
- **Mobile:** Long-press (400ms) = hover, same visual behavior
- **Accessibility:** WCAG touch targets (≥44px), keyboard navigable, screen reader friendly

### Tab Page Headers (Glyph Convergence)
- Each tab page opens with a **glyph convergence header**
- **Half the screen:** Small glyphs converging to form the Burmese numeral of that section (01, 02, 03...)
- **Other half:** Section description or overview
- **Responsive:** Adapts to portrait/landscape orientation
- **Background:** High-contrast typography against background images (may or may not be images)
- **Animation:** Smooth transitions, but not as cinematic as the hero/about pages

### Typography
- **Primary font:** Manrope (clean, modern, highly readable)
- **Serif font:** Bodoni Moda (for headlines, cinematic feel)
- **Myanmar font:** Noto Serif Myanmar (for Karen script, excellent rendering)
- **Monospace:** JetBrains Mono (for code, technical content)

### Color Palette
- **Primary:** Deep navy (#0a1929) — trust, stability
- **Accent:** Karen red (#c41e3a) — energy, passion, cultural significance
- **Secondary:** Gold (#d4af37) — warmth, value, tradition
- **Neutral:** Warm grays (#f5f5f5 to #2a2a2a) — readability, contrast
- **Success:** Forest green (#2d6a4f) — growth, community

### Donation Integration
- **Header:** Subtle "Donate" button in navigation banner (right side, near language toggle)
- **Footer:** "Support KOA's mission" section with donation button on every page
- **Contextual:** Donation CTAs in relevant sections (dictionary, AI, translation, community)
- **Donation page:** Clear breakdown of where money goes (40% language preservation, 30% community services, 20% technology, 10% operations)
- **Design principle:** Never annoying, always present, easy to say yes

### Coming Soon Tab
- **10th tab** is "Beta" or "Coming Soon" with red accent color
- Links to AI landing page and beta signup
- Prominent but not overwhelming
- Communicates: "We're building something special, join us early"

---

**End of Spec v4.**
