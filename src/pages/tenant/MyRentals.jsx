import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Navbar from '../../components/shared/Navbar'
import EmptyState from '../../components/shared/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { useRentals, useHouses, usePayments, useIssues } from '../../hooks/useApi'
import { formatKES, formatDate, calculateRentScore, daysUntil } from '../../utils/formatters'
import toast from 'react-hot-toast'

function RentScoreCard({ score }) {
  const radius = 52
  const circ = 2 * Math.PI * radius
  const dash = (score / 100) * circ

  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'

  return (
    <div className="card p-6 h-full">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-4">RentScore™</h2>
      <div className="flex justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <motion.circle
              cx="60" cy="60" r={radius} fill="none"
              stroke={color} strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ - dash }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-bold text-gray-900 dark:text-white">{score}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">/100</span>
          </div>
        </div>
      </div>
      <div className="text-center mb-4">
        <span className="font-semibold text-sm" style={{ color }}>{label}</span>
      </div>
      <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex justify-between"><span>Base score</span><span className="font-mono">60</span></div>
        <div className="flex justify-between"><span>On-time payments</span><span className="font-mono text-brand-500">+8 each</span></div>
        <div className="flex justify-between"><span>Active rentals</span><span className="font-mono text-brand-500">+5 each</span></div>
        <div className="flex justify-between"><span>Open issues</span><span className="font-mono text-red-500">-3 each</span></div>
      </div>
      {score < 85 && (
        <div className="mt-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300">
          💡 Tip: Pay rent on time and resolve open issues to improve your score.
        </div>
      )}
    </div>
  )
}

export default function MyRentals() {
  const { user } = useAuth()
  const { data: rentals = [], isLoading, editMutation } = useRentals({ tenantId: user?.id })
  const { data: allHouses = [] } = useHouses({})
  const { data: payments = [] } = usePayments({ tenantId: user?.id })
  const { data: issues = [] } = useIssues({ tenantId: user?.id })

  const validRentals = rentals.filter(r => allHouses.find(h => h.id === r.houseId))
  const score = calculateRentScore(payments, validRentals, issues)

  const handleRenew = (rental) => {
    const newEnd = new Date(rental.endDate)
    newEnd.setFullYear(newEnd.getFullYear() + 1)
    editMutation.mutate(
      { id: rental.id, endDate: newEnd.toISOString().split('T')[0], renewals: (rental.renewals || 0) + 1 },
      { onSuccess: () => toast.success('Lease renewed for 1 year!') }
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0C]">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">My Rentals</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your tenancies and track your RentScore</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RentScoreCard score={score} />
          </div>
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="space-y-4">{[1,2].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
            ) : validRentals.length === 0 ? (
              <EmptyState icon={Home} title="No active rentals" description="You don't have any active rentals yet. Browse properties to get started." cta="Browse Properties" ctaHref="/browse" />
            ) : (
              <div className="space-y-4">
                {rentals.filter(rental => allHouses.find(h => h.id === rental.houseId)).map(rental => {
                  const house = allHouses.find(h => h.id === rental.houseId)
                  const daysLeft = daysUntil(rental.endDate)
                  const expiring = daysLeft <= 14 && daysLeft > 0

                  return (
                    <motion.div key={rental.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
                      <div className="flex gap-4">
                        <img src={house.images?.[0]} alt={house.title} className="w-24 h-20 rounded-xl object-cover shrink-0" onError={e => e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=60'} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link to={`/house/${house.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-brand-500 transition-colors text-sm leading-snug">{house.title}</Link>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{house.location}</div>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${rental.status === 'active' ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300' : 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-500'}`}>
                              {rental.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(rental.startDate)} – {formatDate(rental.endDate)}</span>
                            <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{formatKES(rental.price)}/mo</span>
                          </div>
                          {expiring && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400">
                              <AlertTriangle size={12} />
                              <span>Lease expires in {daysLeft} days</span>
                              <button onClick={() => handleRenew(rental)} className="ml-2 flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold hover:bg-amber-600 transition-colors">
                                <RefreshCw size={10} /> Renew
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
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