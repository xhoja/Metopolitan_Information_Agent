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

  const [courseActiveSubTabs, setCourseActiveSubTabs] = useState({});

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
                        ? (() => {
                            // Group by course and calculate using the new logic
                            const courseGroups = attendance.reduce(
                              (acc, record) => {
                                const courseId = record.course_id;
                                if (!acc[courseId]) acc[courseId] = [];
                                acc[courseId].push(record);
                                return acc;
                              },
                              {},
                            );

                            let totalHoursPresent = 0;
                            let totalHoursScheduled = 0;

                            Object.values(courseGroups).forEach((records) => {
                              const hoursPresent = records.reduce(
                                (sum, r) => sum + r.hours_present,
                                0,
                              );
                              const weeksRecorded = new Set(
                                records.map((r) => r.week_number),
                              ).size;
                              const hoursScheduled = weeksRecorded * 4;

                              totalHoursPresent += hoursPresent;
                              totalHoursScheduled += hoursScheduled;
                            });

                            const rate =
                              totalHoursScheduled > 0
                                ? (totalHoursPresent / totalHoursScheduled) *
                                  100
                                : 100;

                            return Math.round(rate) + "%";
                          })()
                        : "N/A"
                    }
                    color="text-purple-400"
                  />
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden mb-6">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                    <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                      My Courses
                    </h2>
                    <button
                      onClick={() => setActiveTab("courses")}
                      className="text-amber-400 hover:text-amber-300 text-xs font-medium transition"
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
                            <td className="px-6 py-4 font-medium text-white">
                              {enrollment.courses?.title}
                            </td>
                            <td
                              className="px-6 py-4 text-slate-400 text-xs font-medium"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              {enrollment.courses?.code}
                            </td>
                            <td className="px-6 py-4 text-slate-400 text-xs">
                              {enrollment.courses?.department || "—"}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                {enrollment.courses?.credits} cr
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
            <div className="mb-8">
              <p className="text-amber-500 text-xs font-medium uppercase tracking-[0.2em] mb-1">
                Academic
              </p>
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                My Courses
              </h1>
            </div>
            {coursesLoading ? (
              <div className="flex items-center justify-center py-24 text-slate-500 text-sm">
                Loading courses…
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 bg-slate-800 border border-slate-700 rounded-xl">
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.25v6m0 0l4.5-4.5M12 12.25l-4.5-4.5"
                    />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm font-medium">
                  No courses enrolled yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="bg-slate-800 border border-slate-700 hover:border-amber-500/40 rounded-xl p-6 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        {enrollment.courses?.code || "Unknown Code"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {enrollment.courses?.credits || 0} credits
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-1">
                      {enrollment.courses?.title || "Unknown Course"}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Enrolled{" "}
                      {enrollment.enrolled_at
                        ? new Date(enrollment.enrolled_at).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short", year: "numeric" },
                          )
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "grades":
        return (
          <div>
            <div className="mb-8">
              <p className="text-amber-500 text-xs font-medium uppercase tracking-[0.2em] mb-1">
                Academic
              </p>
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                Grades & GPA
              </h1>
            </div>

            {gradesLoading ? (
              <div className="flex items-center justify-center py-24 text-slate-500 text-sm">
                Loading grades…
              </div>
            ) : grades.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 bg-slate-800 border border-slate-700 rounded-xl">
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm font-medium">
                  No grades recorded yet
                </p>
              </div>
            ) : (
              <>
                {/* GPA Overview */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Overall GPA
                      </h3>
                      <p className="text-4xl font-bold text-amber-400">
                        {(
                          grades.reduce((sum, g) => sum + g.value, 0) /
                          grades.length
                        ).toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Based on {grades.length} grade
                        {grades.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400 mb-2">
                        Grade Distribution
                      </div>
                      <div className="space-y-1">
                        {["A", "B", "C", "D", "F"].map((letter, i) => {
                          const threshold = 90 - i * 20;
                          const count = grades.filter(
                            (g) =>
                              g.value >= threshold - 10 &&
                              g.value < threshold + 10,
                          ).length;
                          const percentage = (count / grades.length) * 100;
                          return (
                            <div
                              key={letter}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span className="text-slate-400 w-4">
                                {letter}:
                              </span>
                              <div className="w-16 bg-slate-700 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    letter === "A"
                                      ? "bg-emerald-500"
                                      : letter === "B"
                                        ? "bg-blue-500"
                                        : letter === "C"
                                          ? "bg-amber-500"
                                          : letter === "D"
                                            ? "bg-orange-500"
                                            : "bg-red-500"
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-slate-500 w-8 text-right">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Grades Table */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800">
                    <h2 className="text-sm font-semibold text-white">
                      Grade Details
                    </h2>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {["Course", "Type", "Grade", "Weight", "Semester"].map(
                          (h) => (
                            <th
                              key={h}
                              className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-widest"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade, i) => (
                        <tr
                          key={grade.id || i}
                          className={`hover:bg-slate-950/40 transition-colors ${i < grades.length - 1 ? "border-b border-slate-800/60" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <p className="text-white text-sm font-medium">
                              {grade.courses?.title || "—"}
                            </p>
                            <p
                              className="text-slate-500 text-xs"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              {grade.courses?.code || "—"}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium px-2 py-0.5 rounded capitalize bg-blue-300/15 text-blue-300 border border-blue-400/30">
                              {grade.grade_type || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm font-semibold ${
                                grade.value >= 90
                                  ? "text-emerald-400"
                                  : grade.value >= 70
                                    ? "text-amber-400"
                                    : "text-rose-400"
                              }`}
                            >
                              {grade.value}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs">
                            {grade.weight || "—"}%
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs">
                            {grade.semester || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        );

      case "attendance":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Course Info</h2>
            {attendanceLoading ? (
              <div className="text-slate-400">Loading attendance...</div>
            ) : attendance.length === 0 ? (
              <div className="text-slate-400">No attendance records found</div>
            ) : (
              <div className="space-y-8">
                {(() => {
                  // Group attendance records by course
                  const courseGroups = attendance.reduce((acc, record) => {
                    const courseId = record.course_id;
                    if (!acc[courseId]) {
                      acc[courseId] = {
                        courseTitle:
                          record.courses?.title || "Unknown Course Title",
                        courseCode:
                          record.courses?.code || "Unknown Course Code",
                        records: [],
                      };
                    }
                    acc[courseId].records.push(record);
                    return acc;
                  }, {});

                  return Object.values(courseGroups).map((course, index) => {
                    const records = course.records;

                    // Calculate attendance metrics
                    const hoursPresent = records.reduce(
                      (sum, r) => sum + r.hours_present,
                      0,
                    );
                    const weeksRecorded = new Set(
                      records.map((r) => r.week_number),
                    ).size;
                    const hoursScheduled = weeksRecorded * 4;
                    const rate =
                      hoursScheduled > 0
                        ? (hoursPresent / hoursScheduled) * 100
                        : 100;

                    // Determine if course is finalized (14 weeks completed)
                    const isFinalized = weeksRecorded >= 14;

                    // Sort records by week number (descending to show latest first)
                    const sortedRecords = [...records].sort(
                      (a, b) => b.week_number - a.week_number,
                    );

                    return (
                      <div
                        key={index}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-6"
                      >
                        {/* Course Header */}
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                              {course.courseCode}
                            </h3>
                            <p className="text-lg text-slate-300 mb-2">
                              {course.courseTitle}
                            </p>
                            <div className="flex gap-4 text-sm text-slate-400">
                              <span>Attendance Th: {rate.toFixed(0)}%</span>
                              <span>L: {rate.toFixed(0)}%</span>
                            </div>
                          </div>
                          <CircularProgressBar
                            percentage={rate}
                            isFinalized={isFinalized}
                          />
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-slate-700 mb-6">
                          <div className="flex gap-8">
                            <button
                              onClick={() =>
                                setCourseActiveSubTabs((prev) => ({
                                  ...prev,
                                  [course.courseId || index]: "attendance",
                                }))
                              }
                              className={`pb-2 text-sm font-medium transition ${
                                courseActiveSubTabs[
                                  course.courseId || index
                                ] !== "interim"
                                  ? "text-white border-b-2 border-blue-500"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              Attendance
                            </button>
                            <button
                              onClick={() =>
                                setCourseActiveSubTabs((prev) => ({
                                  ...prev,
                                  [course.courseId || index]: "interim",
                                }))
                              }
                              className={`pb-2 text-sm font-medium transition ${
                                courseActiveSubTabs[
                                  course.courseId || index
                                ] === "interim"
                                  ? "text-white border-b-2 border-blue-500"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              Interim Grades
                            </button>
                          </div>
                        </div>

                        {/* Content based on active sub-tab */}
                        {courseActiveSubTabs[course.courseId || index] ===
                        "interim" ? (
                          /* Interim Grades View */
                          <div className="space-y-4">
                            {grades.length > 0 ? (
                              grades
                                .filter(
                                  (grade) =>
                                    grade.courses?.code === course.courseCode,
                                )
                                .map((grade) => (
                                  <div
                                    key={grade.id}
                                    className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="text-white font-medium">
                                          {grade.courses?.title}
                                        </p>
                                        <p className="text-sm text-slate-400">
                                          Grade: {grade.value}%
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-2xl font-bold text-green-400">
                                          {grade.value}%
                                        </p>
                                        <p className="text-xs text-slate-400">
                                          Current Grade
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                            ) : (
                              <div className="text-center py-8 text-slate-400">
                                No interim grades available for this course yet.
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Attendance Records List */
                          <div className="space-y-3">
                            {sortedRecords.map((record) => (
                              <div
                                key={record.id}
                                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                              >
                                <div className="flex items-center gap-4">
                                  {/* Week Number Circle */}
                                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {record.week_number}
                                  </div>

                                  {/* Session Info */}
                                  <div>
                                    <p className="text-white font-medium">
                                      {record.status === "present"
                                        ? "Present"
                                        : "Absent"}{" "}
                                      - Week {record.week_number}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-sm text-slate-400">
                                        {record.hours_present}/2h attended
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-1 rounded-full ${
                                          record.session_start?.includes(
                                            "Theory",
                                          ) ||
                                          record.session_start?.includes("T")
                                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                            : "bg-green-500/20 text-green-300 border border-green-500/30"
                                        }`}
                                      >
                                        {record.session_start?.includes(
                                          "Theory",
                                        ) || record.session_start?.includes("T")
                                          ? "theory"
                                          : "lab"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Date */}
                                <div className="text-sm text-slate-400">
                                  {new Date(record.date).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Grade Info - only show if course is finalized */}
                        {isFinalized && (
                          <div className="mt-6 pt-6 border-t border-slate-700">
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-slate-400">
                                  Final Grade:
                                </span>
                                <span className="ml-2 text-white font-medium">
                                  N/A
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400">Points:</span>
                                <span className="ml-2 text-white">N/A</span>
                              </div>
                              <div>
                                <span className="text-slate-400">
                                  Class Average:
                                </span>
                                <span className="ml-2 text-white">N/A</span>
                              </div>
                              <div>
                                <span className="text-slate-400">
                                  Max Can Get:
                                </span>
                                <span className="ml-2 text-white">N/A</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
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

function CircularProgressBar({
  percentage,
  size = 120,
  strokeWidth = 8,
  isFinalized = false,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#10b981"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-white">
          {percentage.toFixed(1)}%
        </p>
        {isFinalized && <p className="text-xs text-slate-400">finalized</p>}
      </div>
    </div>
  );
}
