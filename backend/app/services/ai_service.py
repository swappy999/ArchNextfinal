from typing import List
from google import genai
from google.genai import types
from app.core.config import settings
from app.schemas.ai_schema import ChatMessage

# Initialize the Gemini clients
client_chatbot = genai.Client(api_key=settings.GEMINI_API_KEY_CHATBOT) if settings.GEMINI_API_KEY_CHATBOT else None
client_verification = genai.Client(api_key=settings.GEMINI_API_KEY_VERIFICATION) if settings.GEMINI_API_KEY_VERIFICATION else None

SYSTEM_PROMPT = """You are ArchBot — your city intelligence copilot embedded inside the real estate urban analytics platform called ArchNext.

Your role is to:
- Guide users through platform features using an intelligent, calm, concise, and professional tone.
- Explain thermal mapping, ward intelligence, property prediction models, and urban infrastructure analytics.
- Suggest which tool users should use based on their goals.
- Directly navigate the user to different pages when they ask to go somewhere or when you suggest a tool.

You must:
- Stay within ArchNext scope.
- Avoid general knowledge responses.
- Keep answers concise and actionable (Limit responses to 150–200 words max).
- If the user asks to navigate to a page, or you highly recommend a page, YOU MUST include the tag `[NAVIGATE: /route]` in your response. Replace `/route` with one of the following exact paths: `/dashboard`, `/portfolio`, `/properties`, `/map`, `/prediction`, `/marketplace`, `/ecosystem`, `/settings`.
- Do not make up routes. Only use the ones listed.
- Acknowledge any provided 'Context' to understand where the user currently is in the app.

You are not a generic chatbot. You are a domain-specific intelligence layer for ArchNext.
"""

async def process_chat_message(messages: List[ChatMessage], context: dict | None = None) -> str:
    if not client_chatbot:
        return "Internal Error: Gemini Chatbot API key is not configured."

    # Convert frontend messages to the format expected by the google-genai SDK
    contents = []
    
    # If context is provided, prepend it secretly as a system instruction part to the first message 
    # (or rather, we can just inject it into the content of the very last user message for simplicity)
    if context and messages:
        last_msg = messages[-1]
        if last_msg.role == 'user':
            context_str = f"\n\n[SYSTEM CONTEXT: {context}]"
            last_msg.content += context_str
    
    for msg in messages:
        # User message role is user, model message role is model
        contents.append(
            types.Content(
                role=msg.role,
                parts=[types.Part.from_text(text=msg.content)]
            )
        )

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=0.3,
    )

    try:
        response = client_chatbot.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=config
        )
        return response.text
    except Exception as e:
        print(f"[Gemini] Error generating content: {e}")
        return "I am currently experiencing an interruption in my cognitive routines. Please try again in a moment."

async def verify_property_listing(property_details: dict, predicted_price: float) -> dict:
    """
    Uses Gemini to verify a property listing based on its details 
    and the AI-predicted market price.
    """
    if not client_verification:
        return {"is_verified": False, "score": 0.0, "reason": "Gemini Verification API key not configured"}

    prompt = f"""
    As an expert AI Property Auditor for ArchNext, rigorously verify the following property listing for authenticity, pricing accuracy, and quality.
    
    Title: {property_details.get('title')}
    Description: {property_details.get('description')}
    Listed Price: {property_details.get('price')} INR
    AI Predicted Price: {predicted_price} INR/sqft
    
    Tasks & Rubrics:
    1. Price Analysis: Compare the Listed Price with the AI Predicted Price. If the listed price is >30% higher or lower, flag it as suspicious. Ensure units match contextually.
    2. Content Scrutiny: Analyze the description for red flags (e.g., ALL CAPS, overly promotional claims, missing details like area/BHK).
    3. Authenticity: Evaluate if the listing seems plausible, professional, and authentic.
    
    Respond in STRICT JSON format:
    {{
        "is_verified": boolean, // True only if score > 0.6 and no critical red flags
        "verification_score": float (0.0 to 1.0), // based on price (0.4), description (0.3), authenticity (0.3)
        "summary": "Short 1-sentence verification summary",
        "flags": ["list", "of", "red", "flags", "if", "any"]
    }}
    """

    try:
        response = client_verification.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type='application/json'
            )
        )
        import json
        result = json.loads(response.text)
        return result
    except Exception as e:
        print(f"[Gemini] Verification Error: {e}")
        return {
            "is_verified": False, 
            "verification_score": 0.5, 
            "summary": "Verification engine timeout. Manual review suggested.",
            "flags": ["system_error"]
        }
