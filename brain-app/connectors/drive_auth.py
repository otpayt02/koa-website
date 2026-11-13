"""One-time desktop OAuth authorization; writes token only to a private path."""

import os
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow


SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]


if __name__ == "__main__":
    credentials = Path(os.environ["GOOGLE_CLIENT_SECRETS_PATH"])
    target = Path(os.environ["GOOGLE_TOKEN_PATH"])
    target.parent.mkdir(parents=True, exist_ok=True)
    flow = InstalledAppFlow.from_client_secrets_file(str(credentials), SCOPES)
    token = flow.run_local_server(port=0)
    target.write_text(token.to_json(), encoding="utf-8")
    os.chmod(target, 0o600)
