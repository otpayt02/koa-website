# Karen Music Director — KOA Service Integration Specification

**Version:** 0.1-draft
**Created:** 2026-08-24
**Owner:** Oliver Payton (with KOA + KOA music-community review)
**Canonical Repo:** `github.com/otpayt02/koa-website` (KOA) + `music_director_database/karen_music_website` (music editor)
**Local run (current):** `.\restart-karen-music-sites` skill → port 4177
**Status:** Draft — not yet implemented. Review before any public claim about Karen music.

---

## 1. Vision

The Karen Music Director is KOA's cultural-preservation program for Karen hymnody, choral arrangements, and contemporary Karen music. It ships as a **service on the KOA website**, not as a standalone product.

It must:

1. **Preserve** the existing Karen hymn tradition (church hymnals, handwritten chord charts, oral arrangements) in a durable digital form.
2. **Equip** Karen music directors in America with a bilingual editor for chord charts, lyrics, and print-ready sheet music.
3. **Connect** music practice to the S'gaw-Mango AI language stack — Karen lyrics are also linguistic evidence.
4. **Respect** the rights of composers, arrangers, and communities — nothing is published without provenance.

---

## 2. What Already Exists

The `karen_music_website` repo is the furthest-along piece of the Karen AI stack. Key surfaces:

| Surface | Path | Notes |
|---|---|---|
| **Sites editor (v8 stage)** | `sites/karen-music-director/` | React/Vite editor for chord charts + lyrics |
| **Python backend** | `*.py` files in repo root | Chart-code generator, print formatting, import pipelines |
| **Chart code library** | `chart_code/` | 21 Karen music chart source files (JSON + ChordPro-ish) |
| **Hand charts** | `chart_hand/Youth/` | Scanned handwritten charts (3 files) |
| **Chart images** | `chart_images/` | Reference images |
| **Church audio archive** | `church_audio_archive/` | Recordings with sub-folders |
| **Karen sheets local** | `karen_sheets_local/` | Local sheet exports |
| **Packaging** | `packaging/` | Desktop build / packaging scripts |
| **Docs** | `docs/` | 5 docs files (walkthroughs, specs) |
| **Tests** | `tests/` + extensive pytest fixtures | Comprehensive — accuracy, chart image, e2e, import regression |
| **Database schema** | `database-paper-database-pa-*` (Playwright) | Persistent SQLite |

The editor **already runs** on port 4177 via the `/restart-karen-music-sites` skill. The printout formatting, Karen-typing-mode hotkey, chord-chart import from JSON/ChordPro/text/image/PDF, language modal, and settings panel are all implemented.

---

## 3. Integration Model

The music director does **not** become part of the KOA React App Router. It stays in its own repo and is integrated as a service.

### 3.1 Embedding options (ranked by preference)

1. **Subdomain + reverse proxy** (preferred): `music.koamerica.org` → KOA Cloudflare worker → karen_music_website. One domain, two repos, separate deployments.
2. **Path prefix on KOA**: `koamerica.org/music` → KOA worker proxies to the music editor. Same domain; slightly more coupling.
3. **External link**: `koamerica.org/music` → separate `music.koamerica.org` URL. Simplest; weakest UX.
4. **iframe embed**: KOA React page embeds the music editor in an iframe. Fastest to demo; worst for SEO and deep-linking.

**Recommendation:** option 1 (subdomain + reverse proxy) for production; option 4 (iframe demo) for the first public preview behind an admin gate.

### 3.2 Shared authentication

- KOA admin session (ChatGPT-based auth per `chatgpt-auth.ts`) issues a short-lived token.
- The music editor accepts the token as a `koa-session` cookie or `Authorization: Bearer` header.
- Music-editor admins are a subset of KOA admins — the token includes a `role: "admin|music-director|contributor"` claim.
- Anonymous visitors can view published hymns; contributors and above can edit drafts.

### 3.3 Data flow between KOA and the music editor

