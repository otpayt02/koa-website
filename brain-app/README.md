# KOA Company Brain

The brain lives in this folder. It is the canonical source of truth for the
site's live data: the daily headline run and the quarterly MCARI conflict
record.

## Layout

- `brain.json` — canonical config: MCARI stats, feed registry, headline-run settings
- `headlines.mjs` — the daily 10 AM Eastern scrape run (zero deps, Node 18+)
- `backend/` — FastAPI skeleton (`KOA Company Brain API`); route modules not yet implemented. Later this can serve `brain.json` and headline history as an API.

## The daily headline run (10:00 AM Eastern)

`.github/workflows/headlines.yml` fires at 15:00 UTC daily:

1. Reads `brain-app/brain.json`
2. Scrapes every feed in `feeds` — MCARI first (weight 3, page-watch since
   MCARI publishes no RSS), then Karen News, ReliefWeb, and Mizzima (RSS)
3. Filters by `headlineRun.keywords` (MCARI items always pass at weight 3)
4. Ranks by weight then recency, dedupes, caps at `maxItems`
5. Writes `public/feeds.json` — served at `/feeds.json`, consumed by the
   landing page ticker (`fetch("feeds.json")`)
6. Commits only when headlines changed; the push to `main` triggers
   `deploy-cloudflare.yml`

Optional: set the `SIGNAL_WEBHOOK` repository secret to a Signal webhook URL
ending in `text=` (e.g. CallMeBot) to get a ping on your phone each run.

## To add a feed source

Append to `feeds` in `brain.json`:

- `"type": "rss"` — `url` is the RSS/Atom feed URL
- `"type": "page"` — `url` is an HTML page; its h2/h3 headings are scraped

Higher `weight` outranks other sources.

## Quarterly stats refresh (agent contract)

Every quarter, fetch `https://mcari.org/en/monitor` and update the `mcari`
block in `brain.json`: `issue`, `period`, and `stats` from the latest issue's
key findings. Keep attribution intact — the landing page cites the issue
number and links to MCARI.

## Manual run

```bash
node brain-app/headlines.mjs
```
