from pydantic import BaseModel, Field
from typing import Optional
import datetime


class GradeCreate(BaseModel):
    student_id: str
    course_id: str
    value: float = Field(ge=0, le=100, description="Grade value between 0 and 100")
    semester: str


class GradeUpdate(BaseModel):
    value: Optional[float] = Field(default=None, ge=0, le=100)
    semester: Optional[str] = None


class GradeRead(BaseModel):
    id: str
    student_id: str
    course_id: str
    value: float
    semester: str
    created_at: Optional[datetime.datetime] = None
