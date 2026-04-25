from fastapi import APIRouter, HTTPException, Header
from schemas.submission import SubmissionCreate
from typing import Annotated
from fastapi import APIRouter, HTTPException, Header, UploadFile, File
from db import supabase
from routers.auth import decode_token
from schemas import SubmissionCreate
import uuid

router = APIRouter()

NOT_FOUND_RESPONSE = {404: {"description": "Student not found"}}
BEARER_PREFIX = "Bearer "  # fix S1192: defined once, reused everywhere

def get_student_id(token: str) -> str:
    payload = decode_token(token)
    res = supabase.table("students").select("id").eq("user_id", payload["sub"]).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return res.data[0]["id"]


# ── Courses ────────────────────────────────────────────────────────────────

@router.get("/courses")
def get_my_courses(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
@router.get("/courses", responses=NOT_FOUND_RESPONSE)
def get_my_courses(authorization: Annotated[str, Header()]):  # fix S8410
    token = authorization.replace(BEARER_PREFIX, "")
    student_id = get_student_id(token)
    res = supabase.table("enrollments").select("*, courses(*)").eq("student_id", student_id).execute()
    return res.data


# ── Grades ─────────────────────────────────────────────────────────────────

@router.get("/grades")
def get_my_grades(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
@router.get("/grades", responses=NOT_FOUND_RESPONSE)
def get_my_grades(authorization: Annotated[str, Header()]):
    token = authorization.replace(BEARER_PREFIX, "")
    student_id = get_student_id(token)
    res = supabase.table("grades").select("*, courses(title, code)").eq("student_id", student_id).execute()
    return res.data


# ── Attendance ─────────────────────────────────────────────────────────────

@router.get("/attendance")
def get_my_attendance(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
@router.get("/attendance", responses=NOT_FOUND_RESPONSE)
def get_my_attendance(authorization: Annotated[str, Header()]):
    token = authorization.replace(BEARER_PREFIX, "")
    student_id = get_student_id(token)
    res = supabase.table("attendance").select("*, courses(title)").eq("student_id", student_id).execute()
    return res.data


# ── Transcript ─────────────────────────────────────────────────────────────

@router.get("/transcript")
def get_transcript(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
@router.get("/transcript", responses=NOT_FOUND_RESPONSE)
def get_transcript(authorization: Annotated[str, Header()]):
    token = authorization.replace(BEARER_PREFIX, "")
    student_id = get_student_id(token)
    student = supabase.table("students").select("*, users(name, email)").eq("id", student_id).execute().data
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    grades = supabase.table("grades").select("*, courses(title, code, credits)").eq("student_id", student_id).execute().data
    return {"student": student[0], "grades": grades}


# ── Assignments ────────────────────────────────────────────────────────────

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


@router.post("/assignments/{assignment_id}/submit")
def submit_assignment(assignment_id: str, data: SubmissionCreate, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
@router.post("/assignments/{assignment_id}/submit", responses=NOT_FOUND_RESPONSE)
def submit_assignment(assignment_id: str, data: SubmissionCreate, authorization: Annotated[str, Header()]):
    token = authorization.replace(BEARER_PREFIX, "")
    student_id = get_student_id(token)
    # Verify the assignment belongs to a course the student is enrolled in
    assignment = supabase.table("assignments").select("course_id").eq("id", assignment_id).execute()
    if not assignment.data:
        raise HTTPException(status_code=404, detail="Assignment not found")
    enrollment = (supabase.table("enrollments")
                  .select("id")
                  .eq("student_id", student_id)
                  .eq("course_id", assignment.data[0]["course_id"])
                  .execute())
    if not enrollment.data:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")
    res = supabase.table("submissions").insert({
        "student_id": student_id,
        "assignment_id": assignment_id,
        "file_url": data.file_url,
        "content": data.content,
    }).execute()
    return res.data[0]


# ── Profile ────────────────────────────────────────────────────────────────

@router.get("/profile")
def get_profile(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    user_id = payload["sub"]
    user = supabase.table("users").select("id, name, email, role").eq("id", user_id).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")
    student = supabase.table("students").select("id, major, enrolled_year, credits_earned").eq("user_id", user_id).execute()
    return {**user.data[0], **(student.data[0] if student.data else {})}
