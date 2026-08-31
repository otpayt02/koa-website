# KOA Canonical One-App Phase 7 Implementation Plan

> **For Claude:** Use `@skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Make `C:\Users\olive\Projects\koa-website` the single runnable KOA application with four locale pivots, protected authoring studios, corrected cinematic identity motion, durable documentation, and one PowerShell launch command.

**Architecture:** Keep the React App Router under `app/[lang]` as the only product runtime and retain `public/koa` as a read-only parity reference until browser QA passes. Add small domain modules for locale metadata, page authorization, translation provenance, cinematic particles, frame manifests, and partner verification so `CinematicHome.tsx` and admin pages do not absorb unrelated complexity. Implement on `feat/cinematic-spec`, verify there, fast-forward `main`, then retire the already-merged bilingual worktree without deleting its remote branch.

**Tech Stack:** React 19, Next.js 16 App Router, vinext 0.0.50, TypeScript 5.9, Drizzle ORM/D1, native Canvas/CSS motion, Node test runner, PowerShell, Playwright/Chrome browser QA.

---

## Execution boundaries

- Working directory: `C:\Users\olive\Projects\koa-website`.
- Approved design baseline: `ddf4ceb` and `docs/superpowers/specs/2026-08-24-koa-canonical-one-app-consolidation-design.md`.
- Preserve untracked `cinematic-cookbook.md` and all `output/playwright` evidence unless a task explicitly archives an exact generated path first.
- Do not modify `public/koa` except for parity-test references. New behavior belongs in React.
- Do not install Magic UI or add a second glyph runtime. The failed installation stays documented.
- Do not deploy, publish, delete remote branches, invent partner relationships, or label unreviewed translation proposals as approved/training data.
- Use `apply_patch` for hand-edited files. Run each failing test before implementation and each passing test afterward.
- If the same verification failure survives two reversible fixes, preserve the work, record the blocker in the ledger, and continue only with an independent task.

### Task 1: Restore and prove the canonical vinext toolchain

**Files:**

- Create: `tests/vinext-environment.test.mjs`
- Modify only if the lock is demonstrably stale: `package-lock.json`
- Reference: `package.json`

**Step 1: Write the failing environment test**

Create a test that asserts the locked vinext package and Windows binary exist without starting the server:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("the canonical checkout has the locked vinext runtime", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.devDependencies.vinext, "0.0.50");
  assert.ok(existsSync(new URL("../node_modules/.bin/vinext.cmd", import.meta.url)));
});
```

**Step 2: Run the test and confirm the known failure**

Run:

```powershell
Set-Location 'C:\Users\olive\Projects\koa-website'
node --test tests\vinext-environment.test.mjs
```

Expected: FAIL because `node_modules\.bin\vinext.cmd` is absent.

**Step 3: Restore locked dependencies after disk preflight**

Run:

```powershell
$freeBytes = (Get-PSDrive -Name C).Free
if ($freeBytes -lt 2GB) { throw 'At least 2 GB free is required before npm ci.' }
Set-Location 'C:\Users\olive\Projects\koa-website'
npm.cmd ci
```

Expected: npm exits `0`; `package-lock.json` remains unchanged unless npm reports a genuine lock mismatch. Do not substitute `npm install` casually.

**Step 4: Re-run the environment test**

Run: `node --test tests\vinext-environment.test.mjs`

Expected: PASS.

**Step 5: Establish a baseline build without claiming visual parity**

Run:

```powershell
npm.cmd exec tsc -- --noEmit
npm.cmd run build
```

Expected: both exit `0`. If build fails, apply at most two scoped vinext fixes and record the exact error before proceeding.

**Step 6: Commit**

```powershell
git add tests\vinext-environment.test.mjs package-lock.json
git commit -m "test: lock the canonical vinext environment"
```

### Task 2: Add the one-paste PowerShell runner

**Files:**

- Create: `scripts/run-koa.ps1`
- Create: `scripts/stop-koa.ps1`
- Create: `tests/run-koa-script.test.mjs`
- Modify: `.gitignore`
- Modify: `README.md`

**Step 1: Write failing runner contract tests**

Test that the runner contains a 2 GB preflight, verifies `vinext.cmd`, records one owned PID, waits on `/en`, supports `-NoBrowser` and `-CheckOnly`, and never contains deploy/publish commands. Test that the stop script reads the recorded state and stops only that PID.

Run: `node --test tests\run-koa-script.test.mjs`

Expected: FAIL because both scripts are missing.

**Step 2: Implement the runner parameters and preflight**

The opening contract is:

```powershell
param(
  [int]$Port = 3000,
  [switch]$NoBrowser,
  [switch]$CheckOnly
)

$koaRoot = Split-Path -Parent $PSScriptRoot
$statePath = Join-Path $koaRoot '.koa-runtime.json'
$vinextPath = Join-Path $koaRoot 'node_modules\.bin\vinext.cmd'
$koaUrl = "http://127.0.0.1:$Port/en"
```

Required behavior:

