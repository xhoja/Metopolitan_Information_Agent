from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agent.mia import router as mia_router
from routers.auth import router as auth_router
from routers.admin import router as admin_router
from routers.professor import router as professor_router
from routers.student import router as student_router

app = FastAPI(title="M.I.A University System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(professor_router, prefix="/professor", tags=["Professor"])
app.include_router(student_router, prefix="/student", tags=["Student"])
app.include_router(mia_router, prefix="/mia", tags=["MIA"])