import { useState } from 'react'

export default function ProfessorsTab({ users, onRemove, onEdit }) {
  const [search, setSearch] = useState('')
  const professors = users.filter(u => u.role === 'professor')
  const filtered = professors.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-blue-300 text-xs font-medium uppercase tracking-[0.2em] mb-1">Faculty</p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Professors</h1>
          <p className="text-slate-500 text-sm mt-1">{professors.length} professor{professors.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="input-base w-full md:w-80"
        />
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-24 text-slate-500 text-sm">
            {search ? 'No professors match your search.' : 'No professors yet.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Name', 'Email', 'Joined', ''].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-slate-500 font-medium text-xs uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={`hover:bg-slate-950/40 transition-colors ${i < filtered.length - 1 ? 'border-b border-slate-800/60' : ''}`}>
                  <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>{p.email}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(p)}
                          className="text-slate-500 hover:text-blue-300 transition-colors p-1.5 rounded hover:bg-slate-700"
                          title="Edit professor"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 013.182 3.182L6.75 19.963l-4.5 1.5 1.5-4.5L16.862 3.487z" />
                          </svg>
                        </button>
                      )}
                      {onRemove && (
                        <button
                          onClick={() => onRemove(p)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1.5 rounded hover:bg-slate-700"
                          title="Remove professor"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
