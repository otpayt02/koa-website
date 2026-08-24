# KOA canonical one-app consolidation design

Date: 2026-08-24
Status: Approved by the user on 2026-08-24; implementation plan created
Canonical repository: `C:\Users\olive\Projects\koa-website`

## Goal

Make the React App Router application on `main` the sole canonical KOA runtime. Bring multilingual editing, cinematic controls, mobile preview, translation retention, partner presentation, and the corrected seal choreography into that one application without publishing or deploying it.

## Locked decisions

- `koa-website` on `main` is the only canonical runtime and source of truth.
- `koa-website-bilingual` is not a second product. Its branch commit is already an ancestor of `main`; the worktree can be retired after generated files are reviewed.
- The public site defaults to English and offers Thai, Burmese, and S'gaw Karen.
- S'gaw Karen remains a separate, review-gated language, not an automatic derivative of Thai or Burmese.
- Translation and choreography editing live inside authenticated admin routes. Public visitors cannot discover or reach those authoring tools.
- Preserve the K–seal–A sequence, native scroll, `1800vh` desktop film, foreground occlusion, and complete Motion-off composition.
- Do not deploy, publish, process donations, delete a remote branch, or present unreviewed cultural or partnership claims.

## Verified current state

- Node `v22.22.3` and npm `11.17.0` satisfy the repository prerequisite.
- The C: drive has about 12.2 GB free after recovery.
- `node_modules` and `node_modules\.bin\vinext.cmd` were absent during the prior runtime audit. Dependency restoration and a new build are implementation work, not assumed complete by this document.
- The bilingual worktree points at `5d5bcfe`, which is already merged into `main`.
- Its current changes are generated Wrangler workers, `tsconfig.tsbuildinfo`, `.playwright-cli`, and `output`; they must be reviewed before worktree removal.
- The repository has no `.github/workflows` directory. The observed failure is local/vinext or hosting-related, not a repository-owned GitHub Actions workflow.
- The exact supplied seal is `public/koa/assets/koa-seal-white-lettering-v2.png` (`1254×1254`). Existing duplicate SVG orbit text is not part of the approved logo.

## Canonical architecture

### Public application

- `app/[lang]` owns every public route.
- `components/CinematicHome.tsx` remains the home-film entry point and is split into focused components only where implementation needs clear boundaries.
- Locale pivots are `en`, `th`, `my`, and `ksw`; `en` is the default.
- Essential copy remains semantic DOM text. Canvas and image layers are decorative.
- `public/koa` is temporarily retained as a read-only visual and browser-evidence reference. It receives no new product features. A later reviewed phase may archive or remove it after React parity is verified.

### Admin-only authoring

- `/[lang]/admin/language-studio` is protected by the existing server-side role system and accepts only the admin role.
- `/[lang]/admin/design-studio` contains the choreography/frame manifest, tunable motion values, reference weights, and phone preview.
- The phone preview uses a recursion-safe iframe or isolated preview route at `390×844`, with accessible controls for mobile, desktop, and Motion-off views.
- Public locale selection changes the visitor language only; it is not an editing surface.

### Translation retention

English is the canonical source for new content. Thai, Burmese, and S'gaw Karen proposals are generated independently from English, never chained through one another.

Each content unit stores:

- stable content ID, route, section, frame, and source revision;
- English source text and provenance;
- locale proposal, provider/model metadata, confidence, status, and timestamps;
- human reviewer, review notes, accepted revision, and supersession link;
- cultural-sensitivity and publication gates.

Unreviewed proposals never mix with approved translation pairs and are never labeled training data. Accepted S'gaw Karen pairs may be exported later for an explicitly reviewed training corpus.

## Visual and motion system

### Exact seal treatment

Use the supplied white-lettering seal as the only visual source. Render a stationary inner seal and a second annular crop of the same image for the already-embedded white English/Karen circumference text. Rotate only that annular crop clockwise. Both layers share one center, scale, and translation, so the text radius stays directly proportional to the seal radius throughout hero migration. Remove the duplicate SVG orbit text.

### Persistent glyph paths

Glyph particles receive stable IDs and durable path state for the life of the page. Formation, dispersion, and re-formation alter targets and opacity; they never destroy a path because a short class or narrow scroll window ended. The invisible symbol anchor stays stable while particles breathe around it. Greater distance from the anchor reduces velocity so outer dispersion slows instead of disappearing.

### Partners and Karen organizations

Create two autonomous marquee rows moving slowly in opposite directions. They are time-based, not scroll-linked, pause on hover and keyboard focus, and become a static wrapped grid for Motion off or reduced motion.

Each record contains organization name, verified relationship status, logo source, logo-use permission, URL, and review state. Unverified organizations appear only as clearly labeled drafts inside admin preview.

### Film pacing and interaction

- Preserve the `1800vh` desktop runway and current mobile runway unless browser evidence proves a readability regression.
- Keep one message per cinematic viewport and a full breathing beat between chapters.
- Sparse Burmese numeral formations remain translucent and recognizable, never solid particle walls.
- The background-only pointer matrix uses reviewed S'gaw Karen clusters plus K, O, and A.
- Foreground geometry masks all glyph drawing.
- Hover/focus glimmer is one slow red-to-paper-to-gold wipe and is absent with Motion off.

## Documentation system

- `README.md` explains the project background, canonical architecture, run commands, media, and cookbook.
- `docs/KOA-CINEMATIC-COOKBOOK.md` is the durable choreography and visual reference.
- `UNDERSTANDING.md` explains why each important file exists, what it contains, and what fails if removed.
- Each route eventually receives `docs/pages/<route>/design.md`, `spec.md`, and `ideas.md`.
- Each verified version emits `docs/cinematic/versions/vNNNN-<short-sha>.md` and a machine-readable manifest covering frame entry/exit, visible content, locales, static and motion layers, tunables, evidence, and change rationale.
- Planned project skills are `koa-mobile-preview`, `koa-translation-mapper`, `koa-frame-story-spec`, and `repo-understanding-sync`. They are created and validated in bounded implementation phases, not assumed to exist from this specification.

