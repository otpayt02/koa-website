# KOA v4 Implementation Answers — Unconfirmed Assumptions

**Date:** 2026-08-10  
**Status:** **UNCONFIRMED — implementation defaults only**  
**Authority:** These are not answers from Oliver or KOA leadership. They are conservative assumptions that let the v4 prototype be implemented without representing unresolved organizational, legal, linguistic, financial, or partnership decisions as fact.

Anything marked **production gate** must remain disabled, unpublished, or non-transactional until an authorized KOA decision-maker confirms it. The corresponding decision requests are summarized in `docs/answers-needed.md`.

## Language & Dictionary

1. **Dialect:** Use S'gaw Karen as the initial interface and dictionary label because the spec names S'gaw. Keep the data model capable of adding Pwo and other dialect labels. **Unconfirmed.**
2. **Dictionary sources and permission:** No source is approved for scraping yet. Build provenance and review capabilities, but do not scrape or import third-party content. **Production gate.**
3. **Words without direct English equivalents:** Store multiple contextual glosses, usage notes, bilingual examples, and an optional explanation instead of forcing a one-to-one translation. **Unconfirmed editorial policy.**
4. **Approved translators/interpreters:** No names, count, credentials, or availability have been supplied. Use no real directory listings; fixtures must be clearly fictional or empty. **Production gate.**
5. **Entry quality bar:** Treat every submission as pending until a reviewer checks script, dialect, meaning, context, source/provenance, and rights. Two-person review is the provisional bar for sensitive or disputed content. **Unconfirmed.**
6. **Speaker verification:** Do not infer fluency from identity. Provisionally require a reviewer application, community reference, and an evaluation by an approved language lead. **Production gate.**
7. **Multiple dialects:** Use one searchable dictionary with explicit dialect tags and filters, not isolated duplicate dictionaries. **Unconfirmed.**

## Audio & AI Training

8. **STT model:** Keep the pipeline provider-neutral; no model has been selected and no training should launch. Evaluate open, documented multilingual baselines before any procurement. **Production gate.**
9. **TTS model:** Keep the pipeline provider-neutral and do not synthesize contributor voices until model, consent, and misuse safeguards are approved. **Production gate.**
10. **Karen LLM:** Assume adaptation/evaluation of an existing multilingual model, not training a foundation model from scratch. This is a research direction, not a promised deployed service. **Unconfirmed and gated.**
11. **Training location:** No runtime is selected. Store only job metadata and interfaces; do not send community data to an external GPU or API. **Production gate.**
12. **Model-collapse prevention:** Separate human-authored, imported, and synthetic data; exclude model output from training by default; version datasets; require human evaluation and held-out test sets. **Unconfirmed technical policy.**
13. **Minimum dataset:** The spec's 100-hour figure is a planning reference, not an approved universal threshold. Do not fine-tune until KOA approves a model-specific data-readiness review. **Production gate.**
14. **Quality measurement:** Provisionally combine human evaluation by approved speakers with task-appropriate automated metrics (for example WER for STT and COMET/BLEU as supporting translation signals). Automated scores must not replace human review. **Unconfirmed.**
15. **Audio consent:** No final license exists. The interface may display a placeholder consent requirement, but uploads must not be accepted for training until counsel-approved terms cover storage, moderation, model training, voice risks, withdrawal, and deletion. **Production gate.**

## Translation & Interpretation

16. **Certifications:** None are verified. Do not display certification claims until KOA defines accepted issuers and verifies documents. **Production gate.**
17. **Court contacts:** No court or public-defender contact is documented. Describe the partnership as proposed, never active. **Production gate.**
18. **Pricing:** Present “community support and organizational rates to be confirmed”; do not promise free, sliding-scale, or paid terms until approved. **Production gate.**
19. **Court-interpretation liability:** No policy is approved. Do not accept or assign court matters until counsel defines contracts, confidentiality, conflicts, qualification checks, record retention, and escalation. **Production gate.**
20. **Insurance:** No coverage is documented. Do not imply that KOA or interpreters carry malpractice/professional liability insurance. **Production gate.**

## Community & Contributions

21. **Moderators:** No roster or training program is confirmed. Keep administrative roles seed-free by default and require documented onboarding before granting review access. **Production gate.**
22. **Dictionary disputes:** Provisionally preserve versions, let users flag an entry, pause disputed publication when risk is material, and escalate to a language-review panel with a recorded rationale and appeal. **Unconfirmed.**
23. **Harmful or incorrect submissions:** Default to pending; support rejection, quarantine, audit history, rate limits, and urgent moderator escalation. Do not silently delete provenance or review records. **Unconfirmed operational policy.**
24. **Donor system:** No processor is selected. The donation experience must be informational/non-transactional until a processor, webhook verification, refunds, receipts, and data handling are approved. **Production gate.**
25. **Tax deductibility / 501(c)(3):** Not verified in the supplied repository. Do not claim deductibility or issue tax receipts until legal entity and tax status are confirmed. **Production gate.**