1. Resolve `$koaRoot` and refuse a different checkout.
2. Require 2 GB free before `npm.cmd ci` when dependencies are missing.
3. Fail if the port belongs to an unidentified process; never kill it.
4. Start `npm.cmd run dev -- --host 127.0.0.1 --port $Port` with `-WindowStyle Hidden`.
5. Poll `$koaUrl` for up to 60 seconds using `Invoke-WebRequest`; do not use a fixed long sleep.
6. Write PID, port, URL, root, and start time to `.koa-runtime.json`.
7. Open `$koaUrl` unless `-NoBrowser`; print the exact stop command.
8. In `-CheckOnly`, perform preflight and exit without starting a process.

**Step 3: Implement the stop script**

Read `.koa-runtime.json`, verify the PID still exists and its command line references this repository or the recorded port, stop only that PID, wait for exit, and remove the state file. Refuse mismatched state.

**Step 4: Ignore runtime state, not proof media**

Append:

```gitignore
.koa-runtime.json
output/runtime/
.playwright-cli/
```

Do not ignore `output/playwright` globally because named proof is intentionally inspectable.

**Step 5: Run tests and a no-start preflight**

```powershell
node --test tests\run-koa-script.test.mjs
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\run-koa.ps1 -CheckOnly -NoBrowser
```

Expected: PASS and a clear preflight summary.

**Step 6: Update README with the now-real permanent command**

Remove “planned” language and retain exactly:

```powershell
Set-Location 'C:\Users\olive\Projects\koa-website'; powershell -NoProfile -ExecutionPolicy Bypass -File '.\scripts\run-koa.ps1'
```

Include the stop command: `powershell -NoProfile -ExecutionPolicy Bypass -File '.\scripts\stop-koa.ps1'`.

**Step 7: Commit**

```powershell
git add .gitignore README.md scripts\run-koa.ps1 scripts\stop-koa.ps1 tests\run-koa-script.test.mjs
git commit -m "feat: add one-command KOA local runner"
```

### Task 3: Make React and four locale pivots canonical

**Files:**

- Modify: `components/i18n.ts:1-33`
- Modify: `components/LanguageToggle.tsx:1-27`
- Modify: `components/Header.tsx:95-108`
- Modify: `app/[lang]/layout.tsx:1-40`
- Modify: `app/page.tsx:1-5`
- Modify: `app/sitemap.ts`
- Create: `messages/th.json`
- Create: `messages/my.json`
- Create: `messages/ksw.json` from reviewed `messages/karen.json`
- Retain temporarily: `messages/karen.json` as a documented compatibility source until all imports are removed
- Create: `tests/locale-contract.test.mjs`
- Modify: `tests/rendered-bilingual.test.mjs:35-78`
- Modify: `tests/rendered-html.test.mjs:29-45`

**Step 1: Write failing locale and canonical-root tests**

Assert:

- locale registry is `en`, `th`, `my`, `ksw`;
- root redirects to `/en`, not `/koa/`;
- layout static params come from the shared registry;
- toggle exposes all four pivots and preserves the remainder of the route;
- rendered checks request all four routes;
- no public header or preview bar links visitors to `/koa/`.

Run:

```powershell
node --test tests\locale-contract.test.mjs tests\rendered-html.test.mjs
```

Expected: FAIL on the two-locale registry and `/koa/` redirect.

**Step 2: Centralize locale metadata**

Use one registry in `components/i18n.ts`:

```ts
export const languages = ["en", "th", "my", "ksw"] as const;
export type Lang = (typeof languages)[number];

export const localeMeta: Record<Lang, { label: string; nativeLabel: string; htmlLang: string }> = {
  en: { label: "English", nativeLabel: "English", htmlLang: "en" },
  th: { label: "Thai", nativeLabel: "ไทย", htmlLang: "th" },
  my: { label: "Burmese", nativeLabel: "မြန်မာ", htmlLang: "my" },
  ksw: { label: "S'gaw Karen", nativeLabel: "ကညီ", htmlLang: "ksw" },
};
```

Import all four catalogs. Keep their key shape equal to `messages/en.json`. Thai, Burmese, and S'gaw Karen strings are proposals until reviewed; record that status in the Language Studio data rather than presenting it as approved copy.

**Step 3: Replace the binary language toggle**

Render four links from `languages`, excluding or marking the current language. Replace `/^(en|karen)/` with a registry-derived locale prefix matcher. Set cookie/local storage and `document.documentElement.lang` from `localeMeta`.

**Step 4: Remove the split-runtime navigation**

- Change `app/page.tsx` to `redirect("/en")`.
- Remove the “Bilingual preview mode” bar from `app/[lang]/layout.tsx`.
- Remove the `Cinematic site` `/koa/` switch from `Header.tsx`.
- Generate static params from `languages`, not a duplicate array.
- Update sitemap alternates for all four locales.

**Step 5: Run locale checks**

```powershell
node --test tests\locale-contract.test.mjs tests\rendered-html.test.mjs
npm.cmd exec tsc -- --noEmit
```

Expected: PASS. Rendered build-dependent checks may skip only before the next build; they must pass in final QA.

**Step 6: Commit**

```powershell
git add app components messages tests
git commit -m "feat: make four-locale React routes canonical"
```

### Task 4: Enforce server-side admin-only studio access

**Files:**

