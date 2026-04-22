-- M.I.A — Metropolitan Information Agent
-- PostgreSQL / Supabase Schema
-- Run this in the Supabase SQL Editor or any psql client connected to your project.

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    role          VARCHAR(50)  NOT NULL CHECK (role IN ('admin', 'professor', 'student')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STUDENTS  (one row per student user)
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    major          VARCHAR(255),
    enrolled_year  INTEGER,
    credits_earned NUMERIC(5,1) NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROFESSORS  (one row per professor user)
-- ============================================================
CREATE TABLE IF NOT EXISTS professors (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(255),
    title      VARCHAR(255),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    code         VARCHAR(50)  NOT NULL UNIQUE,
    title        VARCHAR(255) NOT NULL,
    credits      INTEGER      NOT NULL CHECK (credits > 0),
    department   VARCHAR(255),
    description  TEXT,
    professor_id UUID         REFERENCES professors(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ENROLLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id   UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, course_id)
);

-- ============================================================
-- GRADES
-- ============================================================
CREATE TABLE IF NOT EXISTS grades (
    id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID          NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id  UUID          NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    value      NUMERIC(5,2)  NOT NULL CHECK (value >= 0 AND value <= 100),
    semester   VARCHAR(50)   NOT NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, course_id, semester)
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id  UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    date       DATE        NOT NULL,
    status     VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, course_id, date)
);

-- ============================================================
-- ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS assignments (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    due_date    TIMESTAMPTZ,
    type        VARCHAR(100) NOT NULL DEFAULT 'assignment',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    UUID         NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assignment_id UUID         NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    file_url      TEXT,
    content       TEXT,
    submitted_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    grade         NUMERIC(5,2),
    feedback      TEXT,
    UNIQUE (student_id, assignment_id)
);

-- ============================================================
-- MATERIALS  (course files uploaded by professors)
-- ============================================================
CREATE TABLE IF NOT EXISTS materials (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    file_url    TEXT,
    file_name   VARCHAR(255),
    uploaded_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHAT SESSIONS  (M.I.A — one session groups a conversation)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID         NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title      VARCHAR(255),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MESSAGES  (individual turns inside a chat session)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID        NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role       VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STUDENT PREFERENCES  (key/value store for M.I.A memory)
-- ============================================================
CREATE TABLE IF NOT EXISTS student_preferences (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID         NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    key        VARCHAR(255) NOT NULL,
    value      TEXT         NOT NULL,
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, key)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email              ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role               ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_user_id         ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_professors_user_id       ON professors(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_professor_id     ON courses(professor_id);
CREATE INDEX IF NOT EXISTS idx_courses_code             ON courses(code);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id   ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id    ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id        ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_course_id         ON grades(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id    ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course_id     ON attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date          ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id    ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id   ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_materials_course_id      ON materials(course_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_student_id ON chat_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id      ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_prefs_student_id         ON student_preferences(student_id);
