from pydantic import BaseModel
from typing import List, Optional

class ProductVariant(BaseModel):
    id: str
    title: str
    price: float
    available: bool

class Product(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    price_min: float
    currency: str = "USD"
    variants: List[ProductVariant] = []
    handle: str
