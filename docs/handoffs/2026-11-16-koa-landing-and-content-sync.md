# KOA continuation handoff — 2026-11-16

## Copy into the next Codex chat

Continue the KOA website/content-sync task in `C:\Users\olive\Projects\koa-website`, branch `codex/koa-company-brain-connectors`. Do not start from a plan or replace this checkout. Read `AGENTS.md`, this handoff, `docs/koa-content-sync.md`, `docs/koa-motion-component-research.md`, and the local skill `.agents/skills/koa-motion-component-research/SKILL.md` first.

The request is to keep the real source site running locally through the project dev/preview commands, synthesize the current multilingual glyph-and-seal landing with the older chapter-led landing, use the legacy scene with a single oversized Karen flag and people around it, and reconcile the full rendered public text for every static page and section into only the `Published website copy` tab in the existing KOA Google Doc. Do not edit the English source or unapproved S'gaw Karen tab. Keep the daily Google Doc monitor; it already exists as “KOA daily content sync and deploy” and runs at 9:00 a.m. America/New_York. It is a daily check, not real-time change detection.

The earlier Meta-artifact run first paused at the usage limit, then a later continuation pushed commit `7390cc566b4385ae77860bf35543a1f6f5fc7473` and deployed Sites version 59. HTTP content was verified, but final narrow-mobile visuals remained unverified because the local build environment in that separate Sites checkout was incomplete. This request is a new source-checkout pass; do not repeat or claim the old mobile QA. Current pre-task HEAD was `2f907e667f43a196909d6d5ae357617f701df94a`; preserve unrelated dirty files and do not reset them.

## Current task ledger

1. Read the referenced chat and locate the paused state.
2. Check the active daily Google Docs monitor and its source document.
3. Restore the legacy oversized-flag landing illustration and synthesize the landing.
4. Export every static localized route, sync the Doc tab, and verify parity.
5. Keep a researched motion component workflow and deliver this handoff.

## Source boundaries

- Native Google Doc: `koa-my-koa-website-content-draft`, ID `12KQN1uLNMfIJj0bFrbPe7bLZ6U5qYlFrEo0I966W534`, connected Drive account `oliverp789@gmail.com`.
- Update only the `Published website copy` tab (`t.n2xtl590zkvo`) using the latest revision guard; verify the final contents by rereading the tab.
- Static public route templates are discovered from the current `app/[lang]` tree across `en`, `ksw`, `my`, and `th`. Admin paths and dynamic dictionary/profile IDs are excluded. The source `app/sitemap.ts` is currently narrower than the route tree; do not mistake sitemap coverage for full route coverage.
- Use `python scripts/export-published-site-copy.py --base-url http://[::1]:3000` to write `content/published-site-copy.txt` against the source site's local dev server. The exporter includes rendered text, hidden rendered text, labels, alt text, placeholders, tooltips, and share metadata. Source-only/action-state strings remain listed by `content/translation-queue.generated.json`.
- Preserve the other tabs, unapproved Karen proposals, and unrelated worktree files.

## Photo and design decision

The user clarified the requested photo composition: one enormous Karen flag stretched across the foreground, with the community gathered along its edge; photos dominated by many separate handheld flags are the wrong choice. The active hero uses the legacy illustration at `/koa/assets/karen-flag-capitol-legacy.webp`, derived from `versions/koa-website/runnable/assets/222812ce99b8dc2fdd67f7c0a128900451dfab86218c874be837a6bc14dd4449.png`. Smaller flags remain visible around the giant foreground flag. The building is the U.S. Capitol, not the White House, and the illustration must not be presented as documentary photography. Current landing keeps semantic translated headings and action links, then hands into distinct photo-led program sections with measured parallax. The previous CinematicLanding component remains a reference; avoid duplicating its content in the active home route.

## Skills to call for the next motion pass

- `$koa-motion-component-research` — required online component/source/license comparison for each requested effect.
- `$scroll-craft` — landing journey, hero depth, section variety, mobile composition.
- `$web-animation-design` — motion system and interaction details.
- `$impeccable` — hierarchy, accessibility, responsive polish, complete surface review.
- `$gsap-web`, `$60fps-animation`, `$accessible-animation` — downloaded from `iart-ai/web-animation-skills` into `C:\Users\olive\.codex\skills`; available in a new Codex turn.
- Read project `ss-motion`, `ss-a11y`, `ss-build`, and `ss-verify` when their scopes apply.

Motion component sources researched: [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [React Bits text and background catalog](https://reactbits.dev/c/text-animations), [React Bits source/license](https://github.com/DavidHDev/react-bits), [Motion Primitives MIT source](https://github.com/ibelick/motion-primitives), [Three.js docs](https://threejs.org/docs/), and [React Three Fiber source](https://github.com/pmndrs/react-three-fiber). Keep Three.js optional; the current photo story does not need a 3D runtime.

## Verified in this pass

- `npm.cmd run build` passed, including content and translation queue checks.
- Headless Chrome verified the legacy flag image loaded at desktop 1440 px and mobile 390 px, with no horizontal overflow; desktop image/copy parallax separated on scroll and returned on reverse scroll; `?motion=off` removed transforms; first Tab reached “Skip to main content”; no page errors were reported.
- The rendered text export covers 72/72 static localized routes (18 each for `en`, `ksw`, `my`, and `th`) and 3,971 text/label records. The `Published website copy` tab was reread and exactly matched `content/published-site-copy.txt`.
- The local KOA source dev server is reachable at `http://[::1]:3000/en`. The Brain frontend also listens on IPv4 port 3000; use IPv6 for the public KOA source page.
- Still required: stage exact paths, commit, push, and update this handoff with the final commit hash. No production deployment was made in this pass.
