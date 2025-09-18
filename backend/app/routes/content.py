from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from ..dependencies import get_content_service
from ..models.schemas import ChapterOut, QuestionOut
from ..services.content_service import ContentService

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/chapters", response_model=list[ChapterOut])
def list_chapters(service: ContentService = Depends(get_content_service)):
    chapters = service.list_chapters()
    return [
        ChapterOut(
            slug=chapter.meta.slug,
            title=chapter.meta.title,
            order=chapter.meta.order,
            description=chapter.meta.description,
            body=chapter.body,
        )
        for chapter in chapters
    ]


@router.get("/chapters/{slug}", response_model=ChapterOut)
def get_chapter(slug: str, service: ContentService = Depends(get_content_service)):
    chapter = service.get_chapter(slug)
    if not chapter:
        raise HTTPException(status_code=404, detail="未找到章节")
    return ChapterOut(
        slug=chapter.meta.slug,
        title=chapter.meta.title,
        order=chapter.meta.order,
        description=chapter.meta.description,
        body=chapter.body,
    )


@router.get("/questions", response_model=list[QuestionOut])
def list_questions(
    chapter: str | None = Query(default=None),
    difficulty: str | None = Query(default=None),
    service: ContentService = Depends(get_content_service),
):
    questions = service.list_questions(chapter=chapter, difficulty=difficulty)
    return [_question_out(q) for q in questions]


@router.get("/questions/{slug}", response_model=QuestionOut)
def get_question(slug: str, service: ContentService = Depends(get_content_service)):
    question = service.get_question(slug)
    if not question:
        raise HTTPException(status_code=404, detail="未找到题目")
    return _question_out(question)


def _question_out(question) -> QuestionOut:
    return QuestionOut(
        slug=question.meta.slug,
        chapter=question.meta.chapter,
        difficulty=question.meta.difficulty,
        type=question.meta.type,
        title=question.meta.title,
        memory_limit=question.meta.memory_limit,
        show_in_tutorial=question.meta.show_in_tutorial,
        show_in_bank=question.meta.show_in_bank,
        prompt=question.prompt,
        answer=question.answer,
        explanation=question.explanation,
        common_mistakes=question.common_mistakes,
        advanced_insights=question.advanced_insights,
    )
