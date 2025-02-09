from pydantic import BaseModel


class AgentResponse(BaseModel):
    response: str
    time_taken: float


class AgentRequest(BaseModel):
    input: str
