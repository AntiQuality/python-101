from __future__ import annotations

import os
from typing import List

from fastapi import HTTPException, status
from dotenv import load_dotenv

from ..models.content import JudgeResult

try:
    from volcenginesdkarkruntime import Ark
except ImportError:  # pragma: no cover - optional at install time
    Ark = None  # type: ignore

load_dotenv()


class LLMJudge:
    def __init__(self) -> None:
        self._api_key = os.environ.get("ARK_API_KEY")
        self._client = None
        if Ark and self._api_key:
            self._client = Ark(api_key=self._api_key, timeout=1800)

    def evaluate(self, system_prompt: str, prompt: str) -> JudgeResult:
        if not self._client:
            # Stub mode for本地开发
            feedback = [
                "未检测到豆包 API Key，返回本地模拟结果。",
                "请在 `.env` 中配置 ARK_API_KEY 以启用真实判题。",
            ]
            return JudgeResult(passed=False, feedback_steps=feedback)

        try:
            response = self._client.chat.completions.create(
                model="doubao-seed-1.6-250615",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                thinking={"type": "disabled"},
                temperature=0.6,
            )
        except Exception as exc:  # pragma: no cover - network call
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

        content = response.choices[0].message.content if response.choices else ""
        feedback = content.splitlines() if content else []
        # 由调用方解析是否通过；此处简单返回原始信息
        return JudgeResult(passed=False, feedback_steps=feedback, raw_response=response.to_dict())


judge_service = LLMJudge()
