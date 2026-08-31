# S'gaw-Mango AI — KOA Integration Specification

**Version:** 0.1-draft
**Created:** 2026-08-24
**Owner:** Oliver Payton (with KOA community review)
**Canonical Repo:** `github.com/otpayt02/koa-website`
**Sister Repos:** `karen-lang-trans`, `karen-scraper-web`, `karen-sentence-builder`, `karen-language-agent`
**Status:** Draft — not yet implemented; requires KOA/community review before any public claim of capability.

---

## 1. Vision

**S'gaw-Mango AI** (working name) is the Karen Organization of America's in-house multimodal language agent for the S'gaw Karen language. It is not a product demo — it is a community-owned language tool that:

1. **Understands** S'gaw Karen text, speech, and visual glyphs.
2. **Generates** S'gaw Karen text, speech, and culturally appropriate music notation.
3. **Translates** bidirectionally between S'gaw Karen and English (later Thai, Burmese, and other Karenic languages).
4. **Learns** from community contributions — every approved correction becomes training signal, never raw data.
5. **Protects** the language as a living community resource, not a scraped corpus.

It is promoted on the KOA website as one of KOA's signature programs — not as a commercial AI product, but as evidence that Karen language, grammar, and voice can live digitally on Karen terms.

---

## 2. Why "Mango"

Working name rationale (to be reviewed with KOA):

- "Mango" (သရက်သီး in Burmese; the Karen term will be community-supplied) is a familiar fruit across the Karen diaspora — shared cultural reference, not political.
- "S'gaw" anchors the tool to the specific Karenic language (as distinct from Pwo, Bwe, etc.).
- The name must not claim official endorsement until KOA formally adopts it.
- Alternative naming directions: a Karen cultural artifact, a Karen word for "voice" or "word", or a transliterated Karen term. **Defer final naming to KOA community review.**

---

## 3. Capabilities Matrix

Each capability maps to one sister repo and one evidence artifact.

