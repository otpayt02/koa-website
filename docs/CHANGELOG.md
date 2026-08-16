# KOA Website — Changelog

All notable changes to this project are documented here.
Each entry includes: date, what changed, why, and who.

---

## 2026-08-10 (v4 implementation)

### QA and decision traceability

- `docs/answers.md` — added conservative answers to all 50 §14 questions, each marked unconfirmed and production-gated where authority or evidence is missing; enables prototype implementation without inventing KOA policy.
- `docs/answers-needed.md` — reduced the open questions to a production-readiness frontier and evidence checklist; makes source permissions, approved professionals, court contacts, donations, legal terms, and operational ownership explicit blockers rather than hidden assumptions.
- `docs/decisions/0005-assumption-gated-v4-implementation.md` — recorded the decision to implement all committed v4 surfaces while external, rights-sensitive, professional, and financial integrations fail closed pending approval.
- `docs/conversations/2026-08-10-implementation-v4.md` — logged Oliver's full-build instruction, materials reviewed, implementation interpretation, QA approach, and unresolved decisions for traceability.
- `docs/history/v1-design-qa.md` — copied the superseded root `design-qa.md` into the specified history location without deleting the source artifact.
- `tests/v4-contract.test.mjs` — added serverless Node contracts for all 14 bilingual pages, locale catalog parity, 12 API routes and handler exports, exclusion of standalone IDEAS routes, accessibility/SEO signals, and v4 schema/migration structure.
- `tests/rendered-bilingual.test.mjs` — added build-artifact HTML checks for English and Karen home pages without a development server; stale or absent builds are skipped with an actionable reason.
- `docs/CHANGELOG.md` — added this per-file implementation and verification record as required by SPEC §19.

### Product and platform implementation

- `app/[lang]/` — implemented the 14 committed bilingual pages plus the shared language shell, metadata, structured data, and safe admin surface.
- `app/api/` — added dictionary, contribution, audio, translation, interpreter, collaboration, contact, donation, logging, and training endpoints with validation and request IDs.
- `components/`, `messages/`, `app/globals.css` — added the reusable accessible UI system, English/S'gaw Karen catalogs, forms, review states, audio controls, and responsive visual language.
- `db/`, `drizzle/`, `lib/`, `worker/` — added the D1 schema and migration, audit/moderation/rate-limit helpers, R2 media handling, structured logging, and honest training export/feedback worker hooks.
- `app/sitemap.ts`, `app/robots.ts`, `proxy.ts` — added technical SEO, language alternates, crawler boundaries, and request observability for the Next 16 runtime.
- `.openai/hosting.json` — declared the DB and media bindings required by the committed persistence features.
- `package.json`, `.gitignore` — expanded the test command to cover all Node contracts and ignored TypeScript build metadata.

### Scope boundary

- Standalone Karen music, podcast, AI education portal, and Karen keyboard routes remain excluded because they are still unapproved in `docs/IDEAS.md`.
- Dictionary scraping, external model training, real interpreter/court service publication, donation processing/tax receipts, and unverified content publication remain production-gated until `docs/answers-needed.md` is resolved.

## 2026-08-09 (v4)

### Added
- `docs/SPEC.md` (v4) — expanded spec with community dictionary, audio training, translation/interpretation services, court interpretation partnership, community contribution features, and donations. 14 committed pages, 6 build phases, 50 grilling questions.
- `docs/decisions/0004-community-dictionary-and-audio-training.md` — ADR for community-moderated dictionary + audio training pipeline.
- `docs/conversations/2026-08-09-planning-v4.md` — transcript of v4 planning session.

### Promoted from IDEAS.md to SPEC (now committed)
- Community-moderated Karen dictionary (scraped + community-uploaded) → SPEC §5
- Community audio uploads for STT/TTS training → SPEC §6
- Karen LLM development (understanding spoken Karen) → SPEC §6
- Synonyms, antonyms, multiple translation variants → SPEC §5
- Approved translator/interpreter directory → SPEC §7
- Court interpretation partnership → SPEC §7
- Community feature requests, service suggestions, collaboration requests → SPEC §8
- Donations and contributions portal → SPEC §8
- Recursive AI training loop (now part of dictionary + audio pipeline) → SPEC §6

### Changed (from v3)
- Page count increased from 7 to 14 committed pages.
- Build phases increased from 3 to 6 (added Dictionary, Translation, Community, AI Training phases).
- Open questions increased from 28 to 50 (added dictionary, audio, interpretation, community questions).
- DB schema expanded: added `dictionary_entries`, `dictionary_versions`, `audio_pairs`, `interpreters`, `donations`, `feature_requests` tables.
- API routes expanded: added dictionary, audio upload, translation, collaborate, donations, training endpoints.
- Components expanded: added DictionarySearch, DictionaryEntry, AudioRecorder, AudioPlayer, ContributionForm, ReviewQueue, InterpreterCard, DonationForm, FeatureRequestForm.
- Worker expanded: added `scrape-worker.ts` for dictionary scraping.

### Still in IDEAS.md (not yet approved)
- Karen music section
- Podcast
- Karen AI education portal (standalone)
- Karen language keyboard (standalone)

### Decisions
- ADR-0001: Bilingual architecture via Next.js [lang] dynamic route segment.
- ADR-0002: Team collaboration via GitHub Issues + Projects.
- ADR-0003: Separate approved features from ideas (SPEC.md + IDEAS.md split).
- ADR-0004: Community-moderated dictionary + audio training pipeline.

### Notes
- v4 reflects Oliver's confirmation that the community dictionary, audio training, translation services, and community contributions are core to the nonprofit's mission.
- Court interpreter shortage is a documented national problem; KOA can address this for the Karen community.
- Mozilla Common Voice model inspired the community audio collection approach.
- Living Dictionaries platform inspired the community-moderated dictionary approach.
- 50 open questions in §14 require answers in `docs/answers.md` before Phase 2.

---

## 2026-08-09 (v3)

### Added
- `docs/SPEC.md` (v3) — revised spec with only committed features. Unapproved ideas removed and moved to `docs/IDEAS.md`.
- `docs/IDEAS.md` — parking lot for all unapproved, in-progress, unfinished, or unverified features.
- `docs/TEAM-WORKSPACE.md` — free team collaboration system using GitHub Issues + Projects.
- `.github/ISSUE_TEMPLATE/idea.md` — GitHub Issue template for team members to propose ideas.
- `docs/decisions/0001-bilingual-architecture.md` — ADR for bilingual [lang] route segment.
- `docs/decisions/0002-team-collaboration.md` — ADR for GitHub Issues + Projects.
- `docs/decisions/0003-separate-approved-from-ideas.md` — ADR for SPEC/IDEAS split.
- `docs/conversations/2026-08-09-planning-v3.md` — transcript of v3 planning session.

### Changed (from v2 draft)
- All unapproved features moved from SPEC → IDEAS.md.
- Page count reduced from 16 to 7 committed pages.
- Build phases reduced from 6 to 3.
- Open questions reduced from 35 to 28.

### Decisions
- ADR-0001: Bilingual architecture via Next.js [lang] dynamic route segment.
- ADR-0002: Team collaboration via GitHub Issues + Projects.
- ADR-0003: Separate approved features from ideas.
