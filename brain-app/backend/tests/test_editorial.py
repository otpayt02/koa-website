"""Editorial intake boundaries using synthetic data only."""

import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi import HTTPException

from routes.commentary import DraftInput, create_draft, list_drafts, publish_requires_review, schedule, suggestions
from routes.news import latest_news


class EditorialChecks(unittest.TestCase):
    def test_drafts_stay_private_and_publication_requires_review(self):
        with tempfile.TemporaryDirectory() as folder, patch.dict(os.environ, {"BRAIN_DATA_PATH": folder}):
            draft = create_draft(DraftInput(
                headline="A sourced community issue",
                source_url="https://example.org/report",
                angle_en="Check the facts before community commentary.",
                body_ksw="unreviewed synthetic text",
            ))
            self.assertEqual(draft["translation_status"], "pending_review")
            self.assertEqual(len(list_drafts()["drafts"]), 1)
            self.assertTrue((Path(folder) / "brain-app/private/commentary-drafts.json").is_file())
            with self.assertRaises(HTTPException) as raised:
                publish_requires_review()
            self.assertEqual(raised.exception.status_code, 409)

    def test_review_schedule_and_empty_news(self):
        with tempfile.TemporaryDirectory() as folder, patch.dict(os.environ, {"BRAIN_DATA_PATH": folder}):
            self.assertEqual(latest_news()["articles"], [])
            self.assertEqual(suggestions()["suggestions"], [])
            slots = schedule()["draft_review_slots"]
            self.assertEqual(len(slots), 6)
            self.assertEqual(schedule()["timezone"], "America/Chicago")


if __name__ == "__main__":
    unittest.main()
