# Google Drive connection setup

The optional `drive-connector` poller runs with the `drive` Compose profile. Its Compose default is `GOOGLE_DRIVE_SCOPE=all_related`: it discovers accessible text, Markdown, CSV, JSON, Google Docs, Google Sheets, and text-based PDFs, checks names and contents against KOA domain terms and a local semantic embedding, then persists attributed records that match. Unsupported formats, image-only PDFs, and common credential files are skipped. File content is read locally for classification and indexing; it is not sent to a hosted model. Set `GOOGLE_DRIVE_SCOPE=folder` to restrict discovery to direct children of the explicitly selected folder. OAuth requests Drive-wide read-only access to the account; folder filtering happens in this local connector, not at Google's consent boundary. The Brain uses one local operator token and has no individual accounts.

## Prerequisites

- The `koa-brain-drive` Google Cloud project has the Drive API enabled. Its OAuth consent screen is configured for `oliverp789@gmail.com` in Testing mode.
- The desktop OAuth client `KOA Brain local Drive reader` requests Drive read-only access. Its JSON and refresh token are ignored under `private-data/brain-app/private/` in the sibling `koa-brain-app` repository.
- An approved folder ID and a private local token path. The connector requires an OAuth refresh token for unattended polling.

## Setup

1. In Google Cloud, enable the Drive API and configure the OAuth consent screen. Create the OAuth client and keep its credentials outside Git.
2. Have the authorized account grant access to the approved folder or shared drive. Record the folder ID; do not assume access to all Drive files.
3. Place the downloaded OAuth client JSON at `../koa-brain-app/private-data/brain-app/private/drive-client.json`. In a local Python virtual environment, install `google-auth-oauthlib==1.2.2`, set `GOOGLE_CLIENT_SECRETS_PATH` and `GOOGLE_TOKEN_PATH`, then run `python connectors/drive_auth.py` from `koa-brain-app`. Complete browser consent. Both paths must stay under ignored `private-data/brain-app/private/`. This one-time host helper is separate from the small runtime image.
4. Set `GOOGLE_DRIVE_SCOPE=all_related` for account-wide related-file discovery, or `GOOGLE_DRIVE_SCOPE=folder` plus `GOOGLE_DRIVE_FOLDER_ID` for the narrower mode; set `GOOGLE_DRIVE_ID` only for folder mode on a shared drive. The first worker run saves a change token, backfills the selected scope, then catches changes after that token. The selected review folder is [KOA Brain Approved Sources](https://drive.google.com/drive/folders/1qgbb-LnPcK1qB1i1szD9Rr77aCz4fak3).
5. From `koa-brain-app/`, run `docker compose --profile drive up --build -d`. Inspect `docker compose logs drive-connector`.

## Environment example

```dotenv
GOOGLE_DRIVE_FOLDER_ID=<approved-folder-id>
GOOGLE_DRIVE_ID=<shared-drive-id-if-used>
GOOGLE_DRIVE_SCOPE=folder
DRIVE_SYNC_INTERVAL_SECONDS=60
```

Compose reads the folder and optional drive ID from `koa-brain-app/.env`; the token and cursor paths are fixed inside ignored `koa-brain-app/private-data/brain-app/private/`. Never commit the OAuth client or token.

## Test

Upload a harmless text file into the approved folder after the worker has started. Verify one `drive-*.json` record appears in `inbox/new/`, is routed to `inbox/processed/`, and retains the file ID and revision. Change an unrelated folder and verify it is ignored. The first live account sync completed with `{"ingested":0}` because the approved folder was empty. An add/change/remove test with a real file has not yet been run. Google external OAuth apps in Testing mode issue refresh tokens that expire after seven days; reauthorize when the worker reports a refresh failure.

## Troubleshooting

- OAuth denied: check consent-screen test users, scopes, and redirect URI for the chosen client type.
- Missing shared-drive files: verify membership, drive ID, and shared-drive API parameters.
- Duplicates or missed files: inspect the persisted cursor and revision deduplication state; do not reset the cursor casually.
- Google Docs cannot download as binary: use the Drive export API and a documented output format.
