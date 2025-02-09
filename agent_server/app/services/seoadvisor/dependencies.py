from fastapi import Depends
from langchain_google_genai import ChatGoogleGenerativeAI
from core.language_model import get_language_model
from services.seoadvisor.service import SeoAdvisor


def get_seo_advisor_service(llm: ChatGoogleGenerativeAI = Depends(get_language_model)) -> SeoAdvisor:
    return SeoAdvisor(llm=llm)
