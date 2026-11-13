# GitHub connection setup

The backend now has a signed receiver at `POST /github/webhook`. It remains bound to localhost and cannot receive GitHub deliveries until a reviewed HTTPS ingress is configured. Do not point a webhook at `localhost`.

The Brain also has an on-demand public REST fallback through **Sync sources**. It reads recent commits and issues from `otpayt02/koa-website` without exposing the local backend. This works without a GitHub token, subject to GitHub's unauthenticated API rate limit. The webhook remains optional for near-real-time delivery.

## Prerequisites

- Repository admin access to `otpayt02/koa-website`.
- A reviewed HTTPS ingress that forwards only `/github/webhook` to the local backend. The ingress is not included in Compose.
- A random webhook secret stored outside Git. The current Brain has no login or shared access control.

## Setup

1. Set `GITHUB_WEBHOOK_SECRET` in ignored `brain-app/.env` to a random value of at least 32 characters. Recreate the backend container. Expose only `/github/webhook` through a reviewed HTTPS ingress; keep the Brain API on `127.0.0.1`.
2. In the repository, open **Settings → Webhooks → Add webhook**. Set the payload URL to `https://<your-host>/github/webhook`, content type to `application/json`, and enter the secret. Enable only **Issues**, **Pull requests**, and **Push** events.
3. The receiver validates `X-Hub-Signature-256` against the raw body before parsing, checks the repository, accepts selected issue and PR actions plus pushes, and tracks `X-GitHub-Delivery` to avoid duplicate inbox files.
4. Each accepted event writes a small, source-linked JSON summary. Full payloads and secrets are not stored in the inbox.

## Environment example

```dotenv
GITHUB_WEBHOOK_SECRET=<random-long-secret>
```

Compose reads the secret from `.env`. Keep it out of Git.

## Test

Use GitHub's **Recent Deliveries** to send a ping and inspect the receiver status. Then create a harmless test issue, PR, or push in the target repository. Confirm one attributed inbox file per delivery and its later move to `inbox/processed/`. Replay the same delivery and confirm no duplicate. Test an invalid signature and confirm no file is written. These live delivery tests have not been run here.

## Troubleshooting

- Delivery fails: check public HTTPS reachability, ingress routing, and GitHub's delivery response.
- Signature fails: validate the original body bytes and the configured secret, without reserializing JSON.
- No file appears after HTTP 2xx: check event selection, action filter, write permissions, and receiver logs.
- Duplicates: persist delivery IDs across restarts.

References: [GitHub webhook setup](https://docs.github.com/en/webhooks/using-webhooks/creating-webhooks), [signature validation](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries), [event payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads).
