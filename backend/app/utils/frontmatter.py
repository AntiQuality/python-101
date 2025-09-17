from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Tuple

import yaml


@dataclass
class FrontMatter:
    attributes: Dict[str, object]
    body: str


def parse(content: str) -> FrontMatter:
    if not content.startswith("---\n"):
        return FrontMatter(attributes={}, body=content)

    parts = content.split("\n---\n", 1)
    if len(parts) != 2:
        return FrontMatter(attributes={}, body=content)

    header_raw, body = parts
    header_lines = header_raw.splitlines()[1:]  # Skip opening ---
    header = "\n".join(header_lines)
    attributes = yaml.safe_load(header) or {}
    return FrontMatter(attributes=attributes, body=body.strip())
