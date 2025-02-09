from langchain_google_genai import ChatGoogleGenerativeAI
from core.config import config

def get_language_model() -> ChatGoogleGenerativeAI:
    try:
        if not config.LM_API_KEY.get_secret_value():
            raise ValueError("API key is not set")
        if not config.LM_NAME.get_secret_value():
            raise ValueError("Model name is not set")
        return ChatGoogleGenerativeAI(temperature=0, api_key=config.LM_API_KEY.get_secret_value(), model=config.LM_NAME.get_secret_value())
    except Exception as e:
        raise ValueError(e)
