import { useState, useEffect } from "react";
import DashboardNav from "../components/DashboardNav";
import { studentService, miaService } from "../api/studentService";

const tabs = [
  { id: "courses", label: "My Courses" },
  { id: "grades", label: "Grades & GPA" },
  { id: "attendance", label: "Attendance" },
  { id: "assignments", label: "Assignments" },
  { id: "transcript", label: "Transcript" },
  { id: "mia", label: "M.I.A Chat" },
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("courses");

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
                      grades.reduce((sum, g) => sum + g.grade, 0) /
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
                        Grade: {grade.grade}%
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
                    <button
                      onClick={() => {
                        const content = prompt("Enter assignment content:");
                        if (content) {
                          submitAssignment(assignment.id, { content });
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                    >
                      Submit Assignment
                    </button>
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
                          Grade: {grade.grade}% | Credits:{" "}
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
