import api from "./axios";

export const studentService = {
  getCourses: () => api.get("/student/courses"),

  getGrades: () => api.get("/student/grades"),

  getAttendance: () => api.get("/student/attendance"),

  getAssignments: () => api.get("/student/assignments"),

  submitAssignment: (assignmentId, data) =>
    api.post(`/student/assignments/${assignmentId}/submit`, data),

  getTranscript: () => api.get("/student/transcript"),
};

export const miaService = {
  chat: (message) => api.post("/mia/chat", { message }),
};
