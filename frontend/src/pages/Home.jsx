import { Link } from 'react-router-dom'
import heroImg from '../assets/hero.jpg'
import logoImg from '../assets/logo.jpg'

const stats = [
  { value: '60+', label: 'Erasmus+ Partners' },
  { value: '15+', label: 'Countries' },
  { value: '3', label: 'Faculties' },
  { value: '5 yrs', label: 'Excellent Accreditation' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-8 py-4 flex items-center gap-3">
        <img src={logoImg} alt="UMT Logo" className="h-10 w-10 object-contain rounded" />
        <span className="text-lg font-semibold text-white tracking-wide">M.I.A</span>
        <span className="text-slate-500 text-sm ml-1">— Metropolitan Information Agent</span>
        <div className="ml-auto">
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero image */}
      <div className="relative w-full h-64 overflow-hidden">
        <img src={heroImg} alt="University Metropolitan Tirana" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950" />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center px-4 py-16 max-w-4xl mx-auto w-full">
        {/* Title */}
        <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">
          University Metropolitan Tirana
        </p>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight text-white text-center">
          M.I.A
        </h1>
        <p className="text-slate-300 text-lg mb-2 font-medium">Metropolitan Information Agent</p>
        <p className="text-slate-500 italic mb-10">"Take your step!"</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
          {stats.map((s) => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-blue-400">{s.value}</p>
              <p className="text-slate-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* About blurb */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-10 max-w-2xl text-center">
          <p className="text-slate-300 text-sm leading-relaxed">
            UMT is an Albanian higher education institution focused on engineering, architecture, economics, and technology.
            First university in Albania to offer a PhD in Artificial Intelligence.
            Rated <span className="text-blue-400 font-medium">Excellent</span> by the British Accreditation Agency for 5 consecutive years.
          </p>
        </div>

        <Link
          to="/login"
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3 rounded-xl text-lg font-semibold shadow-lg shadow-blue-900/40 transition"
        >
          Access Your Portal
        </Link>
      </div>
    </div>
  )
}
