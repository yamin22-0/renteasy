import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/shared/ProtectedRoute'
import GuestOnlyRoute from './components/shared/GuestOnlyRoute'
import PageLoader from './components/shared/PageLoader'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import TenantLayout from './components/tenant/TenantLayout'

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'))
const Browse = lazy(() => import('./pages/tenant/Browse'))
const HouseDetail = lazy(() => import('./pages/tenant/HouseDetail'))
const MyRentals = lazy(() => import('./pages/tenant/MyRentals'))
const Favorites = lazy(() => import('./pages/tenant/Favorites'))
const Payments = lazy(() => import('./pages/tenant/Payments'))
const ReportIssue = lazy(() => import('./pages/tenant/ReportIssue'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))

// Admin pages
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProperties = lazy(() => import('./pages/admin/Properties'))
const AdminPropertyForm = lazy(() => import('./pages/admin/PropertyForm'))
const AdminBookings = lazy(() => import('./pages/admin/Bookings'))
const AdminTenants = lazy(() => import('./pages/admin/Tenants'))
const AdminIssues = lazy(() => import('./pages/admin/Issues'))
const AdminPayments = lazy(() => import('./pages/admin/Payments'))

// Redirect component based on role
function RoleBasedRedirect() {
  const { user } = useAuth()
  
  if (!user) return <Navigate to="/" replace />
  
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }
  
  if (user.role === 'tenant') {
    return <Navigate to="/my-rentals" replace />
  }
  
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes - no auth required */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/house/:id" element={<HouseDetail />} />
              </Route>

              {/* Auth routes - redirect if already logged in */}
              <Route element={<GuestOnlyRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Role-based redirect after login */}
              <Route path="/redirect" element={<RoleBasedRedirect />} />

              {/* Tenant routes - protected */}
              <Route element={<ProtectedRoute role="tenant" />}>
                <Route element={<TenantLayout />}>
                  <Route path="/my-rentals" element={<MyRentals />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/report-issue" element={<ReportIssue />} />
                </Route>
              </Route>

              {/* Admin routes - protected */}
              <Route element={<ProtectedRoute role="admin" />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/properties" element={<AdminProperties />} />
                  <Route path="/admin/properties/add" element={<AdminPropertyForm />} />
                  <Route path="/admin/properties/edit/:id" element={<AdminPropertyForm />} />
                  <Route path="/admin/bookings" element={<AdminBookings />} />
                  <Route path="/admin/tenants" element={<AdminTenants />} />
                  <Route path="/admin/issues" element={<AdminIssues />} />
                  <Route path="/admin/payments" element={<AdminPayments />} />
                </Route>
              </Route>

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}