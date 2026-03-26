import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageLoader from './PageLoader'
import toast from 'react-hot-toast'

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/browse';
    toast.error('Unauthorized access');
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />
}