from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=3, max_length=1000, description="The message to send to the chatbot")
    history: Optional[list[Dict[str,str]]] = Field(
        default=[],
        description="Previous conversation history"
    )

class ChatResponse(BaseModel):
    response: str = Field(..., description="The response from chatbot")
    blocked: bool = Field(default=False, description="True if the message was flagged for safety")
    