from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
from schemas.course import CourseCreate, CourseUpdate
from schemas.grade import GradeCreate
from schemas.attendance import AttendanceCreate
from schemas.assignment import AssignmentCreate
from db import supabase
from routers.auth import decode_token
from datetime import datetime as dt
import uuid

router = APIRouter()


def get_professor_id(token: str) -> str:
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
async def create_assignment(
    title: str = Form(...),
    course_id: str = Form(...),
    type: str = Form(...),
    description: Optional[str] = Form(None),
    due_date: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    authorization: str = Header(...),
):
    file_url = None
    file_name = None
    if file and file.filename:
        file_bytes = await file.read()
        stored_name = f"{uuid.uuid4()}_{file.filename}"
        supabase.storage.from_("materials").upload(stored_name, file_bytes, {"content-type": file.content_type})
        file_url = supabase.storage.from_("materials").get_public_url(stored_name)
        file_name = file.filename
    res = supabase.table("assignments").insert({
        "title": title,
        "description": description,
        "due_date": due_date,
        "course_id": course_id,
        "type": type,
        "file_url": file_url,
        "file_name": file_name,
    }).execute()
    return res.data[0]

# ── Roster ─────────────────────────────────────────────────────────────────

@router.delete("/assignments/{assignment_id}")
def delete_assignment(assignment_id: str, authorization: str = Header(...)):
    supabase.table("assignments").delete().eq("id", assignment_id).execute()
    return {"ok": True}

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
