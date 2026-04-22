from fastapi import APIRouter
from schemas.mia import ChatRequest, ChatResponse
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

# Temporary in-memory history — will be replaced in Point 6 with DB persistence
chat_history: list[dict] = []


def call_model(message: str) -> str:
    global chat_history
    chat_history.append({"role": "user", "content": message})
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are M.I.A, a helpful academic advisor."},
            *chat_history,
        ],
    )
    reply = completion.choices[0].message.content
    chat_history = chat_history[-10:]
    chat_history.append({"role": "assistant", "content": reply})
    return reply


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    answer = call_model(req.message)
    # session_id is a placeholder until Point 6 wires up DB persistence
    return {"response": answer, "session_id": "temporary"}
