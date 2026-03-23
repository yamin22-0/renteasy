import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Home } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(4, 'Password too short'),
})

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password)
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch {}
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=90"
          alt="Luxury home"
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
            <h2 className="font-display text-4xl font-bold text-white mb-3">Welcome back to Kenya's best rental platform</h2>
            <p className="text-white/70">Thousands of verified homes waiting for you.</p>
          </div>
          <div className="flex gap-6">
            {[['30+', 'Properties'], ['12', 'Counties'], ['0', 'Agent Fees']].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-2xl font-bold text-white">{n}</div>
                <div className="text-white/60 text-sm">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-[#0B0B0C] px-6">
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
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">Sign in</h1>
            <p className="text-gray-500 dark:text-gray-400">Don't have an account? <Link to="/register" className="text-brand-500 font-semibold hover:underline">Create one</Link></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('email')} type="email" placeholder="you@example.com" className="input-field pl-10" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••" className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