- Create: `lib/authorization.mjs`
- Create: `lib/page-auth.ts`
- Modify: `lib/auth.ts:1-60`
- Modify: `app/[lang]/admin/page.tsx:1-31`
- Create: `app/[lang]/admin/language-studio/page.tsx`
- Create: `app/[lang]/admin/design-studio/page.tsx`
- Create: `tests/admin-access.test.mjs`

**Step 1: Write failing authorization tests**

Test the pure policy:

```js
import { canAccessAdminStudio } from "../lib/authorization.mjs";

assert.equal(canAccessAdminStudio("admin"), true);
for (const role of ["public", "contributor", "reviewer", "approved_translator", "moderator"]) {
  assert.equal(canAccessAdminStudio(role), false);
}
```

Also assert all three admin pages call `requirePageAdmin` before rendering protected UI.

Run: `node --test tests\admin-access.test.mjs`

Expected: FAIL because the policy/helper/studio routes do not exist.

**Step 2: Implement one role policy**

`lib/authorization.mjs` exports `ADMIN_STUDIO_ROLES = ["admin"]` and `canAccessAdminStudio(role)`. Reuse it from API and page authorization rather than duplicating arrays.

**Step 3: Implement page authorization**

`requirePageAdmin(returnTo)` must:

1. Read request headers using `next/headers`.
2. Build a same-origin `Request` and call `requireAnyRole(request, ["admin"])`.
3. Redirect unauthenticated visitors through `chatGPTSignInPath(returnTo)`.
4. Return `notFound()` for authenticated non-admins so the private studio is not discoverable.
5. Propagate unexpected D1/runtime failures rather than pretending access was denied.

**Step 4: Guard the existing dashboard and both studio shells**

Call `await requirePageAdmin(...)` before `getMessages` or protected UI. Add links from the guarded dashboard to Language Studio and Design Studio. Keep `robots: { index: false, follow: false }` on all protected pages.

**Step 5: Run tests**

```powershell
node --test tests\admin-access.test.mjs
npm.cmd exec tsc -- --noEmit
```

Expected: PASS.

**Step 6: Commit**

```powershell
git add lib app\[lang]\admin tests\admin-access.test.mjs
git commit -m "feat: protect KOA authoring studios"
```

### Task 5: Add revisioned translation provenance and review schema

**Files:**

- Modify: `db/schema.ts:46-58,177-189`
- Create: `drizzle/0001_phase7_content_studio.sql` through Drizzle generation
- Modify: `drizzle/meta/_journal.json`
- Create: `drizzle/meta/0001_snapshot.json`
- Create: `tests/translation-schema.test.mjs`

**Step 1: Write the failing schema contract**

Assert the schema contains:

- locale enum `en`, `th`, `my`, `ksw` where public content uses locales;
- `contentUnits` with route, section, frame, source revision/text/provenance;
- `translationProposals` with locale, value, provider, model version, confidence, status, reviewer, review note, reviewed timestamp, and supersession;
- an index on content unit/revision and proposal status/locale;
- no path that treats `pending_review` as approved training data.

Run: `node --test tests\translation-schema.test.mjs`

Expected: FAIL on the old `en|karen` tables.

**Step 2: Add source and proposal tables**

Use these domain values:

```ts
export const contentLocales = ["en", "th", "my", "ksw"] as const;
export const proposalStatuses = ["draft", "pending_review", "approved", "rejected", "superseded"] as const;
```

`contentUnits` owns the canonical English revision. `translationProposals` owns proposal history. Keep `contentTranslations` temporarily for published compatibility, but extend its locale enum and document that only approved proposals may sync into it.

**Step 3: Generate and inspect the migration**

Run:

```powershell
npm.cmd run db:generate -- --name phase7_content_studio
```

Expected: a `0001` migration plus metadata. Inspect it for additive changes; it must not drop current user/content tables.

**Step 4: Run schema and type checks**

```powershell
node --test tests\translation-schema.test.mjs
npm.cmd exec tsc -- --noEmit
```

Expected: PASS.

**Step 5: Commit**

```powershell
git add db\schema.ts drizzle tests\translation-schema.test.mjs
git commit -m "feat: retain revisioned translation provenance"
```

### Task 6: Build the admin Language Studio vertical slice

**Files:**

- Create: `lib/translation-policy.mjs`
- Create: `lib/translation-service.ts`
- Create: `app/api/admin/content-units/route.ts`
- Create: `app/api/admin/translation-proposals/route.ts`
- Create: `components/admin/LanguageStudio.tsx`
- Modify: `app/[lang]/admin/language-studio/page.tsx`
- Modify: `app/globals.css`
- Create: `tests/translation-policy.test.mjs`
- Create: `tests/language-studio-contract.test.mjs`

**Step 1: Write failing policy tests**

Test:

- English is the only source locale;
- `th`, `my`, and `ksw` proposals reference the same English content unit/revision;
- no locale proposal can cite another proposal as its source;
- S'gaw Karen proposals always begin `pending_review`;
- export eligibility requires `approved`, a reviewer ID, and a matching current source revision.

Run: `node --test tests\translation-policy.test.mjs tests\language-studio-contract.test.mjs`

Expected: FAIL because the policy and studio do not exist.

