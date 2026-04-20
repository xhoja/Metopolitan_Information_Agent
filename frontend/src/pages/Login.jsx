import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import loginBg from '../assets/login-bg.jpg'
import logoImg from '../assets/logo.jpg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
            className="bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg py-2.5 font-semibold transition shadow-lg shadow-blue-900/30"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
