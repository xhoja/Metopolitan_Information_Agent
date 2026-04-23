import { useState, useEffect } from 'react'
import DashboardNav from '../components/DashboardNav'
import api from '../api/axios'

const TABS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'courses',      label: 'My Courses' },
  { id: 'roster',       label: 'Student Registry' },
  { id: 'materials',    label: 'Course Materials' },
  { id: 'assignments',  label: 'Assignments' },
  { id: 'grades',       label: 'Grades' },
  { id: 'attendance',   label: 'Attendance' },
]

const EMPTY_COURSE = { code: '', title: '', credits: 3, department: '', description: '' }
const EMPTY_ASSIGNMENT = { title: '', description: '', due_date: '', course_id: '', type: 'homework' }
const EMPTY_GRADE = { student_id: '', course_id: '', value: '', semester: '', grade_type: '', weight: '' }
const TODAY = new Date().toISOString().split('T')[0]

export default function ProfessorDashboard() {
  const [tab, setTab]                   = useState('overview')
  const [courses, setCourses]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  // courses tab
  const [courseModal, setCourseModal]   = useState(false)
  const [courseForm, setCourseForm]     = useState(EMPTY_COURSE)
  const [courseSaving, setCourseSaving] = useState(false)
  const [courseError, setCourseError]   = useState('')

  // roster tab
  const [rosterCourse, setRosterCourse]   = useState('')
  const [roster, setRoster]               = useState([])
  const [rosterLoading, setRosterLoading] = useState(false)
  const [rosterError, setRosterError]     = useState('')

  // materials tab
  const [matCourse, setMatCourse]       = useState('')
  const [materials, setMaterials]       = useState([])
  const [matLoading, setMatLoading]     = useState(false)
  const [matError, setMatError]         = useState('')
  const [matFile, setMatFile]           = useState(null)
  const [matTitle, setMatTitle]         = useState('')
  const [matUploading, setMatUploading] = useState(false)
  const [matUploadErr, setMatUploadErr] = useState('')
  const [matUploadOk, setMatUploadOk]   = useState('')

  // assignments tab
  const [selectedCourse, setSelectedCourse]       = useState('')
  const [assignments, setAssignments]             = useState([])
  const [assignLoading, setAssignLoading]         = useState(false)
  const [assignModal, setAssignModal]             = useState(false)
  const [assignForm, setAssignForm]               = useState(EMPTY_ASSIGNMENT)
  const [assignSaving, setAssignSaving]           = useState(false)
  const [assignError, setAssignError]             = useState('')

  // grades tab
  const [gradeForm, setGradeForm]         = useState(EMPTY_GRADE)
  const [gradeSaving, setGradeSaving]     = useState(false)
  const [gradeError, setGradeError]       = useState('')
  const [gradeSuccess, setGradeSuccess]   = useState('')
  const [gradeStudents, setGradeStudents] = useState([])
  const [gradeViewCourse, setGradeViewCourse] = useState('')
  const [grades, setGrades]               = useState([])
  const [gradesLoading, setGradesLoading] = useState(false)

  // attendance tab
  const [attendCourse, setAttendCourse]           = useState('')
  const [attendStudents, setAttendStudents]       = useState([])
  const [attendSheet, setAttendSheet]             = useState({})  // student_id → hours_present (float)
  const [attendDate, setAttendDate]               = useState(TODAY)
  const [attendSessionStart, setAttendSessionStart] = useState('08:00')
  const [attendSessionEnd, setAttendSessionEnd]   = useState('12:00')
  const [attendRecords, setAttendRecords]         = useState([])
  const [attendLoading, setAttendLoading]         = useState(false)
  const [attendSaving, setAttendSaving]           = useState(false)
  const [attendError, setAttendError]             = useState('')
  const [attendSuccess, setAttendSuccess]         = useState('')

  const fetchCourses = async () => {
    try {
      const res = await api.get('/professor/courses')
      setCourses(res.data)
    } catch {
      setError('Failed to load courses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [])

  // --- Roster ---
  useEffect(() => {
    if (!rosterCourse) { setRoster([]); return }
    setRosterLoading(true)
    setRosterError('')
    api.get(`/professor/courses/${rosterCourse}/students`)
      .then(r => setRoster(r.data))
      .catch(() => { setRosterError('pending'); setRoster([]) })
      .finally(() => setRosterLoading(false))
  }, [rosterCourse])

  // --- Materials ---
  useEffect(() => {
    if (!matCourse) { setMaterials([]); return }
    setMatLoading(true)
    setMatError('')
    api.get(`/professor/courses/${matCourse}/materials`)
      .then(r => setMaterials(r.data))
      .catch(() => { setMatError('pending'); setMaterials([]) })
      .finally(() => setMatLoading(false))
  }, [matCourse])

  const handleUploadMaterial = async (e) => {
    e.preventDefault()
    if (!matFile) return
    setMatUploading(true)
    setMatUploadErr('')
    setMatUploadOk('')
    try {
      const formData = new FormData()
      formData.append('file', matFile)
      formData.append('title', matTitle || matFile.name)
      formData.append('course_id', matCourse)
      await api.post(`/professor/courses/${matCourse}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const r = await api.get(`/professor/courses/${matCourse}/materials`)
      setMaterials(r.data)
      setMatFile(null)
      setMatTitle('')
      setMatUploadOk('File uploaded successfully.')
      e.target.reset()
    } catch (err) {
      setMatUploadErr(err.response?.data?.detail || 'Upload failed. Endpoint may not be implemented yet.')
    } finally {
      setMatUploading(false)
    }
  }

  // --- Assignments ---
  useEffect(() => {
    if (!selectedCourse) { setAssignments([]); return }
    setAssignLoading(true)
    api.get(`/professor/assignments/${selectedCourse}`)
      .then(r => setAssignments(r.data))
      .catch(() => setAssignments([]))
      .finally(() => setAssignLoading(false))
  }, [selectedCourse])

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    setCourseSaving(true)
    setCourseError('')
    try {
      await api.post('/professor/courses', { ...courseForm, credits: Number(courseForm.credits) })
      await fetchCourses()
      setCourseModal(false)
      setCourseForm(EMPTY_COURSE)
    } catch (err) {
      setCourseError(err.response?.data?.detail || 'Failed to create course.')
    } finally {
      setCourseSaving(false)
    }
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    setAssignSaving(true)
    setAssignError('')
    try {
      const res = await api.post('/professor/assignments', assignForm)
      setAssignments(a => [...a, res.data])
      setAssignModal(false)
      setAssignForm({ ...EMPTY_ASSIGNMENT, course_id: selectedCourse })
    } catch (err) {
      setAssignError(err.response?.data?.detail || 'Failed to create assignment.')
    } finally {
      setAssignSaving(false)
    }
  }

  useEffect(() => {
    if (!gradeViewCourse) { setGrades([]); return }
    setGradesLoading(true)
    api.get(`/professor/grades/${gradeViewCourse}`)
      .then(r => setGrades(r.data))
      .catch(() => setGrades([]))
      .finally(() => setGradesLoading(false))
  }, [gradeViewCourse])

  const handleAddGrade = async (e) => {
    e.preventDefault()
    setGradeSaving(true)
    setGradeError('')
    setGradeSuccess('')
    try {
      await api.post('/professor/grades', { ...gradeForm, value: Number(gradeForm.value) })
      setGradeSuccess('Grade recorded.')
      setGradeForm(EMPTY_GRADE)
      setGradeStudents([])
      if (gradeViewCourse === gradeForm.course_id) {
        const r = await api.get(`/professor/grades/${gradeForm.course_id}`)
        setGrades(r.data)
      }
    } catch (err) {
      setGradeError(err.response?.data?.detail || 'Failed to record grade.')
    } finally {
      setGradeSaving(false)
    }
  }

  const calcDuration = (start, end) => {
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60)
  }

  useEffect(() => {
    if (!attendCourse) { setAttendStudents([]); setAttendSheet({}); setAttendRecords([]); return }
    const dur = calcDuration(attendSessionStart, attendSessionEnd)
    api.get(`/professor/courses/${attendCourse}/students`)
      .then(r => {
        setAttendStudents(r.data)
        const sheet = {}
        r.data.forEach(s => { sheet[s.student_id] = dur })
        setAttendSheet(sheet)
      })
      .catch(() => { setAttendStudents([]); setAttendSheet({}) })
    setAttendLoading(true)
    api.get(`/professor/attendance/${attendCourse}`)
      .then(r => setAttendRecords(r.data))
      .catch(() => setAttendRecords([]))
      .finally(() => setAttendLoading(false))
  }, [attendCourse])

  const handleSubmitAttendance = async () => {
    if (!attendCourse || attendStudents.length === 0) return
    setAttendSaving(true)
    setAttendError('')
    setAttendSuccess('')
    try {
      const records = Object.entries(attendSheet).map(([student_id, hours_present]) => ({ student_id, hours_present: Number(hours_present) }))
      await api.post('/professor/attendance/bulk', {
        course_id: attendCourse,
        date: attendDate,
        session_start: attendSessionStart,
        session_end: attendSessionEnd,
        records,
      })
      const dur = calcDuration(attendSessionStart, attendSessionEnd)
      setAttendSuccess(`Saved — ${attendDate}, ${attendSessionStart}–${attendSessionEnd} (${dur}h session).`)
      const r = await api.get(`/professor/attendance/${attendCourse}`)
      setAttendRecords(r.data)
    } catch (err) {
      setAttendError(err.response?.data?.detail || 'Failed to save attendance.')
    } finally {
      setAttendSaving(false)
    }
  }

  const name = localStorage.getItem('name') || 'Professor'

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <DashboardNav role="professor" tabs={TABS} activeTab={tab} onTabChange={setTab} />

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div className="mb-10">
              <p className="text-amber-500 text-xs font-medium uppercase tracking-[0.2em] mb-1">Welcome back</p>
              <h1 className="text-3xl font-semibold text-white tracking-tight">{name}</h1>
              <p className="text-slate-500 text-sm mt-1">Here's your teaching snapshot.</p>
            </div>

            {loading ? (
              <p className="text-slate-500 text-sm">Loading…</p>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                  <StatCard label="My Courses" value={courses.length} color="text-amber-400" />
                  <StatCard label="Total Credits" value={courses.reduce((s, c) => s + (c.credits || 0), 0)} color="text-blue-300" />
                  <StatCard label="Departments" value={new Set(courses.map(c => c.department).filter(Boolean)).size} color="text-emerald-400" />
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                    <h2 className="text-sm font-semibold text-white">My Courses</h2>
                    <button onClick={() => setTab('courses')} className="text-amber-400 hover:text-amber-300 text-xs transition">
                      View all →
                    </button>
                  </div>
                  {courses.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-500 text-sm">No courses yet. Create one in My Courses tab.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <tbody>
                        {courses.slice(0, 5).map((c, i) => (
                          <tr key={c.id} className={`hover:bg-slate-950/40 transition-colors ${i < courses.slice(0, 5).length - 1 ? 'border-b border-slate-800/60' : ''}`}>
                            <td className="px-6 py-3.5 font-medium text-white">{c.title}</td>
                            <td className="px-6 py-3.5 text-slate-400 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>{c.code}</td>
                            <td className="px-6 py-3.5 text-slate-500 text-xs">{c.department || '—'}</td>
                            <td className="px-6 py-3.5 text-right">
                              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                {c.credits} cr
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
        )}

        {/* COURSES */}
        {tab === 'courses' && (
          <div>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-amber-500 text-xs font-medium uppercase tracking-[0.2em] mb-1">Teaching</p>
                <h1 className="text-3xl font-semibold text-white tracking-tight">My Courses</h1>
              </div>
              <button
                onClick={() => { setCourseForm(EMPTY_COURSE); setCourseError(''); setCourseModal(true) }}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition shadow-lg shadow-amber-900/30"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Course
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24 text-slate-500 text-sm">Loading courses…</div>
            ) : error ? (
              <div className="flex items-center justify-center py-24 text-red-400 text-sm">{error}</div>
            ) : courses.length === 0 ? (
              <EmptyState message="No courses yet. Create your first course." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(c => (
                  <div key={c.id} className="bg-slate-800 border border-slate-700 hover:border-amber-500/40 rounded-xl p-6 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        {c.code}
                      </span>
                      <span className="text-xs text-slate-500">{c.credits} credits</span>
                    </div>
                    <h3 className="text-white font-semibold mb-1">{c.title}</h3>
                    {c.department && <p className="text-slate-500 text-xs mb-2">{c.department}</p>}
                    {c.description && <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{c.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ROSTER */}
        {tab === 'roster' && (
          <div>
            <div className="mb-8">
              <p className="text-amber-500 text-xs font-medium uppercase tracking-[0.2em] mb-1">Teaching</p>
              <h1 className="text-3xl font-semibold text-white tracking-tight">Student Registry</h1>
            </div>

            <div className="mb-6">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-2">Select Course</label>
              <select
                value={rosterCourse}
                onChange={e => setRosterCourse(e.target.value)}
                className="input-base w-full md:w-80"
              >
                <option value="">— choose a course —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
              </select>
            </div>

            {!rosterCourse ? (
              <EmptyState message="Select a course to view enrolled students." />
            ) : rosterLoading ? (
              <div className="flex items-center justify-center py-24 text-slate-500 text-sm bg-slate-800 border border-slate-700 rounded-xl">Loading…</div>
            ) : rosterError === 'pending' ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 bg-slate-800 border border-slate-700 rounded-xl">
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm font-medium">Awaiting backend endpoint</p>
                <code className="text-xs text-slate-500 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded font-mono">GET /professor/courses/&#123;id&#125;/students</code>
              </div>
            ) : roster.length === 0 ? (
              <EmptyState message="No students enrolled in this course." />
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">Enrolled Students</h2>
                  <span className="text-slate-500 text-xs">{roster.length} student{roster.length !== 1 ? 's' : ''}</span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {['Name', 'Email', 'Enrolled On'].map(h => (
                        <th key={h} className="text-left px-6 py-4 text-slate-500 font-medium text-xs uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((s, i) => (
                      <tr key={s.id || i} className={`hover:bg-slate-950/40 transition-colors ${i < roster.length - 1 ? 'border-b border-slate-800/60' : ''}`}>
                        <td className="px-6 py-4 font-medium text-white">{s.name || s.student_id}</td>
                        <td className="px-6 py-4 text-slate-400 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>{s.email || '—'}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {s.enrolled_at ? new Date(s.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MATERIALS */}
        {tab === 'materials' && (
          <div>
            <div className="mb-8">
              <p className="text-amber-500 text-xs font-medium uppercase tracking-[0.2em] mb-1">Teaching</p>
              <h1 className="text-3xl font-semibold text-white tracking-tight">Course Materials</h1>
            </div>

            <div className="mb-6">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-2">Select Course</label>
              <select
                value={matCourse}
                onChange={e => { setMatCourse(e.target.value); setMatUploadOk(''); setMatUploadErr('') }}
                className="input-base w-full md:w-80"
              >
                <option value="">— choose a course —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
              </select>
            </div>

            {!matCourse ? (
              <EmptyState message="Select a course to manage its materials." />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Upload form */}
                <div>
                  <h2 className="text-sm font-semibold text-white mb-4">Upload Material</h2>
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <form onSubmit={handleUploadMaterial} className="flex flex-col gap-4">
                      <Field label="Title (optional)">
                        <input
                          value={matTitle}
                          onChange={e => setMatTitle(e.target.value)}
                          placeholder="e.g. Week 3 Slides"
                          className="input-base"
                        />
                      </Field>
                      <Field label="File">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-amber-500/50 transition-colors bg-slate-950/50">
                          <div className="flex flex-col items-center gap-2 text-center px-4">
                            {matFile ? (
                              <>
                                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                <p className="text-amber-300 text-sm font-medium truncate max-w-full">{matFile.name}</p>
                                <p className="text-slate-500 text-xs">{(matFile.size / 1024).toFixed(1)} KB</p>
                              </>
                            ) : (
                              <>
                                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                                <p className="text-slate-400 text-sm">Click to select file</p>
                                <p className="text-slate-600 text-xs">PDF, PPTX, DOCX, ZIP…</p>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.pptx,.ppt,.docx,.doc,.zip,.txt,.xlsx,.xls"
                            onChange={e => { setMatFile(e.target.files[0] || null); setMatUploadOk(''); setMatUploadErr('') }}
                          />
                        </label>
                      </Field>
                      {matUploadErr && <p className="text-rose-400 text-sm">{matUploadErr}</p>}
                      {matUploadOk  && <p className="text-emerald-400 text-sm">{matUploadOk}</p>}
                      <button
                        type="submit"
                        disabled={matUploading || !matFile}
                        className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        {matUploading ? 'Uploading…' : 'Upload File'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Materials list */}
                <div>
                  <h2 className="text-sm font-semibold text-white mb-4">Uploaded Materials</h2>
                  {matLoading ? (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center py-16 text-slate-500 text-sm">Loading…</div>
                  ) : matError === 'pending' ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 bg-slate-800 border border-slate-700 rounded-xl">
                      <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-400 text-sm font-medium">Awaiting backend endpoint</p>
                      <code className="text-xs text-slate-500 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded font-mono">GET /professor/courses/&#123;id&#125;/materials</code>
                    </div>
                  ) : materials.length === 0 ? (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center py-16 text-slate-500 text-sm">No materials uploaded yet.</div>
                  ) : (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                      {materials.map((m, i) => (
                        <div key={m.id || i} className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-950/40 transition-colors ${i < materials.length - 1 ? 'border-b border-slate-800/60' : ''}`}>
                          <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{m.title || m.file_name || 'Untitled'}</p>
                            <p className="text-slate-500 text-xs mt-0.5">
                              {m.uploaded_at ? new Date(m.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </p>
                          </div>
                          {m.file_url && (
                            <a
                              href={m.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-amber-400 transition-colors p-1.5 rounded hover:bg-slate-800 flex-shrink-0"
                              title="Download"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5m0 0l-4.5-4.5M12 16.5l4.5-4.5" />
                              </svg>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ASSIGNMENTS */}
        {tab === 'assignments' && (
          <div>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-amber-500 text-xs font-medium uppercase tracking-[0.2em] mb-1">Teaching</p>
                <h1 className="text-3xl font-semibold text-white tracking-tight">Assignments</h1>
              </div>
              {selectedCourse && (
                <button
                  onClick={() => { setAssignForm({ ...EMPTY_ASSIGNMENT, course_id: selectedCourse }); setAssignError(''); setAssignModal(true) }}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition shadow-lg shadow-amber-900/30"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Assignment
                </button>
              )}
            </div>

            <div className="mb-6">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-2">Select Course</label>
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="input-base w-full md:w-80"
              >
                <option value="">— choose a course —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
              </select>
            </div>

            {!selectedCourse ? (
              <EmptyState message="Select a course to view assignments." />
            ) : assignLoading ? (
              <div className="flex items-center justify-center py-24 text-slate-500 text-sm">Loading…</div>
            ) : assignments.length === 0 ? (
              <EmptyState message="No assignments for this course yet." />
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {['Title', 'Type', 'Due Date', 'Description'].map(h => (
                        <th key={h} className="text-left px-6 py-4 text-slate-500 font-medium text-xs uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a, i) => (
                      <tr key={a.id} className={`hover:bg-slate-950/40 transition-colors ${i < assignments.length - 1 ? 'border-b border-slate-800/60' : ''}`}>
                        <td className="px-6 py-4 font-medium text-white">{a.title}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-300/15 text-blue-300 border border-blue-400/30 capitalize">
                            {a.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>
                          {a.due_date ? new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm max-w-xs truncate">{a.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* GRADES */}
        {tab === 'grades' && (
          <div>
            <div className="mb-8">
              <p className="text-amber-500 text-xs font-medium uppercase tracking-[0.2em] mb-1">Assessment</p>
              <h1 className="text-3xl font-semibold text-white tracking-tight">Grades</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Record form */}
              <div>
                <h2 className="text-sm font-semibold text-white mb-4">Record Grade</h2>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <form onSubmit={handleAddGrade} className="flex flex-col gap-4">
                    <Field label="Course">
                      <select
                        required
                        value={gradeForm.course_id}
                        onChange={e => {
                          const id = e.target.value
                          setGradeForm(f => ({ ...f, course_id: id, student_id: '' }))
                          setGradeStudents([])
                          if (id) api.get(`/professor/courses/${id}/students`).then(r => setGradeStudents(r.data)).catch(() => {})
                        }}
                        className="input-base"
                      >
                        <option value="">— select course —</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                      </select>
                    </Field>
                    <Field label="Student">
                      <select
                        required
                        value={gradeForm.student_id}
                        onChange={e => setGradeForm(f => ({ ...f, student_id: e.target.value }))}
                        className="input-base"
                        disabled={!gradeForm.course_id}
                      >
                        <option value="">— select student —</option>
                        {gradeStudents.map(s => <option key={s.student_id} value={s.student_id}>{s.name} ({s.email})</option>)}
                      </select>
                    </Field>
                    <Field label="Grade (0–100)">
                      <input
                        required
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={gradeForm.value}
                        onChange={e => setGradeForm(f => ({ ...f, value: e.target.value }))}
                        placeholder="e.g. 87.5"
                        className="input-base"
                      />
                    </Field>
                    <Field label="Semester">
                      <input
                        required
                        value={gradeForm.semester}
                        onChange={e => setGradeForm(f => ({ ...f, semester: e.target.value }))}
                        placeholder="e.g. Fall 2025"
                        className="input-base"
                      />
                    </Field>
                    <Field label="Grade Type">
                      <select
                        required
                        value={gradeForm.grade_type}
                        onChange={e => setGradeForm(f => ({ ...f, grade_type: e.target.value }))}
                        className="input-base"
                      >
                        <option value="">— select type —</option>
                        <option value="midterm">Midterm</option>
                        <option value="final">Final</option>
                        <option value="assignment">Assignment</option>
                        <option value="quiz">Quiz</option>
                      </select>
                    </Field>
                    <Field label="Weight (% of overall grade)">
                      <input
                        required
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={gradeForm.weight}
                        onChange={e => setGradeForm(f => ({ ...f, weight: e.target.value }))}
                        placeholder="e.g. 30"
                        className="input-base"
                      />
                    </Field>
                    {gradeError   && <p className="text-rose-400 text-sm">{gradeError}</p>}
                    {gradeSuccess && <p className="text-emerald-400 text-sm">{gradeSuccess}</p>}
                    <button
                      type="submit"
                      disabled={gradeSaving}
                      className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition"
                    >
                      {gradeSaving ? 'Saving…' : 'Record Grade'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Grades list */}
              <div>
                <h2 className="text-sm font-semibold text-white mb-4">View Grades</h2>
                <div className="mb-4">
                  <select
                    value={gradeViewCourse}
                    onChange={e => setGradeViewCourse(e.target.value)}
                    className="input-base"
                  >
                    <option value="">— select course —</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                  </select>
                </div>
                {!gradeViewCourse ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center py-16 text-slate-500 text-sm">Select a course to view grades.</div>
                ) : gradesLoading ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center py-16 text-slate-500 text-sm">Loading…</div>
                ) : grades.length === 0 ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center py-16 text-slate-500 text-sm">No grades recorded for this course.</div>
                ) : (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800">
                          {['Student', 'Type', 'Grade', 'Weight', 'Semester'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((g, i) => (
                          <tr key={g.id || i} className={`hover:bg-slate-950/40 transition-colors ${i < grades.length - 1 ? 'border-b border-slate-800/60' : ''}`}>
                            <td className="px-4 py-3">
                              <p className="text-white text-sm font-medium">{g.student_name || '—'}</p>
                              <p className="text-slate-500 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>{g.student_email || '—'}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-medium px-2 py-0.5 rounded capitalize bg-blue-300/15 text-blue-300 border border-blue-400/30">{g.grade_type}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-sm font-semibold ${g.value >= 90 ? 'text-emerald-400' : g.value >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                                {g.value}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{g.weight}%</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{g.semester}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE */}
        {tab === 'attendance' && (() => {
          const sessionDuration = calcDuration(attendSessionStart, attendSessionEnd)

          // Aggregate per-student stats from past records
          const statsMap = {}
          attendRecords.forEach(r => {
            if (!statsMap[r.student_id]) {
              statsMap[r.student_id] = { student_name: r.student_name, student_email: r.student_email, hours_present: 0, hours_possible: 0, sessions: [] }
            }
            const dur = (r.session_start && r.session_end) ? calcDuration(r.session_start, r.session_end) : 0
            statsMap[r.student_id].hours_present += r.hours_present || 0
            statsMap[r.student_id].hours_possible += dur
            statsMap[r.student_id].sessions.push(r)
          })
          const studentStats = Object.values(statsMap)

          return (
            <div>
              <div className="mb-8">
                <p className="text-amber-500 text-xs font-medium uppercase tracking-[0.2em] mb-1">Tracking</p>
                <h1 className="text-3xl font-semibold text-white tracking-tight">Attendance</h1>
              </div>

              {/* Session controls */}
              <div className="flex flex-wrap gap-4 mb-8 p-5 bg-slate-800 border border-slate-700 rounded-xl">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-2">Course</label>
                  <select
                    value={attendCourse}
                    onChange={e => { setAttendCourse(e.target.value); setAttendError(''); setAttendSuccess('') }}
                    className="input-base"
                  >
                    <option value="">— select course —</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-2">Date</label>
                  <input type="date" value={attendDate} onChange={e => setAttendDate(e.target.value)} className="input-base w-40" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-2">Start Time</label>
                  <input type="time" value={attendSessionStart} onChange={e => setAttendSessionStart(e.target.value)} className="input-base w-32" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-2">End Time</label>
                  <input type="time" value={attendSessionEnd} onChange={e => setAttendSessionEnd(e.target.value)} className="input-base w-32" />
                </div>
                {sessionDuration > 0 && (
                  <div className="flex items-end pb-0.5">
                    <span className="text-amber-400 text-sm font-semibold bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
                      {sessionDuration}h session
                    </span>
                  </div>
                )}
              </div>

              {!attendCourse ? (
                <EmptyState message="Select a course to take attendance." />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                  {/* Attendance sheet */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold text-white">
                        Mark Attendance — {attendDate}, {attendSessionStart}–{attendSessionEnd}
                      </h2>
                      {attendStudents.length > 0 && (
                        <div className="flex gap-2">
                          <button onClick={() => setAttendSheet(s => Object.fromEntries(Object.keys(s).map(id => [id, sessionDuration])))} className="text-xs text-emerald-400 hover:text-emerald-300 transition">All Present</button>
                          <span className="text-slate-700">|</span>
                          <button onClick={() => setAttendSheet(s => Object.fromEntries(Object.keys(s).map(id => [id, 0])))} className="text-xs text-rose-400 hover:text-rose-300 transition">All Absent</button>
                        </div>
                      )}
                    </div>

                    {attendStudents.length === 0 ? (
                      <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center py-16 text-slate-500 text-sm">No students enrolled.</div>
                    ) : (
                      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                        {attendStudents.map((s, i) => {
                          const hp = attendSheet[s.student_id] ?? sessionDuration
                          const pct = sessionDuration > 0 ? hp / sessionDuration : 0
                          const color = pct >= 1 ? 'text-emerald-400' : pct === 0 ? 'text-rose-400' : 'text-amber-400'
                          const borderColor = pct >= 1 ? 'border-emerald-600' : pct === 0 ? 'border-rose-600' : 'border-amber-600'
                          return (
                            <div key={s.student_id} className={`flex items-center gap-3 px-5 py-3.5 ${i < attendStudents.length - 1 ? 'border-b border-slate-800/60' : ''}`}>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{s.name}</p>
                                <p className="text-slate-500 text-xs truncate">{s.email}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => setAttendSheet(sh => ({ ...sh, [s.student_id]: Math.max(0, (sh[s.student_id] ?? sessionDuration) - 0.5) }))}
                                  className="w-7 h-7 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-bold transition flex items-center justify-center"
                                >−</button>
                                <div className={`flex flex-col items-center w-16 border-b-2 ${borderColor} pb-0.5`}>
                                  <span className={`text-lg font-semibold ${color}`}>{hp}</span>
                                  <span className="text-slate-500 text-xs">/ {sessionDuration}h</span>
                                </div>
                                <button
                                  onClick={() => setAttendSheet(sh => ({ ...sh, [s.student_id]: Math.min(sessionDuration, (sh[s.student_id] ?? sessionDuration) + 0.5) }))}
                                  className="w-7 h-7 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-bold transition flex items-center justify-center"
                                >+</button>
                              </div>
                            </div>
                          )
                        })}
                        <div className="px-5 py-4 border-t border-slate-700 bg-slate-900/50">
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex gap-4 text-xs text-slate-500">
                              <span><span className="text-emerald-400 font-semibold">{Object.values(attendSheet).filter(v => v >= sessionDuration && sessionDuration > 0).length}</span> full</span>
                              <span><span className="text-amber-400 font-semibold">{Object.values(attendSheet).filter(v => v > 0 && v < sessionDuration).length}</span> partial</span>
                              <span><span className="text-rose-400 font-semibold">{Object.values(attendSheet).filter(v => v === 0).length}</span> absent</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {attendError   && <p className="text-rose-400 text-xs">{attendError}</p>}
                              {attendSuccess && <p className="text-emerald-400 text-xs">{attendSuccess}</p>}
                              <button
                                onClick={handleSubmitAttendance}
                                disabled={attendSaving || sessionDuration <= 0}
                                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
                              >
                                {attendSaving ? 'Saving…' : 'Save Session'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attendance rate summary */}
                  <div>
                    <h2 className="text-sm font-semibold text-white mb-4">Attendance Rates <span className="text-slate-500 font-normal">(75% to pass)</span></h2>
                    {attendLoading ? (
                      <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center py-16 text-slate-500 text-sm">Loading…</div>
                    ) : studentStats.length === 0 ? (
                      <div className="bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center py-16 text-slate-500 text-sm">No records yet. Save a session to see rates.</div>
                    ) : (
                      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                        {studentStats.map((s, i) => {
                          const rate = s.hours_possible > 0 ? (s.hours_present / s.hours_possible) * 100 : 0
                          const pass = rate >= 75
                          return (
                            <div key={s.student_email} className={`px-5 py-4 ${i < studentStats.length - 1 ? 'border-b border-slate-800/60' : ''}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{s.student_name}</p>
                                  <p className="text-slate-500 text-xs truncate">{s.student_email}</p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                  <span className="text-slate-400 text-xs">{s.hours_present}/{s.hours_possible}h</span>
                                  <span className={`text-sm font-semibold w-12 text-right ${pass ? 'text-emerald-400' : 'text-rose-400'}`}>{rate.toFixed(0)}%</span>
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${pass ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30'}`}>
                                    {pass ? 'Pass' : 'Fail'}
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${pass ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                  style={{ width: `${Math.min(100, rate)}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )
        })()}

      </main>

      {/* Create Course Modal */}
      {courseModal && (
        <Modal title="Create New Course" onClose={() => setCourseModal(false)}>
          <form onSubmit={handleCreateCourse} className="flex flex-col gap-4">
            <Field label="Course Code">
              <input required value={courseForm.code} onChange={e => setCourseForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. CS101" className="input-base" />
            </Field>
            <Field label="Title">
              <input required value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to Programming" className="input-base" />
            </Field>
            <Field label="Credits">
              <input required type="number" min="1" max="12" value={courseForm.credits} onChange={e => setCourseForm(f => ({ ...f, credits: e.target.value }))} className="input-base" />
            </Field>
            <Field label="Department">
              <input value={courseForm.department} onChange={e => setCourseForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Computer Science" className="input-base" />
            </Field>
            <Field label="Description">
              <textarea value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} placeholder="Short course description…" rows={3} className="input-base resize-none" />
            </Field>
            {courseError && <p className="text-rose-400 text-sm">{courseError}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setCourseModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2.5 rounded-lg transition">Cancel</button>
              <button type="submit" disabled={courseSaving} className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition">
                {courseSaving ? 'Creating…' : 'Create Course'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Assignment Modal */}
      {assignModal && (
        <Modal title="New Assignment" onClose={() => setAssignModal(false)}>
          <form onSubmit={handleCreateAssignment} className="flex flex-col gap-4">
            <Field label="Title">
              <input required value={assignForm.title} onChange={e => setAssignForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Midterm Project" className="input-base" />
            </Field>
            <Field label="Type">
              <select value={assignForm.type} onChange={e => setAssignForm(f => ({ ...f, type: e.target.value }))} className="input-base">
                <option value="homework">Homework</option>
                <option value="project">Project</option>
                <option value="exam">Exam</option>
                <option value="quiz">Quiz</option>
                <option value="lab">Lab</option>
              </select>
            </Field>
            <Field label="Due Date">
              <input type="date" value={assignForm.due_date} onChange={e => setAssignForm(f => ({ ...f, due_date: e.target.value }))} className="input-base" />
            </Field>
            <Field label="Description">
              <textarea value={assignForm.description} onChange={e => setAssignForm(f => ({ ...f, description: e.target.value }))} placeholder="Instructions…" rows={3} className="input-base resize-none" />
            </Field>
            {assignError && <p className="text-rose-400 text-sm">{assignError}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setAssignModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2.5 rounded-lg transition">Cancel</button>
              <button type="submit" disabled={assignSaving} className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition">
                {assignSaving ? 'Creating…' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`
        .input-base { width:100%; background:rgb(15 23 42); border:1px solid rgb(51 65 85); border-radius:0.5rem; padding:0.625rem 0.875rem; color:white; font-size:0.875rem; outline:none; transition:border-color 0.15s; font-family:inherit; }
        .input-base:focus { border-color:rgb(217 119 6); }
        .input-base::placeholder { color:rgb(100 116 139); }
        .input-base option { background:rgb(15 23 42); }
      `}</style>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <p className={`text-4xl font-semibold ${color} mb-1`}>{value}</p>
      <p className="text-slate-500 text-sm">{label}</p>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="flex items-center justify-center py-24 text-slate-500 text-sm bg-slate-800 border border-slate-700 rounded-xl">
      {message}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}
