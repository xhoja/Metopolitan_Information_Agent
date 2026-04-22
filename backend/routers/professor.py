from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
from schemas.course import CourseCreate, CourseUpdate
from schemas.grade import GradeCreate
from schemas.attendance import AttendanceCreate
from schemas.assignment import AssignmentCreate
from db import supabase
from routers.auth import decode_token
import uuid

router = APIRouter()


def get_professor_id(token: str) -> str:
    payload = decode_token(token)
    res = supabase.table("professors").select("id").eq("user_id", payload["sub"]).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Professor profile not found")
    return res.data[0]["id"]


# ── Courses ────────────────────────────────────────────────────────────────

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
        "professor_id": prof_id,
    }).execute()
    return res.data[0]


@router.put("/courses/{course_id}")
def update_course(course_id: str, data: CourseUpdate, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    # Ownership check
    existing = supabase.table("courses").select("professor_id").eq("id", course_id).execute()
    if not existing.data or existing.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = supabase.table("courses").update(updates).eq("id", course_id).execute()
    return res.data[0]


@router.delete("/courses/{course_id}")
def delete_course(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    existing = supabase.table("courses").select("professor_id").eq("id", course_id).execute()
    if not existing.data or existing.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    supabase.table("courses").delete().eq("id", course_id).execute()
    return {"message": "Course deleted"}


# ── Roster ─────────────────────────────────────────────────────────────────

@router.get("/courses/{course_id}/students")
def get_course_students(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    existing = supabase.table("courses").select("professor_id").eq("id", course_id).execute()
    if not existing.data or existing.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    enrollments = supabase.table("enrollments").select(
        "id, students(user_id, users(id, name, email))"
    ).eq("course_id", course_id).execute().data
    result = []
    for e in enrollments:
        try:
            result.append({
                "id": e["students"]["users"]["id"],
                "name": e["students"]["users"]["name"],
                "email": e["students"]["users"]["email"],
            })
        except Exception:
            continue
    return result


# ── Grades ─────────────────────────────────────────────────────────────────

@router.post("/grades")
def add_grade(data: GradeCreate, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    course = supabase.table("courses").select("professor_id").eq("id", data.course_id).execute()
    if not course.data or course.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    res = supabase.table("grades").insert({
        "student_id": data.student_id,
        "course_id": data.course_id,
        "value": data.value,
        "semester": data.semester,
    }).execute()
    return res.data[0]


@router.put("/grades/{grade_id}")
def update_grade(grade_id: str, data: dict, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    grade = supabase.table("grades").select("course_id").eq("id", grade_id).execute()
    if not grade.data:
        raise HTTPException(status_code=404, detail="Grade not found")
    course = supabase.table("courses").select("professor_id").eq("id", grade.data[0]["course_id"]).execute()
    if not course.data or course.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    res = supabase.table("grades").update(data).eq("id", grade_id).execute()
    return res.data[0]


@router.delete("/grades/{grade_id}")
def delete_grade(grade_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    grade = supabase.table("grades").select("course_id").eq("id", grade_id).execute()
    if not grade.data:
        raise HTTPException(status_code=404, detail="Grade not found")
    course = supabase.table("courses").select("professor_id").eq("id", grade.data[0]["course_id"]).execute()
    if not course.data or course.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    supabase.table("grades").delete().eq("id", grade_id).execute()
    return {"message": "Grade deleted"}


# ── Attendance ─────────────────────────────────────────────────────────────

@router.get("/attendance/{course_id}")
def get_attendance(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    course = supabase.table("courses").select("professor_id").eq("id", course_id).execute()
    if not course.data or course.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    res = supabase.table("attendance").select("*").eq("course_id", course_id).execute()
    return res.data


@router.post("/attendance")
def mark_attendance(data: AttendanceCreate, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    course = supabase.table("courses").select("professor_id").eq("id", data.course_id).execute()
    if not course.data or course.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    res = supabase.table("attendance").insert({
        "student_id": data.student_id,
        "course_id": data.course_id,
        "date": str(data.date),
        "status": data.status,
    }).execute()
    return res.data[0]


@router.delete("/attendance/{attendance_id}")
def delete_attendance(attendance_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    record = supabase.table("attendance").select("course_id").eq("id", attendance_id).execute()
    if not record.data:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    course = supabase.table("courses").select("professor_id").eq("id", record.data[0]["course_id"]).execute()
    if not course.data or course.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    supabase.table("attendance").delete().eq("id", attendance_id).execute()
    return {"message": "Attendance record deleted"}


# ── Assignments ────────────────────────────────────────────────────────────

@router.get("/assignments/{course_id}")
def get_assignments(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    course = supabase.table("courses").select("professor_id").eq("id", course_id).execute()
    if not course.data or course.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    res = supabase.table("assignments").select("*").eq("course_id", course_id).execute()
    return res.data


@router.post("/assignments")
def create_assignment(data: AssignmentCreate, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    course = supabase.table("courses").select("professor_id").eq("id", data.course_id).execute()
    if not course.data or course.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    res = supabase.table("assignments").insert({
        "title": data.title,
        "description": data.description,
        "due_date": data.due_date.isoformat() if data.due_date else None,
        "course_id": data.course_id,
        "type": data.type,
    }).execute()
    return res.data[0]


@router.put("/assignments/{assignment_id}")
def update_assignment(assignment_id: str, data: dict, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    assignment = supabase.table("assignments").select("course_id").eq("id", assignment_id).execute()
    if not assignment.data:
        raise HTTPException(status_code=404, detail="Assignment not found")
    course = supabase.table("courses").select("professor_id").eq("id", assignment.data[0]["course_id"]).execute()
    if not course.data or course.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    res = supabase.table("assignments").update(data).eq("id", assignment_id).execute()
    return res.data[0]


@router.delete("/assignments/{assignment_id}")
def delete_assignment(assignment_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    assignment = supabase.table("assignments").select("course_id").eq("id", assignment_id).execute()
    if not assignment.data:
        raise HTTPException(status_code=404, detail="Assignment not found")
    course = supabase.table("courses").select("professor_id").eq("id", assignment.data[0]["course_id"]).execute()
    if not course.data or course.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    supabase.table("assignments").delete().eq("id", assignment_id).execute()
    return {"message": "Assignment deleted"}


# ── Submissions (view only) ────────────────────────────────────────────────

@router.get("/assignments/{assignment_id}/submissions")
def get_submissions(assignment_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    assignment = supabase.table("assignments").select("course_id").eq("id", assignment_id).execute()
    if not assignment.data:
        raise HTTPException(status_code=404, detail="Assignment not found")
    course = supabase.table("courses").select("professor_id").eq("id", assignment.data[0]["course_id"]).execute()
    if not course.data or course.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    res = supabase.table("submissions").select(
        "id, submitted_at, file_url, content, grade, feedback, students(user_id, users(name, email))"
    ).eq("assignment_id", assignment_id).execute()
    return res.data


# ── Materials ──────────────────────────────────────────────────────────────

@router.get("/courses/{course_id}/materials")
def get_materials(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    course = supabase.table("courses").select("professor_id").eq("id", course_id).execute()
    if not course.data or course.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    res = supabase.table("materials").select("id, title, file_url, file_name, uploaded_at").eq("course_id", course_id).execute()
    return res.data


@router.post("/courses/{course_id}/materials")
async def upload_material(
    course_id: str,
    title: str = Form(...),
    file: UploadFile = File(...),
    authorization: str = Header(...),
):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    course = supabase.table("courses").select("professor_id").eq("id", course_id).execute()
    if not course.data or course.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    file_bytes = await file.read()
    file_name = f"{uuid.uuid4()}_{file.filename}"
    supabase.storage.from_("materials").upload(file_name, file_bytes, {"content-type": file.content_type})
    file_url = supabase.storage.from_("materials").get_public_url(file_name)
    res = supabase.table("materials").insert({
        "course_id": course_id,
        "title": title,
        "file_url": file_url,
        "file_name": file.filename,
    }).execute()
    return res.data[0]


@router.delete("/courses/{course_id}/materials/{material_id}")
def delete_material(course_id: str, material_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    prof_id = get_professor_id(token)
    course = supabase.table("courses").select("professor_id").eq("id", course_id).execute()
    if not course.data or course.data[0]["professor_id"] != prof_id:
        raise HTTPException(status_code=403, detail="Not your course")
    supabase.table("materials").delete().eq("id", material_id).eq("course_id", course_id).execute()
    return {"message": "Material deleted"}
