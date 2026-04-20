import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function CoursesTab() {
  const [courses, setCourses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    api.get('/admin/courses')
      .then(r => setCourses(r.data))
      .catch(() => setError('Endpoint not available yet.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase()) ||
    c.department?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-8">
        <p className="text-blue-500 text-xs font-medium uppercase tracking-[0.2em] mb-1">Curriculum</p>
        <h1 className="text-3xl font-semibold text-white tracking-tight">Courses</h1>
        {!loading && !error && (
          <p className="text-slate-500 text-sm mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} total</p>
        )}
      </div>

      <div className="mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, code, or department…"
          className="input-base w-full md:w-80"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-500 text-sm">Loading…</div>
        ) : error ? (
          <PendingEndpoint endpoint="GET /admin/courses" />
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-24 text-slate-500 text-sm">
            {search ? 'No courses match your search.' : 'No courses yet.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Code', 'Title', 'Department', 'Professor', 'Credits', 'Students'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-slate-500 font-medium text-xs uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className={`hover:bg-slate-800/40 transition-colors ${i < filtered.length - 1 ? 'border-b border-slate-800/60' : ''}`}>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">{c.code}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{c.title}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{c.department || '—'}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{c.professor_name || '—'}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{c.credits}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{c.enrollment_count ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function PendingEndpoint({ endpoint }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-slate-400 text-sm font-medium">Awaiting backend endpoint</p>
      <code className="text-xs text-slate-500 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded font-mono">{endpoint}</code>
    </div>
  )
}
