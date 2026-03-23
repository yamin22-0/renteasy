import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Building2, CalendarCheck, Users, AlertTriangle,
  CreditCard, ChevronLeft, ChevronRight, Home, LogOut, Sun, Moon, Menu, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/properties', icon: Building2, label: 'Properties' },
  { to: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/admin/tenants', icon: Users, label: 'Tenants' },
  { to: '/admin/issues', icon: AlertTriangle, label: 'Issues' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-2 px-4 py-5 border-b border-gray-100 dark:border-[#2A2A2A] ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shrink-0">
          <Home size={15} color="white" />
        </div>
        {(!collapsed || mobile) && (
          <span className="font-display font-bold text-lg text-gray-900 dark:text-white">RentEasy</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) => isActive ? `sidebar-link-active ${collapsed && !mobile ? 'justify-center px-2' : ''}` : `sidebar-link ${collapsed && !mobile ? 'justify-center px-2' : ''}`}
          >
            <item.icon size={18} className="shrink-0" />
            {(!collapsed || mobile) && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className={`p-3 border-t border-gray-100 dark:border-[#2A2A2A] ${collapsed && !mobile ? 'flex flex-col items-center gap-2' : 'flex items-center gap-2'}`}>
        {(!collapsed || mobile) && (
          <>
            <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full object-cover shrink-0" onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'A')}&background=22c55e&color=fff`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</div>
              <div className="text-xs text-gray-400 truncate">Admin</div>
            </div>
          </>
        )}
        <button onClick={toggle} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-all">
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button onClick={() => { logout(); navigate('/') }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
          <LogOut size={15} />
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0B0B0C] overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2 }}
        className="hidden lg:flex flex-col bg-white dark:bg-[#1A1A1A] border-r border-gray-100 dark:border-[#2A2A2A] relative overflow-hidden"
      >
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute top-5 -right-3 z-10 w-6 h-6 rounded-full bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-[#3A3A3A] flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-[#3A3A3A] transition-all"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-white dark:bg-[#1A1A1A] border-r border-gray-100 dark:border-[#2A2A2A] lg:hidden"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1A1A1A] border-b border-gray-100 dark:border-[#2A2A2A]">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-gray-500">
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-gray-900 dark:text-white">RentEasy Admin</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
