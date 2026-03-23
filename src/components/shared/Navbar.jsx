import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Menu, X, Home, User, LogOut, Sun, Moon, ChevronDown, Bell } from 'lucide-react'

export default function Navbar() {
  const { dark, toggle } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Browse', path: '/browse' },
    { label: 'How It Works', path: '/#how-it-works' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0A0A0B]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center mr-2">
              <Home size={18} color="white" />
            </div>
            <span className="font-display font-bold text-gray-900 dark:text-white text-xl">RentEasy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              // Logged in user menu
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                    <User size={16} className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1A1A1A] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    {user.role === 'tenant' && (
                      <>
                        <Link
                          to="/my-rentals"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          My Rentals
                        </Link>
                        <Link
                          to="/favorites"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Favorites
                        </Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Logged out buttons
              <>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0A0A0B] border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
            
            <button
              onClick={toggle}
              className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
              <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {user ? (
              <>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2">
                  <div className="px-3 py-2 text-sm text-gray-500">Signed in as {user.name}</div>
                  {user.role === 'tenant' && (
                    <>
                      <Link
                        to="/my-rentals"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 rounded-lg"
                      >
                        My Rentals
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 rounded-lg"
                      >
                        Favorites
                      </Link>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 rounded-lg"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-gray-50 rounded-lg"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 space-y-2 border-t border-gray-200 dark:border-gray-800 mt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-3 py-2 text-center text-gray-600 dark:text-gray-300 hover:text-brand-500 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full bg-brand-500 text-white px-3 py-2 rounded-lg text-center font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}