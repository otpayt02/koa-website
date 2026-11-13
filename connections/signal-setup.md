# Signal connection setup

The optional `signal-api` and `signal-connector` services are implemented. They stay off until the `signal` Compose profile is selected. The worker writes only text from one approved group into `inbox/new/` and deduplicates by group, sender, and timestamp. This is a Signal REST bridge, not an MCP server. Choose a dedicated KOA account and obtain group consent before enabling it.

## Prerequisites

- Docker Desktop and a KOA-managed Signal phone with access to the intended group.
- Approval from the account owner and the group for the exact group ID and privacy scope.
- An agreed retention and access policy for group messages. The current Brain has no login or shared access control.

## Setup

1. Review the [signal-cli-rest-api project](https://github.com/bbernhard/signal-cli-rest-api) and set `SIGNAL_API_IMAGE` to a reviewed immutable image tag or digest. Compose publishes the API on `127.0.0.1:8080`, stores its linked-device data in `signal_data`, and uses manual receive mode so messages are not silently consumed while the worker is disconnected.
2. Open `http://localhost:8080/v1/qrcodelink?device_name=koa-brain` on the host. On the KOA phone, use Signal **Settings → Linked devices → Link new device** and scan the QR code. The QR changes on each request.
3. Record the approved group ID locally. Put the values below in `brain-app/.env` after approval. Never copy unrelated chats.
4. From `brain-app/`, run `docker compose --profile signal up --build -d`. Review `docker compose logs signal-connector`.

## Environment example

```dotenv
SIGNAL_API_IMAGE=bbernhard/signal-cli-rest-api:<reviewed-version>
SIGNAL_ACCOUNT=+15555550123
SIGNAL_GROUP_ID=<approved-group-id>
SIGNAL_INGEST_APPROVED=true
```

Keep `.env` outside Git. Do not set `SIGNAL_INGEST_APPROVED=true` before the owner and group approve ingestion. The worker ignores attachments, stories, and unrelated groups.

## Test

Confirm the phone lists the linked device. Send a harmless test message to the approved group, then verify exactly one `signal-*.json` file appears in `inbox/new/` and later in `inbox/processed/`. This live account test has not been run here.

## Troubleshooting

- QR link fails: regenerate the QR, verify the phone is online, inspect the REST container logs, and check signal-cli version compatibility.
- Messages do not appear: confirm the account is in the group, the group ID filter matches, and the worker is running.
- Duplicate files: use the provider message timestamp and source identity as a persistent deduplication key.
- Sensitive content appears: stop the worker and review group consent and filtering before restarting.

Reference: [signal-cli-rest-api usage and QR linking](https://github.com/bbernhard/signal-cli-rest-api/blob/master/doc/EXAMPLES.md).
