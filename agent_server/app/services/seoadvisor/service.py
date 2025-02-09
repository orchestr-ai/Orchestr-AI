from typing import Any
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel

from core.decorators import measure_runtime
from langchain.prompts import PromptTemplate
from langchain.chains.llm import LLMChain

class SeoAdvisor(BaseModel):

    llm: ChatGoogleGenerativeAI

    def get_prompt(self) -> PromptTemplate:
        """Routine to get the prompt."""
        return PromptTemplate(
            input_variables=["website_content"],
            template=(
                "You are an SEO Advisor Agent and you get some context regarding how to optimize a website. Your task is to use that and generate perfect content for SEO Optimization:\n\n"
                "Following is the kind of context you will get for your SEO Optimization:\n"
                "1. Competitor Keyword Analysis\n"
                "2. Target Audience\n"
                "3. Search Intent\n"
                "4. Content Gap Analysis\n"
                "5. Competitor Analysis\n"
                "6. On-Page Optimization\n"

                "Following is the website content, optimize it\n\n"
                "{website_content}\n\n"
                "You should be very clear and ensure the SEO is fully optimized, give good strategies, make sure all the keywords you get are listed in the response and infact all the research things that u get in context should be in the output"
            )
        )

    @measure_runtime
    def execute(self, content: str) -> Any:
        seo_chain = LLMChain(
            llm=self.llm,
            prompt=self.get_prompt(),
        )
        website_content = content
        seo_tips = seo_chain.run(website_content)

        return seo_tips


    # def trim_content(self, content: str) -> str:
    #     return " ".join(content.split()[:50])