| Capability | Repo | Evidence | Status |
|---|---|---|---|
| **OCR of S'gaw Karen glyphs/syllables** | Roboflow project | 88.7% mAP on held-out test set | ✅ Trained |
| **English ↔ S'gaw Karen translation (text)** | `karen-lang-trans` | vast.ai GPU training runs; dataset chunks | ⚠️ Trained; not evaluated publicly |
| **Dictionary lookups with ground-truth corrections** | `karen-scraper-web` | SQLite `karen_dictionary.db` (~2.3MB); ground-truth routes | ✅ Working locally |
| **Sentence construction with bilingual guidance** | `karen-sentence-builder` | Flask app with curated translations | ✅ Working locally |
| **Agentic wrapper (tool use + memory)** | `karen-language-agent` | Agent tests + UI | ⚠️ Early |
| **Speech-to-text (S'gaw Karen)** | Not yet built | — | 🔲 Spec only |
| **Text-to-speech (S'gaw Karen)** | Not yet built | — | 🔲 Spec only |
| **Music generation in Karen chord-chart style** | `music_director_database/karen_music_website` | Editor + out format; see companion spec | ⚠️ Editor works; generator not yet |
| **Community contribution pipeline** | KOA Language Studio (this repo) | `translationProposals` + `auditLogs` | ✅ Schema + UI |

---

## 4. Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     KOA Website (koa-website)                    │
│                                                                  │
│   /en/ai            Landing page: what S'gaw-Mango AI is        │
│   /en/ai/translate  Interactive translation demo (gated)        │
│   /en/ai/dictionary Public dictionary search                    │
│   /en/ai/speak      Speech input/output (gated)                 │
│   /en/ai/music      Karen music sheet generator (gated)         │
│   /en/contribute    Community contribution forms                │
│                                                                  │
│   Admin Language Studio → proposal review → approved exports    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │        KOA AI Gateway (new)             │
        │  - Single API surface for all AI tools  │
        │  - Rate limits, auth, audit             │
        │  - Provenance headers on every call     │
        └─────────────────────────────────────────┘
           │          │         │         │
           ▼          ▼         ▼         ▼
    ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────┐
    │Translator│ │  OCR     │ │  TTS/STT│ │ Music Gen    │
    │(lang-trans)│ │(Roboflow)│ │(future) │ │(music_director│
    │          │ │          │ │         │ │ _database)   │
    └──────────┘ └──────────┘ └─────────┘ └──────────────┘
                              │
                              ▼
                  ┌──────────────────────┐
                  │  Training Pipeline   │
                  │  (vast.ai GPU)       │
                  │  - approved only     │
                  │  - provenance-logged │
                  └──────────────────────┘
```

---

## 5. Data Provenance — The Non-Negotiable

**Rule:** Every training datum must trace to one approved `translationProposals` row whose `status = "approved"` and `reviewerId` is a real human reviewer. Raw scraped text, synthetic outputs from unapproved models, and unreviewed community submissions are **not** training data.

This is enforced by:

1. The `isTrainingEligible(proposal, currentSourceRevision)` policy in `lib/translation-policy.mjs`.
2. The Language Studio UI, which displays a permanent warning: *"Unreviewed S'gaw Karen is not training data."*
3. The export pipeline, which reads only approved proposals joined to current English revisions.

**What is exported for training:**

```json
{
  "schema": "koa/training-bundle/v1",
  "exportedAt": "ISO8601",
  "unitCount": 0,
  "proposalCount": 0,
  "reviewerIds": [],
  "units": [
    {
      "unitId": "string",
      "sourceRevision": "number",
      "sourceText": "string",
      "sourceLocale": "en",
      "translations": [
        {
          "proposalId": "number",
          "locale": "th|my|ksw",
          "value": "string",
          "provider": "human|model",
          "modelVersion": "string|null",
          "confidence": "low|medium|high",
          "reviewerId": "string",
          "reviewedAt": "ISO8601"
        }
      ]
    }
  ]
}
```

This bundle is the only shape the training pipeline accepts. The training pipeline is in `karen-lang-trans`; it consumes bundles, not raw DBs.

---

## 6. Public Promotion Strategy

How S'gaw-Mango AI appears on KOA without overclaiming:

### 6.1 Landing page (`/en/ai`)

**Cinematic treatment:**

- Opening form: Karen glyph emergence (from the established glyph field) into the word "S'gaw-Mango".
- One message per viewport:
  1. "A Karen language tool, built by the Karen community."
  2. "Every word is reviewed. Every voice belongs to someone."
  3. "From syllables on paper to syllables in the air."
- Ending form: Invitation to contribute.

**Truth-state labels (mandatory):**

| Claim | Truth-state label |
|---|---|
| "Translates Karen text" | `Declared — dictionary-backed translation with human review` |
| "Understands spoken Karen" | `In development — speech-to-text not yet trained` |
| "Generates Karen speech" | `In development — TTS not yet trained` |
| "Generates Karen music" | `In development — chord-chart generator exists; generative music not yet` |
| "88.7% OCR accuracy" | `Measured — 88.7% mAP on held-out Roboflow test set, YYYY-MM-DD` |
| "Community-reviewed" | `Declared — every translation passes the Language Studio review gate` |

### 6.2 What we do NOT say

- "Powered by GPT-X" / "Uses [commercial model]" — unless KOA approves explicit attribution.
- "The first Karen AI" — unverifiable claim; other Karenic language projects exist.
- "99% accurate" — no such measurement exists.
- "Official KOA product" — unless KOA formally adopts it.
- "Training data from [corpus name]" — unless provenance is fully documented and consent is recorded.

---

## 7. Interactive Demos (Gated)

### 7.1 Translation demo (`/en/ai/translate`)

- English input → dictionary-backed translation with Karen script rendering.
- Karen input → transliteration + closest English gloss.
- Every result displays its **source**: `dictionary`, `community-approved`, or `model-draft (not reviewed)`.
- Model-draft results are labeled and excluded from the training pipeline.

### 7.2 Dictionary search (`/en/ai/dictionary`)

- Public search against `karen_dictionary.db`.
- Each entry shows headword, part of speech, English gloss, example sentence (if available), and provenance.
- "Suggest a correction" form posts to the Language Studio proposal pipeline — not directly to the DB.

### 7.3 Speech demo (`/en/ai/speak`)

- **Phase 1:** Record a Karen sentence → save to server → queue for human transcription.
- **Phase 2 (future):** Transcription + speaker attribution → feed into STT training after review.
- **Phase 3 (future):** Real-time STT/TTS.

### 7.4 Music demo (`/en/ai/music`)

- See companion spec: `2026-08-24-music-director-service-integration.md`.
- Phase 1: embed the existing chord-chart editor as a KOA service.
- Phase 2: add a simple Karen-style music sheet generator (melody template + Karen chord vocabulary).
- Phase 3: add generative music in Karen styles.

---

## 8. Integration with KOA React App Router

Implementation plan for a future phase (likely Phase 8):

1. **New route group:** `app/[lang]/ai/` with landing, translate, dictionary, speak, music sub-routes.
2. **New API group:** `app/api/ai/` as the KOA AI Gateway. All sister-repo tools are called through this gateway, never directly from the client.
3. **New content units:** AI landing page copy, demo descriptions, truth-state labels all go through `contentUnits` → `translationProposals` for quad-lingual coverage.
4. **New cinematic frames:** add to `content/cinematic-frame-manifest.json` under route `"/[lang]/ai"`.
5. **New admin UI:** extend the Language Studio with an "AI Demos" tab that shows usage, approval rate, and community contribution flow.

### Files likely touched in Phase 8

- Create: `app/[lang]/ai/page.tsx` + sub-routes
- Create: `app/api/ai/translate/route.ts`, `app/api/ai/dictionary/route.ts`, `app/api/ai/ocr/route.ts`
- Create: `components/ai/AILanding.tsx`, `TranslateDemo.tsx`, `DictionarySearch.tsx`
- Modify: `content/cinematic-frame-manifest.json`
- Modify: `messages/{en,th,my,ksw}.json` — new keys under `ai.*`
- Modify: `docs/KOA-CINEMATIC-COOKBOOK.md` — AI section cinematic treatment

---

## 9. Safety Boundaries

- **No face recognition, no voiceprint identification, no speaker attribution via biometrics.**
- **No gambling, wager matching, or payout logic** — even in music contests.
- **No automated publication** of community contributions without human review.
- **No third-party telemetry** on AI demos until a generic opt-in mechanism exists on KOA.
- **No external model API calls** from the client; all calls go through the KOA AI Gateway with rate limiting and audit logs.
- **Audio recordings** require explicit recorded consent before storage. Children's voices require guardian consent.
- **Raw video / private player data / model weights / large generated artifacts** never committed to the KOA repo.

---

## 10. Success Metrics

| Metric | Target | Measured by |
|---|---|---|
| Approved translation proposals per month | ≥ 50 | Language Studio |
| Community contributors with ≥1 approved proposal | ≥ 20 | Language Studio |
| OCR mAP on held-out Karen glyphs | ≥ 92% | Roboflow test set |
| Translation BLEU on held-out bilingual test set | Report only; no target | `karen-lang-trans` eval |
| STT WER on held-out Karen speech | Report only | future eval |
| Community-reported errors on AI demos | < 5% of uses | Demo feedback form |

---

## 11. What Must Happen Before Any Public Claim

1. KOA community review of the landing page copy.
2. KOA formal adoption of the "S'gaw-Mango" name (or a chosen alternative).
3. At least 100 approved translation proposals in the Language Studio.
4. One end-to-end demo recorded with consent and reviewed.
5. Privacy policy covering AI demo data collection.
6. Approval of the truth-state labels by Oliver + KOA leadership.

Until all six gates are green, the AI section is a local-only preview.

---

## 12. Handoff Notes for the Next Agent

If you are picking up this spec to implement Phase 8:

1. **Read this spec end-to-end first.** The safety boundaries and truth-state labels are load-bearing.
2. **Read `docs/KOA-CINEMATIC-COOKBOOK.md`** — every AI page must use the same cinematic grammar.
3. **Start with the landing page**, not the demos. The landing page sets the frame for everything else.
4. **Do not call sister-repo tools directly from the client.** Always build the KOA AI Gateway first.
5. **Every new page goes through the frame manifest.** Do not add an AI page without a frame entry.
6. **Do not invent Karen text.** Use approved translations from the Language Studio or keep copy in English with a "translation pending" label.
7. **Measure before claiming.** If a demo shows a capability, there must be an evidence artifact behind it.
