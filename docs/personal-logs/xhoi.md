# Personal Log — Xhoi

**Role:** Frontend Development — React architecture, admin and professor dashboards, routing

---

## Week 4 — 2026-04-22

This week I completed the UI polish pass across all dashboards — switched to lighter blues throughout the colour scheme, redesigned the hero section on the landing page, and added password reveal toggles to the login form. I also resolved a CORS configuration issue between the frontend and backend that was blocking API calls in the development environment. Currently working on tightening up the admin and professor dashboard layouts to match the latest wireframe specs.

**Tech explored:** React component composition, Tailwind colour palette customisation, Vite proxy config for CORS bypass in dev.

---

## Week 3 — 2026-04-15

This week I completed and presented the full React + Vite frontend scaffold to the team — client-side routing for all three roles (admin, professor, student) and authentication flow integrated with Supabase. From there I shifted focus to building out the admin and professor dashboard layouts. The team meeting on April 14 highlighted some compatibility issues between the frontend and backend, so the decision was made to stabilise what exists before adding new features. I spent the latter part of the week addressing those inconsistencies and aligning component structure with the backend API contracts Aida and Parashqevi had defined.

**Tech explored:** React Router for role-based routing, Supabase JS client authentication, component-driven dashboard layout patterns.

---

## Week 2 — 2026-04-08

This week was focused on research and setup. I investigated React + Vite as the frontend framework and presented the findings to the team in the April 8 WhatsApp meeting — the team agreed on it as the official stack. I also explored Tailwind CSS component patterns suitable for the three dashboards (admin, professor, student) and began planning the page structure and routing logic. The team agreed to work individually on our assigned areas and reconvene once initial implementation was underway.

**Tech explored:** React + Vite project setup, Tailwind CSS utility patterns, React Router structure planning.

---

## Week 1 — 2026-04-01

This week the team met in person at a coffee shop near Skanderbeg Square on April 6 for the first official project meeting. Three project ideas were evaluated and the team selected M.I.A (Metropolitan Information Agent) — a full-stack university management system with an integrated AI advisor for students. The tech stack was agreed upon: React + Tailwind CSS for the frontend, Python + FastAPI for the backend, PostgreSQL hosted on Supabase, and GitHub with GitHub Desktop for version control. Xhoi and Ajna were assigned frontend development; Aida and Parashqevi backend; Loric the AI agent. My tasks for the week were to set up the React + Tailwind project, scaffold the five main pages (Home, Login, Admin Dashboard, Professor Dashboard, Student Dashboard), configure routing, and initialise the GitHub repository with agreed branching conventions.

**Tech explored:** React + Vite scaffolding, Tailwind CSS initial setup, GitHub branching strategy (feature/name convention).

---

## Research Log

### React + Vite — Hello World

**Date:** 2026-04-19

**What I built:** React + Vite frontend scaffold with admin and professor dashboards, client-side routing, and authentication flow integrated with Supabase.

**What worked:** Vite dev server setup was fast and straightforward. React Router handled multi-role routing (admin, professor, student) cleanly. Tailwind CSS integrated without issues.

**What didn't:** CORS between the Vite dev server and FastAPI backend required proxy configuration — direct API calls failed until Vite's proxy config was set up correctly.

**Key finding:** Vite's proxy config (`server.proxy` in `vite.config.js`) is the cleanest way to bypass CORS in development without touching the backend. React component composition with role-based routing scales well from the start.

**Code:** `feature/frontend-scaffold` branch — `src/` folder
