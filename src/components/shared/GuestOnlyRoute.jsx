import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageLoader from './PageLoader'

export default function GuestOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  // If user is logged in, redirect to their appropriate dashboard
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    }
    if (user.role === 'tenant') {
      return <Navigate to="/my-rentals" replace />
    }
  }

  // If not logged in, show the login/register page
  return <Outlet />
}