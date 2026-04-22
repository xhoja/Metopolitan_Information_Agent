from pydantic import BaseModel
from typing import Optional, Literal
import datetime

AttendanceStatus = Literal["present", "absent", "late", "excused"]


class AttendanceCreate(BaseModel):
    student_id: str
    course_id: str
    date: datetime.date
    status: AttendanceStatus


class AttendanceUpdate(BaseModel):
    status: AttendanceStatus


class AttendanceRead(BaseModel):
    id: str
    student_id: str
    course_id: str
    date: datetime.date
    status: str
    created_at: Optional[datetime.datetime] = None
