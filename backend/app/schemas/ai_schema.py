from pydantic import BaseModel, Field
from typing import List

class ChatMessage(BaseModel):
    role: str = Field(..., description="Either 'user' or 'model'")
    content: str = Field(..., description="Message content")

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="History of messages in the conversation")
    context: dict | None = Field(default=None, description="Current context from the frontend (url, selected feature, map layers etc.)")
