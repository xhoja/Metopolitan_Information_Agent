from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from agent.mia import router as mia_router
from routers.auth import router as auth_router
from routers.admin import router as admin_router
from routers.professor import router as professor_router
from routers.student import router as student_router
from routers.finance import student_router as finance_student_router
from routers.finance import admin_router as finance_admin_router

app = FastAPI(title="M.I.A University System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(professor_router, prefix="/professor", tags=["Professor"])
app.include_router(student_router, prefix="/student", tags=["Student"])
app.include_router(mia_router, prefix="/mia", tags=["MIA"])
app.include_router(finance_student_router, prefix="/student/finance", tags=["Finance"])
app.include_router(finance_admin_router, prefix="/admin/finance", tags=["Finance"])

_static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(_static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(_static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):  # noqa: ARG001
        return FileResponse(os.path.join(_static_dir, "index.html"))