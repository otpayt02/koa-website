# KOA public copy synchronization

## Authority and boundaries

- Source document: the unshared Google Doc `koa-my-koa-website-content-draft` (ID `12KQN1uLNMfIJj0bFrbPe7bLZ6U5qYlFrEo0I966W534`).
- The Google Doc's `Published website copy` tab is the rendered-site inventory. Update this tab only when synchronizing the full public copy; do not overwrite English source, Thai, Burmese, or S'gaw Karen editorial tabs as part of that inventory update.
- Never publish unapproved Karen translations. Thai and Burmese publication follow the active automation authorization. Keep scraped and personal Signal content out of this public inventory.

## Full-site capture

1. Start the source site with `npm.cmd run dev -- --port 3000` when capturing local changes. The public KOA source server is bound on IPv6 loopback because the Brain frontend uses IPv4 port 3000; use `http://[::1]:3000`.
2. Alternatively, build and start the local Wrangler preview on port 3004.
3. Run `python scripts/export-published-site-copy.py --base-url 'http://[::1]:3000'` for the source dev server, or pass the Wrangler preview origin explicitly.
4. Require all static public routes to return HTTP 200. The route list is discovered from non-dynamic, non-admin `app/[lang]/**/page.tsx` files and covers all four supported locales; admin paths and parameterized record/profile routes are intentionally excluded.
5. Compare `content/published-site-copy.txt` with the existing `Published website copy` tab. If the capture is unchanged, do not update the Doc or redeploy.
6. If changed, replace only the target tab's content, require the latest Google Docs revision ID, reread the tab, and verify route count, all locale headers, title/text records, and final snapshot metadata.

The capture includes rendered page text in order, including visually hidden rendered copy, accessible labels, image alt text, placeholders, tooltips, and public share metadata. It cannot invent states that are not rendered until interaction; source literals and their word/sentence records are tracked separately by `content/translation-queue.generated.json`.

## Recurring monitor

The Codex heartbeat automation `KOA daily content sync and deploy` checks the source each day at 9 a.m. America/New_York. It is a daily monitor rather than a real-time Drive webhook. Keep the existing automation instead of creating a duplicate. A Drive push notification or change-feed integration would be needed for immediate detection; the daily workflow should continue to report source inaccessible vs. confirmed no change accurately.
