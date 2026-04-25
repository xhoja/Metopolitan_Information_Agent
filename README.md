# M.I.A — Metropolitan Information Agent

> AI-Powered University Management System

*Advanced Software Engineering — Group Project*

---

## Overview

M.I.A (Metropolitan Information Agent) is a full-stack web application that serves as a complete university management system. It provides three distinct portals for administrators, professors, and students — each tailored to their specific needs and responsibilities.

The standout feature is **M.I.A**, an AI-powered academic adviser integrated exclusively into the student portal, giving students instant, personalised answers about their academic journey.

The system covers every aspect of university operations except the finance department, making it a near-complete institutional platform built for real-world use.

---

## The Problem We Solve

- Students lack instant access to personalised academic guidance without waiting for adviser appointments
- Administrators have no unified platform to manage users, roles, and institutional data
- Professors juggle multiple tools to manage courses, grades, attendance, and assignments
- University data is fragmented across disconnected systems with no single source of truth

---

## Features

### Public Pages
- **Home page** — Landing page introducing M.I.A and the university portal
- **Login page** — Role-based authentication that redirects each user to their correct dashboard

### Administrator Dashboard
- Create and manage all user accounts (students and professors)
- Assign and update user roles across the system
- Full system oversight — access to all records, courses, and activity

### Professor Dashboard
- Upload and manage courses and course materials
- Record and update student grades
- Track and manage student attendance
- Create and manage assignments and projects
- Enroll students and manage class rosters

### Student Dashboard
- View current courses and enrolled subjects
- Check grades and GPA in real time
- View attendance records per course
- Access and download academic transcript
- View and submit assignments and projects
- **M.I.A AI Adviser** — Conversational AI that answers academic questions, recommends courses, checks graduation progress, and remembers student preferences

### M.I.A — AI Agent *(Student Portal Only)*

The AI agent is powered by Groq or Gemini API and is exclusively available to students. It provides:

- Natural language answers to academic questions
- Personalised course recommendations based on major and progress
- Graduation timeline and credit hour tracking
- Persistent memory of student preferences and goals across sessions
- Context-aware multi-turn conversation with full chat history

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | Component-based UI for all three dashboards |
| Frontend | Tailwind CSS | Utility-first styling for fast, clean UI |
| Backend | Python + FastAPI | REST API server — fast, modern, AI/ML-friendly |
| AI Agent | Groq API / Gemini API | LLM powering the M.I.A conversational adviser |
| Database | PostgreSQL | Relational database for all structured university data |
| Database Host | Supabase | Managed PostgreSQL with built-in auth and dashboard |
| Version Control | Git + GitHub | Source control and team collaboration |

---

## Application Pages

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home — landing page introducing M.I.A |
| `/login` | Public | Login with role-based redirect |
| `/admin` | Admin | User management, role assignment, system overview |
| `/professor` | Professor | Courses, grades, attendance, assignments |
| `/student` | Student | Grades, GPA, transcript, attendance, M.I.A chat |

---

## Team

| Member | Role | Responsibilities |
|---|---|---|
| Loric | AI Agent Integration | M.I.A chat, Groq/Gemini API, prompt engineering, preference memory, RAG pipeline |
| Aida | Backend Development | FastAPI endpoints, database models, business logic, validation layer |
| Parashqevi | Backend Development | API routing, authentication middleware, data queries, Supabase integration |
| Xhoi | Frontend Development | React architecture, admin and professor dashboards, routing |
| Ajna | Frontend Development | Student dashboard UI, M.I.A chat interface, Tailwind styling, responsive design |

---

## System Architecture

```
[Browser]
    |
[React Frontend — Tailwind CSS]
    |
[FastAPI Backend — Python]
    |                   |
[Auth + Role        [M.I.A Agent]  <- Student portal only
 Middleware]             |
                   [Groq / Gemini API]
    |
[PostgreSQL — Supabase]
(users, courses, grades, attendance, assignments, chat history)
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.10+
- A [Supabase](https://supabase.com) account (free tier)
- A [Groq API key](https://console.groq.com) (free) or [Gemini API key](https://aistudio.google.com) (free)
- Git + [GitHub Desktop](https://desktop.github.com)

### 1. Clone the repository

Open GitHub Desktop → **File** → **Clone Repository** → paste the repo URL.

Or with terminal:
```bash
git clone https://github.com/your-org/mia-university.git
cd mia-university
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

