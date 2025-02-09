from bs4 import BeautifulSoup
from pydantic import BaseModel

from services.voyager.schema import VoyagerCrawlerOutput
from langchain_community.document_loaders.recursive_url_loader import RecursiveUrlLoader


class WebScraper(BaseModel):
    """Entity that uses langchain to scrape the data"""

    def _custom_extractor(self, html_content):
        soup = BeautifulSoup(html_content, "html.parser")
        return soup.get_text()

    def _extract_from_web(self, url: str) -> list[VoyagerCrawlerOutput]:
        """Routine to retrieve proper content from the web"""
        loader = RecursiveUrlLoader(url=url, extractor=self._custom_extractor)
        documents = loader.load()
        result = []

        for doc in documents:
            content = doc.page_content

            crawler_output = VoyagerCrawlerOutput(content=content)
            result.append(crawler_output)

        return result

    def extract(self, url: str) -> list[VoyagerCrawlerOutput]:
        crawled_output = self._extract_from_web(url=url)
        return crawled_output
