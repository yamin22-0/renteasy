import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useState } from 'react'
import { 
  Home, Search, Heart, CreditCard, AlertCircle, 
  User, LogOut, Menu, X, Sun, Moon, LayoutDashboard,
  Bell, ChevronDown
} from 'lucide-react'

export default function TenantLayout() {
  const { dark, toggle } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/my-rentals' },
    { icon: Search, label: 'Browse', path: '/browse' },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: AlertCircle, label: 'Report Issue', path: '/report-issue' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0C]">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#0A0A0B] border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 lg:hidden"
              >
                <Menu size={24} />
              </button>
              <Link to="/my-rentals" className="flex items-center ml-2 lg:ml-0">
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center mr-2">
                  <Home size={18} color="white" />
                </div>
                <span className="font-display font-bold text-gray-900 dark:text-white text-xl">RentEasy</span>
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100"
              >
                {dark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 relative">
                <Bell size={20} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                    <User size={16} className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.name || 'Tenant'}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1A1A1A] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 bottom-0 z-40 w-64 bg-white dark:bg-[#0A0A0B] border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`lg:pl-64 pt-16 transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}