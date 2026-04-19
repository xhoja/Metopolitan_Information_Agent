import DashboardNav from '../components/DashboardNav'

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DashboardNav role="student" />
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
        <p className="text-slate-400 mb-8">Your academic overview and AI adviser</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="My Courses" desc="View current enrolled courses" />
          <Card title="Grades & GPA" desc="Check grades and real-time GPA" />
          <Card title="Attendance" desc="View attendance records per course" />
          <Card title="Transcript" desc="Access and download academic transcript" />
          <Card title="Assignments" desc="View and submit assignments and projects" />
          <Card title="M.I.A AI Adviser" desc="Ask M.I.A anything about your academic journey" highlight />
        </div>
      </main>
    </div>
  )
}

function Card({ title, desc, highlight }) {
  return (
    <div className={`bg-slate-900 border rounded-xl p-6 transition cursor-pointer ${
      highlight
        ? 'border-blue-500 hover:border-blue-400 bg-blue-950/30'
        : 'border-slate-800 hover:border-blue-500'
    }`}>
      <h3 className={`text-lg font-semibold mb-2 ${highlight ? 'text-blue-400' : 'text-white'}`}>{title}</h3>
      <p className="text-slate-400 text-sm">{desc}</p>
    </div>
  )
}
