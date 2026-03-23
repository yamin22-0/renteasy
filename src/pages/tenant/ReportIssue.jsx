import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import Navbar from '../../components/shared/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useIssues, useRentals } from '../../hooks/useApi'
import { formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

const schema = z.object({
  title: z.string().min(5, 'Title too short'),
  description: z.string().min(20, 'Please provide more detail'),
  category: z.string().min(1, 'Select a category'),
  priority: z.string().min(1, 'Select a priority'),
})

const STATUS_CONFIG = {
  Open: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300' },
  'In Progress': { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  Resolved: { icon: CheckCircle2, color: 'text-brand-500', bg: 'bg-brand-100 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300' },
}

export default function ReportIssue() {
  const { user } = useAuth()
  const { data: rentals = [] } = useRentals({ tenantId: user?.id })
  const { data: issues = [], isLoading, addMutation } = useIssues({ tenantId: user?.id })
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const activeRental = rentals[0]

  const onSubmit = async (data) => {
    if (!activeRental) { toast.error('You need an active rental to report issues'); return }
    try {
      await addMutation.mutateAsync({ ...data, houseId: activeRental.houseId, tenantId: user.id })
      toast.success('Issue reported successfully')
      reset()
    } catch {
      toast.error('Failed to submit issue')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0C]">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Report an Issue</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Report maintenance or property issues to your landlord</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">New Issue Report</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Issue Title</label>
                <input {...register('title')} placeholder="e.g. Leaking roof in bedroom" className="input-field" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea {...register('description')} rows={4} placeholder="Describe the issue in detail..." className="input-field resize-none" />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <select {...register('category')} className="input-field">
                    <option value="">Select category</option>
                    {['Plumbing', 'Electrical', 'Security', 'Structural', 'Pest Control', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
                  <select {...register('priority')} className="input-field">
                    <option value="">Select priority</option>
                    {['Low', 'Medium', 'High', 'Emergency'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={addMutation.isPending}
                className="btn-primary w-full py-3"
              >
                {addMutation.isPending ? 'Submitting...' : 'Submit Report'}
              </motion.button>
            </form>
          </div>

          {/* Issue List */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Previous Issues ({issues.length})</h2>
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
            ) : issues.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">
                <CheckCircle2 size={32} className="mx-auto mb-3 text-brand-400" />
                <p className="font-medium text-gray-700 dark:text-gray-300">No issues reported</p>
                <p className="text-sm mt-1">Your property is in great shape!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {issues.map(issue => {
                  const cfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.Open
                  return (
                    <motion.div key={issue.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{issue.title}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.bg}`}>{issue.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">{issue.description}</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs bg-gray-100 dark:bg-[#2A2A2A] text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{issue.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${issue.priority === 'High' || issue.priority === 'Emergency' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300' : 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-600 dark:text-gray-400'}`}>{issue.priority}</span>
                        <span className="text-xs text-gray-400 ml-auto">{formatDate(issue.createdAt)}</span>
                      </div>
                      {issue.adminNote && (
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[#2A2A2A] text-xs text-brand-600 dark:text-brand-400">
                          <span className="font-semibold">Admin: </span>{issue.adminNote}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
