# KOA Company Brain: local setup

This is an initial setup screen, not yet a shared knowledge workspace. Executive login and credentials do not exist yet; do not enter passwords. The existing backend imports route modules that are not yet present, so its service cannot start until those modules are supplied. Inbox routing is reserved for Phase 2. Use it only on your own computer.

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and start it.
2. Clone the repository: `git clone https://github.com/otpayt02/koa-website.git`
3. Enter the repository: `cd koa-website`
4. Run `docker compose up` (requires Docker Compose 2.20.3 or newer).
5. Open [http://localhost:3000](http://localhost:3000). Executive login will be added in a later phase; it is not available yet.

The three services see live repository files through a read-only mount. The inbox container checks hourly for `route-inbox.py`, which is not included in this phase. Rebuild images after changing dependency files. Stop the stack with `Ctrl+C`.

The app binds to this computer only. It has no authentication, collaboration, or secure document access yet. Do not use this setup to store or share private executive data.
