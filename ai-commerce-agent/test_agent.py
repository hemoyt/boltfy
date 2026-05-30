import httpx
import asyncio
import json

async def test_chat():
    url = "http://127.0.0.1:8000/api/chat/"
    payload = {
        "session_id": "test_session_123",
        "message": "I want black sneakers under $100"
    }
    
    print(f"Sending request to {url}...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                print("Response:")
                print(json.dumps(response.json(), indent=2))
            else:
                print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection failed: {e}")
        print("Make sure the server is running on http://127.0.0.1:8000")

if __name__ == "__main__":
    asyncio.run(test_chat())
