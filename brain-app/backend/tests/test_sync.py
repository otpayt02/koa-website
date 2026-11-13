"""A failed remote source must not block the local index."""

import os
import unittest
from unittest.mock import patch

from routes import sync


class SyncChecks(unittest.TestCase):
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
