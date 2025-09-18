from fastapi import APIRouter, Depends

from ..dependencies import get_execution_service
from ..models.schemas import ExecutionRequest, ExecutionResult
from ..services.execution_service import ExecutionService

router = APIRouter(prefix="/execute", tags=["execute"])


@router.post("/run", response_model=ExecutionResult)
def run_code(req: ExecutionRequest, service: ExecutionService = Depends(get_execution_service)):
    result = service.run(
        req.code,
        stdin_data=req.stdin,
        time_limit=req.time_limit or 30.0,
        memory_limit=req.memory_limit,
    )
    return result
