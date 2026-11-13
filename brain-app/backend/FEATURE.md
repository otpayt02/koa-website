# Docker backend initialization

## User outcome

Start the KOA Company Brain API in a Docker container with its application code in the image and its local inbox folders ready before requests are served.

## Current evidence

- Compose starts `brain-backend` on `127.0.0.1:8000`.
- The repository root is bind-mounted at `/app/brain-data`; `BRAIN_DATA_PATH` points there.
- The API uses the inbox router script and serves the frontend's `/api/inbox/*` requests.

## Scope and behavior

- The backend image contains the API and inbox router script. It starts Uvicorn without development reload.
- Startup validates the configured data root and creates the two inbox folders idempotently.
- `GET /health` reports readiness after startup. The frontend waits for a healthy backend.
- Existing inbox and webhook routes, local bind mounts, and connector opt-in settings remain in place.

## Safety and cost

The stack remains bound to localhost. It has no executive authentication, so private executive data is still out of scope. No new paid or external service is enabled. The Docker build excludes `.env` and private files from its context.

## Acceptance and proof

- [x] Isolated initialization tests pass.
- [x] Compose configuration validates.
- [x] Docker image builds and health endpoint responds from the running container.
- [x] Frontend can connect after backend readiness.

## Rollback

Revert this change and rebuild the backend image; repository data remains on the host mount.
