import { Link } from 'react-router-dom'
import campusImg from '../assets/campus.jpg'
import logoImg from '../assets/logo.jpg'

const stats = [
  { value: '60+', label: 'Erasmus+ Partners' },
  { value: '15+', label: 'Countries' },
  { value: '3', label: 'Faculties' },
  { value: '5 yrs', label: 'Excellent Accreditation' },
]

const faculties = [
  {
    name: 'Faculty of Engineering & Architecture',
    programs: ['Computer Engineering', 'Civil Engineering', 'Architecture', 'Electrical Engineering'],
  },
  {
    name: 'Faculty of Economics & Business',
    programs: ['Business Administration', 'Finance & Accounting', 'Marketing', 'Management'],
  },
  {
    name: 'Faculty of Technology & Design',
    programs: ['Artificial Intelligence', 'Information Technology', 'Graphic Design', 'Urban Planning'],
  },
]

const features = [
  { title: 'AI-Powered Advising', desc: 'M.I.A answers your academic questions 24/7 using advanced AI.' },
  { title: 'Course Management', desc: 'Professors manage courses, materials, grades and attendance in one place.' },
  { title: 'Student Portal', desc: 'Track your GPA, attendance, transcript and assignments in real time.' },
  { title: 'Admin Dashboard', desc: 'Full institutional control over users, enrollments and analytics.' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-700 px-8 py-4 flex items-center gap-3">
        <img src={logoImg} alt="UMT Logo" className="h-9 w-9 object-contain rounded" />
        <span className="text-lg font-semibold text-white tracking-wide">M.I.A</span>
        <span className="text-slate-400 text-sm ml-1 hidden sm:inline">— Metropolitan Information Agent</span>
        <div className="ml-auto">
          <Link
            to="/login"
            className="bg-blue-400 hover:bg-blue-300 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-900/30"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative w-full h-[500px] overflow-hidden">
        <img src={campusImg} alt="University Metropolitan Tirana" className="w-full h-full object-cover object-center scale-105" style={{ filter: 'blur(1px)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/70 to-slate-950" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-[0.3em] mb-4">
            University Metropolitan Tirana
          </p>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg mb-3">
            M.I.A
          </h1>
          <p className="text-slate-200 text-xl font-medium mb-2">Metropolitan Information Agent</p>
          <p className="text-slate-400 italic mb-8">"Take your step!"</p>
          <Link
            to="/login"
            className="bg-blue-400 hover:bg-blue-300 text-white px-10 py-3 rounded-xl text-base font-semibold shadow-xl shadow-blue-900/40 transition"
          >
            Access Your Portal
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto w-full px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center shadow-xl">
              <p className="text-2xl font-bold text-blue-300">{s.value}</p>
              <p className="text-slate-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <section className="max-w-4xl mx-auto w-full px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-[0.2em] mb-2">About</p>
          <h2 className="text-3xl font-bold text-white mb-4">Albania's Leading Tech University</h2>
          <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto">
            University Metropolitan Tirana is Albania's premier higher education institution focused on engineering,
            architecture, economics, and technology. The first university in Albania to offer a PhD in Artificial
            Intelligence, rated <span className="text-blue-300 font-medium">Excellent</span> by the British
            Accreditation Agency for 5 consecutive years.
          </p>
        </div>

        {/* Faculties */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {faculties.map((f) => (
            <div key={f.name} className="bg-slate-800 border border-slate-700 hover:border-blue-400 rounded-xl p-6 transition-all group">
              <h3 className="text-white font-semibold mb-3 text-sm leading-snug group-hover:text-blue-300 transition-colors">{f.name}</h3>
              <ul className="space-y-1">
                {f.programs.map(p => (
                  <li key={p} className="text-slate-400 text-xs flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-300 inline-block flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Platform features */}
        <div className="text-center mb-10">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Platform</p>
          <h2 className="text-3xl font-bold text-white mb-2">Everything in One Place</h2>
          <p className="text-slate-400 text-sm">M.I.A connects students, professors and administration seamlessly.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {features.map((f) => (
            <div key={f.title} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-500 transition">
              <h3 className="text-white font-semibold mb-1">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 px-8 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} University Metropolitan Tirana · M.I.A Platform
      </footer>
    </div>
  )
}
