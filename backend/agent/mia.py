from fastapi import APIRouter
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
print("API KEY:", os.getenv("GROQ_API_KEY")) 

router = APIRouter()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"  # 👈 THIS is the key part
)

chat_history = []

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str


def call_model(message: str):
    global chat_history

    chat_history.append({"role": "user", "content": message})

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        #others models:
        #model="llama3-8b-8192"       faster, lighter
        #model="llama3-70b-8192"      best quality
        #model="mixtral-8x7b-32768"   very good reasoning
        messages=[
            {"role": "system", "content": "You are M.I.A, a helpful academic advisor."},
            *chat_history
        ],
    )

    reply = completion.choices[0].message.content
    chat_history = chat_history[-10:]  # keep last 10 messages
    chat_history.append({"role": "assistant", "content": reply})

    return reply



@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    answer = call_model(req.message)
    return {"response": answer}