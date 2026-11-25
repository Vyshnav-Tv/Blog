import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.')
      return
    }

    try {
      await register(form)
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create your account.')
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">Join the journal</span>
        <h1>Create account</h1>
        {error && <div className="error">{error}</div>}
        <div className="form-group"><label htmlFor="name">Name</label><input className="input" id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label htmlFor="email">Email</label><input className="input" id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="form-group"><label htmlFor="password">Password</label><input className="input" id="password" type="password" minLength="8" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <div className="form-group"><label htmlFor="confirmation">Confirm password</label><input className="input" id="confirmation" type="password" required value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} /></div>
        <button className="btn btn-primary" type="submit">Create account</button>
        <p style={{ marginTop: 18, color: '#737373', fontSize: 14 }}>Already registered? <Link to="/login"><strong>Log in</strong></Link></p>
      </form>
    </div>
  )
}
