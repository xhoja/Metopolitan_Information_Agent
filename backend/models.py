# Re-export from schemas for backward compatibility.
# New code should import directly from schemas.*
from schemas.auth import LoginRequest, UserCreate, UserUpdate, UserRead
from schemas.course import CourseCreate, CourseUpdate, CourseRead
from schemas.grade import GradeCreate, GradeUpdate, GradeRead
from schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceRead
from schemas.assignment import AssignmentCreate, AssignmentUpdate, AssignmentRead
from schemas.submission import SubmissionCreate, SubmissionRead
from schemas.enrollment import EnrollmentCreate, EnrollmentRead
from schemas.mia import ChatRequest, ChatResponse, SessionRead, MessageRead, PreferenceCreate, PreferenceRead
