import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import loginBg from '../assets/login-bg.jpg'
import logoImg from '../assets/logo.jpg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const { access_token, role, name } = res.data
      localStorage.setItem('token', access_token)
      localStorage.setItem('role', role)
      localStorage.setItem('name', name)
      if (role === 'admin') navigate('/admin')
      else if (role === 'professor') navigate('/professor')
      else navigate('/student')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Dimmed background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div className="absolute inset-0 bg-slate-950/75" />

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/')}
       className="absolute top-6 left-6 z-10 flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-all bg-slate
         +-900/70 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 backdrop-blur px-4 py-2 rounded-full shadow-lg"
      >
        ← Back to Home
      </button>

      {/* Card */}
      <div className="relative z-10 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <img src={logoImg} alt="UMT Logo" className="h-10 w-10 object-contain rounded" />
          <div>
            <p className="text-white font-bold text-lg leading-none">M.I.A</p>
            <p className="text-slate-400 text-xs">Sign in to your portal</p>
          </div>
        </div>


        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-slate-950 text-white border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-400 placeholder-slate-500"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-blue-400 placeholder-slate-500"
            />
            <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
              {showPassword
                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              }
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-400 hover:bg-blue-300 disabled:opacity-50 text-white rounded-lg py-2.5 font-semibold transition shadow-lg shadow-blue-900/30"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
