# Google Drive connection setup

The optional `drive-connector` poller is implemented but stays off until the `drive` Compose profile is selected. It reads only direct children of an explicitly approved folder, stores a change cursor, and writes attributed JSON records for text, Markdown, CSV, JSON, Google Docs, and Google Sheets. Other formats and nested folders are skipped. The current Brain has no login or shared access control.

## Prerequisites

- A Google Cloud project with the Drive API enabled and an OAuth consent screen configured for the authorized KOA account.
- An OAuth client appropriate for the eventual local worker, with the minimum Drive read scope it needs.
- An approved folder ID and a private local token path. The connector requires an OAuth refresh token for unattended polling.

## Setup

1. In Google Cloud, enable the Drive API and configure the OAuth consent screen. Create the OAuth client and keep its credentials outside Git.
2. Have the authorized account grant access to the approved folder or shared drive. Record the folder ID; do not assume access to all Drive files.
3. Place the downloaded OAuth client JSON at `brain-app/private/drive-client.json`. In a local Python virtual environment, install `google-auth-oauthlib==1.2.2`, set `GOOGLE_CLIENT_SECRETS_PATH` and `GOOGLE_TOKEN_PATH`, then run `python brain-app/connectors/drive_auth.py` from the repository root. Complete browser consent. Both paths must stay under ignored `brain-app/private/`. This one-time host helper is separate from the small runtime image.
4. Set the approved folder ID in `brain-app/.env`; set the shared drive ID only if applicable. The first worker run saves the current change token and watches future changes. It does not backfill old files.
5. From `brain-app/`, run `docker compose --profile drive up --build -d`. Inspect `docker compose logs drive-connector`.

## Environment example

```dotenv
GOOGLE_DRIVE_FOLDER_ID=<approved-folder-id>
GOOGLE_DRIVE_ID=<shared-drive-id-if-used>
```

Compose reads the folder and optional drive ID from `.env`; the token and cursor paths are fixed inside ignored `brain-app/private/`. Never commit the OAuth client or token.

## Test

Upload a harmless text file into the approved folder after the worker has started. Verify one `drive-*.json` record appears in `inbox/new/`, is routed to `inbox/processed/`, and retains the file ID and revision. Change an unrelated folder and verify it is ignored. This live account test has not been run here.

## Troubleshooting

- OAuth denied: check consent-screen test users, scopes, and redirect URI for the chosen client type.
- Missing shared-drive files: verify membership, drive ID, and shared-drive API parameters.
- Duplicates or missed files: inspect the persisted cursor and revision deduplication state; do not reset the cursor casually.
- Google Docs cannot download as binary: use the Drive export API and a documented output format.
