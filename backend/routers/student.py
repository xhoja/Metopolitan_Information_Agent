from fastapi import APIRouter, HTTPException, Header, UploadFile, File
from db import supabase
from routers.auth import decode_token
from schemas import SubmissionCreate
import uuid

router = APIRouter()

def get_student_id(token: str):
    payload = decode_token(token)
    res = supabase.table("students").select("id").eq("user_id", payload["sub"]).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return res.data[0]["id"]

@router.get("/courses")
def get_my_courses(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    student_id = get_student_id(token)
    res = supabase.table("enrollments").select("*, courses(*)").eq("student_id", student_id).execute()
    return res.data

@router.get("/grades")
def get_my_grades(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    student_id = get_student_id(token)
    res = supabase.table("grades").select("*, courses(title, code)").eq("student_id", student_id).execute()
    return res.data

@router.get("/attendance")
def get_my_attendance(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    student_id = get_student_id(token)
    res = supabase.table("attendance").select("*, courses(title)").eq("student_id", student_id).execute()
    return res.data

@router.get("/transcript")
def get_transcript(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    student_id = get_student_id(token)
    student = supabase.table("students").select("*, users(name, email)").eq("id", student_id).execute().data[0]
    grades = supabase.table("grades").select("*, courses(title, code, credits)").eq("student_id", student_id).execute().data
    return {"student": student, "grades": grades}

@router.get("/assignments")
def get_my_assignments(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    student_id = get_student_id(token)
    enrollments = supabase.table("enrollments").select("course_id").eq("student_id", student_id).execute().data
    course_ids = [e["course_id"] for e in enrollments]
    assignments = []
    for cid in course_ids:
        res = supabase.table("assignments").select("*").eq("course_id", cid).execute()
        assignments.extend(res.data)
    return assignments

@router.post("/assignments/{assignment_id}/submit")
def submit_assignment(assignment_id: str, data: SubmissionCreate, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    student_id = get_student_id(token)
    res = supabase.table("submissions").insert({
        "student_id": student_id,
        "assignment_id": assignment_id,
        "file_url": data.file_url
    }).execute()
    return res.data[0]