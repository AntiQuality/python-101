from datetime import datetime

from fastapi import APIRouter, Depends

from ..dependencies import get_user_service
from ..models.content import ProgressEntry
from ..models.schemas import AuthResponse, ProgressRequest
from ..services.user_service import UserService
from .auth import _to_user_out

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/record", response_model=AuthResponse)
def record_progress(req: ProgressRequest, service: UserService = Depends(get_user_service)):
    entry = ProgressEntry(
        user_id=req.username,
        question_slug=req.question_slug,
        score=req.score,
        completed_at=datetime.utcnow(),
    )
    service.record_progress(entry)
    account = service.get_user(req.username)
    return AuthResponse(user=_to_user_out(account))
