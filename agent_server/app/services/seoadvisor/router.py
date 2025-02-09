from api.constants import APIRouteNames
from fastapi import APIRouter, Depends

from services.seoadvisor.dependencies import get_seo_advisor_service
from services.seoadvisor.service import SeoAdvisor
from services.agents.schema import AgentRequest, AgentResponse


router = APIRouter()


@router.post("/generate", name=APIRouteNames.SEO_ADVISOR)
async def perform_seo_advisor(
    body: AgentRequest,
    service: SeoAdvisor = Depends(get_seo_advisor_service)
) -> AgentResponse:
    try:

        result, time_taken = service.execute(content=body.input)
        return AgentResponse(response=result, time_taken=time_taken)
    except Exception as e:
        raise ValueError(e)
