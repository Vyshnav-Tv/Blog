import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function signOut() {
    await logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="container nav">
        <Link className="brand" to="/">Chronicle</Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link className="nav-link" to="/">Stories</Link>
          {!user ? (
            <>
              <Link className="nav-link" to="/login">Log in</Link>
              <Link className="btn btn-primary" to="/register">Register</Link>
            </>
          ) : (
            <>
              {user.role === 'admin' && <Link className="nav-link" to="/admin">Admin</Link>}
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
              <button className="btn btn-outline" type="button" onClick={signOut}>Log out</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