## Failed and superseded ideas to retain

| Attempt or idea | Observed result | Canonical treatment |
|---|---|---|
| `npx shadcn@latest add @magicui/glyph-matrix` | Dependency resolution failed; retry hit `ENOSPC` | Keep the first-party seeded canvas; reconsider only after recovery and a demonstrated benefit |
| Fresh headless capture of the narrow seal-flight class | Two condition-based checks timed out | Replace the fragile class-window probe with durable phase telemetry and stable milestones |
| Multiple vinext watchers for static and bilingual worktrees | Continuous HMR loop and stale-route risk | Run one clean canonical React process |
| Build with missing vinext binary | Build cannot start | Restore dependencies after disk-space preflight |
| Raster seal plus new SVG orbit text | Visually duplicated the approved logo | Rotate an annular crop of the exact seal only |
| Static and React implementations evolving together | Drift and duplicated maintenance | React is canonical; static is a temporary read-only reference |
| English → Thai → Burmese → Karen chain | Compounds translation error and provenance ambiguity | Generate independent locale proposals from English |
| Brief formation lifecycle that destroys particle paths | Glyph dispersion can vanish in a small animation window | Use stable particle IDs and persistent page-lifetime paths |

## Reference weighting

Two independent 0–100 scores govern decisions: **strength** measures authority/reliability; **consideration** measures how strongly the reference should influence this implementation.

| Reference | Strength | Consideration | Use |
|---|---:|---:|---|
| Current explicit user instructions | 100 | 100 | Primary product intent and constraints |
| Supplied logo and matching white-lettering asset | 100 | 100 | Exact seal geometry and orbit source |
| Approved Option 1 one-app architecture | 100 | 100 | Runtime and worktree decision |
| Current `main` React source | 95 | 100 | Canonical implementation baseline |
| Fresh browser/runtime evidence | 95 | 95 | Acceptance and regression decisions |
| Existing cinematic cookbook and K–seal–A contract | 90 | 95 | Choreography continuity |
| KOA-approved copy/assets | 100 | 100 | Public content after approval is recorded |
| Local Facebook-derived enhanced images | 60 | 50 | Draft reference until originals and rights are documented |
| Official KOA Facebook page | 80 | 60 | Discovery and provenance lead, not automatic reuse permission |
| Referenced site typography/halo | 65 | 55 | Directional mood, never pixel cloning |
| Algorithmic-art principles | 70 | 65 | Natural seeded behavior and transparent tunables |
| Generic component trends or Magic UI defaults | 30 | 20 | Inspiration only when they improve KOA's experience |

## PowerShell contract

The implementation adds `scripts/run-koa.ps1`. Its permanent one-paste invocation is:

```powershell
Set-Location 'C:\Users\olive\Projects\koa-website'; powershell -NoProfile -ExecutionPolicy Bypass -File '.\scripts\run-koa.ps1'
```

The script preflights disk space, restores dependencies only when needed, starts one canonical vinext process, waits for readiness, opens the local URL, prints PID/URL, and provides an exact stop command. It never publishes or deploys.

Until that script is implemented, the README provides a one-paste command for the temporary static reference. That reference is not the canonical React application.

## Safe worktree retirement

Implementation may remove the worktree only after reviewing status and preserving every non-generated change:

```powershell
git -C 'C:\Users\olive\Projects\koa-website' merge-base --is-ancestor 5d5bcfe main
git -C 'C:\Users\olive\Projects\koa-website-bilingual' status --short
git -C 'C:\Users\olive\Projects\koa-website' worktree remove 'C:\Users\olive\Projects\koa-website-bilingual'
git -C 'C:\Users\olive\Projects\koa-website' branch -d 'koa-visual-narrative-redesign-994e3'
```

These are implementation-phase commands, not commands to run before written-spec approval. Remote branch deletion is excluded unless separately authorized.

## Verification and acceptance

1. One vinext process serves all public, locale, admin, and preview routes.
2. English, Thai, Burmese, and S'gaw Karen pivots render; missing translations fall back visibly and enter the admin queue.
3. Non-admin requests to both studio routes are rejected server-side.
4. The mobile preview renders the real application at `390×844` without recursively embedding itself.
5. The exact seal renders with no duplicate outer typography; only its original annular text rotates.
6. Glyph paths persist across formation/dispersion milestones and never disappear because a narrow class window ended.
7. Partner rows move autonomously in opposite directions and rest accessibly with Motion off.
8. Desktop `1440×900`, mobile `390×844`, and Motion-off browser evidence show no overflow, foreground glyph bleed, console errors, or missing content.
9. Relevant tests, TypeScript, lint, and production build pass after vinext recovery.
10. README, cookbook, understanding guide, frame manifest, request ledger, progress, and decisions match the verified implementation.
11. The bilingual worktree is retired only after ancestor and status checks pass.
12. No deploy, publication, remote branch deletion, or unsupported public claim occurs.

## Implementation sequence after written-spec approval

1. Restore vinext dependencies and prove one canonical browser process.
2. Add the durable one-command runner.
3. Consolidate locales and build admin-only Language and Design Studios.
4. Correct the seal annulus and persistent particle lifecycle; add partner rows.
5. Add translation provenance, review gates, frame manifests, and understanding documentation.
6. Run desktop, mobile, and Motion-off QA, then retire the obsolete worktree.
