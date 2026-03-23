import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { 
  User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Home, 
  Shield, Zap, Building2, CheckCircle, Award, Users 
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const { register, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      })
      
      navigate('/my-rentals', { replace: true })
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
          alt="Modern Apartment"
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
              Join Kenya's<br />
              #1 Rental<br />
              Community
            </h1>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <span>10,000+ Happy Tenants</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Award size={20} />
                </div>
                <span>Build Your RentScore™</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <span>Secure M-Pesa Payments</span>
              </div>
            </div>
          </div>
          
          <div className="text-white/60 text-sm">
            <p>Join thousands of tenants finding their perfect home</p>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-[#0B0B0C] p-8 overflow-y-auto py-12">
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
              Create Account
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Start your journey to finding your dream home
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="+254 700 000 000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
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
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Creating account...' : (
                  <>
                    Create Account <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}