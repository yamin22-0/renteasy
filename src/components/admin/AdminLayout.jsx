import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Home, BookOpen, Users, 
  AlertCircle, CreditCard, DoorOpen, Menu, X, LogOut 
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useMoveOutRequests, useRenewalRequests } from '../../hooks/useApi'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Properties', path: '/admin/properties', icon: Home },
  { label: 'Bookings', path: '/admin/bookings', icon: BookOpen },
  { label: 'Tenants', path: '/admin/tenants', icon: Users },
  { label: 'Lease Requests', path: '/admin/lease-requests', icon: DoorOpen, isLease: true },
  { label: 'Issues', path: '/admin/issues', icon: AlertCircle },
  { label: 'Payments', path: '/admin/payments', icon: CreditCard },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Fetch pending counts for the notification badge
  const { data: moveOuts = [] } = useMoveOutRequests({ status: 'pending' })
  const { data: renewals = [] } = useRenewalRequests({ status: 'pending' })
  const totalPendingLease = moveOuts.length + renewals.length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0C] flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#1A1A1A] z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <Link to="/admin" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white">
                    <Home size={18} />
                  </div>
                  <span className="font-display font-bold text-xl text-gray-900 dark:text-white">RentEasy</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `
                      flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${isActive ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-gray-500'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      {item.label}
                    </div>
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 font-medium"><LogOut size={18} /> Sign Out</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#1A1A1A] border-r border-gray-200 dark:border-gray-800 sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white">
              <Home size={18} />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">RentEasy Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.label}
              </div>
              {item.isLease && totalPendingLease > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {totalPendingLease}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold dark:text-white">Admin Panel</span>
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
            A
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}