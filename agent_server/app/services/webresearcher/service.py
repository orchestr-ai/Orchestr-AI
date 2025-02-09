from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel
from langchain.prompts import PromptTemplate
from langchain.chains.llm import LLMChain
from core.decorators import measure_runtime


class WebResearcherService(BaseModel):

    llm: ChatGoogleGenerativeAI

    def get_prompt(self) -> PromptTemplate:
        """Routine to get the prompt."""
        return PromptTemplate(
            input_variables=["website_content"],
            template=(
                "You are a Web Researcher Agent that specializes in calculating following points from the entire web given a website content.\n"
                "You are supposed to give a context output which will help an SEO Advisor agent to generate proper SEO for the website content based on your context generation from the web\n\n"
                "What to know for getting a good SEO for a website?\n"
                "1. Conduct Competitor Keyword Analysis (Identify and analyze keywords your competitors rank for using tools like SEMrush, Ahrefs, or Google Keyword Planner.)"
                "2. Understand the Target Audience (Research the target audience's demographics, interests, and search behavior.)"
                "3. Perform Content Gap Analysis (Evaluate existing content on your site versus competitors to identify missing topics or underexplored areas)"
                "4. Analyze Search Intent (Study the search intent behind target keywords (e.g., informational, navigational, transactional, or commercial))"
                "Given below is the Website content give a crisp and short context output which will help the SEO Advisor to generate proper SEO for the website content based on your context generation from the web\n\n"
                "{website_content}\n\n"
                ""
            )
        )

    @measure_runtime
    def execute(self, content: str) -> str:
        web_researcher_chain = LLMChain(
            llm=self.llm,
            prompt=self.get_prompt(),
        )
        website_content = content
        web_tips = web_researcher_chain.run(website_content)

        return web_tips
