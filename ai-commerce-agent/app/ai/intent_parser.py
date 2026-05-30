import json
from app.ai.llm import get_completion
from app.ai.prompts import SYSTEM_PROMPT

async def parse_intent(message: str, context: list = []):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]
    # Add context if available
    for ctx in context[-5:]: # Last 5 messages for context
        messages.append(ctx)
        
    messages.append({"role": "user", "content": message})
    
    response_text = await get_completion(
        messages, 
        response_format={"type": "json_object"}
    )
    
    try:
        return json.loads(response_text)
    except Exception:
        return {
            "category": None,
            "color": None,
            "price_max": None,
            "gender": None,
            "brand": None,
            "query": message
        }