```
┌─────────────────────────┐           ┌─────────────────────────┐
│ KOA React App Router    │           │ Karen Music Editor      │
│                         │           │                         │
│ /en/music (landing)     │ ────────▶ │ /editor (iframe or SPA) │
│ /en/music/hymns         │ ────────▶ │ /hymns (public list)    │
│ /en/music/contribute    │ ────────▶ │ /submit (form)          │
│                         │           │                         │
│ Admin Language Studio   │ ◀───────▶ │ Lyrics provenance       │
│ (lyrics become          │           │ (Karen lyrics feed      │
│  translation proposals) │           │  Language Studio)       │
└─────────────────────────┘           └─────────────────────────┘
```

**Lyrics provenance is bidirectional:**

- Karen lyrics written in the music editor can be exported as `translationProposals` in KOA (with source = "music-director").
- Approved KOA Karen translations can be imported into the music editor's lyric suggestions (with a "community-reviewed" badge).

---

## 4. KOA Public Surfaces for Music

### 4.1 Music landing page (`/en/music`)

**Cinematic treatment (per cookbook):**

- Opening form: a single Karen chord chart emerges from the glyph field, then a waveform of a Karen hymn (audio) rises.
- Five chapters:
  1. `၁` — *The sound of home* (full-bleed photo of a Karen choir or gathering)
  2. `၂` — *What we preserve* (hymnal page, handwritten chart scan)
  3. `၃` — *What we build* (editor screenshot with Karen typing mode on)
  4. `၄` — *Who leads the music* (music director portrait + name + church)
  5. `၅` — *How to contribute* (rights-gated form)
- Ending form: "Send a song" invitation.

**Truth-state labels:**

| Claim | Truth-state label |
|---|---|
| "Preserves Karen hymns" | `Declared — N hymns in the archive (count)` |
| "Bilingual editor" | `Implemented — Karen + English, reviewed` |
| "Print-ready sheet music" | `Implemented — PDF export with Karen script` |
| "Generates Karen music" | `In development — melody templates only; no generative model yet` |
| "Community submissions" | `In development — rights-gated intake form exists; review pipeline pending` |

### 4.2 Public hymn archive (`/en/music/hymns`)

- Searchable list of hymns with: Karen title, English title, composer (if known and consented), year, meter, and a preview image of the chart.
- Each hymn links to a read-only view of the chart and (if rights allow) an audio preview.
- **Rights-gated:** only hymns with `permission: "public-view"` appear. Others remain in the editor only.

### 4.3 Contribution intake (`/en/music/contribute`)

- A form where a community member can:
  - Upload a handwritten chord chart (image) → OCR → queued for music-director review.
  - Submit a recording of a Karen hymn → queued for transcription + rights check.
  - Suggest a correction to an existing hymn's lyrics → posted to the Language Studio as a `translationProposal`.
- Every submission requires recorded consent.
- Nothing is published without music-director + KOA review.

### 4.4 Music Director dashboard (`/en/admin/music`)

- Extends KOA admin area.
- Shows: pending submissions, pending lyric proposals, recently published hymns, chart accuracy metrics, audio archive growth.
- Links into the external music editor via a signed launch URL.

---

## 5. Karen Music Style Spec

