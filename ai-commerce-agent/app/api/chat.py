from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.ai.intent_parser import parse_intent
from app.ecommerce.shopify import search_products
from app.memory.session import get_session, update_session

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    # 1. Get or create session
    session = get_session(request.session_id)
    
    # 2. Parse intent from user message
    intent = await parse_intent(request.message, session.get("context", []))
    
    # 3. Search products based on intent
    products = await search_products(intent)
    
    # 4. Update session memory
    session["last_intent"] = intent
    session["context"].append({"role": "user", "content": request.message})
    update_session(request.session_id, session)
    
    # 5. Format response
    return ChatResponse(
        message=f"I found some products for you based on '{intent.get('category', 'your request')}'",
        products=products
    )