**Step 2: Implement strict proposal validation**

Core policy shape:

```js
export const proposalLocales = ["th", "my", "ksw"];

export function createProposalInput({ contentUnitId, sourceRevision, locale, value, provider, modelVersion, confidence }) {
  if (!proposalLocales.includes(locale)) throw new Error("Unsupported proposal locale");
  return { contentUnitId, sourceRevision, locale, value, provider, modelVersion, confidence, status: "pending_review" };
}

export function isTrainingEligible(proposal, currentSourceRevision) {
  return proposal.status === "approved" && Boolean(proposal.reviewerId) && proposal.sourceRevision === currentSourceRevision;
}
```

**Step 3: Add admin-only APIs**

- Every handler begins with `requireAnyRole(request, ["admin"])`.
- `GET /api/admin/content-units` lists source units and proposals.
- `POST /api/admin/content-units` creates a new English revision with provenance.
- `POST /api/admin/translation-proposals` creates a proposal.
- `PATCH /api/admin/translation-proposals` approves, rejects, or supersedes with reviewer attribution.
- Use `handleApi`, `readJson`, `enumField`, `numberField`, and `textField` from `lib/api.ts`.
- Write an `auditLogs` row for every review transition.

**Step 4: Build the usable studio**

The client UI provides:

- route/section/frame list;
- English source and revision;
- four aligned locale columns;
- provider/model/confidence/provenance badges;
- proposal textarea and Save Draft action;
- Approve, Reject, and Supersede controls;
- explicit empty, loading, saved, permission-denied, and API-failure states;
- a warning that unreviewed S'gaw Karen is not training data.

Do not add an AI provider call. AI proposal generation is an explicit skill task later and posts traceable proposals through this API.

**Step 5: Run focused checks**

```powershell
node --test tests\translation-policy.test.mjs tests\language-studio-contract.test.mjs
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
```

Expected: PASS with no role or type errors.

**Step 6: Commit**

```powershell
git add lib app\api\admin app\[lang]\admin\language-studio components\admin app\globals.css tests
git commit -m "feat: add the admin Language Studio"
```

### Task 7: Create the frame manifest and mobile Design Studio

**Files:**

- Create: `content/cinematic-frame-manifest.json`
- Create: `lib/cinema/frame-manifest.ts`
- Create: `components/admin/DesignStudio.tsx`
- Modify: `app/[lang]/admin/design-studio/page.tsx`
- Modify: `app/globals.css`
- Create: `tests/frame-manifest.test.mjs`
- Create: `tests/design-studio-contract.test.mjs`

**Step 1: Write failing manifest tests**

Every frame must include:

```json
{
  "id": "home-arrival-seal",
  "route": "/[lang]",
  "entry": { "progress": 0 },
  "exit": { "progress": 0.18 },
  "foreground": [],
  "background": [],
  "staticFeatures": [],
  "motionFeatures": [],
  "tunables": {},
  "locales": ["en", "th", "my", "ksw"],
  "motionOff": {},
  "why": "",
  "evidence": []
}
```

Tests reject missing IDs, overlapping unordered progress ranges, undocumented tunables, and frames without a Motion-off result.

Run: `node --test tests\frame-manifest.test.mjs tests\design-studio-contract.test.mjs`

Expected: FAIL because the manifest/studio do not exist.

**Step 2: Encode the current home story**

Include arrival, seal migration, K/A resolve, delayed O resolve, copy reveal, scroll invitation, five chapter doors, partner handoff, and final involvement action. Reference the cookbook instead of duplicating long prose.

**Step 3: Build the admin Design Studio**

Provide:

- chronological frame rail;
- static/motion/content tabs;
- displayed tunables with safe ranges and reference weights;
- viewport buttons for `390×844`, `768×1024`, and full width;
- Motion on/off toggle passed into the preview URL;
- recursion-safe iframe source `/${lang}?koa-preview=1&motion=off|on`;
- Reload and Open Full Page actions;
- empty/error state if a manifest frame is invalid.

The iframe never points to `/admin/design-studio`.

**Step 4: Run tests and type checks**

```powershell
node --test tests\frame-manifest.test.mjs tests\design-studio-contract.test.mjs
npm.cmd exec tsc -- --noEmit
```

Expected: PASS.

**Step 5: Commit**

```powershell
git add content lib\cinema app\[lang]\admin\design-studio components\admin app\globals.css tests
git commit -m "feat: add frame-aware mobile Design Studio"
```

### Task 8: Replace duplicate orbit text with the exact seal annulus

**Files:**

- Create: `components/cinematic/SealAssembly.tsx`
- Modify: `components/CinematicHome.tsx:439-466`
- Modify: `app/globals.css:505-600`
- Create: `tests/phase7-seal-contract.test.mjs`

**Step 1: Write the failing seal contract**

Assert:

- both layers use `/koa/assets/koa-seal-white-lettering-v2.png`;
- the component has `seal-core` and `seal-annulus` layers;
- there is no SVG `textPath`, `cinematic-film__orbit`, or extra circumference copy in `CinematicHome.tsx`;
- both layers share the same CSS size/center variables;
- only the annulus receives scroll-related rotation;
- the K–seal–A trigger IDs remain unchanged.

