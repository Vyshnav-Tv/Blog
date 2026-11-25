import { NavLink, Outlet } from 'react-router-dom'
import useAuth from '../context/useAuth'
import Header from '../components/Header'

export default function DashboardLayout() {
  const { user } = useAuth()
  return (
    <>
      <Header />
      <div className="dashboard-shell">
        <aside className="sidebar">
          <nav className="sidebar-inner" aria-label="Dashboard navigation">
            {user?.role === 'admin' ? (
              <NavLink to="/admin">Overview</NavLink>
            ) : (
              <>
                <NavLink to="/dashboard" end>My posts</NavLink>
                <NavLink to="/dashboard/posts/new">Create post</NavLink>
                <NavLink to="/dashboard/profile">Profile</NavLink>
              </>
            )}
          </nav>
        </aside>
        <main className="dashboard-main"><Outlet /></main>
      </div>
    </>
  )
}
