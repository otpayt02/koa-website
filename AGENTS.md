<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **koa-website** (3321 symbols, 7945 relationships, 278 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact before editing.** Use `impact({target: "symbolName", direction: "upstream"})` or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .`; report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- MUST warn on HIGH/CRITICAL `risk` pre-edit; never use `riskSharedAxes` to waive a HIGH/CRITICAL `risk` warning. Compare File/symbol: MCP File omits axes; Graph-RAG expands File.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- **MUST use `query({search_query: "concept"})` for concepts/flows, `context({name: "symbolName"})` for a named symbol, or `impact` for blast radius, on read-only callers, dependencies, imports, or execution flow.** Graph first; text search only for empty/`UNKNOWN`/literals.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/koa-website/context` | Codebase overview, check index freshness |
| `gitnexus://repo/koa-website/clusters` | All functional areas |
| `gitnexus://repo/koa-website/processes` | All execution flows |
| `gitnexus://repo/koa-website/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

## KOA operating context

- `app/`, `components/`, and `worker/` are the public vinext site and API. The private Company Brain lives in the sibling `../koa-brain-app` repository. Keep their data and credentials separate.
- Public site candidate: `npm.cmd run build`, then `npx.cmd wrangler dev --config dist/server/wrangler.json --port 3004 --local`. The public domain still serves the older Sites deployment until the Cloudflare migration gates in `docs/cloudflare-migration.md` pass.
- Brain: `../koa-brain-app/docker-compose.yml` is the container stack. It mounts this website read-only for indexing; run Compose from the Brain repository and keep the operator token and runtime data there in ignored files.
- Preserve the supplied KOA seal and sourced photography. Treat S’gaw Karen copy, policy claims, volunteer identities, drafts, and scraped material as review-gated. Never publish Brain records automatically.
- For visual work, use the installed scroll-craft, web-animation-design, ui-styling, impeccable-design-polish, and tastemaker skills as applicable. Verify desktop, narrow mobile, keyboard, and reduced-motion behavior before a release claim.
- For every new animation or scroll effect, read `.agents/skills/koa-motion-component-research/SKILL.md`; search the exact component demo, upstream source, license, and official API docs before selecting an implementation, then record the chosen adaptation.
- Keep local source, built candidate, private Brain, public deployment, and DNS cutover distinct in reports. Stage exact paths; do not include `inbox/`, the sibling Brain's ignored `private-data/`, archives, or generated editorial references in commits.
