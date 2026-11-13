# KOA Company Brain: local setup

This is a local inbox dashboard, not yet a secure shared knowledge workspace. It shows files waiting in `inbox/new/` and files already routed to `inbox/processed/`, lets you refresh the lists, and can run the inbox processor manually for all files or one selected file. It lists file names, paths, and sizes; it does not display file contents or the topic indexes. Executive login and credentials do not exist yet. Use it only on your own computer and keep private executive data out of the inbox.

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and start it.
2. Clone the repository: `git clone https://github.com/otpayt02/koa-website.git`
3. Enter the repository: `cd koa-website`
4. Enter `brain-app`: `cd brain-app`, then run `docker compose up --build` (requires Docker Compose 2.20.3 or newer).
5. Open [http://localhost:3000](http://localhost:3000). The frontend proxies `/api` to the backend inside Compose. Executive login will be added in a later phase; it is not available yet.

The backend and inbox worker see live repository files through a bind mount. The frontend source and locked dependencies are built into its image; rebuild after changing frontend files. The inbox worker processes files immediately on startup and every 30 minutes by default; set `INBOX_INTERVAL_MINUTES` to change the interval. Put files in `inbox/new/`; the worker moves them into `inbox/processed/` and adds a reference to a topic index such as `decisions/decisions.md`. The backend lists inbox items at `GET /api/inbox/new` and `GET /api/inbox/processed`, runs a manual pass at `POST /api/inbox/process`, and marks a specific new item processed at `POST /api/inbox/mark-processed` with `{"item_path":"filename.md"}`. Stop the stack with `Ctrl+C`.

The app binds to this computer only. It has no authentication, collaboration, or secure document access yet. Do not use this setup to store or share private executive data.

## Connections

Connector code is included but the external sources are opt-in. Review each guide and approve the exact source and privacy scope before enabling ingestion:

- [Signal group connection](../connections/signal-setup.md)
- [Google Drive folder connection](../connections/drive-setup.md)
- [GitHub webhook connection](../connections/github-setup.md)

Copy [.env.example](.env.example) to an ignored `.env` and configure only approved sources. Signal and Drive use optional Compose profiles; the GitHub receiver returns 503 until a webhook secret is set. GitHub still needs a reviewed HTTPS ingress to receive real deliveries. Signal needs a linked KOA account and an approved group; Drive needs OAuth authorization and an approved folder. No live account connection was performed by this repository change. Do not place personal or sensitive files in `inbox/new/`; the current Brain has no executive access controls.

## Maintenance

From `brain-app/`, run `docker compose ps` to inspect services and `docker compose logs --tail=100 brain-backend brain-frontend inbox-processor` to inspect failures. Restart with `docker compose restart`; after dependency or source changes, rebuild with `docker compose up --build`. Add a harmless file to `../inbox/new/`, then inspect `../inbox/processed/` and the worker logs. If items accumulate, check the worker logs and `INBOX_INTERVAL_MINUTES`, then use `POST http://localhost:8000/api/inbox/process` for a manual pass. Preserve the original file until routing is confirmed.
