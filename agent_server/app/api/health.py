from api.constants import APIRouteNames
from fastapi import APIRouter

router = APIRouter()


@router.get("/", name=APIRouteNames.HEALTH)
async def ping() -> str:
    return "Health is 100% for this Agent Server"
