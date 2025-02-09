from urllib.parse import urlparse

from api.routes import router as api_router
from core.config import Config, config
from core.custom_exceptions import CustomHTTPException
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


def filter_transactions(event, hint):
    url_string = event["request"]["url"]
    parsed_url = urlparse(url_string)

    if parsed_url.path == "/api/health":
        return None

    return event


def get_app(config: Config, router: APIRouter) -> FastAPI:
    app = FastAPI(
        title=config.PROJECT_NAME + "-api",
        debug=config.DEBUG,
        version=config.VERSION,
        docs_url=config.API_PREFIX + "/docs",
        redoc_url=config.API_PREFIX + "/redoc",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(router, prefix=config.API_PREFIX)
    return app


app = get_app(config=config, router=api_router)


@app.exception_handler(CustomHTTPException)
async def custom_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error_code": exc.error_code, "detail": exc.detail},
    )
