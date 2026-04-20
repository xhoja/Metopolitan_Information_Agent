import { useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo.jpg'

export default function DashboardNav({ role, tabs = [], activeTab, onTabChange }) {
  const navigate = useNavigate()
  const name = localStorage.getItem('name') || ''
  const roleLabel = { admin: 'Admin', professor: 'Professor', student: 'Student' }[role] || role

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6">
      <div className="flex justify-between items-center py-3">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="UMT Logo" className="h-9 w-9 object-contain rounded" />
          <span className="text-white font-semibold">M.I.A</span>
          <span className="text-slate-500 text-sm">— {roleLabel}</span>
        </div>
        <div className="flex items-center gap-4">
          {name && <span className="text-slate-300 text-sm">{name}</span>}
          <button onClick={logout} className="text-slate-400 hover:text-white text-sm transition">
            Logout
          </button>
        </div>
      </div>

      {tabs.length > 0 && (
        <div className="flex gap-1 -mb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
