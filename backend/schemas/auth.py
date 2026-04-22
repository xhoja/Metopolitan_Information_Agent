from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Literal
import datetime

UserRole = Literal["admin", "professor", "student"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole
    # role-specific profile fields (only one set is used per role)
    major: Optional[str] = None
    department: Optional[str] = None
    title: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name must not be blank")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("password must be at least 6 characters")
        return v


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("name must not be blank")
        return v.strip() if v else v


class UserRead(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: Optional[datetime.datetime] = None
