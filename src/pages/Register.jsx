import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Phone, Eye, EyeOff, Home } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const schema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

export default function Register() {
  const { register: authRegister, loading } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      await authRegister(data)
      navigate('/')
    } catch {}
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=90"
          alt="Modern home"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-brand-900/40" />
        <div className="relative z-10 p-12 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <Home size={18} color="white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">RentEasy</span>
          </Link>
          <div>
            <h2 className="font-display text-4xl font-bold text-white mb-3">Start your journey to finding your perfect home</h2>
            <p className="text-white/70">Join thousands of Kenyans who found their dream home on RentEasy.</p>
          </div>
          <div className="card p-4">
            <p className="text-brand-600 font-semibold text-sm mb-1">✓ Zero agent fees</p>
            <p className="text-brand-600 font-semibold text-sm mb-1">✓ Verified listings only</p>
            <p className="text-brand-600 font-semibold text-sm">✓ M-Pesa escrow protection</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-[#0B0B0C] px-6 py-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Home size={16} color="white" />
              </div>
              <span className="font-display font-bold text-xl text-gray-900 dark:text-white">RentEasy</span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">Create account</h1>
            <p className="text-gray-500 dark:text-gray-400">Already have an account? <Link to="/login" className="text-brand-500 font-semibold hover:underline">Sign in</Link></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('name')} placeholder="Aisha Mohamed" className="input-field pl-10" />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('email')} type="email" placeholder="you@example.com" className="input-field pl-10" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('phone')} placeholder="+254 7XX XXX XXX" className="input-field pl-10" />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••" className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('confirmPassword')} type={showPw ? 'text' : 'password'} placeholder="••••••••" className="input-field pl-10" />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>

            <p className="text-gray-400 text-xs text-center">
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
