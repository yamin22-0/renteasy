import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Menu, X, Home, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const tenantLinks = [
  { to: '/browse', label: 'Browse' },
  { to: '/my-rentals', label: 'My Rentals' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/payments', label: 'Payments' },
  { to: '/report-issue', label: 'Issues' },
]

const adminLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/properties', label: 'Properties' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/tenants', label: 'Tenants' },
  { to: '/admin/issues', label: 'Issues' },
  { to: '/admin/payments', label: 'Payments' },
]

export default function Navbar({ transparent = false }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = user?.role === 'admin' ? adminLinks : tenantLinks
  const isTransparent = transparent && !scrolled

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isTransparent
        ? 'bg-transparent'
        : 'bg-white/90 dark:bg-[#0B0B0C]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#2A2A2A]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Home size={16} color="white" />
            </div>
            <span className={`font-display font-bold text-xl ${isTransparent ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
              RentEasy
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/admin'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-500 text-white'
                      : isTransparent
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2A2A2A]'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className={`p-2 rounded-lg transition-all duration-150 ${
                isTransparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]'
              }`}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=22c55e&color=fff`} />
                <span className={`text-sm font-medium ${isTransparent ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{user.name.split(' ')[0]}</span>
                <button onClick={() => { logout(); navigate('/') }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]'}`}>
                  Login
                </Link>
                <Link to="/register" className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-all">
                  Sign Up
                </Link>
              </div>
            )}

            <button onClick={() => setOpen(o => !o)} className={`md:hidden p-2 rounded-lg ${isTransparent ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#2A2A2A] px-4 pb-4"
          >
            <div className="flex flex-col gap-1 pt-2">
              {links.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-brand-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              {user ? (
                <button onClick={() => { logout(); navigate('/'); setOpen(false) }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 font-medium">
                  <LogOut size={16} /> Logout
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Login</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="px-3 py-2 text-sm font-semibold bg-brand-500 text-white rounded-lg text-center">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
