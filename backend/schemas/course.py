from pydantic import BaseModel, Field
from typing import Optional
import datetime


class CourseCreate(BaseModel):
    code: str
    title: str
    credits: int = Field(gt=0, description="Credit hours must be a positive integer")
    department: Optional[str] = None
    description: Optional[str] = None


class CourseUpdate(BaseModel):
    code: Optional[str] = None
    title: Optional[str] = None
    credits: Optional[int] = Field(default=None, gt=0)
    department: Optional[str] = None
    description: Optional[str] = None


class CourseRead(BaseModel):
    id: str
    code: str
    title: str
    credits: int
    department: Optional[str] = None
    description: Optional[str] = None
    professor_id: Optional[str] = None
    created_at: Optional[datetime.datetime] = None
