from api.constants import APIRouteNames
from fastapi import APIRouter, Depends

from services.webresearcher.dependencies import get_web_researcher_service
from services.webresearcher.service import WebResearcherService
from services.agents.schema import AgentRequest, AgentResponse


router = APIRouter()


@router.post("/generate", name=APIRouteNames.WEB_RESEARCHER)
async def perform_web_research(
    body: AgentRequest,
    service: WebResearcherService = Depends(get_web_researcher_service),
) -> AgentResponse:
    try:

        result, time_taken = service.execute(content=body.input)
        return AgentResponse(response=result, time_taken=time_taken)
    except Exception as e:
        raise ValueError(e)