Run: `node --test tests\phase7-seal-contract.test.mjs tests\phase5-motion-contract.test.mjs`

Expected: FAIL on the existing SVG orbit and low-resolution logo.

**Step 2: Implement the isolated assembly**

Use two co-centered images:

```tsx
export function SealAssembly({ rotation }: { rotation: number }) {
  return (
    <div className="cinematic-seal" style={{ "--seal-annulus-turn": `${rotation}deg` } as React.CSSProperties}>
      <img className="cinematic-seal__core" src="/koa/assets/koa-seal-white-lettering-v2.png" alt="" />
      <img className="cinematic-seal__annulus" src="/koa/assets/koa-seal-white-lettering-v2.png" alt="" />
    </div>
  );
}
```

Mask the core to the inner disk and annulus to the circumference band using complementary radial masks. Both layers use `inset: 0`, identical dimensions, transform origin `50% 50%`, and the same parent migration transform. Rotate only `__annulus`.

**Step 3: Preserve accessible identity**

The visual layers remain `aria-hidden`; keep one semantic KOA name in nearby DOM. Do not expose duplicate alt text.

**Step 4: Run tests and type checks**

```powershell
node --test tests\phase7-seal-contract.test.mjs tests\phase5-motion-contract.test.mjs
npm.cmd exec tsc -- --noEmit
```

Expected: PASS and no source contract loss for the established choreography.

**Step 5: Commit**

```powershell
git add components\cinematic\SealAssembly.tsx components\CinematicHome.tsx app\globals.css tests\phase7-seal-contract.test.mjs tests\phase5-motion-contract.test.mjs
git commit -m "fix: rotate only the supplied KOA seal lettering"
```

### Task 9: Make glyph paths persistent and restore 1800vh pacing

**Files:**

- Create: `lib/cinema/glyph-motion.mjs`
- Create: `components/cinematic/LivingGlyphField.tsx`
- Modify: `components/CinematicHome.tsx:46-189,225-364`
- Modify: `app/globals.css:350-365,476-505,1379-1410`
- Create: `tests/glyph-motion.test.mjs`
- Modify: `tests/phase5-motion-contract.test.mjs`

**Step 1: Write failing behavioral tests**

Create particles, advance through formation → disperse → reform, and assert:

- IDs and `pathSeed` never change;
- path arrays never become empty;
- the anchor remains fixed;
- speed decreases as anchor distance increases;
- alpha remains bounded and sparse;
- Motion off returns a complete static composition;
- CSS uses `1800vh` desktop and `1440vh` mobile.

Run: `node --test tests\glyph-motion.test.mjs tests\phase5-motion-contract.test.mjs`

Expected: FAIL because current `respawn` replaces particle state and React uses `1000vh`.

**Step 2: Implement a pure persistent motion engine**

Core state:

```js
{
  id,
  pathSeed,
  position: { x, y },
  velocity: { x, y },
  anchor: { x, y },
  target: { x, y },
  mode: "ambient" | "forming" | "breathing" | "dispersing",
  opacity,
  breathePhase
}
```

`retargetParticle` mutates target/mode but returns the same ID/path seed. `advanceParticle` uses distance-damped velocity and bounded easing. Life cycling changes fade phase and target; it does not reconstruct the path.

**Step 3: Extract the canvas component**

Move only the living-field responsibility out of `CinematicHome.tsx`. Keep orchestration/progress in the parent. Feed explicit phase, chapter, reduced-motion, and occlusion rectangles into the field.

**Step 4: Add durable phase telemetry**

Set `data-cinematic-phase` to stable values such as `arrival`, `seal-flight`, `glyph-o`, `chapter-1`, and `motion-off`. Browser tests wait on this authored state rather than a narrow transient CSS class.

**Step 5: Restore pacing and reduced-motion guardrails**

- Desktop film: `height: 1800vh`.
- Mobile film: `height: 1440vh`.
- Preserve native scroll and the existing normalized delay/hold engine.
- Motion off stops RAF, hides particle canvases, and leaves complete semantic foreground content.

**Step 6: Run tests**

```powershell
node --test tests\glyph-motion.test.mjs tests\phase5-motion-contract.test.mjs
npm.cmd exec tsc -- --noEmit
```

Expected: PASS.

**Step 7: Commit**

```powershell
git add lib\cinema\glyph-motion.mjs components\cinematic\LivingGlyphField.tsx components\CinematicHome.tsx app\globals.css tests
git commit -m "fix: keep cinematic glyph paths persistent"
```

### Task 10: Add verified partner rows with opposite autonomous motion

**Files:**

- Create: `content/partners.ts`
- Create: `components/cinematic/PartnerMarquee.tsx`
- Modify: `components/CinematicHome.tsx`
- Modify: `components/admin/DesignStudio.tsx`
- Modify: `app/globals.css`
- Create: `tests/partner-marquee.test.mjs`

**Step 1: Write failing data and motion contracts**

Test that every partner record has:

```ts
{
  id,
  name,
  relationshipStatus,
  logoPath,
  logoSource,
  logoPermission,
  url,
  reviewStatus
}
```

