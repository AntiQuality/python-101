from __future__ import annotations

import json
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
        self._path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
