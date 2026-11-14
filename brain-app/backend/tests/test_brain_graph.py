"""Graph projection checks with synthetic records only."""

import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from knowledge import sync_processed
from routes.brain import graph_data


class BrainGraphChecks(unittest.TestCase):
    def test_graph_uses_indexed_records_and_stable_positions(self):
        with tempfile.TemporaryDirectory() as folder:
            processed = Path(folder) / "inbox" / "processed"
            processed.mkdir(parents=True)
            (processed / "one.md").write_text("Karen community gathering and language access", encoding="utf-8")
            (processed / "two.md").write_text("Karen community gathering and language access", encoding="utf-8")
            with patch.dict(os.environ, {"BRAIN_DATA_PATH": folder}):
                sync_processed()
                graph = graph_data()
                self.assertEqual(len(graph["nodes"]), 2)
                self.assertEqual(len(graph["edges"]), 1)
                self.assertEqual(graph, graph_data())
                self.assertIn("character n-gram", graph["similarity"])


if __name__ == "__main__":
    unittest.main()
