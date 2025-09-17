from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ChapterMetadata(BaseModel):
    slug: str
    title: str
    order: int
    description: Optional[str] = None


class Chapter(BaseModel):
    meta: ChapterMetadata
    body: str


class QuestionMetadata(BaseModel):
    slug: str
    chapter: str
    difficulty: str
    type: str
    memory_limit: Optional[int] = Field(default=None, description="Bytes")
    show_in_tutorial: bool = True
    show_in_bank: bool = True


class Question(BaseModel):
    meta: QuestionMetadata
    prompt: str
    answer: Optional[str] = None
    explanation: Optional[str] = None
    common_mistakes: Optional[str] = None
    advanced_insights: Optional[str] = None


class ProgressEntry(BaseModel):
    user_id: str
    question_slug: str
    score: float
    completed_at: datetime


class DeviceInfo(BaseModel):
    name: str
    browser: str
    last_login: datetime


class UserAccount(BaseModel):
    username: str
    password: str  # 明文，后续可替换为哈希
    devices: List[DeviceInfo] = Field(default_factory=list)
    progress: List[ProgressEntry] = Field(default_factory=list)


class JudgeResult(BaseModel):
    passed: bool
    feedback_steps: List[str]
    raw_response: Optional[dict] = None
