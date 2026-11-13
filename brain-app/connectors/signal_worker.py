"""Receive only approved Signal group text from a linked local account."""

from __future__ import annotations

import json
import os
import time
from urllib.parse import quote, urlparse

import websocket

from connectors.inbox_writer import write_record


def message_record(event: dict, approved_group: str) -> tuple[str, dict] | None:
    envelope = event.get("params", {}).get("result", {}).get("envelope") or event.get("envelope")
    if not isinstance(envelope, dict):
        return None
    message = envelope.get("dataMessage")
    if not isinstance(message, dict):
        return None
    group = message.get("groupInfo") or message.get("groupV2") or {}
    if not isinstance(group, dict) or group.get("groupId") != approved_group:
        return None
    text = message.get("message")
    if not isinstance(text, str) or not text.strip():
        return None
    sender = envelope.get("sourceUuid") or envelope.get("sourceNumber")
    timestamp = envelope.get("timestamp")
    if not isinstance(sender, str) or not isinstance(timestamp, int):
        return None
    identity = f"{approved_group}:{sender}:{timestamp}"
    return identity, {"source": "signal", "group_id": approved_group,
                      "sender": sender, "timestamp_ms": timestamp, "text": text[:100_000]}


def main() -> None:
    if os.getenv("SIGNAL_INGEST_APPROVED") != "true":
        raise SystemExit("Signal ingestion requires explicit approval")
    group = os.environ["SIGNAL_GROUP_ID"]
    account = os.environ["SIGNAL_ACCOUNT"]
    if not group or not account:
        raise SystemExit("Approved group ID and Signal account are required")
    base = os.getenv("SIGNAL_API_URL", "http://signal-api:8080")
    parsed = urlparse(base)
    if parsed.hostname not in {"signal-api", "127.0.0.1", "localhost"}:
        raise SystemExit("Signal API must be local")
    endpoint = f"ws://{parsed.netloc}/v1/receive/{quote(account, safe='')}"
    while True:
        try:
            connection = websocket.create_connection(endpoint, timeout=60)
            try:
                while True:
                    event = json.loads(connection.recv())
                    result = message_record(event, group)
                    if result:
                        write_record("signal", *result)
            finally:
                connection.close()
        except (OSError, ValueError, websocket.WebSocketException) as error:
            print(f"Signal receiver reconnecting: {type(error).__name__}", flush=True)
            time.sleep(5)


if __name__ == "__main__":
    main()
