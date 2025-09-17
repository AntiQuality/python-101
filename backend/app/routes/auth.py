from datetime import datetime

from fastapi import APIRouter, Depends

from ..dependencies import get_user_service
from ..models.content import DeviceInfo
from ..models.schemas import (
    AuthResponse,
    DeviceRemovalRequest,
    DeviceOut,
    LoginRequest,
    ProgressOut,
    RegisterRequest,
    UserOut,
)
from ..services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth"])


def _to_user_out(account) -> UserOut:
    return UserOut(
        username=account.username,
        devices=[
            DeviceOut(name=device.name, browser=device.browser, last_login=device.last_login)
            for device in account.devices
        ],
        progress=[
            ProgressOut(
                question_slug=entry.question_slug,
                score=entry.score,
                completed_at=entry.completed_at,
            )
            for entry in account.progress
        ],
    )


@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest, service: UserService = Depends(get_user_service)):
    account = service.create_user(req.username, req.password)
    return AuthResponse(user=_to_user_out(account))


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, service: UserService = Depends(get_user_service)):
    account = service.authenticate(req.username, req.password)
    device = DeviceInfo(name=req.device_name, browser=req.browser, last_login=datetime.utcnow())
    account = service.register_device(req.username, device)
    return AuthResponse(user=_to_user_out(account))


@router.delete("/device", response_model=AuthResponse)
def remove_device(req: DeviceRemovalRequest, service: UserService = Depends(get_user_service)):
    account = service.remove_device(req.username, req.device_name, req.browser)
    return AuthResponse(user=_to_user_out(account))