## Content & Sources

26. **Leadership and program sources:** Use only content already approved in repository materials. Do not invent biographies, titles, outcomes, or current program facts; mark gaps for KOA review. **Production gate for publication.**
27. **Content authorship:** Treat KOA leadership as final publisher, with contributors drafting and approved translators reviewing Karen text. Named owners are still required. **Unconfirmed workflow.**
28. **Photos and media:** Reuse repository assets only when their rights and subjects' consent are known; otherwise retain neutral placeholders and descriptive alt text. **Rights confirmation required.**
29. **Mission and tagline:** Use existing supplied KOA wording only. Do not create a new official mission statement or tagline and present it as approved. **Production gate.**
30. **Current services:** Treat service descriptions in the spec as planned site scope, not verified current availability. KOA must confirm service names, eligibility, coverage, hours, and contact paths. **Production gate.**

## Technical & Operations

31. **Hosting:** Continue with the repository's Cloudflare/vinext-compatible architecture for development; production account, domain, regions, and service limits remain unconfirmed. **Unconfirmed.**
32. **Database:** Use Drizzle with the repository's Cloudflare D1/SQLite-compatible setup unless infrastructure ownership changes. Do not treat development schema selection as production approval. **Unconfirmed.**
33. **Karen font:** Prefer a widely supported Myanmar/Karen Unicode fallback stack and validate on target browsers/devices. Bundling a specific font requires license and rendering review. **Production gate.**
34. **Backups / disaster recovery:** Provisionally require daily database backups, periodic restore tests, versioned media storage, documented RPO/RTO, and an incident owner. No plan is operational yet. **Production gate.**
35. **Admin access:** Start with least privilege, MFA, named accounts, audited role changes, and immediate revocation on departure. Oliver is not assumed to be the only production admin; a confirmed roster and backup owner are required. **Production gate.**

## Team & Workflow

36. **Team and roles:** Only Oliver's IT Manager / Web Lead role is documented. Do not invent other people or assignments. **Confirmation required.**
37. **GitHub access:** Grant no additional access based on this assumption file. Use the smallest confirmed collaborator set with protected branches and reviewed changes. **Production gate.**
38. **Review response time:** Use a provisional internal target of five business days for ordinary proposals and a documented urgent-abuse path. **Unconfirmed.**
39. **Backup owner:** None is named. Production launch requires a second authorized owner for accounts, incidents, moderation, and continuity. **Production gate.**

## SEO & Growth

40. **Primary search target:** Optimize first for “Karen Organization of America” and clearly related KOA/Karen community terms, while avoiding claims that rankings are guaranteed. **Unconfirmed.**
41. **Local SEO:** Do not create city/location pages until KOA confirms real service areas, offices, and locally accurate contact information. **Production gate.**
42. **Search Console:** Setup is unknown. Add standards-based metadata and sitemap support; account verification remains a launch task. **Unconfirmed.**
43. **Success measures:** Provisionally track accessible visits, completed service requests, approved dictionary entries, validated audio hours, contributor retention, moderation turnaround, and task completion—not vanity traffic alone. Analytics consent and exact targets remain open. **Unconfirmed.**

## Legal & Compliance

44. **Dictionary ownership/license:** No license is approved. Preserve contributor and source attribution and do not publish imported or contributed entries under a guessed license. **Production gate.**
45. **Audio ownership/license:** Contributors retain whatever rights applicable law gives them; KOA receives no assumed training license. A signed, counsel-reviewed grant and withdrawal policy are required. **Production gate.**
46. **Privacy policy / terms:** Yes, production use involving accounts, uploads, requests, donations, or analytics requires reviewed privacy, terms, acceptable-use, and consent text. Drafting authority and counsel review are unconfirmed. **Production gate.**
47. **Deletion requests:** Provisionally provide authenticated intake, identity verification, legal-hold checks, deletion/export across primary data and vendors, a response log, and a defined retention window. **Unconfirmed legal process.**
48. **Grant reporting:** No grants or obligations are documented. Add reporting dimensions only after funding agreements are reviewed. **Production gate.**
49. **Shutdown/data stewardship:** Require an approved continuity plan covering export, notices, deletion, archival, license survival, and transfer to an appropriate community steward. **Production gate.**
50. **Fiscal status:** No fiscal sponsor or independent 501(c)(3) status is verified here. Suppress tax, receipt, and charitable-status claims until documentation is confirmed. **Production gate.**

## Effect on the v4 Implementation

The prototype may implement navigation, forms, validation, moderation states, data structures, audit interfaces, and clearly labeled demonstrations. It must not silently activate scraping, external model training, real interpreter publication/booking, court-service commitments, payment processing, tax receipts, or rights-sensitive content publication. Those boundaries preserve forward progress while the grilling answers remain open.
