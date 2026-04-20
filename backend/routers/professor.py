from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from db import supabase
from routers.auth import decode_token

router = APIRouter()

class CourseCreate(BaseModel):
    code: str
    title: str
    credits: int
    department: Optional[str] = None
    description: Optional[str] = None

class GradeInput(BaseModel):
    student_id: str
    course_id: str
    value: float
    semester: str

class AttendanceInput(BaseModel):
    student_id: str
    course_id: str
    date: str
    status: str

class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    course_id: str
    type: str

def get_professor_id(token: str):
    payload = decode_token(token)
    res = supabase.table("professors").select("id").eq("user_id", payload["sub"]).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Professor not found")
    return res.data[0]["id"]

@router.get("/courses")
def get_courses(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    res = supabase.table("courses").select("*").eq("professor_id", prof_id).execute()
    return res.data

@router.post("/courses")
def create_course(data: CourseCreate, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    res = supabase.table("courses").insert({
        "code": data.code,
        "title": data.title,
        "credits": data.credits,
        "department": data.department,
        "description": data.description,
        "professor_id": prof_id
    }).execute()
    return res.data[0]

@router.post("/grades")
def add_grade(data: GradeInput, authorization: str = Header(...)):
    res = supabase.table("grades").insert({
        "student_id": data.student_id,
        "course_id": data.course_id,
        "value": data.value,
        "semester": data.semester
    }).execute()
    return res.data[0]

@router.get("/attendance/{course_id}")
def get_attendance(course_id: str, authorization: str = Header(...)):
    res = supabase.table("attendance").select("*").eq("course_id", course_id).execute()
    return res.data

@router.post("/attendance")
def mark_attendance(data: AttendanceInput, authorization: str = Header(...)):
    res = supabase.table("attendance").insert({
        "student_id": data.student_id,
        "course_id": data.course_id,
        "date": data.date,
        "status": data.status
    }).execute()
    return res.data[0]

@router.post("/assignments")
def create_assignment(data: AssignmentCreate, authorization: str = Header(...)):
    res = supabase.table("assignments").insert({
        "title": data.title,
        "description": data.description,
        "due_date": data.due_date,
        "course_id": data.course_id,
        "type": data.type
    }).execute()
    return res.data[0]

@router.get("/assignments/{course_id}")
def get_assignments(course_id: str, authorization: str = Header(...)):
    res = supabase.table("assignments").select("*").eq("course_id", course_id).execute()
    return res.data