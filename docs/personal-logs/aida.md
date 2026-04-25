# Personal Log — Aida

**Role:** Backend Development — FastAPI endpoints, database models, business logic, validation layer
          Tester — supporting backend validation and ensuring correct API behavior  


## Week 4 — 2026-04-22

This week I worked on backend API functionality, with a strong focus on making sure endpoints behave correctly and handle different scenarios properly. I implemented several endpoints in student.py, including retrieving course materials with enrollment checks, GPA calculation using weighted logic, and endpoints for assignments and submissions with related course data.
I also worked on the assignment submission endpoint, which now supports file uploads using multipart/form-data and stores files in Supabase Storage. While working on this, I identified an issue with the missing "submissions" storage bucket and resolved it by configuring the correct setup.
On the admin side, I implemented an enrollment endpoint that includes validation to prevent duplicate enrollments and ensures appropriate error responses are returned.
Overall, I paid close attention to validating inputs, handling edge cases, and making sure each endpoint returns the correct responses under different conditions.

**Tech explored:** FastAPI request validation, error handling, file upload handling, Supabase Storage integration

## Week 3 — 2026-04-15

This week I focused on setting up the core structure for backend endpoints and understanding how the student and admin modules should be organized. I worked on initial route definitions in FastAPI and explored how to structure responses for courses, assignments, and user-related data.
I also started testing basic API calls using tools like Postman to verify that endpoints were returning the correct data. During this process, I identified areas where validation would be needed, especially for role-based access and enrollment checks.

**Tech explored:** FastAPI routing, API testing with Postman, basic response structuring

## Week 2 — 2026-04-08

This week I worked on understanding the project architecture and backend structure. I reviewed how different modules like student.py, admin.py, and authentication are organized, and how they connect to the database through Supabase.
I also explored how data models such as students, courses, and enrollments relate to each other, which helped in planning how endpoints should be designed later.
Additionally, I familiarized myself with FastAPI basics and how requests, responses, and validation work.

**Tech explored:** FastAPI fundamentals, project structure, database relationships (Supabase/PostgreSQL)

## Week 1 — 2026-04-01

This week we formed the team and defined the overall scope of the project. We discussed the main features of the system and how different user roles (admin, professor, student) would interact with it.
I focused on setting up the backend environment and understanding how the system would be structured. This included exploring how API endpoints will be organized, how requests and responses are handled, and how the backend will connect to the database.
Most of the work this week was focused on planning and building a clear foundation for backend development in the following weeks.

**Tech explored:** FastAPI basics, API structure, backend planning

## Research Log 4

### API Validation and Backend Testing

**Date:** 22.04.2026

**What I built:** Backend endpoints for student and admin features, focusing on validation and correct API responses.

**What worked:** Endpoints correctly enforce rules such as enrollment checks and duplicate prevention. File uploads work after proper storage configuration.

**What didn't:** Initial issues with file upload handling and missing Supabase bucket required debugging and adjustment.

**Key finding:** Even during development, continuously checking API behavior and edge cases helps prevent larger issues later and ensures system reliability.

**Code:** feature/backend-endpoints — backend/ folder - student.py & admin.py flies
