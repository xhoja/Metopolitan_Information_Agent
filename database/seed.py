"""
M.I.A seed script — inserts test users, a course, enrollment, grade,
attendance record, and assignment so you can smoke-test every endpoint.

Usage (from the /backend directory):
    python ../database/seed.py

Requires: the backend .env to be present (SUPABASE_URL + SUPABASE_KEY).

Test credentials created:
    admin@mia.edu          / Admin1234!
    prof.smith@mia.edu     / Prof1234!
    alice@mia.edu          / Student1234!
"""

import sys
import os
import datetime

# Allow running from either /backend or /database
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

import bcrypt
from db import supabase


def hash_pw(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def upsert_user(name, email, password, role):
    existing = supabase.table("users").select("id").eq("email", email).execute()
    if existing.data:
        print(f"  [skip] user already exists: {email}")
        return existing.data[0]["id"]
    res = supabase.table("users").insert({
        "name": name,
        "email": email,
        "password_hash": hash_pw(password),
        "role": role,
    }).execute()
    uid = res.data[0]["id"]
    print(f"  [ok]   created user: {email}  (id={uid})")
    return uid


def upsert_student(user_id, major, enrolled_year):
    existing = supabase.table("students").select("id").eq("user_id", user_id).execute()
    if existing.data:
        print(f"  [skip] student profile already exists for user_id={user_id}")
        return existing.data[0]["id"]
    res = supabase.table("students").insert({
        "user_id": user_id,
        "major": major,
        "enrolled_year": enrolled_year,
        "credits_earned": 0,
    }).execute()
    sid = res.data[0]["id"]
    print(f"  [ok]   created student profile id={sid}")
    return sid


def upsert_professor(user_id, department, title):
    existing = supabase.table("professors").select("id").eq("user_id", user_id).execute()
    if existing.data:
        print(f"  [skip] professor profile already exists for user_id={user_id}")
        return existing.data[0]["id"]
    res = supabase.table("professors").insert({
        "user_id": user_id,
        "department": department,
        "title": title,
    }).execute()
    pid = res.data[0]["id"]
    print(f"  [ok]   created professor profile id={pid}")
    return pid


def upsert_course(code, title, credits, department, description, professor_id):
    existing = supabase.table("courses").select("id").eq("code", code).execute()
    if existing.data:
        print(f"  [skip] course already exists: {code}")
        return existing.data[0]["id"]
    res = supabase.table("courses").insert({
        "code": code,
        "title": title,
        "credits": credits,
        "department": department,
        "description": description,
        "professor_id": professor_id,
    }).execute()
    cid = res.data[0]["id"]
    print(f"  [ok]   created course: {code}  (id={cid})")
    return cid


def upsert_enrollment(student_id, course_id):
    existing = (supabase.table("enrollments")
                .select("id")
                .eq("student_id", student_id)
                .eq("course_id", course_id)
                .execute())
    if existing.data:
        print(f"  [skip] enrollment already exists")
        return existing.data[0]["id"]
    res = supabase.table("enrollments").insert({
        "student_id": student_id,
        "course_id": course_id,
    }).execute()
    eid = res.data[0]["id"]
    print(f"  [ok]   created enrollment id={eid}")
    return eid


def upsert_grade(student_id, course_id, value, semester):
    existing = (supabase.table("grades")
                .select("id")
                .eq("student_id", student_id)
                .eq("course_id", course_id)
                .eq("semester", semester)
                .execute())
    if existing.data:
        print(f"  [skip] grade already exists")
        return existing.data[0]["id"]
    res = supabase.table("grades").insert({
        "student_id": student_id,
        "course_id": course_id,
        "value": value,
        "semester": semester,
    }).execute()
    gid = res.data[0]["id"]
    print(f"  [ok]   created grade id={gid}")
    return gid


def upsert_attendance(student_id, course_id, date, status):
    existing = (supabase.table("attendance")
                .select("id")
                .eq("student_id", student_id)
                .eq("course_id", course_id)
                .eq("date", date)
                .execute())
    if existing.data:
        print(f"  [skip] attendance record already exists")
        return existing.data[0]["id"]
    res = supabase.table("attendance").insert({
        "student_id": student_id,
        "course_id": course_id,
        "date": date,
        "status": status,
    }).execute()
    aid = res.data[0]["id"]
    print(f"  [ok]   created attendance id={aid}")
    return aid


def upsert_assignment(course_id, title, description, due_date, atype):
    existing = (supabase.table("assignments")
                .select("id")
                .eq("course_id", course_id)
                .eq("title", title)
                .execute())
    if existing.data:
        print(f"  [skip] assignment already exists: {title}")
        return existing.data[0]["id"]
    res = supabase.table("assignments").insert({
        "course_id": course_id,
        "title": title,
        "description": description,
        "due_date": due_date,
        "type": atype,
    }).execute()
    asid = res.data[0]["id"]
    print(f"  [ok]   created assignment id={asid}")
    return asid


def main():
    print("\n=== M.I.A Seed Script ===\n")

    # -- Admin
    print("-- Admin user")
    upsert_user("Admin User", "admin@mia.edu", "Admin1234!", "admin")

    # -- Professor
    print("\n-- Professor user")
    prof_uid = upsert_user("Dr. John Smith", "prof.smith@mia.edu", "Prof1234!", "professor")
    prof_id = upsert_professor(prof_uid, "Computer Science", "Associate Professor")

    # -- Student
    print("\n-- Student user")
    stu_uid = upsert_user("Alice Johnson", "alice@mia.edu", "Student1234!", "student")
    stu_id = upsert_student(stu_uid, "Computer Science", datetime.datetime.now().year)

    # -- Course
    print("\n-- Course")
    course_id = upsert_course(
        code="CS101",
        title="Introduction to Programming",
        credits=3,
        department="Computer Science",
        description="Foundational programming concepts using Python.",
        professor_id=prof_id,
    )

    # -- Enrollment
    print("\n-- Enrollment")
    upsert_enrollment(stu_id, course_id)

    # -- Grade
    print("\n-- Grade")
    upsert_grade(stu_id, course_id, 88.5, "Fall 2025")

    # -- Attendance
    print("\n-- Attendance")
    upsert_attendance(stu_id, course_id, "2025-09-10", "present")
    upsert_attendance(stu_id, course_id, "2025-09-17", "present")
    upsert_attendance(stu_id, course_id, "2025-09-24", "absent")

    # -- Assignment
    print("\n-- Assignment")
    upsert_assignment(
        course_id=course_id,
        title="Homework 1: Variables and Loops",
        description="Write a Python script demonstrating variables and loop constructs.",
        due_date="2025-09-20T23:59:00+00:00",
        atype="homework",
    )

    print("\n=== Seed complete ===\n")
    print("Test credentials:")
    print("  admin@mia.edu        / Admin1234!")
    print("  prof.smith@mia.edu   / Prof1234!")
    print("  alice@mia.edu        / Student1234!")
    print()


if __name__ == "__main__":
    main()
