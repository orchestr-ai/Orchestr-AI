from api.constants import APIRouteNames
from fastapi import APIRouter, Depends

from services.agents.schema import AgentRequest, AgentResponse
from services.voyager.service import VoyagerService
from services.voyager.dependencies import get_voyager_service

router = APIRouter()


@router.post("/generate", name=APIRouteNames.VOYAGER)
async def perform_voyager_action(
    body: AgentRequest,
    service: VoyagerService = Depends(get_voyager_service)
) -> AgentResponse:
    try:
        result, time_taken = service.execute(
            url=body.input
        )
        return AgentResponse(response=service.format_response(response=result), time_taken=time_taken)
    except Exception as e:
        raise e
