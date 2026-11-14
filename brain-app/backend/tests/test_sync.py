"""A failed remote source must not block the local index."""

import os
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from routes import sync


class SyncChecks(unittest.TestCase):
    def test_manual_drive_sync_includes_backend_import_path(self):
        with tempfile.TemporaryDirectory() as folder:
            token_path = Path(folder) / "drive-token.json"
            token_path.write_text("{}", encoding="utf-8")
            with patch.dict(os.environ, {"GOOGLE_DRIVE_FOLDER_ID": "approved-folder",
                                      "GOOGLE_TOKEN_PATH": str(token_path)}), \
                 patch.object(sync, "sync_github", return_value={"ingested": 0}), \
                 patch.object(sync, "_run_router", return_value={"processed_count": 0}), \
                 patch.object(sync, "sync_processed", return_value={"documents": 0}), \
                 patch.object(sync.subprocess, "run", return_value=SimpleNamespace(stdout='{"ingested": 0}')) as runner:
                sync._run()
            self.assertEqual(sync.status()["status"], "completed")
            self.assertIn(str(Path(sync.__file__).resolve().parents[1]), runner.call_args.kwargs["env"]["PYTHONPATH"])

    def test_github_failure_still_updates_local_index(self):
        with patch.dict(os.environ, {"GOOGLE_DRIVE_FOLDER_ID": ""}), \
             patch.object(sync, "sync_github", side_effect=OSError("synthetic network failure")), \
             patch.object(sync, "_run_router", return_value={"processed_count": 0}), \
             patch.object(sync, "sync_processed", return_value={"documents": 2}):
            sync._run()
        result = sync.status()
        self.assertEqual(result["status"], "partial")
        self.assertEqual(result["results"]["knowledge"]["documents"], 2)
        self.assertEqual(result["results"]["drive"]["status"], "not_configured")


if __name__ == "__main__":
    unittest.main()
