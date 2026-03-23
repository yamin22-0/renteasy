import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/shared/ProtectedRoute'
import GuestOnlyRoute from './components/shared/GuestOnlyRoute'
import PageLoader from './components/shared/PageLoader'

// Lazy load all pages
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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/house/:id" element={<HouseDetail />} />

              {/* Auth */}
              <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
              <Route path="/register" element={<GuestOnlyRoute><Register /></GuestOnlyRoute>} />

              {/* Tenant */}
              <Route path="/my-rentals" element={<ProtectedRoute role="tenant"><MyRentals /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute role="tenant"><Favorites /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute role="tenant"><Payments /></ProtectedRoute>} />
              <Route path="/report-issue" element={<ProtectedRoute role="tenant"><ReportIssue /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="properties" element={<AdminProperties />} />
                <Route path="properties/add" element={<AdminPropertyForm />} />
                <Route path="properties/edit/:id" element={<AdminPropertyForm />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="tenants" element={<AdminTenants />} />
                <Route path="issues" element={<AdminIssues />} />
                <Route path="payments" element={<AdminPayments />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