### 4. Configure environment variables

Copy `.env.example` to `.env` in both `frontend/` and `backend/` and fill in your values.

**`backend/.env`**
```env
DATABASE_URL=your_supabase_postgres_connection_string
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_jwt_secret_key
```

**`frontend/.env`**
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 5. Run the development servers

**Backend:**
```bash
cd backend
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Project Structure

```
mia-university/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ProfessorDashboard.jsx
│   │   │   └── StudentDashboard.jsx
│   │   ├── components/
│   │   │   ├── chat/           # M.I.A chat components
│   │   │   ├── dashboard/      # Shared dashboard components
│   │   │   └── shared/         # Navbar, Sidebar, ProtectedRoute
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── routers/
│   │   ├── auth.py             # Login, token, role middleware
│   │   ├── admin.py            # User management endpoints
│   │   ├── professor.py        # Courses, grades, attendance
│   │   └── student.py          # Student data endpoints
│   ├── agent/
│   │   ├── mia.py              # M.I.A agent orchestration
│   │   ├── prompt_builder.py   # Builds context-aware prompts
│   │   └── memory.py           # Student preference extraction
│   ├── models/                 # Database models
│   ├── main.py
│   └── requirements.txt
│
├── database/
│   └── schema.sql
│
└── README.md
```

---

## Core Database Entities

| Entity | Description |
|---|---|
| `User` | All system users — id, name, email, password_hash, role (admin / professor / student) |
| `Student` | Student profile — user_id, major, enrolled_year, credits_earned, gpa |
| `Professor` | Professor profile — user_id, department, title |
| `Course` | Course catalog — code, title, credits, department, description, professor_id |
| `Enrollment` | Student-course link — student_id, course_id, semester, status |
| `Grade` | student_id, course_id, assignment_id, value, semester |
| `Attendance` | student_id, course_id, date, status (present / absent / late) |
| `Assignment` | title, description, due_date, course_id, type (project / homework / exam) |
| `Submission` | student_id, assignment_id, submitted_at, file_url, grade |
| `ChatSession` | student_id, started_at, ended_at |
| `Message` | session_id, role (user / assistant), content, created_at |
| `StudentPreference` | student_id, category, preference_text, source (chat / manual) |

---

## Role Permissions

| Feature | Admin | Professor | Student |
|---|:---:|:---:|:---:|
| Create / manage users | yes | no | no|
| Assign roles | yes | no | no |
| View all system data | yes | no | no |
| Manage courses | yes| yes| no |
| Upload grades | yes| yes | no |
| Manage attendance | yes | yes | no |
| Create assignments | yes | yes | no |
| View own grades & GPA | no | no | yes |
| View transcript | no | no | yes |
| View own attendance | no | no | yes |
| Submit assignments | no | no | yes |
| Access M.I.A AI Adviser | no | no | yes |

---

## Contributing

This project uses **GitHub Desktop** and follows a feature-branch workflow. No direct commits to `main`.

1. In GitHub Desktop click **Current Branch** → **New Branch** and name it `feature/your-feature-name` or `fix/your-fix-name`
2. Make your changes, then write a commit summary following Conventional Commits format e.g. `feat: add student dashboard`. Prefixes: `feat:`, `fix:`, `docs:`, `chore:`
3. Click **Commit to [branch]**, then click **Push origin** to upload your branch to GitHub
4. On GitHub, open a **Pull Request** from your branch into `main` and request review from at least one teammate before merging

---

## Out of Scope

The following feature is intentionally excluded from M.I.A in this version:

- Finance and tuition management (payments, scholarships, billing)

This may be considered for a future release.

---

*Built by the M.I.A team — Advanced Software Engineering*