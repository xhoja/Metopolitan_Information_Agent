from pydantic import BaseModel
from typing import Optional
import datetime


class AssignmentCreate(BaseModel):
    course_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime.datetime] = None
    type: str = "assignment"


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime.datetime] = None
    type: Optional[str] = None


class AssignmentRead(BaseModel):
    id: str
    course_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime.datetime] = None
    type: str
    created_at: Optional[datetime.datetime] = None
