from pydantic import BaseModel
from typing import Optional
import datetime


class EnrollmentCreate(BaseModel):
    student_id: str
    course_id: str


class EnrollmentRead(BaseModel):
    id: str
    student_id: str
    course_id: str
    enrolled_at: Optional[datetime.datetime] = None
