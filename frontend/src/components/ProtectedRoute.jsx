import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../context/useAuth'

export default function ProtectedRoute({ role }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
