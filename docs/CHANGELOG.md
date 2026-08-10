# KOA Website — Changelog

All notable changes to this project are documented here.
Each entry includes: date, what changed, why, and who.

---

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
