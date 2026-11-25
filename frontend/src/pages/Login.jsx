import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true); setError('')
    try {
      const result = await login(form)
      const defaultPage = result.user.role === 'admin' ? '/admin' : '/dashboard'
      navigate(location.state?.from?.pathname || defaultPage, { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to log in.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">Welcome back</span>
        <h1>Log in</h1>
        {error && <div className="error">{error}</div>}
        <div className="form-group"><label htmlFor="email">Email</label><input className="input" id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="form-group"><label htmlFor="password">Password</label><input className="input" id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <button className="btn btn-primary" disabled={busy} type="submit">{busy ? 'Signing in...' : 'Log in'}</button>
        <p style={{ marginTop: 18, color: '#737373', fontSize: 14 }}>New here? <Link to="/register"><strong>Create an account</strong></Link></p>
      </form>
    </div>
  )
}
