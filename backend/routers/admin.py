from fastapi import APIRouter, HTTPException, Header
from schemas.auth import UserCreate, UserUpdate
from db import supabase
from routers.auth import hash_password, decode_token
import datetime

router = APIRouter()


def require_admin(token: str) -> dict:
    payload = decode_token(token)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return payload


# ── Users ──────────────────────────────────────────────────────────────────

@router.post("/users")
def create_user(data: UserCreate, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_admin(token)
    existing = supabase.table("users").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already exists")
    hashed = hash_password(data.password)
    user_res = supabase.table("users").insert({
        "name": data.name,
        "email": data.email,
        "password_hash": hashed,
        "role": data.role,
    }).execute()
    user = user_res.data[0]
    if data.role == "student":
        supabase.table("students").insert({
            "user_id": user["id"],
            "major": data.major,
            "enrolled_year": datetime.datetime.now().year,
        }).execute()
    elif data.role == "professor":
        supabase.table("professors").insert({
            "user_id": user["id"],
            "department": data.department,
            "title": data.title,
        }).execute()
    return {"message": "User created", "id": user["id"]}


@router.get("/users")
def get_all_users(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_admin(token)
    res = supabase.table("users").select("id, name, email, role, created_at").execute()
    return res.data


@router.put("/users/{user_id}")
def update_user(user_id: str, data: UserUpdate, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_admin(token)
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    supabase.table("users").update(updates).eq("id", user_id).execute()
    return {"message": "User updated"}


@router.delete("/users/{user_id}")
def delete_user(user_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_admin(token)
    supabase.table("users").delete().eq("id", user_id).execute()
    return {"message": "User deleted"}


# ── Stats overview ─────────────────────────────────────────────────────────

@router.get("/stats")
def get_stats(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_admin(token)
    users = supabase.table("users").select("id, role").execute().data
    return {
        "total_users": len(users),
        "students": sum(1 for u in users if u["role"] == "student"),
        "professors": sum(1 for u in users if u["role"] == "professor"),
        "admins": sum(1 for u in users if u["role"] == "admin"),
        "total_courses": len(supabase.table("courses").select("id").execute().data),
        "total_enrollments": len(supabase.table("enrollments").select("id").execute().data),
    }


# ── Courses ────────────────────────────────────────────────────────────────

@router.get("/courses")
def get_all_courses(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_admin(token)
    courses = supabase.table("courses").select(
        "id, code, title, department, credits, professor_id, professors(user_id, users(name))"
    ).execute().data
    result = []
    for c in courses:
        enrollment_count = len(
            supabase.table("enrollments").select("id").eq("course_id", c["id"]).execute().data
        )
        try:
            professor_name = c["professors"]["users"]["name"]
        except Exception:
            professor_name = ""
        result.append({
            "id": c["id"],
            "code": c["code"],
            "title": c["title"],
            "department": c["department"],
            "credits": c["credits"],
            "professor_name": professor_name,
            "enrollment_count": enrollment_count,
        })
    return result


# ── Enrollments ────────────────────────────────────────────────────────────

@router.get("/enrollments")
def get_all_enrollments(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_admin(token)
    enrollments = supabase.table("enrollments").select(
        "id, enrolled_at, students(user_id, users(name)), courses(title, code)"
    ).execute().data
    result = []
    for e in enrollments:
        try:
            student_name = e["students"]["users"]["name"]
        except Exception:
            student_name = ""
        try:
            course_title = e["courses"]["title"]
            course_code = e["courses"]["code"]
        except Exception:
            course_title = ""
            course_code = ""
        result.append({
            "id": e["id"],
            "student_name": student_name,
            "course_title": course_title,
            "course_code": course_code,
            "enrolled_at": e.get("enrolled_at"),
        })
    return result


# ── Attendance ─────────────────────────────────────────────────────────────

@router.get("/attendance")
def get_all_attendance(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_admin(token)
    records = supabase.table("attendance").select(
        "id, date, status, students(user_id, users(name)), courses(title)"
    ).execute().data
    result = []
    for r in records:
        try:
            student_name = r["students"]["users"]["name"]
        except Exception:
            student_name = ""
        try:
            course_title = r["courses"]["title"]
        except Exception:
            course_title = ""
        result.append({
            "id": r["id"],
            "student_name": student_name,
            "course_title": course_title,
            "date": r["date"],
            "status": r["status"],
        })
    return result


# ── Grades ─────────────────────────────────────────────────────────────────

@router.get("/grades")
def get_all_grades(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_admin(token)
    grades = supabase.table("grades").select(
        "id, value, semester, students(user_id, users(name)), courses(title)"
    ).execute().data
    result = []
    for g in grades:
        try:
            student_name = g["students"]["users"]["name"]
        except Exception:
            student_name = ""
        try:
            course_title = g["courses"]["title"]
        except Exception:
            course_title = ""
        result.append({
            "id": g["id"],
            "student_name": student_name,
            "course_title": course_title,
            "value": g["value"],
            "semester": g["semester"],
        })
    return result
