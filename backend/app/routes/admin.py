from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..dependencies import get_content_service, get_user_service
from ..models.schemas import (
    ChapterOut,
    ChapterUpsertRequest,
    QuestionOut,
    QuestionUpsertRequest,
    UserOut,
)
from ..services.content_service import ContentService
from ..services.user_service import UserService
from .auth import _to_user_out
from .content import _question_out

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserOut])
def list_users(service: UserService = Depends(get_user_service)):
    return [_to_user_out(user) for user in service.list_users()]


@router.get("/users/{username}", response_model=UserOut)
def get_user(username: str, service: UserService = Depends(get_user_service)):
    account = service.get_user(username)
    if not account:
        raise HTTPException(status_code=404, detail="用户不存在")
    return _to_user_out(account)


@router.get("/questions", response_model=list[QuestionOut])
def list_all_questions(service: ContentService = Depends(get_content_service)):
    return [_question_out(q) for q in service.list_questions()]


@router.post("/chapters", response_model=ChapterOut, status_code=status.HTTP_201_CREATED)
def upsert_chapter(payload: ChapterUpsertRequest, service: ContentService = Depends(get_content_service)):
    chapter = service.upsert_chapter(
        slug=payload.slug,
        title=payload.title,
        order=payload.order,
        description=payload.description,
        body=payload.body,
    )
    return ChapterOut(
        slug=chapter.meta.slug,
        title=chapter.meta.title,
        order=chapter.meta.order,
        description=chapter.meta.description,
        body=chapter.body,
    )


@router.post("/questions", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
def upsert_question(payload: QuestionUpsertRequest, service: ContentService = Depends(get_content_service)):
    question = service.upsert_question(
        slug=payload.slug,
        chapter=payload.chapter,
        difficulty=payload.difficulty,
        qtype=payload.type,
        memory_limit=payload.memory_limit,
        show_in_tutorial=payload.show_in_tutorial,
        show_in_bank=payload.show_in_bank,
        prompt=payload.prompt,
        answer=payload.answer,
        explanation=payload.explanation,
        common_mistakes=payload.common_mistakes,
        advanced_insights=payload.advanced_insights,
    )
    return _question_out(question)
