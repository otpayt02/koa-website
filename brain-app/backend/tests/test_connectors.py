"""Local signature, scope, and deduplication checks for connector intake."""

import asyncio
import hashlib
import hmac
import importlib.util
import json
import logging
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi import HTTPException

from connectors.inbox_writer import write_record
from routes.github import receive_webhook


class FakeRequest:
    def __init__(self, payload, headers):
        self.payload = payload
        self.headers = headers

    async def stream(self):
        yield self.payload


class ConnectorChecks(unittest.TestCase):
    def test_signed_github_delivery_and_duplicate(self):
        secret = "test-secret-with-at-least-thirty-two-characters"
        payload = json.dumps({"repository": {"full_name": "otpayt02/koa-website"},
                              "issue": {"id": 42, "title": "Harmless check", "html_url": "https://github.com/otpayt02/koa-website/issues/42"},
                              "action": "opened"}).encode()
        signature = "sha256=" + hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
        headers = {"x-hub-signature-256": signature, "x-github-delivery": "local-check-1", "x-github-event": "issues"}
        with tempfile.TemporaryDirectory() as folder, patch.dict(os.environ, {"GITHUB_WEBHOOK_SECRET": secret, "BRAIN_DATA_PATH": folder}):
            self.assertEqual(asyncio.run(receive_webhook(FakeRequest(payload, headers)))["status"], "created")
            self.assertEqual(asyncio.run(receive_webhook(FakeRequest(payload, headers)))["status"], "duplicate")
            self.assertEqual(len(list((Path(folder) / "inbox" / "new").glob("*.json"))), 1)
            script = Path(__file__).resolve().parents[2] / "inbox-processor" / "route-inbox.py"
            spec = importlib.util.spec_from_file_location("koa_test_router", script)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            result = module.process_inbox(Path(folder))
            self.assertEqual(result["processed_count"], 1)
            self.assertEqual(len(list((Path(folder) / "inbox" / "processed").glob("github-*.json"))), 1)
            self.assertEqual(asyncio.run(receive_webhook(FakeRequest(payload, headers)))["status"], "duplicate")
            with self.assertRaises(HTTPException) as error:
                asyncio.run(receive_webhook(FakeRequest(payload, {**headers, "x-hub-signature-256": "sha256=bad"})))
            self.assertEqual(error.exception.status_code, 401)
            logger = logging.getLogger("koa.inbox.processor")
            for handler in logger.handlers[:]:
                handler.close()
                logger.removeHandler(handler)

    def test_writer_rejects_unsupported_source(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaises(ValueError):
                write_record("unknown", "id", {}, Path(folder))


if __name__ == "__main__":
    unittest.main()
