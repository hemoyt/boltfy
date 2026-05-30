from openai import AsyncOpenAI
from app.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def get_completion(messages, response_format=None):
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        response_format=response_format
    )
    return response.choices[0].message.content
