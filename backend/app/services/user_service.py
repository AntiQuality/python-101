from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from fastapi import HTTPException, status

from ..core.config import settings
from ..models.content import DeviceInfo, ProgressEntry, UserAccount
from .storage import JSONStorage


class UserService:
    def __init__(self) -> None:
        self._storage = JSONStorage("users.json")

    # ------------------------------------------------------------------
    def list_users(self) -> List[UserAccount]:
        return [UserAccount(**payload) for payload in self._data().values()]

    def get_user(self, username: str) -> Optional[UserAccount]:
        payload = self._data().get(username)
        if not payload:
            return None
        return UserAccount(**payload)

    def create_user(self, username: str, password: str) -> UserAccount:
        data = self._data()
        if username in data:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="用户名已存在")
        account = UserAccount(username=username, password=password)
        data[username] = account.dict()
        self._storage.write(data)
        return account

    def authenticate(self, username: str, password: str) -> UserAccount:
        account = self.get_user(username)
        if not account or account.password != password:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误")
        return account

    def register_device(self, username: str, device: DeviceInfo) -> UserAccount:
        account = self.get_user(username)
        if not account:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")
        # Remove duplicates by device name + browser
        account.devices = [d for d in account.devices if not (d.name == device.name and d.browser == device.browser)]
        if len(account.devices) >= settings.max_devices_per_user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="设备数量已达上限")
        account.devices.append(device)
        self._replace_account(account)
        return account

    def remove_device(self, username: str, device_name: str, browser: str) -> UserAccount:
        account = self.get_user(username)
        if not account:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")
        account.devices = [d for d in account.devices if not (d.name == device_name and d.browser == browser)]
        self._replace_account(account)
        return account

    def record_progress(self, entry: ProgressEntry) -> None:
        account = self.get_user(entry.user_id)
        if not account:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")
        # Replace existing entry for same question
        account.progress = [p for p in account.progress if p.question_slug != entry.question_slug]
        account.progress.append(entry)
        self._replace_account(account)

    # ------------------------------------------------------------------
    def _data(self) -> Dict[str, dict]:
        return self._storage.read()

    def _replace_account(self, account: UserAccount) -> None:
        data = self._data()
        data[account.username] = account.dict()
        self._storage.write(data)


user_service = UserService()
