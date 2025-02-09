from fastapi import Depends
from langchain_google_genai import ChatGoogleGenerativeAI
from services.webresearcher.service import WebResearcherService
from core.language_model import get_language_model


def get_web_researcher_service(llm: ChatGoogleGenerativeAI = Depends(get_language_model)):
    return WebResearcherService(llm=llm)
