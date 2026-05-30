# In-memory session store for MVP
# In a real app, this would use Redis
sessions = {}

def get_session(session_id: str):
    if session_id not in sessions:
        sessions[session_id] = {
            "last_intent": None,
            "context": [],
            "cart": []
        }
    return sessions[session_id]

def update_session(session_id: str, data: dict):
    sessions[session_id] = data
