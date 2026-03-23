import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Home, Shield, Zap, Users, Building2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const user = await login(formData.email, formData.password)
      
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/my-rentals', { replace: true })
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const fillDemoTenant = () => {
    setFormData({
      email: 'aisha@gmail.com',
      password: 'pass123',
    })
  }

  const fillDemoAdmin = () => {
    setFormData({
      email: 'james@renteasy.com',
      password: 'pass123',
    })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80"
          alt="Luxury Home"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/95 via-brand-800/90 to-brand-700/85" />
        
        <div className="relative z-10 flex flex-col justify-between py-12 px-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Home size={28} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">RentEasy</span>
          </div>
          
          <div className="space-y-8">
            <h1 className="font-display text-5xl font-bold text-white leading-tight">
              Welcome Back to<br />
              Kenya's Premier<br />
              Rental Platform
            </h1>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <span>Zero Agent Fees</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Zap size={20} />
                </div>
                <span>M-Pesa Escrow Protection</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <span>5,000+ Verified Properties</span>
              </div>
            </div>
          </div>
          
          <div className="text-white/60 text-sm">
            <p>© 2024 RentEasy Kenya. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-[#0B0B0C] p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center">
                <Home size={24} className="text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
              Sign In
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Access your account to find your perfect home
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <a href="#" className="text-sm text-brand-500 hover:text-brand-600 font-medium">
                Forgot password?
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </motion.button>

           

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-500 hover:text-brand-600 font-semibold">
                Sign up
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}