from pydantic import BaseModel
from typing import List, Optional, Any

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ProductCard(BaseModel):
    id: str
    title: str
    price: float
    currency: str = "USD"
    image_url: Optional[str] = None
    cta: str = "add_to_cart"

class ChatResponse(BaseModel):
    type: str = "text"
    message: str
    products: List[ProductCard] = []
    metadata: Optional[Any] = None
