from datetime import datetime
from typing import List

from pydantic import BaseModel


class DeviceOut(BaseModel):
    name: str
    browser: str
    last_login: datetime


class ProgressOut(BaseModel):
    question_slug: str
    score: float
    completed_at: datetime


class UserOut(BaseModel):
    username: str
    is_admin: bool
    devices: List[DeviceOut]
    progress: List[ProgressOut]


class AuthResponse(BaseModel):
    user: UserOut


class RegisterRequest(BaseModel):
    username: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str
    device_name: str
    browser: str


class DeviceRemovalRequest(BaseModel):
    username: str
    device_name: str
    browser: str


class ProgressRequest(BaseModel):
    username: str
    question_slug: str
    score: float


class JudgeRequest(BaseModel):
    system_prompt: str
    prompt: str


class JudgeResponse(BaseModel):
    passed: bool
    feedback_steps: List[str]


class ExecutionRequest(BaseModel):
    code: str
    stdin: str | None = None
    time_limit: float | None = None
    memory_limit: int | None = None


class ExecutionResult(BaseModel):
    success: bool
    stdout: str
    stderr: str
    error: str | None = None


class ChapterOut(BaseModel):
    slug: str
    title: str
    order: int
    description: str | None = None
    body: str


class QuestionOut(BaseModel):
    slug: str
    chapter: str
    difficulty: str
    type: str
    memory_limit: int | None = None
    show_in_tutorial: bool
    show_in_bank: bool
    prompt: str
    answer: str | None = None
    explanation: str | None = None
    common_mistakes: str | None = None
    advanced_insights: str | None = None


class ChapterUpsertRequest(BaseModel):
    slug: str
    title: str
    order: int
    description: str | None = None
    body: str


class QuestionUpsertRequest(BaseModel):
    slug: str
    chapter: str
    difficulty: str
    type: str
    memory_limit: int | None = None
    show_in_tutorial: bool = True
    show_in_bank: bool = True
    prompt: str
    answer: str | None = None
    explanation: str | None = None
    common_mistakes: str | None = None
    advanced_insights: str | None = None
