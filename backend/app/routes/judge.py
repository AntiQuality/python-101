from fastapi import APIRouter, Depends

from ..dependencies import get_judge_service
from ..models.schemas import JudgeRequest, JudgeResponse
from ..services.judge_service import LLMJudge

router = APIRouter(prefix="/judge", tags=["judge"])


@router.post("/evaluate", response_model=JudgeResponse)
def evaluate(req: JudgeRequest, service: LLMJudge = Depends(get_judge_service)):
    result = service.evaluate(req.system_prompt, req.prompt)
    return JudgeResponse(passed=result.passed, feedback_steps=result.feedback_steps)
