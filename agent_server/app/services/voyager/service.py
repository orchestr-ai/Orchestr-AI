from services.voyager.schema import VoyagerCrawlerOutput
from services.voyager.scraper import WebScraper
from core.decorators import measure_runtime

class VoyagerService:
    """Entity for the Web Voyager Service"""

    @measure_runtime
    def execute(self, url: str) -> list[VoyagerCrawlerOutput]:
        scraper = WebScraper()
        scraped_output = scraper.extract(url=url)
        return scraped_output


    def format_response(self, response: list[VoyagerCrawlerOutput]) -> str:
        res = ""

        for item in response:
            res += f"{item.content}\n\n"

        return res
