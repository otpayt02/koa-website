# ADR-0004: Community-Moderated Dictionary & Audio Training Pipeline

**Date:** 2026-08-09
**Status:** Accepted
**Decider:** Oliver P
**Context:**
The Karen language is under-resourced and under-represented digitally. Existing dictionaries are scattered across community resources. KOA is a nonprofit for the community, and the community must be involved in building and moderating the dictionary. Additionally, there is a shortage of Karen interpreters, especially in courts, and community audio can train speech-to-text and text-to-speech models to help address this gap.

**Decision:**
Build a community-moderated Karen dictionary that:
1. Scrapes definitions from existing community resources (with provenance tracking and permission).
2. Accepts community-uploaded definitions, translations (multiple variants), synonyms, antonyms, examples, and audio.
3. Is moderated by community reviewers and approved translators/interpreters.
4. Feeds audio data into a training pipeline for STT, TTS, and Karen LLM development.
5. Supports an approved interpreter directory and court interpretation partnership.

**Inspiration:**
- Living Dictionaries platform for under-resourced languages.
- Mozilla Common Voice for community audio collection.
- Urban Dictionary's community moderation model (improved with human review).

**Consequences:**
- (+) Community ownership and engagement — the dictionary is built by and for the Karen community.
- (+) Provenance tracking for legal and ethical compliance.
- (+) Audio training pipeline addresses the Karen interpreter shortage.
- (+) Multiple translation variants capture the richness of the language.
- (+) Court interpretation partnership provides a real community service.
- (-) Requires significant moderation infrastructure and reviewer training.
- (-) Audio training requires 100+ hours of validated audio — a long-term effort.
- (-) Scraping requires permission and ethical review per source.
- (-) Contributor consent needed for audio licensing.
