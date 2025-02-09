from services.agents.service import BaseAgent


class VoyagerAgent(BaseAgent):
    """Voyage agent that is responsible to scrape data from any URL that it provided to it and return the data."""
    system_prompt = "I am a Voyager agent. I can scrape data from any URL that you provide to me and provide a structured format of all the important data."

    def execute(self, url: str):
        """Routine that voyager uses to scrape data from the URL."""
