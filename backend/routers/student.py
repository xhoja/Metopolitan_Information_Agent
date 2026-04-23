from typing import Annotated
from fastapi import APIRouter, HTTPException, Header, UploadFile, File
from db import supabase
from routers.auth import decode_token
from schemas import SubmissionCreate
import uuid

router = APIRouter()

NOT_FOUND_RESPONSE = {404: {"description": "Student not found"}}
BEARER_PREFIX = "Bearer "  # fix S1192: defined once, reused everywhere

def get_student_id(token: str):
    payload = decode_token(token)
    res = supabase.table("students").select("id").eq("user_id", payload["sub"]).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return res.data[0]["id"]

@router.get("/courses", responses=NOT_FOUND_RESPONSE)
def get_my_courses(authorization: Annotated[str, Header()]):  # fix S8410
    token = authorization.replace(BEARER_PREFIX, "")
    student_id = get_student_id(token)
    res = supabase.table("enrollments").select("*, courses(*)").eq("student_id", student_id).execute()
    return res.data

@router.get("/grades", responses=NOT_FOUND_RESPONSE)
def get_my_grades(authorization: Annotated[str, Header()]):
    token = authorization.replace(BEARER_PREFIX, "")
    student_id = get_student_id(token)
    res = supabase.table("grades").select("*, courses(title, code)").eq("student_id", student_id).execute()
    return res.data

@router.get("/attendance", responses=NOT_FOUND_RESPONSE)
def get_my_attendance(authorization: Annotated[str, Header()]):
    token = authorization.replace(BEARER_PREFIX, "")
    student_id = get_student_id(token)
    res = supabase.table("attendance").select("*, courses(title)").eq("student_id", student_id).execute()
    return res.data

@router.get("/transcript", responses=NOT_FOUND_RESPONSE)
def get_transcript(authorization: Annotated[str, Header()]):
    token = authorization.replace(BEARER_PREFIX, "")
    student_id = get_student_id(token)
    student = supabase.table("students").select("*, users(name, email)").eq("id", student_id).execute().data[0]
    grades = supabase.table("grades").select("*, courses(title, code, credits)").eq("student_id", student_id).execute().data
    return {"student": student, "grades": grades}

@router.get("/assignments", responses=NOT_FOUND_RESPONSE)
def get_my_assignments(authorization: Annotated[str, Header()]):
    token = authorization.replace(BEARER_PREFIX, "")
    student_id = get_student_id(token)
    enrollments = supabase.table("enrollments").select("course_id").eq("student_id", student_id).execute().data
    course_ids = [e["course_id"] for e in enrollments]
    assignments = []
    for cid in course_ids:
        res = supabase.table("assignments").select("*").eq("course_id", cid).execute()
        assignments.extend(res.data)
    return assignments

@router.post("/assignments/{assignment_id}/submit", responses=NOT_FOUND_RESPONSE)
def submit_assignment(assignment_id: str, data: SubmissionCreate, authorization: Annotated[str, Header()]):
    token = authorization.replace(BEARER_PREFIX, "")
    student_id = get_student_id(token)
    res = supabase.table("submissions").insert({
        "student_id": student_id,
        "assignment_id": assignment_id,
        "file_url": data.file_url
    }).execute()
    return res.data[0]