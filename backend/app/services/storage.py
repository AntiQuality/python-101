from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

from ..core.config import settings


class JSONStorage:
    def __init__(self, filename: str) -> None:
        self._path = settings.data_dir / filename
        if not self._path.exists():
            self._path.write_text("{}", encoding="utf-8")

    def read(self) -> Dict[str, Any]:
        data = self._path.read_text(encoding="utf-8")
        if not data.strip():
            return {}
        return json.loads(data)

    def write(self, data: Dict[str, Any]) -> None:
        self._path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2, default=self._default),
            encoding="utf-8",
        )

    @staticmethod
    def _default(value: Any) -> Any:
        if isinstance(value, datetime):
            return value.isoformat()
        raise TypeError(f"Object of type {type(value)!r} is not JSON serializable")
