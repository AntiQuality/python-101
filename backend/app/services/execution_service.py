from __future__ import annotations

import json
import subprocess
import sys
import shutil
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, status

from ..core.config import settings
from ..models.schemas import ExecutionResult

RUNNER_MODULE = Path(__file__).resolve().parents[1] / "utils" / "run_code.py"


class ExecutionService:
    def __init__(self, python_executable: Optional[str] = None) -> None:
        self._python = python_executable or sys.executable

    def run(
        self,
        code: str,
        *,
        stdin_data: str | None = None,
        time_limit: float = 30.0,
        memory_limit: Optional[int] = None,
    ) -> ExecutionResult:
        if not code.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="代码不能为空")

        tmp_dir = tempfile.mkdtemp(prefix="runner-", dir=settings.data_dir)
        code_file = Path(tmp_dir) / "main.py"
        code_file.write_text(code, encoding="utf-8")

        memory = memory_limit or settings.default_memory_limit

        process = subprocess.Popen(
            [
                self._python,
                "-I",
                "-B",
                str(RUNNER_MODULE),
                str(code_file),
                "--time-limit",
                str(time_limit),
                "--memory-limit",
                str(memory),
                "--workdir",
                str(Path(tmp_dir) / "workspace"),
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        try:
            stdout, stderr = process.communicate(input=stdin_data, timeout=time_limit + 2)
        except subprocess.TimeoutExpired:
            process.kill()
            raise HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT, detail="代码运行超时")

        if process.returncode != 0:
            detail = stderr.strip() or f"执行失败（退出码 {process.returncode}）"
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

        try:
            payload = json.loads(stdout)
        except json.JSONDecodeError as exc:  # noqa: BLE001
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="运行器返回数据异常") from exc

        shutil.rmtree(tmp_dir, ignore_errors=True)

        return ExecutionResult(
            success=bool(payload.get("success")),
            stdout=str(payload.get("stdout", "")),
            stderr=str(payload.get("stderr", "")),
            error=payload.get("error"),
        )


execution_service = ExecutionService()
