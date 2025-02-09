from api.health import router as health_router
from fastapi import APIRouter

from services.voyager.router import router as voyager_router
from services.seoadvisor.router import router as seoadvisor_router
from services.webresearcher.router import router as web_researcher_router

router = APIRouter()
router.include_router(health_router, tags=["health"], prefix="/health")
router.include_router(voyager_router, tags=["voyager"], prefix="/agent/voyager")
router.include_router(seoadvisor_router, tags=["seo_advisor"], prefix="/agent/seo_advisor")
router.include_router(web_researcher_router, tags=["web_researcher"], prefix="/agent/web_researcher")
