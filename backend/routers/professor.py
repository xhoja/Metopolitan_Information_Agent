from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from db import supabase
from routers.auth import decode_token
import uuid

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

@router.get("/courses/{course_id}/students")
def get_course_students(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    get_professor_id(token)
    enrollments = supabase.table("enrollments").select("id, students(user_id, users(id, name, email))").eq("course_id", course_id).execute().data
    result = []
    for e in enrollments:
        try:
            result.append({
                "id": e["students"]["users"]["id"],
                "name": e["students"]["users"]["name"],
                "email": e["students"]["users"]["email"],
                "enrolled_at": None
            })
        except:
            continue
    return result

@router.get("/courses/{course_id}/materials")
def get_materials(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    get_professor_id(token)
    res = supabase.table("materials").select("id, title, file_url, file_name").eq("course_id", course_id).execute()
    return res.data

@router.post("/courses/{course_id}/materials")
async def upload_material(
    course_id: str,
    title: str = Form(...),
    file: UploadFile = File(...),
    authorization: str = Header(...)
):
    token = authorization.replace("Bearer ", "")
    get_professor_id(token)
    file_bytes = await file.read()
    file_name = f"{uuid.uuid4()}_{file.filename}"
    supabase.storage.from_("materials").upload(file_name, file_bytes, {"content-type": file.content_type})
    file_url = supabase.storage.from_("materials").get_public_url(file_name)
    res = supabase.table("materials").insert({
        "course_id": course_id,
        "title": title,
        "file_url": file_url,
        "file_name": file.filename
    }).execute()
    return res.data[0]