# KOA Company Brain: local setup

This is a local, single-operator inbox and vector search dashboard. It shows files waiting in `inbox/new/` and files already routed to `inbox/processed/`, searches a local SQLite vector index, and has a **Sync sources** button. The operator token protects the private API, but individual executive accounts, encryption at rest, and a retention policy are not implemented. Use it only on your own computer; do not ingest executive Signal messages until the exact group and policy are approved.

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and start it.
2. Clone the repository: `git clone https://github.com/otpayt02/koa-website.git`
3. Enter the repository: `cd koa-website`
4. Copy `.env.example` to the ignored `.env`. Set `BRAIN_ADMIN_TOKEN` to a random value of at least 32 characters; for example, generate one with `python -c "import secrets; print(secrets.token_hex(32))"`. Keep this token private.
5. Enter `brain-app`: `cd brain-app`, then run `docker compose up --build -d` (requires Docker Compose 2.20.3 or newer). Compose starts Ollama and downloads the local embedding and answer models on first run.
6. Open [http://localhost:3001](http://localhost:3001) and enter the operator token. The frontend proxies `/api` to the backend inside Compose.

The backend image includes its API code and inbox router. On startup it checks `BRAIN_DATA_PATH` and creates `inbox/new` and `inbox/processed` if needed. The frontend waits for the backend's `GET /health` check before starting. Verify initialization with `docker compose ps` and `curl http://localhost:8000/health`; the response should be `{"status":"ok"}`. The host ports remain bound to `127.0.0.1`.

The backend and inbox worker see live repository files through a bind mount. The frontend source and locked dependencies are built into its image; rebuild after changing frontend files. The inbox worker processes files immediately on startup and every 30 minutes by default; set `INBOX_INTERVAL_MINUTES` to change the interval. Put files in `inbox/new/`; the worker moves them into `inbox/processed/` and adds a reference to a topic index such as `decisions/decisions.md`. The backend lists inbox items at `GET /api/inbox/new` and `GET /api/inbox/processed`, runs a manual pass at `POST /api/inbox/process`, and marks a specific new item processed at `POST /api/inbox/mark-processed` with `{"item_path":"filename.md"}`. Stop the detached stack with `docker compose down`.

The app binds to this computer only. The operator token gates the inbox, sync, and knowledge endpoints. The SQLite file is under ignored `brain-app/private/knowledge.sqlite3`. Compose runs Ollama locally and pulls `embeddinggemma:300m` and `qwen2.5:1.5b`; vectors and grounded answers are produced on this computer, with source excerpts shown under each answer. No text is sent to a hosted model. Repository sync indexes readable, non-ignored text files and excludes secrets, private data, dependencies, generated output, and large files. Embedding similarity groups related topics; it is a retrieval aid and does not prove factual relationships. The index stores source excerpts and is not encrypted at rest.

On first startup, Compose downloads the local models before starting the Brain backend. Select **Sync sources**, wait for the run to complete, then ask “What is this project for, and what is currently blocking the webhook?” Review the displayed source files to verify the answer.

## Sync and source scope

The **Sync sources** button fetches recent public commits and issues from `otpayt02/koa-website` using GitHub's REST API, checks the approved Drive folder only when a local OAuth refresh token exists, routes new inbox files, and updates the vector index. GitHub's signed `POST /github/webhook` receiver remains available for a future narrow HTTPS ingress; GitHub cannot post to localhost. Manual GitHub fetches need no ingress. An unauthenticated GitHub API client has a lower rate limit, so the button is intended for deliberate runs rather than 15-second polling.

The Drive connector defaults to `GOOGLE_DRIVE_SCOPE=all_related`: it scans supported text, Docs, Sheets, and text-based PDFs accessible to the connected account, classifies them using the shared KOA relevance profile and local embeddings, then polls the Drive change cursor. It skips credential-like names and common secret payloads, and only persists records meeting the KOA relevance threshold. Image-only scans and unsupported binary formats need OCR or a dedicated parser and are not indexed. Set `GOOGLE_DRIVE_SCOPE=folder` to restrict it to the reviewed [KOA Brain Approved Sources](https://drive.google.com/drive/folders/1qgbb-LnPcK1qB1i1szD9Rr77aCz4fak3) folder. The dedicated Google Cloud project is `koa-brain-drive`; this computer has a private desktop OAuth token, while other clones need their own authorization. Supported types and Drive API visibility still limit discovery; see [Drive setup](../connections/drive-setup.md). Polling defaults to 60 seconds. Signal receives live events through a WebSocket and remains off until a linked account, exact group ID, and group approval are configured; see [Signal setup](../connections/signal-setup.md).

## Connections

Connector code is included but the external sources are opt-in. Review each guide and approve the exact source and privacy scope before enabling ingestion:

- [Signal group connection](../connections/signal-setup.md)
- [Google Drive folder connection](../connections/drive-setup.md)
- [GitHub webhook connection](../connections/github-setup.md)

Copy [.env.example](.env.example) to an ignored `.env` and configure only approved sources. Signal and Drive use optional Compose profiles; the GitHub receiver returns 503 until a webhook secret is set. GitHub still needs a reviewed HTTPS ingress to receive real deliveries. Signal needs a linked KOA account and an approved group; Drive needs OAuth authorization and an approved folder. The current Brain uses one local operator token and has no individual executive accounts.

## Public news and commentary desk

The default Compose stack includes `news-aggregator`. It reads the public RSS feeds from Karen News and KIC News once on startup and every hour, caching up to 30 attributed headlines and links from each source in ignored `brain-app/private/news-latest.json`. Failed feed requests leave the last successful cache in place. The operator-token protected `GET /api/news` returns that cache; `GET /api/commentary/suggestions` turns its first 20 items into neutral fact-check questions. Neither route copies article bodies or publishes political positions.

The Brain frontend has an **Editorial desk** view to open attributed news links, select a source, save a private English draft, and see review slots and draft status. The private commentary desk accepts sourced English drafts at `POST /api/commentary` and lists them at `GET /api/commentary`. Any submitted S’gaw Karen text is marked `pending_review`. `GET /api/commentary/schedule` gives the next six Monday/Wednesday/Friday 9:00 a.m. America/Chicago **review slots**. `POST /api/commentary/publish` rejects publication until an editorial and language-review workflow exists. The public site’s commentary route is a review-status landing page, not a feed of these private drafts. Do not put sensitive executive or Signal material in drafts: this local prototype has one operator token and unencrypted local JSON storage.

## Maintenance

From `brain-app/`, run `docker compose ps` to inspect services and `docker compose logs --tail=100 brain-backend brain-frontend inbox-processor` to inspect failures. Restart with `docker compose restart`; after dependency or source changes, rebuild with `docker compose up --build -d`. Stop with `docker compose down`. Add a harmless file to `../inbox/new/`, then inspect `../inbox/processed/` and the worker logs. If items accumulate, check the worker logs and `INBOX_INTERVAL_MINUTES`, then use `POST http://localhost:8000/api/inbox/process` for a manual pass. Preserve the original file until routing is confirmed.
