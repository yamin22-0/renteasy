import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageLoader from './PageLoader'

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    // Wrong role - redirect to appropriate dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    }
    if (user.role === 'tenant') {
      return <Navigate to="/my-rentals" replace />
    }
    return <Navigate to="/" replace />
  }

  return <Outlet />
}