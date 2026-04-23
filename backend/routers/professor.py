from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from db import supabase
from routers.auth import decode_token
from datetime import datetime as dt
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
    grade_type: str
    weight: float

class AttendanceBulkItem(BaseModel):
    student_id: str
    hours_present: float

class AttendanceBulkInput(BaseModel):
    course_id: str
    date: str
    session_start: str  # "HH:MM"
    session_end: str    # "HH:MM"
    records: list[AttendanceBulkItem]

def _session_duration(start: str, end: str) -> float:
    try:
        s = dt.strptime(start[:5], "%H:%M")
        e = dt.strptime(end[:5], "%H:%M")
        return max(0.0, (e - s).seconds / 3600)
    except:
        return 0.0

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
        "semester": data.semester,
        "grade_type": data.grade_type,
        "weight": data.weight
    }).execute()
    return res.data[0]

@router.get("/grades/{course_id}")
def get_grades(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    get_professor_id(token)
    res = supabase.table("grades").select("id, student_id, value, semester, grade_type, weight, students(users(name, email))").eq("course_id", course_id).execute()
    result = []
    for g in res.data:
        try:
            student = g.get("students") or {}
            user = student.get("users") or {}
            result.append({
                "id": g["id"],
                "student_id": g["student_id"],
                "student_name": user.get("name", "—"),
                "student_email": user.get("email", "—"),
                "value": g["value"],
                "semester": g["semester"],
                "grade_type": g["grade_type"],
                "weight": g["weight"],
            })
        except:
            result.append(g)
    return result

@router.get("/attendance/{course_id}")
def get_attendance(course_id: str, authorization: str = Header(...)):
    res = supabase.table("attendance").select(
        "id, student_id, date, status, session_start, session_end, hours_present, students(users(name, email))"
    ).eq("course_id", course_id).order("date", desc=True).execute()
    result = []
    for r in res.data:
        try:
            student = r.get("students") or {}
            user = student.get("users") or {}
            result.append({
                "id": r["id"],
                "student_id": r["student_id"],
                "student_name": user.get("name", "—"),
                "student_email": user.get("email", "—"),
                "date": r["date"],
                "status": r["status"],
                "session_start": (r.get("session_start") or "")[:5],
                "session_end": (r.get("session_end") or "")[:5],
                "hours_present": r.get("hours_present") or 0,
            })
        except:
            result.append(r)
    return result

@router.post("/attendance/bulk")
def mark_attendance_bulk(data: AttendanceBulkInput, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    get_professor_id(token)
    duration = _session_duration(data.session_start, data.session_end)
    supabase.table("attendance").delete().eq("course_id", data.course_id).eq("date", data.date).eq("session_start", data.session_start).execute()
    rows = []
    for r in data.records:
        hp = max(0.0, min(float(r.hours_present), duration))
        status = "present" if hp >= duration else ("absent" if hp == 0 else "late")
        rows.append({
            "student_id": r.student_id,
            "course_id": data.course_id,
            "date": data.date,
            "session_start": data.session_start,
            "session_end": data.session_end,
            "hours_present": hp,
            "status": status,
        })
    res = supabase.table("attendance").insert(rows).execute()
    return res.data

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
    enrollments = supabase.table("enrollments").select("id, created_at, students(id, user_id, users(id, name, email))").eq("course_id", course_id).execute().data
    result = []
    for e in enrollments:
        try:
            result.append({
                "id": e["students"]["users"]["id"],
                "student_id": e["students"]["id"],
                "name": e["students"]["users"]["name"],
                "email": e["students"]["users"]["email"],
                "enrolled_at": e.get("created_at")
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