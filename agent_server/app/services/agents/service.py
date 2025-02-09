from abc import ABC, abstractmethod
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel
from core.config import config
from langchain.agents import tool, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents.output_parsers.openai_tools import OpenAIToolsAgentOutputParser
from langchain.agents.format_scratchpad.openai_tools import (
    format_to_openai_tool_messages,
)

class BaseAgent(ABC, BaseModel):

    system_prompt: str
    AGENT_PROMPT_VAR_NAME: str = "custom_ethindia2024_agent"

    class Config:
        arbitrary_types_allowed = True


    @classmethod
    def tool_abstractmethod(cls, func):
        """Combines @tool and @abstractmethod."""
        return tool(abstractmethod(func))

    @tool_abstractmethod
    def execute(self):
        pass

    def get_language_model(self, temperature: float = 0) -> ChatGoogleGenerativeAI:

        if not config.LM_API_KEY.get_secret_value():
            raise ValueError("API key is not set")
        if not config.LM_NAME.get_secret_value():
            raise ValueError("Model name is not set")

        return ChatGoogleGenerativeAI(temperature=temperature, api_key=config.LM_API_KEY.get_secret_value(), model=config.LM_NAME.get_secret_value())


    def get_prompt(self) -> ChatPromptTemplate:
        """Routine to return the prompt."""
        if not self.system_prompt or len(self.system_prompt) == 0:
            raise ValueError("System prompt is empty")

        return ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    self.system_prompt,
                ),
                ("user", "{input}"),
                MessagesPlaceholder(variable_name=self.AGENT_PROMPT_VAR_NAME),
            ]
        )


    def get_executor(self) -> AgentExecutor:
        """Routine to get the executor."""
        llm = self.get_language_model()
        tools = [self.execute()]

        llm_with_tools = llm.bind_tools(tools)
        agent = (
            {
                "input": lambda x: x["input"],
                self.AGENT_PROMPT_VAR_NAME: lambda x: format_to_openai_tool_messages(
                    x["intermediate_steps"]
                ),
            }
            | self.get_prompt()
            | llm_with_tools
            | OpenAIToolsAgentOutputParser()
        )


        return AgentExecutor(agent=agent, tools=tools, verbose=True)