Assert public rendering filters to `relationshipStatus: "verified"`, `logoPermission: "approved"`, and `reviewStatus: "approved"`. Assert two rows have opposite CSS directions, pause on hover/focus, and become a static grid under reduced motion/Motion off.

Run: `node --test tests\partner-marquee.test.mjs`

Expected: FAIL because data/component/styles do not exist.

**Step 2: Implement the data boundary**

Do not invent relationships. Seed only records supported by an approved local source and logo-use evidence. If none are approved, keep draft records visible only in Design Studio and make the public component return `null`; record the content-data blocker rather than fabricating logos.

**Step 3: Implement the cinematic component**

- Duplicate the verified sequence only for seamless visual looping, with duplicate copies `aria-hidden`.
- Row one uses a slow leftward animation; row two uses the same duration rightward.
- Animation is time-based and independent of scroll progress.
- Pause the containing track on `:hover` and `:focus-within`.
- Use a static two-column/mobile-one-column grid for reduced motion and Motion off.
- Keep generous vertical spacing so this is one presentation, not another dashboard strip.

**Step 4: Run tests and type checks**

```powershell
node --test tests\partner-marquee.test.mjs
npm.cmd exec tsc -- --noEmit
```

Expected: component/policy tests PASS. If no relationship data is approved, report public content as data-blocked, not code-blocked.

**Step 5: Commit**

```powershell
git add content\partners.ts components\cinematic\PartnerMarquee.tsx components\CinematicHome.tsx components\admin\DesignStudio.tsx app\globals.css tests\partner-marquee.test.mjs
git commit -m "feat: add verified cinematic partner rows"
```

### Task 11: Add durable understanding, frame snapshots, and project skills

**Files:**

- Create: `UNDERSTANDING.md`
- Create: `docs/pages/home/design.md`
- Create: `docs/pages/home/spec.md`
- Create: `docs/pages/home/ideas.md`
- Create: `scripts/snapshot-cinematic-spec.mjs`
- Create: `scripts/update-understanding.mjs`
- Create: `docs/cinematic/versions/v0007-phase7.json`
- Create: `docs/cinematic/versions/v0007-phase7.md`
- Create: `skills/koa-mobile-preview/SKILL.md`
- Create: `skills/koa-translation-mapper/SKILL.md`
- Create: `skills/koa-frame-story-spec/SKILL.md`
- Create: `skills/repo-understanding-sync/SKILL.md`
- Create: `tests/documentation-sync.test.mjs`
- Modify: `README.md`
- Modify: `docs/KOA-CINEMATIC-COOKBOOK.md`

**Step 1: Write failing deterministic-documentation tests**

Assert:

- `UNDERSTANDING.md` lists every first-party top-level path and its purpose/removal impact;
- frame JSON validates against `content/cinematic-frame-manifest.json` structure;
- generated Markdown contains commit, route, locale, frame order, content, motion, tunables, evidence, and rationale;
- running each generator twice produces no diff;
- each project skill has valid frontmatter, trigger, inputs, workflow, output, verification, and approval boundary.

Run: `node --test tests\documentation-sync.test.mjs`

Expected: FAIL because artifacts/scripts/skills do not exist.

**Step 2: Implement the understanding generator**

Maintain a curated registry rather than explaining generated files individually. For each important file/folder record:

- why it exists;
- contents and owner;
- consumers;
- what fails if absent;
- generated/manual status;
- verification command;
- approval or privacy boundary.

The script updates only its marked generated section so hand-written context is preserved.

**Step 3: Implement the frame snapshot generator**

Read the canonical frame manifest and emit deterministic JSON/Markdown. Accept `--version`, `--commit`, and `--evidence-dir`; reject an unclean generated diff during finalization.

**Step 4: Create and validate four focused skills**

- `koa-mobile-preview`: starts the canonical runner, opens `390×844`, checks overflow/Motion off, and emits named evidence.
- `koa-translation-mapper`: takes an English content-unit revision plus independent Thai/Burmese/S'gaw Karen proposals, records provider/confidence/provenance, and posts drafts for review; it never approves automatically.
- `koa-frame-story-spec`: validates/generates the chronological frame manifest and Markdown snapshot.
- `repo-understanding-sync`: updates the marked section of `UNDERSTANDING.md` from repository changes without rewriting human notes.

During execution, invoke `@skill-creator` for each skill and use its validation command. Do not create a hidden background translator or external account.

**Step 5: Run deterministic and skill validation**

```powershell
node --test tests\documentation-sync.test.mjs
python 'C:\Users\olive\.codex\skills\.system\skill-creator\scripts\quick_validate.py' 'skills\koa-mobile-preview'
python 'C:\Users\olive\.codex\skills\.system\skill-creator\scripts\quick_validate.py' 'skills\koa-translation-mapper'
python 'C:\Users\olive\.codex\skills\.system\skill-creator\scripts\quick_validate.py' 'skills\koa-frame-story-spec'
python 'C:\Users\olive\.codex\skills\.system\skill-creator\scripts\quick_validate.py' 'skills\repo-understanding-sync'
```

Expected: all PASS and a second generator run leaves `git diff` unchanged.

**Step 6: Commit**

