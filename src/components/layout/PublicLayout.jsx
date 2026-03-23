import { Outlet } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Menu, X, Sun, Moon } from 'lucide-react'

export default function PublicLayout() {
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Browse', path: '/browse' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'Contact', path: '/contact' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0C]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0A0A0B]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center mr-2">
                <Home size={18} color="white" />
              </div>
              <span className="font-display font-bold text-gray-900 dark:text-white text-xl">RentEasy</span>
            </Link>

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

            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {dark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#0A0A0B] border-t">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 rounded-lg"
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={toggle}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 rounded-lg"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
                <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-3 py-2 text-gray-600 dark:text-gray-300 rounded-lg"
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
          </div>
        )}
      </nav>

      <main className="pt-16">
        <Outlet />
      </main>

      <footer className="bg-gray-900 dark:bg-[#0A0A0B] pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                  <Home size={20} color="white" />
                </div>
                <span className="font-display font-bold text-white text-2xl">RentEasy</span>
              </div>
              <p className="text-gray-400 text-sm">Kenya's #1 verified rental platform. Find your perfect home with zero agent fees.</p>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-brand-400 text-sm">Home</Link></li>
                <li><Link to="/browse" className="text-gray-400 hover:text-brand-400 text-sm">Browse Properties</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-brand-400 text-sm">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-brand-400 text-sm">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-brand-400 text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-brand-400 text-sm">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-400 text-sm">📞 +254 700 000 000</li>
                <li className="text-gray-400 text-sm">✉️ info@renteasy.co.ke</li>
                <li className="text-gray-400 text-sm">📍 Nairobi, Kenya</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">© 2024 RentEasy Kenya. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}