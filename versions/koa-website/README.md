# KOA version catalog

Generated locally by `scripts/build-koa-version-catalog.mjs`; it does not copy, move, delete, publish, or rewrite a website asset.

- `canonical/CANONICAL.md` is the one authoritative source pointer.
- `html/<id>/VERSION.md` is one folder per distinct HTML file hash; duplicates point back to it.
- `git/<id>/VERSION.md` is one folder per recoverable branch launcher.
- `assets/registry.json` is the running hash registry. Each HTML version points to a single canonical asset occurrence by hash.

Rebuild into a new empty destination with:

`node .\scripts\build-koa-version-catalog.mjs --canonical-ref origin/main`
