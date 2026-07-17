"""
Minimal in-memory TTL cache.

Not for production/multi-instance use (dies on restart, not shared across
workers) — but for a single-process dev/demo deployment it avoids hammering
NewsAPI's 100/day limit and re-running FinBERT unnecessarily.
"""
import time
from typing import Any, Optional

_store: dict[str, tuple[float, Any]] = {}
DEFAULT_TTL_SECONDS = 300  # 5 minutes — news/price don't change meaningfully faster than this


def get(key: str) -> Optional[Any]:
    entry = _store.get(key)
    if entry is None:
        return None
    expires_at, value = entry
    if time.time() > expires_at:
        del _store[key]
        return None
    return value


def set(key: str, value: Any, ttl: int = DEFAULT_TTL_SECONDS) -> None:
    _store[key] = (time.time() + ttl, value)