"""Synthetic local index checks; no organization records are read."""

import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from knowledge import database_path, search, sync_processed
from security import require_operator
from fastapi import HTTPException


class KnowledgeChecks(unittest.TestCase):
    def test_indexes_and_searches_unicode_without_external_calls(self):
        with tempfile.TemporaryDirectory() as folder:
            processed = Path(folder) / "inbox" / "processed"
            processed.mkdir(parents=True)
            private = Path(folder) / "brain-app" / "private"
            private.mkdir(parents=True)
            (private / "drive-cursor.scope.json").write_text('{"sample-file":"r1"}', encoding="utf-8")
            (processed / "sample.json").write_text(json.dumps({
                "source": "drive", "file_id": "sample-file", "revision": "r1", "name": "Community calendar",
                "content_utf8": "Karen community gathering on Saturday. ကညီဒီးကလုာ်"
            }), encoding="utf-8")
            (processed / "duplicate.json").write_bytes((processed / "sample.json").read_bytes())
            with patch.dict(os.environ, {"BRAIN_DATA_PATH": folder, "GOOGLE_CURSOR_PATH": str(private / "drive-cursor.txt")}):
                result = sync_processed()
                self.assertEqual(result["documents"], 1)
                self.assertTrue(database_path().is_file())
                matches = search("community gathering")
                self.assertEqual(matches[0]["source"], "drive")
                self.assertIn("Saturday", matches[0]["excerpt"])
                self.assertEqual(sync_processed()["updated"], 0)
                (processed / "sample.json").unlink()
                (processed / "duplicate.json").unlink()
                self.assertEqual(sync_processed()["documents"], 0)

    def test_signal_requires_exact_approved_group(self):
        with tempfile.TemporaryDirectory() as folder:
            processed = Path(folder) / "inbox" / "processed"
            processed.mkdir(parents=True)
            (processed / "signal.json").write_text(json.dumps({
                "source": "signal", "group_id": "other", "text": "synthetic secret"
            }), encoding="utf-8")
            with patch.dict(os.environ, {"BRAIN_DATA_PATH": folder, "SIGNAL_GROUP_ID": "approved",
                                          "SIGNAL_INGEST_APPROVED": "true"}):
                self.assertEqual(sync_processed()["documents"], 0)

    def test_drive_scope_excludes_superseded_and_removed_files(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            processed = root / "inbox" / "processed"
            private = root / "brain-app" / "private"
            processed.mkdir(parents=True)
            private.mkdir(parents=True)
            for revision in ("old", "current"):
                (processed / f"{revision}.json").write_text(json.dumps({
                    "source": "drive", "file_id": "approved-file", "revision": revision,
                    "name": "Brief", "content_utf8": f"Version {revision}"
                }), encoding="utf-8")
            scope = private / "drive-cursor.scope.json"
            scope.write_text('{"approved-file":"current"}', encoding="utf-8")
            with patch.dict(os.environ, {"BRAIN_DATA_PATH": folder, "GOOGLE_CURSOR_PATH": str(private / "drive-cursor.txt")}):
                self.assertEqual(sync_processed()["documents"], 1)
                self.assertEqual(search("current")[0]["excerpt"], "Version current")
                scope.write_text("{}", encoding="utf-8")
                self.assertEqual(sync_processed()["documents"], 0)

    def test_operator_token_rejects_unknown_token(self):
        with patch.dict(os.environ, {"BRAIN_ADMIN_TOKEN": "x" * 32}):
            with self.assertRaises(HTTPException) as caught:
                require_operator("Bearer wrong")
            self.assertEqual(caught.exception.status_code, 401)
            require_operator("Bearer " + "x" * 32)


if __name__ == "__main__":
    unittest.main()
