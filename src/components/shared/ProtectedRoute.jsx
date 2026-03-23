import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageLoader from './PageLoader'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
  }
  return children
}