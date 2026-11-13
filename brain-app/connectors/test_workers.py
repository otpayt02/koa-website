"""Harmless local connector event checks; no external accounts required."""

import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import drive_worker
from signal_worker import message_record


class StopPolling(Exception):
    pass


class WorkerChecks(unittest.TestCase):
    def test_signal_group_filter(self):
        event = {"params": {"result": {"envelope": {"sourceUuid": "sender-id", "timestamp": 123,
                 "dataMessage": {"message": "Harmless test", "groupInfo": {"groupId": "approved"}}}}}}
        self.assertIsNone(message_record(event, "different"))
        identity, record = message_record(event, "approved")
        self.assertEqual(identity, "approved:sender-id:123")
        self.assertEqual(record["text"], "Harmless test")

    def test_drive_approved_folder_and_cursor(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            private = root / "private"
            private.mkdir()
            (private / "cursor.txt").write_text("start", encoding="utf-8")
            environment = {"GOOGLE_DRIVE_FOLDER_ID": "approved", "GOOGLE_DRIVE_ID": "",
                           "BRAIN_DATA_PATH": folder, "GOOGLE_TOKEN_PATH": str(private / "token.json"),
                           "GOOGLE_CURSOR_PATH": str(private / "cursor.txt")}
            changes = {"newStartPageToken": "next", "changes": [
                {"file": {"id": "allowed", "name": "test.txt", "mimeType": "text/plain", "parents": ["approved"], "modifiedTime": "t1"}},
                {"file": {"id": "excluded", "name": "other.txt", "mimeType": "text/plain", "parents": ["other"], "modifiedTime": "t1"}},
            ]}
            def fake_get(_token, path, _params):
                return b"Harmless text" if path == "files/allowed" else json.dumps(changes).encode()
            with patch.dict(os.environ, environment), patch.object(drive_worker, "access_token", return_value="local-token"), \
                 patch.object(drive_worker, "drive_get", side_effect=fake_get), \
                 patch.object(drive_worker.time, "sleep", side_effect=StopPolling):
                with self.assertRaises(StopPolling):
                    drive_worker.main()
            records = list((root / "inbox" / "new").glob("drive-*.json"))
            self.assertEqual(len(records), 1)
            self.assertEqual(json.loads(records[0].read_text(encoding="utf-8"))["file_id"], "allowed")
            self.assertEqual((private / "cursor.txt").read_text(encoding="utf-8"), "next")


if __name__ == "__main__":
    unittest.main()
