import api from "./axios";

export const studentService = {
  getCourses: () => api.get("/student/courses"),

  getGrades: () => api.get("/student/grades"),

  getAttendance: () => api.get("/student/attendance"),

  getAssignments: () => api.get("/student/assignments"),

  submitAssignment: (assignmentId, data) =>
    api.post(`/student/assignments/${assignmentId}/submit`, data),

  getTranscript: () => api.get("/student/transcript"),
  getCourseMaterials: (courseId) => api.get(`/student/courses/${courseId}/materials`),
};

export const miaService = {
  chat: (message, sessionId) =>
    api.post("/mia/chat", { message, session_id: sessionId || null }),
  getSessions: () => api.get("/mia/sessions"),
  getSessionMessages: (sessionId) =>
    api.get(`/mia/sessions/${sessionId}/messages`),
  deleteSession: (sessionId) =>
    api.delete(`/mia/sessions/${sessionId}`),
};
