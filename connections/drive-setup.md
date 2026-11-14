# Google Drive connection setup

The optional `drive-connector` poller is implemented and runs on this computer with the `drive` Compose profile. It indexes only direct children of an explicitly approved folder, stores a change cursor and current-revision scope, and writes attributed JSON records for text, Markdown, CSV, JSON, Google Docs, and Google Sheets. Other formats and nested folders are skipped. OAuth requests Drive-wide read-only access to the account; folder filtering happens in this local connector, not at Google's consent boundary. The Brain uses one local operator token and has no individual accounts.

## Prerequisites

- The `koa-brain-drive` Google Cloud project has the Drive API enabled. Its OAuth consent screen is configured for `oliverp789@gmail.com` in Testing mode.
- The desktop OAuth client `KOA Brain local Drive reader` requests Drive read-only access. Its JSON and refresh token are ignored under `brain-app/private/` on this computer.
- An approved folder ID and a private local token path. The connector requires an OAuth refresh token for unattended polling.

## Setup

1. In Google Cloud, enable the Drive API and configure the OAuth consent screen. Create the OAuth client and keep its credentials outside Git.
2. Have the authorized account grant access to the approved folder or shared drive. Record the folder ID; do not assume access to all Drive files.
3. Place the downloaded OAuth client JSON at `brain-app/private/drive-client.json`. In a local Python virtual environment, install `google-auth-oauthlib==1.2.2`, set `GOOGLE_CLIENT_SECRETS_PATH` and `GOOGLE_TOKEN_PATH`, then run `python brain-app/connectors/drive_auth.py` from the repository root. Complete browser consent. Both paths must stay under ignored `brain-app/private/`. This one-time host helper is separate from the small runtime image.
4. Set the approved folder ID in `brain-app/.env`; set the shared drive ID only if applicable. The first worker run saves a change token, backfills existing direct children, then catches changes after that token. The folder currently selected for this local Brain is [KOA Brain Approved Sources](https://drive.google.com/drive/folders/1qgbb-LnPcK1qB1i1szD9Rr77aCz4fak3); it was empty at creation.
5. From `brain-app/`, run `docker compose --profile drive up --build -d`. Inspect `docker compose logs drive-connector`.

## Environment example

```dotenv
GOOGLE_DRIVE_FOLDER_ID=<approved-folder-id>
GOOGLE_DRIVE_ID=<shared-drive-id-if-used>
DRIVE_SYNC_INTERVAL_SECONDS=60
```

Compose reads the folder and optional drive ID from `.env`; the token and cursor paths are fixed inside ignored `brain-app/private/`. Never commit the OAuth client or token.

## Test

Upload a harmless text file into the approved folder after the worker has started. Verify one `drive-*.json` record appears in `inbox/new/`, is routed to `inbox/processed/`, and retains the file ID and revision. Change an unrelated folder and verify it is ignored. The first live account sync completed with `{"ingested":0}` because the approved folder was empty. An add/change/remove test with a real file has not yet been run. Google external OAuth apps in Testing mode issue refresh tokens that expire after seven days; reauthorize when the worker reports a refresh failure.

## Troubleshooting

- OAuth denied: check consent-screen test users, scopes, and redirect URI for the chosen client type.
- Missing shared-drive files: verify membership, drive ID, and shared-drive API parameters.
- Duplicates or missed files: inspect the persisted cursor and revision deduplication state; do not reset the cursor casually.
- Google Docs cannot download as binary: use the Drive export API and a documented output format.
