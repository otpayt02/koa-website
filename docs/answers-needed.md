# KOA v4 Decisions Still Needed

**Status:** Open as of 2026-08-10.  
**Purpose:** This is the short production-readiness frontier derived from the 50 questions in `docs/SPEC.md` §14. Provisional implementation assumptions live in `docs/answers.md`; they are explicitly not KOA approvals.

The v4 build can continue as a safe prototype. The following decisions block production activation, public claims, or external data movement.

## Immediate production gates

1. **Language authority and dialect policy (Q1, Q3–Q7):** Name the language lead, approved reviewers/translators, speaker-verification method, dialect scope, entry acceptance bar, and dispute/appeal process.
2. **Dictionary source permissions and rights (Q2, Q44):** List each resource, owner/contact, permitted fields, permission/license evidence, required attribution, crawl limits, update/removal process, and whether derivative publication/model use is allowed.
3. **Audio rights and AI governance (Q8–Q15, Q45):** Approve consent/license text, age policy, withdrawal/deletion process, vendors/data regions, model choices, dataset threshold, synthetic-data policy, evaluations, release criteria, misuse response, and accountable owner.
4. **Interpreter directory and court service (Q4, Q16–Q20):** Identify verified professionals, accepted credentials, availability/contact privacy, court contacts, pricing, contracting party, qualification rules, confidentiality, conflicts, insurance, legal review, and complaint/escalation handling.
5. **Moderation operations (Q21–Q23):** Name moderators and backups; approve training, service levels, safety escalation, suspension/appeal, record retention, and emergency response.
6. **Donations and nonprofit claims (Q24–Q25, Q50):** Verify the legal entity/fiscal sponsor and tax status; select the payment processor; approve receipts, refunds, restricted gifts, fraud/chargebacks, accounting reconciliation, privacy, and webhook ownership.
7. **Authoritative content and media (Q26–Q30):** Supply approved leadership bios, mission/tagline, current services, eligibility/service areas, authors and translators, image rights/model releases, and publication sign-off.
8. **Production operations and security (Q31–Q39):** Confirm hosting/database accounts and regions, font license/device QA, backups and restore testing, RPO/RTO, incident ownership, admin roster/MFA/revocation, GitHub access, review SLA, and continuity owner.
9. **SEO, analytics, and privacy (Q40–Q43, Q46–Q49):** Confirm target audiences/locations, Search Console owner, analytics and consent platform, measurable targets, privacy/terms owner, deletion/retention process, grant obligations, and shutdown/data-stewardship plan.

## Evidence requested

- Written permission or license records for every scrape/import source.
- Approved translator/interpreter roster and credential-verification records.
- Court/public-defender contacts and any executed partnership terms.
- Payment processor/account owner and proof of tax/fiscal status before donation claims.
- Counsel-approved contributor, audio, privacy, terms, and service-agreement language.
- Named production owners and backup owners for security, moderation, data, finance, and incidents.

Until this evidence exists, production integrations should fail closed: no scraping, no model-training export, no real directory listing or court booking, and no payment/tax-receipt processing.
