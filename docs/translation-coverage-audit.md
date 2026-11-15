# Public translation coverage audit

Checked 2026-11-15 in `codex/koa-company-brain-connectors`.

## Why English remains

The public layout currently reads `messages/{locale}.json` for shared shell text, and individual pages mix localized `pageLabels` with hardcoded English. The existing `content/catalog.ts` has many additional English/Karen entries, but the `PublishedContentHydrator` is not mounted in the public layout, so those bindings never replace page text. The catalog and hydrator also retained the old `karen` locale name while public routes use `/ksw`. A requested translation is therefore neither a reviewed publication nor a live substitution. Thai and Burmese message catalogs cover the shell, but they do not cover all component text.

## Queue now generated

Run `npm.cmd run translation:queue` after source changes. The output `content/translation-queue.generated.json` contains English text candidates from the existing inventory, shared message catalog, and public TS/TSX source. Each segment carries a source location, life-area category, exact English word tokens and offsets, and null proposal slots for `ksw`, `th`, and `my`. Its word list groups repeated English words by life area and links every occurrence to a segment and token index. All entries are **unapproved**. They are review inputs, not translated pages.

Current counts: **1,668** source text candidates, **2,346** word/area entries, and **10,022** English word occurrences. The older bilingual inventory has **694** generated definitions and **719** DOM bindings; **657** of those definitions have no Karen text. All **38** shared shell message keys have a value in Thai, Burmese, and S’gaw Karen, which explains why navigation can appear translated while page content remains English.

The generated inventory is intentionally overinclusive: a source-level scanner can include a component that is not reachable in the running site, and can miss text assembled from runtime data, network responses, `Intl` formatting, or a rendered interaction state. The Muse task in [muse-full-site-translation-prompt.md](muse-full-site-translation-prompt.md) requires a route/state/attribute crawl to close those gaps. Do not claim 100% coverage from the static queue alone.

The approved Drive folder contains one native Google Doc, **“KOA website content draft — Brain source, unreviewed”**. It has 4,058 document paragraphs across an English six-page content draft and notes. It is a meaning reference, not public copy or approved translation. The translation scope is the actual public website; Brain remains English.

## Approval and training boundary

The importer accepts only known source IDs and exactly one alignment per English token for each target language. It writes `machine_proposal` review records and a per-locale coverage count. A null word alignment requires a grammar note. `Intl.Segmenter` exposes target word chunks as reviewer hints; it does not infer translation equivalence. A fluent reviewer must resolve S’gaw Karen variants, morphology, and context, while Thai and Burmese proposals need editorial review. No importer output is public or model training data by default.
