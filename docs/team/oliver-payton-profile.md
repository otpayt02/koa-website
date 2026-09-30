# Oliver Payton — Profile Dossier and Official Team Bio

**Evidence status:** Draft for Oliver and KOA community review  
**Prepared:** 2026-09-28  
**Public-safety rule:** This dossier uses public repository material and facts Oliver supplied in the request. It does not include private biographical, employment, contact, or Google Drive information.

## Identity and role

### User-provided facts

- **Name:** Oliver Payton
- **Role:** IT Manager / Web Lead (also described by Oliver as IT / Tech Lead)
- **Project relationship:** Owner of `otpayt02/koa-website` and builder of the KOA website

These identity and employment statements are supplied by Oliver in the commissioning request. They should be confirmed by KOA before publication.

### What the public repositories verify

KOA's public project records identify **Oliver P** as the author and **IT Manager / Web Lead** of the website specification. Later integration specifications name **Oliver Payton** as owner, with KOA or community review, for both the S'gaw-Mango AI concept and the Karen Music Director integration. The repositories therefore support describing Oliver as the technical owner or lead recorded in the project documentation—not as the sole author of every implementation or as speaking for the community without review.

Sources: [KOA website specification](https://github.com/otpayt02/koa-website/blob/main/docs/SPEC.md), [S'gaw-Mango integration specification](https://github.com/otpayt02/koa-website/blob/main/docs/specs/2026-08-24-sgaw-mango-ai-integration.md), [Karen Music Director integration specification](https://github.com/otpayt02/koa-website/blob/main/docs/specs/2026-08-24-music-director-service-integration.md).

## Verifiable technical work

### KOA website architecture

The public `koa-website` repository describes one canonical React App Router application combining KOA's public mission experience, multilingual content, cinematic storytelling, and protected administration. The current architecture includes public language-pivoted routes, protected admin routes, locale catalogs, content and review data, scripts, and tests. Its declared stack includes Next.js App Router, React, TypeScript, Drizzle ORM, Vite/vinext, Tailwind/PostCSS, Cloudflare tooling, and SQLite/D1-oriented schema work.

This is more than a marketing site. The repository contains schemas and routes for moderated dictionary entries, translation proposals, community contributions, consent-gated audio, training-data exports, interpretation requests, audit logs, and administration. The project explicitly keeps translations, photographs, cultural claims, and publication review-gated.

Sources: [repository README](https://github.com/otpayt02/koa-website/blob/main/README.md), [package manifest](https://github.com/otpayt02/koa-website/blob/main/package.json), [database schema](https://github.com/otpayt02/koa-website/blob/main/db/schema.ts), [dictionary API](https://github.com/otpayt02/koa-website/blob/main/app/api/dictionary/route.ts), [translation review API](https://github.com/otpayt02/koa-website/blob/main/app/api/admin/translation-proposals/route.ts).

### Community-moderated dictionary

The KOA specification makes a living, community-moderated S'gaw Karen dictionary a core service. Its model supports multiple translation variants, synonyms, antonyms, examples, pronunciations, attribution, edit history, provenance, and discussion. Submissions enter a review queue; approved translators, reviewers, and moderators decide what becomes public. Scraped material is not automatically published and must retain source provenance and permission.

The implementation reflects that design: dictionary entries, translations, examples, relations, versions, and discussions are separate data structures with moderation states and reviewer attribution. Public API reads filter for approved records, while contributor changes go through role and status checks.

Sources: [KOA website specification §5](https://github.com/otpayt02/koa-website/blob/main/docs/SPEC.md#5-community-moderated-karen-dictionary), [dictionary and audio decision](https://github.com/otpayt02/koa-website/blob/main/docs/decisions/0004-community-dictionary-and-audio-training.md), [database schema](https://github.com/otpayt02/koa-website/blob/main/db/schema.ts), [dictionary entry API](https://github.com/otpayt02/koa-website/blob/main/app/api/dictionary/%5Bid%5D/route.ts).

### S'gaw Karen OCR and dictionary processing

The public `s-gaw-karen-ocr` repository documents a Python pipeline for an under-resourced language: synthetic S'gaw Karen syllable and paragraph dataset generation, YOLO OCR training and tiled inference, PDF rendering and row splitting, legacy KNU-font decoding, dictionary extraction and correction logging, S'gaw Karen sort handling, and a Flask review workbench. Its README reports local project metrics in which mAP50 moved from `0.888` in v1 to `0.965` in v2, while correctly limiting the claim to the repository's recorded metrics. Large datasets, weights, PDFs, and raw generated images are intentionally excluded from Git.

The repository also says it consolidates useful material from earlier Karen-language experiments. That matters when interpreting missing repositories: the current public evidence is strongest in this consolidated project, not in inaccessible or renamed historical repositories.

Sources: [Sgaw Karen OCR and Dictionary Pipeline](https://github.com/otpayt02/s-gaw-karen-ocr), [architecture documentation](https://github.com/otpayt02/s-gaw-karen-ocr/blob/main/docs/ARCHITECTURE.md), [source-repository notes](https://github.com/otpayt02/s-gaw-karen-ocr/blob/main/docs/SOURCE_REPOS.md).

### S'gaw-Mango AI gateway

The S'gaw-Mango document proposes a KOA-owned gateway that would coordinate translation, OCR, future speech features, dictionary retrieval, and music tooling while applying a shared human-review and provenance policy. Its most important architectural rule is that training data must trace to an approved translation proposal reviewed by a real person; scraped text, unreviewed community submissions, and unapproved synthetic output are not training data.

This must be described as **designed or specified**, not already shipped. The source itself is marked “Draft — not yet implemented” and requires KOA/community review before public capability claims. The “S'gaw-Mango” name is also a working name pending community review.

Source: [S'gaw-Mango AI integration specification](https://github.com/otpayt02/koa-website/blob/main/docs/specs/2026-08-24-sgaw-mango-ai-integration.md).

### Community audio and training-data pipeline

The KOA site includes the architecture for contributors to upload Karen speech paired with transcription and metadata. The API requires explicit audio-training license consent, stores uploads as pending and unreviewed, and permits approval only when a reviewer marks quality as validated. The training endpoint exports only approved, validated, consented audio pairs and explicitly states that queuing an export does not start or claim model training.

This supports the precise statement that Oliver's KOA architecture includes a **consent- and review-gated audio upload and dataset-export pipeline**. It does not support claiming that KOA has already trained or deployed production STT, TTS, or LLM models.

Sources: [audio upload API](https://github.com/otpayt02/koa-website/blob/main/app/api/audio/upload/route.ts), [training-pair API](https://github.com/otpayt02/koa-website/blob/main/app/api/training/pair/route.ts), [dictionary and audio decision](https://github.com/otpayt02/koa-website/blob/main/docs/decisions/0004-community-dictionary-and-audio-training.md).

### Translation and human review

The website's language architecture treats English source revisions and S'gaw Karen translation proposals as traceable records. Proposals carry locale, provider/model metadata, confidence, review status, reviewer notes, timestamps, and supersession history. Only approved proposals may sync to published translations. This approach makes community review and provenance part of the product architecture rather than an editorial afterthought.

Sources: [canonical one-app design](https://github.com/otpayt02/koa-website/blob/main/docs/superpowers/specs/2026-08-24-koa-canonical-one-app-consolidation-design.md), [database schema](https://github.com/otpayt02/koa-website/blob/main/db/schema.ts), [translation policy](https://github.com/otpayt02/koa-website/blob/main/lib/translation-policy.mjs).

### Karen Music Director integration

The public `karen-music-website` repository describes a desktop/web editor for Karen and Myanmar chord charts. Its stack includes FastAPI, SQLite with migrations, Vite, React, TypeScript, and PyWebView. It supports local parsing of JSON and text/ChordPro charts, vision-assisted import of images and PDFs, review of recognized fields and confidence, and a deliberate save step so imported material remains an unsaved draft until a human approves it.

The KOA integration specification frames this tool as a cultural-preservation service for Karen hymnody, choral arrangements, and contemporary music. It proposes a rights- and consent-gated archive, chart OCR review, and an exchange with KOA's Language Studio so lyrics remain reviewable translation proposals. The document explicitly prohibits public audio without recorded consent, hymn publication without rights review, and automated publication.

Sources: [Karen Music Director repository](https://github.com/otpayt02/karen-music-website), [music integration specification](https://github.com/otpayt02/koa-website/blob/main/docs/specs/2026-08-24-music-director-service-integration.md).

### Accessibility and supporting tools

The public `a-loud-reader` repository is a Python/PowerShell accessibility utility that reads Codex chat turns aloud, using Microsoft Edge neural TTS with a Windows SAPI fallback and optional Piper support. It demonstrates a broader interest in practical, local-first accessibility tools, but it is not presented in the public evidence as a KOA product.

Source: [a-loud-reader](https://github.com/otpayt02/a-loud-reader).

## Public-repository audit notes

The requested repository names were checked against the public `otpayt02` GitHub account on 2026-09-28.

| Requested repository | Public evidence | Safe interpretation |
|---|---|---|
| `koa-website` | Public and documented | Canonical KOA web application |
| `s-gaw-karen-ocr` | Public and documented | Consolidated OCR and dictionary-processing pipeline |
| `karen-music-website` | Public and documented | Karen/Myanmar chord-chart editor and related service work |
| `karen-lang-trans` | Public, but no public README or visible descriptive metadata | Do not claim implementation details from this repository alone |
| `karen-scraper-web` | Not public under this exact name | Related public repositories include [`Karen-Web-Scraper`](https://github.com/otpayt02/Karen-Web-Scraper); the OCR repository says earlier work was consolidated |
| `karen-sentence-builder` | Not public under this exact name | Mention only as a component listed in the draft S'gaw-Mango spec; do not describe it as publicly verified current software |
| `karen-language-agent` | Not public under this exact name | Do not claim public implementation details |
| `a-loud-reader` | Public and documented | Local read-aloud/accessibility utility |

Additional relevant public repositories visible on the account include [`S-gaw-Karen-Dictionary-Builder`](https://github.com/otpayt02/S-gaw-Karen-Dictionary-Builder) and [`S-gaw-Karen-AI-ML-OCR-Language-Recognition`](https://github.com/otpayt02/S-gaw-Karen-AI-ML-OCR-Language-Recognition). Their public descriptions support a sustained focus on legacy-font recovery, S'gaw Karen OCR, and broader digital access, but this dossier relies primarily on the newer consolidated OCR repository for technical claims.

## Mission connection

The technical through-line is language access with community authority. S'gaw Karen has limited off-the-shelf OCR, translation, speech, and publishing support. The projects address different parts of that gap: recovering text from legacy fonts and scans, structuring dictionary knowledge, collecting consented pronunciations, preserving translation provenance, and supporting Karen musical notation. Just as importantly, the KOA architecture treats community reviewers—not a model or a scraper—as the authority that decides what is accurate and publishable.

Oliver's documented role as tech lead is therefore best understood as building infrastructure for community stewardship: tools that help Karen speakers preserve, review, teach, and extend their language while retaining consent, attribution, and human judgment.

## Connected KOA workspace themes

A bounded search of the connected Google Drive found private KOA website exports and repeated “Universal Cinematic Website Production Kit” artifacts. To protect private workspace content, this dossier does not quote or reproduce those files. Their public-safe themes—consistent with the repository evidence—are long-form cinematic storytelling, a reusable production system, and stewardship of KOA's digital presentation. No personal facts or technical claims in this profile depend on private Drive content.

No separate local Codex memory or `AGENTS.md` record containing additional public-safe biographical facts was found. Conversation history was used only for facts Oliver supplied directly in this request.

## Official team bio

### Recommended website bio

**Oliver Payton — IT Manager / Web Lead**

Oliver Payton leads the technical development of KOA's bilingual digital platform. His work connects the public website with community-reviewed language tools, including a living S'gaw Karen dictionary, translation workflows, OCR and legacy-font processing, and a consent-based audio contribution pipeline. He has also developed plans for integrating Karen music notation and language technology through KOA's human-review systems. Oliver's focus is practical and community-first: build reliable tools, preserve provenance, and keep Karen speakers and reviewers in control of how their language and cultural materials are represented.

### Short bio

Oliver Payton is KOA's IT Manager / Web Lead. He builds community-reviewed tools for the bilingual KOA website, S'gaw Karen dictionary and OCR workflows, consent-based language data, and Karen music preservation—keeping human review, attribution, and community stewardship at the center.

### One-line card bio

Oliver leads KOA's web and language-technology work, building community-reviewed tools for S'gaw Karen access and preservation.

## Publication guardrails

- Confirm Oliver's title and preferred name styling with KOA before publishing.
- Do not publish age, location, education, employment history, or other private biography unless Oliver supplies and approves it for publication.
- Do not describe S'gaw-Mango as launched, the working name as final, or STT/TTS/LLM training as completed.
- Do not repeat model-performance numbers without naming the metric, version, and repository source.
- Do not imply that scraped, generated, or community-submitted material is approved until a human reviewer has approved it.
- Keep music, image, audio, and cultural material subject to consent, provenance, and rights review.

## Source index

### Public primary sources

- [`otpayt02/koa-website`](https://github.com/otpayt02/koa-website)
- [`otpayt02/s-gaw-karen-ocr`](https://github.com/otpayt02/s-gaw-karen-ocr)
- [`otpayt02/karen-music-website`](https://github.com/otpayt02/karen-music-website)
- [`otpayt02/karen-lang-trans`](https://github.com/otpayt02/karen-lang-trans)
- [`otpayt02/Karen-Web-Scraper`](https://github.com/otpayt02/Karen-Web-Scraper)
- [`otpayt02/S-gaw-Karen-Dictionary-Builder`](https://github.com/otpayt02/S-gaw-Karen-Dictionary-Builder)
- [`otpayt02/S-gaw-Karen-AI-ML-OCR-Language-Recognition`](https://github.com/otpayt02/S-gaw-Karen-AI-ML-OCR-Language-Recognition)
- [`otpayt02/a-loud-reader`](https://github.com/otpayt02/a-loud-reader)

### Repository-local sources reviewed

- [`README.md`](../../README.md)
- [`package.json`](../../package.json)
- [`docs/SPEC.md`](../SPEC.md)
- [`docs/TEAM-WORKSPACE.md`](../TEAM-WORKSPACE.md)
- [`docs/specs/2026-08-24-sgaw-mango-ai-integration.md`](../specs/2026-08-24-sgaw-mango-ai-integration.md)
- [`docs/specs/2026-08-24-music-director-service-integration.md`](../specs/2026-08-24-music-director-service-integration.md)
- [`docs/decisions/0004-community-dictionary-and-audio-training.md`](../decisions/0004-community-dictionary-and-audio-training.md)
- [`db/schema.ts`](../../db/schema.ts)
- [`app/api/dictionary/route.ts`](../../app/api/dictionary/route.ts)
- [`app/api/audio/upload/route.ts`](../../app/api/audio/upload/route.ts)
- [`app/api/training/pair/route.ts`](../../app/api/training/pair/route.ts)
