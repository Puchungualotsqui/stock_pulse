import datetime
from collections import OrderedDict
from typing import Any, Dict

class NewsCache:
    """A simple in-memory cache for API responses with daily reset."""
    def __init__(self, max_items: int = 50):
        self.cache: OrderedDict[str, Any] = OrderedDict()
        self.max_items = max_items
        self.last_reset = datetime.date.today()

    def _reset_if_needed(self):
        today = datetime.date.today()
        if today != self.last_reset:
            print("🧹 Resetting daily cache...")
            self.cache.clear()
            self.last_reset = today

    def get(self, key: str) -> Any:
        """Retrieve cached item or None."""
        self._reset_if_needed()
        value = self.cache.get(key)
        if value:
            # Move key to end (most recently used)
            self.cache.move_to_end(key)
        return value

    def set(self, key: str, value: Any):
        """Add a new item to the cache, keeping max size limit."""
        self._reset_if_needed()
        self.cache[key] = value
        self.cache.move_to_end(key)
        if len(self.cache) > self.max_items:
            # Remove oldest entry
            self.cache.popitem(last=False)

# Global instance
cache = NewsCache(max_items=50)
