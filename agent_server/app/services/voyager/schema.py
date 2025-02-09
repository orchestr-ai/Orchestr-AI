from pydantic import BaseModel


class VoyagerCrawlerOutput(BaseModel):
    content: str

class VoyagerScrapingSchema(BaseModel):
    properties: dict
    requird: list[str]