For the future generative-music phase (S'gaw-Mango AI music module):

### 5.1 Karen hymn structure (observed in existing chart_code)

- **Meter:** predominantly 4/4; some 3/4 waltz hymns.
- **Form:** verse–chorus (V1, C, V2, C, V3, C) or strophic (V1, V2, V3, V4).
- **Harmony:** I–IV–V–I with occasional vi; modal mixture rare.
- **Melody:** stepwise motion within an octave; characteristic descending cadences.
- **Karen script in lyrics:** yes — lyrics line uses S'gaw Karen; transliteration optional.
- **Chord notation:** English letter names (C, F, G7) above the lyric line.

### 5.2 Generator phases

1. **Templates (now):** chord-chart template → fill in lyrics → print. Already exists.
2. **Melody templates (next):** given a meter, a mode, and a form, generate a melodic skeleton using a small Karen-scale grammar. Not generative ML — explicit rules.
3. **Generative (future):** train a small model on the existing corpus of Karen hymns (rights-cleared only) to generate melody + harmony in Karen style. Requires a new dataset and new rights review.

### 5.3 Print format

The existing editor produces PDFs with:

- Karen-script lyrics rendered via Noto Serif Myanmar or Padauk.
- Chord symbols above the lyric line.
- Two systems per page for hymns; four for shorter songs.
- Header: Karen title + English title + meter + composer + arranger.
- Footer: "Karen Organization of America · Music Director Program" (pending KOA approval).

---

## 6. Technical Integration Steps (Future Phase 8+)

### 6.1 KOA-side changes

1. **New route group:** `app/[lang]/music/` — landing, hymns, contribute.
2. **New admin route:** `app/[lang]/admin/music/page.tsx` — music director dashboard shell.
3. **New API routes:** `app/api/music/*` — proxy to the music editor's API with KOA auth.
4. **New content units:** music landing copy, hymn metadata, contribution form text — all through `translationProposals`.
5. **New cinematic frames:** five chapters in `cinematic-frame-manifest.json`.
6. **New `partners.ts` entries:** music-director individuals + churches (with explicit consent records).

### 6.2 Music-editor-side changes

1. **Add KOA token auth** alongside existing local auth.
2. **Expose a read-only public API** for hymn list + chart preview.
3. **Expose a contribution API** that accepts uploads and posts them to KOA's `contentUnits` pipeline.
4. **Add a "send to Language Studio" export** for Karen lyrics → `translationProposals`.
5. **Document the existing chord-chart JSON schema** so KOA's AI Gateway can query it.

### 6.3 Cross-repo contracts

| Contract | Shape | Owner |
|---|---|---|
| Hymn preview | `{ id, titleKaren, titleEn, meter, composer, permission }` | Music editor |
| Contribution submission | `{ type, fileRef, submitterConsent, sourceRevision }` | KOA AI Gateway |
| Lyric proposal | KOA `translationProposals` row | KOA Language Studio |
| Audio recording | `{ fileRef, speakerConsent, language, dialect }` | KOA AI Gateway |

---

## 7. Safety Boundaries

- **No public audio without recorded consent.** Especially for children and community elders.
- **No public hymn publication without a rights review.** Many Karen hymns have living composers.
- **No biometric speaker identification.** Voice is attribution; we do not fingerprint.
- **No generative-music publication without dataset provenance.** Every training hymn must have explicit permission.
- **No automated publication** — every chart, audio, and lyric passes through a human reviewer.
- **No commercial claims** — this is a cultural preservation program, not a product.

---

## 8. Success Metrics

| Metric | Target | Measured by |
|---|---|---|
| Hymns in the digital archive (rights-cleared) | ≥ 50 | Music editor DB |
| Music directors using the editor weekly | ≥ 5 | Editor usage logs (opt-in) |
| Community contributions per month | ≥ 10 | Contribution intake |
| Lyric proposals promoted to Language Studio | ≥ 20/month | KOA Language Studio |
| OCR accuracy on handwritten chord charts | ≥ 85% | Held-out chart test set |
| Printed sheets distributed at KOA events | Anecdotal | Event reports |

---

## 9. What Must Happen Before Any Public Claim

1. KOA music-program adoption decision.
2. Rights review of the existing hymn corpus.
3. Consent records for at least the first 20 published hymns.
4. Music-editor token-auth integration complete.
5. One end-to-end demo: community member → contribution → review → publication.
6. Truth-state labels reviewed by Oliver + music director + KOA leadership.

---

## 10. Handoff Notes for the Next Agent

If you are picking up this spec to implement music integration:

1. **Start with the landing page** (`/en/music`), not the editor embed.
2. **Do not bypass the rights review.** If a hymn lacks a rights record, keep it in the editor, not on KOA.
3. **Do not re-implement the music editor.** It's a mature React app; integrate with it, don't replace it.
4. **Every piece of music copy goes through `translationProposals`.** The Language Studio is the source of truth for Karen text on KOA.
5. **Use the existing cinematic grammar** (cookbook) for the music landing — it is a chapter of the same film, not a separate site.
6. **Measure before claiming.** If the page says "preserves N hymns", count them from the DB, not from estimates.
7. **The iframe demo is temporary.** Production integration is subdomain + reverse proxy.
