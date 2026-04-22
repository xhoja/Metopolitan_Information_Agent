# Personal Log — Xhoi

**Role:** Frontend Development — React architecture, admin and professor dashboards, routing

---

## Week 4 — 2026-04-22

This week I completed the UI polish pass across all dashboards — switched to lighter blues throughout the colour scheme, redesigned the hero section on the landing page, and added password reveal toggles to the login form. I also resolved a CORS configuration issue between the frontend and backend that was blocking API calls in the development environment. Currently working on tightening up the admin and professor dashboard layouts to match the latest wireframe specs.

**Tech explored:** React component composition, Tailwind colour palette customisation, Vite proxy config for CORS bypass in dev.

---

## Week 3 — 2026-04-15



---

## Week 2 — 2026-04-08



---

## Week 1 — 2026-04-01



---

## Research Log

### React + Vite — Hello World

**Date:** 2026-04-19

**What I built:** React + Vite frontend scaffold with admin and professor dashboards, client-side routing, and authentication flow integrated with Supabase.

**What worked:** Vite dev server setup was fast and straightforward. React Router handled multi-role routing (admin, professor, student) cleanly. Tailwind CSS integrated without issues.

**What didn't:** CORS between the Vite dev server and FastAPI backend required proxy configuration — direct API calls failed until Vite's proxy config was set up correctly.

**Key finding:** Vite's proxy config (`server.proxy` in `vite.config.js`) is the cleanest way to bypass CORS in development without touching the backend. React component composition with role-based routing scales well from the start.

**Code:** `feature/frontend-scaffold` branch — `src/` folder
