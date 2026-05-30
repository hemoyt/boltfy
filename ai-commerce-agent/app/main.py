from fastapi import FastAPI
from app.api import chat, cart, health
from app.config import settings

app = FastAPI(title=settings.APP_NAME)

app.include_router(health.router, prefix="/health", tags=["system"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(cart.router, prefix="/api/cart", tags=["cart"])

@app.get("/")
async def root():
    return {"message": "Welcome to AI E-Commerce Agent API"}