```powershell
git add UNDERSTANDING.md README.md docs content\cinematic-frame-manifest.json scripts skills tests\documentation-sync.test.mjs
git commit -m "docs: add versioned KOA story and repository guides"
```

### Task 12: Run full browser QA and capture Phase 7 proof

**Files:**

- Create: `scripts/verify-phase7-one-app.cjs`
- Create: `output/playwright/phase7-runtime-evidence.json`
- Create: `output/playwright/phase7-desktop-arrival.jpg`
- Create: `output/playwright/phase7-seal-flight.jpg`
- Create: `output/playwright/phase7-glyph-o.jpg`
- Create: `output/playwright/phase7-partners.jpg` only if verified partner data exists
- Create: `output/playwright/phase7-mobile.jpg`
- Create: `output/playwright/phase7-mobile-motion-off.jpg`
- Create: `output/playwright/phase7-language-studio.jpg` using sanitized local demo data
- Modify: `docs/codex/REQUEST_ADHERENCE_LEDGER.md`
- Modify: `docs/progress.md`
- Modify: `docs/decisions.md` only if QA forces a new decision
- Modify: `docs/cinematic/versions/v0007-phase7.md`

**Step 1: Write the condition-based verifier**

Use `@playwright` during execution. The script must wait on authored states, not arbitrary long sleeps, and report:

- exact URL, PID, source signature, viewport, and motion state;
- root `/` redirect to `/en`;
- successful `en`, `th`, `my`, `ksw` routes;
- anonymous/non-admin rejection for both studio routes;
- `1800vh` desktop and `1440vh` mobile film geometry;
- ordered `arrival → seal-flight → glyph-o → chapter-1` telemetry;
- exact white-lettering asset used twice with co-centered rectangles;
- no extra orbit SVG/text;
- persistent particle IDs/path seeds before and after dispersion;
- background cursor reveal plus zero foreground alpha sample;
- chapter numeral opacity below the solid-form guardrail;
- partner row directions/pause/static fallback when data exists;
- zero horizontal overflow and empty console error/warning lists;
- Motion-off complete content and settled canvas.

**Step 2: Run the canonical application**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File '.\scripts\run-koa.ps1' -NoBrowser
```

Use the printed URL/PID; do not reuse an unidentified older server.

**Step 3: Run focused tests, full tests, and build**

```powershell
node --test tests\vinext-environment.test.mjs tests\run-koa-script.test.mjs tests\locale-contract.test.mjs tests\admin-access.test.mjs tests\translation-schema.test.mjs tests\translation-policy.test.mjs tests\language-studio-contract.test.mjs tests\frame-manifest.test.mjs tests\design-studio-contract.test.mjs tests\phase7-seal-contract.test.mjs tests\glyph-motion.test.mjs tests\partner-marquee.test.mjs tests\documentation-sync.test.mjs
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npm.cmd test
node scripts\verify-phase7-one-app.cjs http://127.0.0.1:3000/en
```

Expected: all tests/build PASS; rendered tests do not skip after the build; evidence JSON contains no runtime problems.

**Step 4: Inspect proof media manually**

Inspect every named image. Confirm no crowding, seal crop seam, duplicate text, foreground glyph bleed, mobile collision, saturated numeral, or Motion-off omission. If a visual issue is not confirmed, do not make a speculative cosmetic change.

**Step 5: Stop the owned server**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File '.\scripts\stop-koa.ps1'
```

Expected: recorded PID exits and port 3000 is released.

**Step 6: Update evidence-backed documentation**

Change planned rows to implemented/verified only where proof exists. Record partner content as data-blocked if relationships/logo rights remain unapproved. Record exact test counts, evidence files, and any remaining limitation.

**Step 7: Commit**

```powershell
git add scripts\verify-phase7-one-app.cjs output\playwright\phase7-* docs\codex\REQUEST_ADHERENCE_LEDGER.md docs\progress.md docs\decisions.md docs\cinematic\versions\v0007-phase7.md
git commit -m "test: verify the canonical KOA one-app experience"
```

### Task 13: Retire the bilingual worktree without data loss

**Files:**

- Create: `docs/history/bilingual-worktree-retirement.md`
- Preserve outside the retired worktree: `output/worktree-archive/bilingual-5d5bcfe/`
- Modify: `UNDERSTANDING.md`
- Modify: `docs/codex/REQUEST_ADHERENCE_LEDGER.md`
- Modify: `docs/progress.md`

**Step 1: Reconfirm ancestry and enumerate exact dirt**

```powershell
git -C 'C:\Users\olive\Projects\koa-website' merge-base --is-ancestor 5d5bcfe main
if ($LASTEXITCODE -ne 0) { throw 'Bilingual commit is not contained in main.' }
git -C 'C:\Users\olive\Projects\koa-website-bilingual' status --short
git -C 'C:\Users\olive\Projects\koa-website-bilingual' diff -- .wrangler tsconfig.tsbuildinfo
```

Expected: only generated Wrangler/build changes plus `.playwright-cli` and `output`.

**Step 2: Preserve unique generated evidence before cleanup**

