#!/usr/bin/env python3
"""Run the inbox router immediately, then repeat on a configurable interval."""

from __future__ import annotations

import importlib.util
import logging
import os
import time
from pathlib import Path


ROUTER_PATH = Path(__file__).with_name("route-inbox.py")
SPEC = importlib.util.spec_from_file_location("koa_route_inbox", ROUTER_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Cannot load inbox router: {ROUTER_PATH}")
ROUTER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ROUTER)


def interval_seconds() -> int:
    raw = os.environ.get("INBOX_INTERVAL_MINUTES", "30")
    try:
        minutes = int(raw)
    except ValueError as error:
        raise ValueError("INBOX_INTERVAL_MINUTES must be a positive integer") from error
    if minutes < 1:
        raise ValueError("INBOX_INTERVAL_MINUTES must be at least 1")
    return minutes * 60


def main() -> None:
    logger = logging.getLogger("koa.inbox.scheduler")
    logger.setLevel(logging.INFO)
    logger.addHandler(logging.StreamHandler())
    delay = interval_seconds()
    logger.info("Inbox scheduler started; interval=%s minutes", delay // 60)
    while True:
        try:
            result = ROUTER.process_inbox()
            logger.info("Inbox run: %s", result)
        except Exception:
            logger.exception("Inbox run failed; the scheduler will retry next interval")
        time.sleep(delay)


if __name__ == "__main__":
    main()
