from fastapi import APIRouter, Request, HTTPException
from app.schemas.ai_schema import ChatRequest
from app.services.ai_service import process_chat_message
from app.core.rate_limiter import limiter

# We'll share the AUTH_LIMIT rate limit or create a new one, but for simplicity let's use a custom 20/minute rule
AI_LIMIT = "20/minute"

router = APIRouter()

@router.post("/chat")
@limiter.limit(AI_LIMIT)
async def chat_endpoint(request: Request, data: ChatRequest):
    """
    Proxy endpoint to communicate with the Gemini AI model.
    Rate limited to prevent abuse.
    """
    try:
        response_text = await process_chat_message(data.messages, data.context)
        return {"response": response_text}
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Failed to process chat request.")
