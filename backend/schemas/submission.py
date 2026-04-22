from pydantic import BaseModel, Field
from typing import Optional
import datetime


class SubmissionCreate(BaseModel):
    assignment_id: str
    file_url: Optional[str] = None
    content: Optional[str] = None


class SubmissionRead(BaseModel):
    id: str
    student_id: str
    assignment_id: str
    file_url: Optional[str] = None
    content: Optional[str] = None
    submitted_at: Optional[datetime.datetime] = None
    grade: Optional[float] = Field(default=None, ge=0, le=100)
    feedback: Optional[str] = None