Create `output/worktree-archive/bilingual-5d5bcfe`, copy the bilingual `output` directory and a SHA-256 manifest there, and document source path, branch, commit, copy time, and recoverability. Do not commit bulk browser caches; commit only the retirement Markdown and checksum manifest if appropriate.

**Step 3: Dry-run exact generated cleanup**

```powershell
git -C 'C:\Users\olive\Projects\koa-website-bilingual' clean -nd -- .playwright-cli output
```

Expected: only those two generated directories. Stop if any other path appears.

**Step 4: Restore generated tracked files and clean archived untracked output**

```powershell
git -C 'C:\Users\olive\Projects\koa-website-bilingual' restore -- .wrangler tsconfig.tsbuildinfo
git -C 'C:\Users\olive\Projects\koa-website-bilingual' clean -fd -- .playwright-cli output
git -C 'C:\Users\olive\Projects\koa-website-bilingual' status --short
```

Expected: final status is empty. These commands are authorized only after Step 2 proves the evidence copy and Step 3 confirms targets.

**Step 5: Remove the worktree and local branch**

```powershell
git -C 'C:\Users\olive\Projects\koa-website' worktree remove 'C:\Users\olive\Projects\koa-website-bilingual'
git -C 'C:\Users\olive\Projects\koa-website' branch -d 'koa-visual-narrative-redesign-994e3'
git -C 'C:\Users\olive\Projects\koa-website' worktree list
```

Expected: only the canonical checkout remains; the local bilingual branch is deleted; no remote branch is deleted.

**Step 6: Update understanding and ledger**

Document why the worktree was retired, where evidence was archived, how locales now live in the canonical app, and that remote cleanup remains excluded.

**Step 7: Commit**

```powershell
git add docs\history\bilingual-worktree-retirement.md UNDERSTANDING.md docs\codex\REQUEST_ADHERENCE_LEDGER.md docs\progress.md
git commit -m "docs: retire the merged bilingual worktree"
```

### Task 14: Fast-forward main, run the final smoke check, and source-push only after the gate

**Files:**

- No new implementation files expected.
- Verify: `README.md`, `UNDERSTANDING.md`, `docs/codex/REQUEST_ADHERENCE_LEDGER.md`, Phase 7 evidence.

**Step 1: Verify the feature branch is clean except preserved user artifacts**

Run:

```powershell
git status --short
git log --oneline main..feat/cinematic-spec
```

Expected: no tracked modifications. Existing untracked `cinematic-cookbook.md` and prior evidence are preserved and disclosed.

**Step 2: Fast-forward local main**

```powershell
git switch main
git merge --ff-only feat/cinematic-spec
```

Expected: main advances without a merge commit or conflict.

**Step 3: Re-run the smallest critical smoke suite from main**

```powershell
node --test tests\locale-contract.test.mjs tests\admin-access.test.mjs tests\phase7-seal-contract.test.mjs tests\glyph-motion.test.mjs tests\partner-marquee.test.mjs
npm.cmd run build
powershell -NoProfile -ExecutionPolicy Bypass -File '.\scripts\run-koa.ps1' -NoBrowser
node scripts\verify-phase7-one-app.cjs http://127.0.0.1:3000/en --smoke
powershell -NoProfile -ExecutionPolicy Bypass -File '.\scripts\stop-koa.ps1'
```

Expected: PASS with one canonical main runtime.

**Step 4: Review the final source-push gate**

Before pushing, report the exact commits, tests, proof, remaining partner/translation review limitations, preserved untracked files, and confirmation that no deployment will occur. Source push was previously requested, but do not combine it with a Sites deployment or remote branch deletion.

**Step 5: Push main after the explicit execution checkpoint**

```powershell
git push origin main
```

Expected: `origin/main` advances to the verified local main commit. No deploy command follows.

## Final acceptance checklist

- [ ] `scripts/run-koa.ps1` opens one current React runtime from one paste and prints a safe stop command.
- [ ] `/` redirects to `/en`; no public navigation sends visitors to `/koa/`.
- [ ] English, Thai, Burmese, and S'gaw Karen pivots render with correct HTML language metadata.
- [ ] Admin dashboard, Language Studio, and Design Studio are server-side admin-only.
- [ ] Translation proposals retain English source revision, independent locale provenance, model/provider/confidence, and human review state.
- [ ] Unreviewed S'gaw Karen proposals are excluded from approved/training exports.
- [ ] The Design Studio shows chronological frames and a recursion-safe `390×844` real-app preview.
- [ ] Only the supplied seal's embedded annular lettering rotates; no duplicate circumference text remains.
- [ ] Glyph IDs/paths survive dispersion and re-formation, with distance-damped motion.
- [ ] Desktop film is `1800vh`; mobile is `1440vh`; Motion off is complete.
- [ ] Partner rows oppose each other, pause accessibly, and publish only verified/permissioned records.
- [ ] `UNDERSTANDING.md`, page design/spec/ideas, frame snapshots, cookbook, and four project skills are current and validated.
- [ ] Desktop, mobile, Motion-off, locale, admin-denial, occlusion, seal, and runtime-console proof exists.
- [ ] The bilingual worktree is archived and retired; its remote branch is untouched.
- [ ] Local main contains the verified commits; source push is separate from deployment.
