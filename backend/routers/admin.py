from fastapi import APIRouter, HTTPException, Header
from models import UserCreate
from db import supabase
from routers.auth import hash_password, decode_token
import datetime

router = APIRouter()

def require_admin(token: str):
    payload = decode_token(token)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return payload

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
        "role": data.role
    }).execute()
    user = user_res.data[0]
    if data.role == "student":
        supabase.table("students").insert({
            "user_id": user["id"],
            "major": data.major,
            "enrolled_year": datetime.datetime.now().year
        }).execute()
    elif data.role == "professor":
        supabase.table("professors").insert({
            "user_id": user["id"],
            "department": data.department,
            "title": data.title
        }).execute()
    return {"message": "User created", "id": user["id"]}

@router.get("/users")
def get_all_users(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_admin(token)
    res = supabase.table("users").select("id, name, email, role, created_at").execute()
    return res.data

@router.put("/users/{user_id}")
def update_user(user_id: str, data: UserCreate, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_admin(token)
    supabase.table("users").update({
        "name": data.name,
        "email": data.email,
        "role": data.role
    }).eq("id", user_id).execute()
    return {"message": "User updated"}

@router.delete("/users/{user_id}")
def delete_user(user_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_admin(token)
    supabase.table("users").delete().eq("id", user_id).execute()
    return {"message": "User deleted"}