from pydantic import BaseModel
from typing import Optional, Literal
import datetime


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None  # omit to start a new session
    # authorization header is automatically included by the HTTP client


class ChatResponse(BaseModel):
    response: str
    session_id: str


class SessionRead(BaseModel):
    id: str
    title: Optional[str] = None
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None


class MessageRead(BaseModel):
    id: str
    session_id: str
    role: Literal["user", "assistant", "system"]
    content: str
    created_at: Optional[datetime.datetime] = None


class PreferenceCreate(BaseModel):
    key: str
    value: str


class PreferenceRead(BaseModel):
    id: str
    key: str
    value: str
    updated_at: Optional[datetime.datetime] = None
