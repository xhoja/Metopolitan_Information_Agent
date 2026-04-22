from fastapi import APIRouter, HTTPException, Header
from schemas.auth import LoginRequest, UserCreate, UserRead
from db import supabase
import bcrypt
import jwt, os, datetime

router = APIRouter()
SECRET_KEY = os.getenv("SECRET_KEY", "changeme")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalid or expired")


@router.post("/login")
def login(req: LoginRequest):
    res = supabase.table("users").select("*").eq("email", req.email).execute()
    if not res.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = res.data[0]
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["id"], user["role"])
    return {"access_token": token, "role": user["role"], "name": user["name"]}


@router.post("/register")
def register(data: UserCreate):
    existing = supabase.table("users").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
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
    token = create_token(user["id"], user["role"])
    return {"access_token": token, "role": user["role"], "name": user["name"]}


@router.get("/me", response_model=UserRead)
def get_me(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    res = supabase.table("users").select("id, name, email, role, created_at").eq("id", payload["sub"]).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    return res.data[0]
