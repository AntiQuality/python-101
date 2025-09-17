from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from ..dependencies import get_content_service, get_user_service
from ..models.schemas import QuestionOut, UserOut
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
