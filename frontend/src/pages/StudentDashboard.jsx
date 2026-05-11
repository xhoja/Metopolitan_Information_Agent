import { useState, useEffect } from "react";
import DashboardNav from "../components/DashboardNav";
import { studentService, miaService } from "../api/studentService";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "courses", label: "My Courses" },
  { id: "grades", label: "Grades & GPA" },
  { id: "attendance", label: "Attendance" },
  { id: "assignments", label: "Assignments" },
  { id: "transcript", label: "Transcript" },
  { id: "mia", label: "M.I.A Chat" },
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [grades, setGrades] = useState([]);
  const [gradesLoading, setGradesLoading] = useState(true);

  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);

  const [transcript, setTranscript] = useState(null);
  const [transcriptLoading, setTranscriptLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    studentService
      .getCourses()
      .then((res) => setCourses(res.data))
      .catch((err) => console.error("Courses error:", err))
      .finally(() => setCoursesLoading(false));
  }, []);

  useEffect(() => {
    studentService
      .getGrades()
      .then((res) => setGrades(res.data))
      .catch((err) => console.error("Grades error:", err))
      .finally(() => setGradesLoading(false));
  }, []);

  useEffect(() => {
    studentService
      .getAttendance()
      .then((res) => setAttendance(res.data))
      .catch((err) => console.error("Attendance error:", err))
      .finally(() => setAttendanceLoading(false));
  }, []);

  useEffect(() => {
    studentService
      .getAssignments()
      .then((res) => setAssignments(res.data))
      .catch((err) => console.error("Assignments error:", err))
      .finally(() => setAssignmentsLoading(false));
  }, []);

  useEffect(() => {
    studentService
      .getTranscript()
      .then((res) => setTranscript(res.data))
      .catch((err) => console.error("Transcript error:", err))
      .finally(() => setTranscriptLoading(false));
  }, []);

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    setChatLoading(true);
    miaService
      .chat(chatInput)
      .then((res) => {
        setMessages((prev) => [
          ...prev,
          { role: "user", content: chatInput },
          { role: "assistant", content: res.data.response },
        ]);
        setChatInput("");
      })
      .catch((err) => console.error("Chat error:", err))
      .finally(() => setChatLoading(false));
  };

  const submitAssignment = (assignmentId, data) => {
    studentService
      .submitAssignment(assignmentId, data)
      .then((res) => {
        console.log("Assignment submitted:", res);
        // Refresh assignments list
        setAssignmentsLoading(true);
        studentService
          .getAssignments()
          .then((res) => setAssignments(res.data))
          .finally(() => setAssignmentsLoading(false));
      })
      .catch((err) => console.error("Submission error:", err));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div>
            <div className="mb-10">
              <p className="text-amber-500 text-xs font-medium uppercase tracking-[0.2em] mb-1">
                Welcome back
              </p>
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                {localStorage.getItem("name") || "Student"}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Here's your academic snapshot.
              </p>
            </div>

            {coursesLoading ||
            gradesLoading ||
            attendanceLoading ||
            assignmentsLoading ? (
              <p className="text-slate-500 text-sm">Loading overview…</p>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <StatCard
                    label="Enrolled Courses"
                    value={courses.length}
                    color="text-amber-400"
                  />
                  <StatCard
                    label="Current GPA"
                    value={
                      grades.length > 0
                        ? (
                            grades.reduce((sum, g) => sum + g.value, 0) /
                            grades.length
                          ).toFixed(2)
                        : "N/A"
                    }
                    color="text-blue-300"
                  />
                  <StatCard
                    label="Assignments"
                    value={assignments.length}
                    color="text-emerald-400"
                  />
                  <StatCard
                    label="Attendance Rate"
                    value={
                      attendance.length > 0
                        ? Math.round(
                            (attendance.filter((a) => a.present).length /
                              attendance.length) *
                              100,
                          ) + "%"
                        : "N/A"
                    }
                    color="text-purple-400"
                  />
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden mb-6">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                    <h2 className="text-sm font-semibold text-white">
                      My Courses
                    </h2>
                    <button
                      onClick={() => setActiveTab("courses")}
                      className="text-amber-400 hover:text-amber-300 text-xs transition"
                    >
                      View all →
                    </button>
                  </div>
                  {courses.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-500 text-sm">
                      No courses enrolled yet.
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <tbody>
                        {courses.slice(0, 3).map((enrollment, i) => (
                          <tr
                            key={enrollment.id}
                            className={`hover:bg-slate-950/40 transition-colors ${i < courses.slice(0, 3).length - 1 ? "border-b border-slate-800/60" : ""}`}
                          >
                            <td className="px-6 py-3.5 font-medium text-white">
                              {enrollment.courses?.title}
                            </td>
                            <td
                              className="px-6 py-3.5 text-slate-400 text-xs"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              {enrollment.courses?.code}
                            </td>
                            <td className="px-6 py-3.5 text-slate-500 text-xs">
                              {enrollment.courses?.credits} credits
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                Enrolled
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                    <h2 className="text-sm font-semibold text-white">
                      Recent Assignments
                    </h2>
                    <button
                      onClick={() => setActiveTab("assignments")}
                      className="text-amber-400 hover:text-amber-300 text-xs transition"
                    >
                      View all →
                    </button>
                  </div>
                  {assignments.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-500 text-sm">
                      No assignments found.
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <tbody>
                        {assignments.slice(0, 3).map((assignment, i) => (
                          <tr
                            key={assignment.id}
                            className={`hover:bg-slate-950/40 transition-colors ${i < assignments.slice(0, 3).length - 1 ? "border-b border-slate-800/60" : ""}`}
                          >
                            <td className="px-6 py-3.5 font-medium text-white">
                              {assignment.title}
                            </td>
                            <td className="px-6 py-3.5 text-slate-400 text-xs">
                              Due:{" "}
                              {new Date(
                                assignment.due_date,
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                {new Date(assignment.due_date) > new Date()
                                  ? "Upcoming"
                                  : "Overdue"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        );

      case "courses":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Courses</h2>
            {coursesLoading ? (
              <div className="text-slate-400">Loading courses...</div>
            ) : courses.length === 0 ? (
              <div className="text-slate-400">No courses found</div>
            ) : (
              <div className="grid gap-4">
                {courses.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {enrollment.courses?.code} - {enrollment.courses?.title}
                    </h3>
                    <p className="text-slate-400">
                      Credits: {enrollment.courses?.credits}
                    </p>
                    <p className="text-slate-400">
                      Enrolled:{" "}
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "grades":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Grades & GPA</h2>
            {gradesLoading ? (
              <div className="text-slate-400">Loading grades...</div>
            ) : grades.length === 0 ? (
              <div className="text-slate-400">No grades found</div>
            ) : (
              <div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">GPA</h3>
                  <p className="text-3xl font-bold text-blue-400">
                    {(
                      grades.reduce((sum, g) => sum + g.value, 0) /
                      grades.length
                    ).toFixed(2)}
                  </p>
                </div>
                <div className="grid gap-4">
                  {grades.map((grade) => (
                    <div
                      key={grade.id}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-6"
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {grade.courses?.code} - {grade.courses?.title}
                      </h3>
                      <p className="text-xl font-bold text-green-400">
                        Grade: {grade.value}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "attendance":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Attendance</h2>
            {attendanceLoading ? (
              <div className="text-slate-400">Loading attendance...</div>
            ) : attendance.length === 0 ? (
              <div className="text-slate-400">No attendance records found</div>
            ) : (
              <div className="grid gap-4">
                {attendance.map((record) => (
                  <div
                    key={record.id}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {record.courses?.title}
                    </h3>
                    <p className="text-slate-400">
                      Date: {new Date(record.date).toLocaleDateString()}
                    </p>
                    <p
                      className={`font-semibold ${record.present ? "text-green-400" : "text-red-400"}`}
                    >
                      Status: {record.present ? "Present" : "Absent"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "assignments":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Assignments</h2>
            {assignmentsLoading ? (
              <div className="text-slate-400">Loading assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="text-slate-400">No assignments found</div>
            ) : (
              <div className="grid gap-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {assignment.title}
                    </h3>
                    <p className="text-slate-400 mb-4">
                      {assignment.description}
                    </p>
                    <p className="text-slate-400 mb-4">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const content = prompt("Enter assignment content:");
                          if (content) {
                            submitAssignment(assignment.id, { content });
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition text-sm"
                      >
                        Submit Text
                      </button>
                      <button
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = ".pdf,.doc,.docx,.txt,.zip";
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              submitAssignment(assignment.id, { file });
                            }
                          };
                          input.click();
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition text-sm"
                      >
                        Upload File
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "transcript":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Transcript</h2>
            {transcriptLoading ? (
              <div className="text-slate-400">Loading transcript...</div>
            ) : !transcript ? (
              <div className="text-slate-400">Transcript not found</div>
            ) : (
              <div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Student Information
                  </h3>
                  <p className="text-slate-400">
                    Name: {transcript.student?.users?.name}
                  </p>
                  <p className="text-slate-400">
                    Email: {transcript.student?.users?.email}
                  </p>
                  <p className="text-slate-400">
                    Major: {transcript.student?.major}
                  </p>
                  <p className="text-slate-400">
                    Credits Earned: {transcript.student?.credits_earned}
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Course History
                  </h3>
                  <div className="space-y-2">
                    {transcript.grades?.map((grade) => (
                      <div
                        key={grade.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-slate-300">
                          {grade.courses?.code} - {grade.courses?.title}
                        </span>
                        <span className="text-slate-400">
                          Grade: {grade.value}% | Credits:{" "}
                          {grade.credits?.credits}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "mia":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">M.I.A AI Adviser</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="h-96 overflow-y-auto mb-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-slate-400">
                    Start a conversation with M.I.A...
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-900/30 text-blue-300 ml-auto max-w-md"
                          : "bg-slate-800 text-slate-300 max-w-md"
                      }`}
                    >
                      <p className="text-sm font-semibold mb-1">
                        {msg.role === "user" ? "You" : "M.I.A"}
                      </p>
                      <p>{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask M.I.A anything about your academic journey..."
                  className="flex-1 bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-400"
                  disabled={chatLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white px-6 py-2 rounded-lg transition"
                >
                  {chatLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DashboardNav
        role="student"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className="p-8 max-w-6xl mx-auto">{renderTabContent()}</main>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <p className={`text-4xl font-semibold ${color} mb-1`}>{value}</p>
      <p className="text-slate-500 text-sm uppercase tracking-[0.1em]">
        {label}
      </p>
    </div>
  );
}
