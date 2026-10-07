import time
from collections import defaultdict
from threading import Lock
from typing import Dict, List
from app.core.exceptions import RateLimitError
from app.core.config import settings


class InMemoryRateLimiter:
    """Thread-safe rate limiter and cooldown tracker for anti-spam protection."""

    def __init__(self):
        self._lock = Lock()
        self._history: Dict[str, List[float]] = defaultdict(list)
        self._last_request: Dict[str, float] = {}

    def check_and_record(
        self,
        identifier: str,
        cooldown_seconds: int = None,
        max_per_hour: int = None,
    ) -> None:
        cooldown = cooldown_seconds if cooldown_seconds is not None else settings.REVIEW_COOLDOWN_SECONDS
        limit = max_per_hour if max_per_hour is not None else settings.REVIEW_RATE_LIMIT_PER_HOUR

        now = time.time()
        with self._lock:
            # Check cooldown
            last_time = self._last_request.get(identifier)
            if last_time is not None:
                elapsed = now - last_time
                if elapsed < cooldown:
                    remaining = int(cooldown - elapsed)
                    raise RateLimitError(
                        message=f"Please wait {remaining} seconds before submitting another review.",
                        error_code="REVIEW_COOLDOWN",
                    )

            # Check window (1 hour)
            one_hour_ago = now - 3600
            # Clean old records
            timestamps = [t for t in self._history[identifier] if t > one_hour_ago]
            if len(timestamps) >= limit:
                raise RateLimitError(
                    message=f"Hourly limit reached. Maximum {limit} reviews per hour allowed.",
                    error_code="RATE_LIMIT_EXCEEDED",
                )

            # Record submission
            timestamps.append(now)
            self._history[identifier] = timestamps
            self._last_request[identifier] = now


review_rate_limiter = InMemoryRateLimiter()
