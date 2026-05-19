from pydantic import BaseModel
from typing import Optional


class MajorFeeCreate(BaseModel):
    major: str
    annual_fee: float
    academic_year: str = "2025-2026"
    installment_count: int = 2


class MajorFeeUpdate(BaseModel):
    annual_fee: Optional[float] = None
    academic_year: Optional[str] = None
    installment_count: Optional[int] = None


class StudentFeeCreate(BaseModel):
    student_id: str
    academic_year: str
    agreed_amount: float


class InstallmentCreate(BaseModel):
    description: str
    amount: float
    due_date: str


class InstallmentUpdate(BaseModel):
    paid: bool


class TransactionCreate(BaseModel):
    issue_date: Optional[str] = None
    doc_type: str = "INV"
    doc_no: Optional[str] = None
    explanation: Optional[str] = None
    amount: float
