"""Check the backend's local data initialization without touching repository data."""

import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from main import initialize_data_dirs


class InitializationChecks(unittest.TestCase):
    def test_creates_inbox_dirs_and_is_repeatable(self):
        with tempfile.TemporaryDirectory() as folder:
            with patch.dict(os.environ, {"BRAIN_DATA_PATH": folder}):
                root = initialize_data_dirs()
                self.assertEqual(root, Path(folder).resolve())
                self.assertTrue((root / "inbox/new").is_dir())
                self.assertTrue((root / "inbox/processed").is_dir())
                self.assertEqual(initialize_data_dirs(), root)

    def test_requires_configured_data_root(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(RuntimeError, "BRAIN_DATA_PATH"):
                initialize_data_dirs()

    def test_rejects_missing_data_root(self):
        with tempfile.TemporaryDirectory() as folder:
            with patch.dict(os.environ, {"BRAIN_DATA_PATH": str(Path(folder) / "missing")}):
                with self.assertRaises(FileNotFoundError):
                    initialize_data_dirs()


if __name__ == "__main__":
    unittest.main()
