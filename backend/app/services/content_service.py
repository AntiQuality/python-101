from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Optional

from ..core.config import settings
from ..models.content import Chapter, ChapterMetadata, Question, QuestionMetadata
from ..utils.frontmatter import parse


class ContentService:
    def __init__(self, resources_dir: Optional[Path] = None) -> None:
        self._resources_dir = resources_dir or settings.resources_dir
        self._chapters_cache: Dict[str, Chapter] = {}
        self._questions_cache: Dict[str, Question] = {}

    # Public API -----------------------------------------------------------
    def list_chapters(self) -> List[Chapter]:
        self._ensure_chapters_loaded()
        return sorted(self._chapters_cache.values(), key=lambda c: c.meta.order)

    def get_chapter(self, slug: str) -> Optional[Chapter]:
        self._ensure_chapters_loaded()
        return self._chapters_cache.get(slug)

    def list_questions(
        self,
        *,
        chapter: Optional[str] = None,
        difficulty: Optional[str] = None,
        include_tutorial_only: bool = True,
        include_bank_only: bool = True,
    ) -> List[Question]:
        self._ensure_questions_loaded()
        questions = list(self._questions_cache.values())
        if chapter:
            questions = [q for q in questions if q.meta.chapter == chapter]
        if difficulty:
            questions = [q for q in questions if q.meta.difficulty == difficulty]
        if not include_tutorial_only:
            questions = [q for q in questions if q.meta.show_in_bank]
        if not include_bank_only:
            questions = [q for q in questions if q.meta.show_in_tutorial]
        return sorted(questions, key=lambda q: q.meta.slug)

    def get_question(self, slug: str) -> Optional[Question]:
        self._ensure_questions_loaded()
        return self._questions_cache.get(slug)

    # Internal helpers ----------------------------------------------------
    def _ensure_chapters_loaded(self) -> None:
        if self._chapters_cache:
            return
        chapters_dir = self._resources_dir / settings.chapters_dirname
        if not chapters_dir.exists():
            return
        for path in chapters_dir.glob("*.md"):
            chapter = self._load_chapter(path)
            if chapter:
                self._chapters_cache[chapter.meta.slug] = chapter

    def _ensure_questions_loaded(self) -> None:
        if self._questions_cache:
            return
        questions_dir = self._resources_dir / settings.questions_dirname
        if not questions_dir.exists():
            return
        for path in questions_dir.glob("**/*.md"):
            if not path.is_file():
                continue
            question = self._load_question(path)
            if question:
                self._questions_cache[question.meta.slug] = question

    def _load_chapter(self, path: Path) -> Optional[Chapter]:
        content = path.read_text(encoding="utf-8")
        front_matter = parse(content)
        if "slug" not in front_matter.attributes:
            return None
        meta = ChapterMetadata(
            slug=front_matter.attributes["slug"],
            title=front_matter.attributes.get("title", path.stem),
            order=int(front_matter.attributes.get("order", 0)),
            description=front_matter.attributes.get("description"),
        )
        return Chapter(meta=meta, body=front_matter.body)

    def _load_question(self, path: Path) -> Optional[Question]:
        content = path.read_text(encoding="utf-8")
        front_matter = parse(content)
        attributes = front_matter.attributes
        required_fields = {"slug", "chapter", "difficulty", "type"}
        if not required_fields.issubset(attributes):
            return None
        meta = QuestionMetadata(
            slug=attributes["slug"],
            chapter=attributes["chapter"],
            difficulty=attributes["difficulty"],
            type=attributes["type"],
            memory_limit=self._parse_memory(attributes.get("memory_limit")),
            show_in_tutorial=bool(attributes.get("show_in_tutorial", True)),
            show_in_bank=bool(attributes.get("show_in_bank", True)),
        )
        sections = self._split_question_body(front_matter.body)
        return Question(
            meta=meta,
            prompt=sections.get("prompt", ""),
            answer=sections.get("answer"),
            explanation=sections.get("explanation"),
            common_mistakes=sections.get("common_mistakes"),
            advanced_insights=sections.get("advanced_insights"),
        )

    @staticmethod
    def _parse_memory(value: Optional[str]) -> Optional[int]:
        if value is None:
            return None
        if isinstance(value, int):
            return value
        value = value.strip().upper()
        if value.endswith("MB"):
            return int(value[:-2]) * 1024 * 1024
        if value.endswith("KB"):
            return int(value[:-2]) * 1024
        return int(value)

    @staticmethod
    def _split_question_body(body: str) -> Dict[str, str]:
        sections: Dict[str, str] = {"prompt": body.strip()}
        current_key = "prompt"
        collected_lines: List[str] = []
        for line in body.splitlines():
            if line.startswith("### "):
                if collected_lines:
                    sections[current_key] = "\n".join(collected_lines).strip()
                heading = line[4:].strip().lower()
                key_map = {
                    "正确答案": "answer",
                    "解析": "explanation",
                    "常见错误": "common_mistakes",
                    "进阶拓展": "advanced_insights",
                }
                current_key = key_map.get(heading, heading)
                collected_lines = []
            else:
                collected_lines.append(line)
        if collected_lines:
            sections[current_key] = "\n".join(collected_lines).strip()
        return sections


content_service = ContentService()
