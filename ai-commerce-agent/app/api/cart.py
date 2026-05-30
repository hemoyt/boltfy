from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class CartAddRequest(BaseModel):
    session_id: str
    product_id: str
    quantity: int = 1

@router.post("/add")
async def add_to_cart(request: CartAddRequest):
    # For MVP, we'll just simulate adding to a session-based cart
    return {
        "status": "success",
        "message": f"Added product {request.product_id} to cart",
        "cart_count": 1
    }
