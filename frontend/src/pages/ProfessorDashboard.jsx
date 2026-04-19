import DashboardNav from '../components/DashboardNav'

export default function ProfessorDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DashboardNav role="professor" />
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Professor Dashboard</h1>
        <p className="text-slate-400 mb-8">Manage your courses, grades, and students</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="My Courses" desc="Upload and manage course materials" />
          <Card title="Grades" desc="Record and update student grades" />
          <Card title="Attendance" desc="Track student attendance per course" />
          <Card title="Assignments" desc="Create and manage assignments and projects" />
          <Card title="Class Roster" desc="Enroll students and manage rosters" />
        </div>
      </main>
    </div>
  )
}

function Card({ title, desc }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500 transition cursor-pointer">
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <p className="text-slate-400 text-sm">{desc}</p>
    </div>
  )
}
