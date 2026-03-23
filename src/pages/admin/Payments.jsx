import { motion } from 'framer-motion'
import { CreditCard, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { usePayments, useUsers, useRentals } from '../../hooks/useApi'
import { formatKES, formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function AdminPayments() {
  const { data: payments = [], isLoading, editMutation } = usePayments({})
  const { data: tenants = [] } = useUsers()
  const { data: rentals = [] } = useRentals({})

  const completed = payments.filter(p => p.status === 'Completed')
  const pending = payments.filter(p => p.status === 'Pending')
  const totalCollected = completed.reduce((s, p) => s + p.amount, 0)
  const totalPending = pending.reduce((s, p) => s + p.amount, 0)

  const stats = [
    { label: 'Total Collected', value: formatKES(totalCollected), icon: CheckCircle2, color: 'bg-brand-500' },
    { label: 'Held in Escrow', value: formatKES(totalPending), icon: Clock, color: 'bg-amber-500' },
    { label: 'Completed', value: completed.length, icon: CreditCard, color: 'bg-blue-500' },
  ]

  const releaseEscrow = (payment) => {
    editMutation.mutate(
      { id: payment.id, status: 'Completed', escrowStatus: 'Released' },
      { onSuccess: () => toast.success(`Escrow released — ${formatKES(payment.amount)} sent to landlord`) }
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{payments.length} total transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div className="font-mono text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{s.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Pending escrow — needs action */}
      {pending.length > 0 && (
        <div>
          <h2 className="font-semibold text-amber-600 dark:text-amber-400 text-sm mb-3 flex items-center gap-2">
            <Clock size={15} /> Held in Escrow — Awaiting Release
          </h2>
          <div className="space-y-3">
            {pending.map((p, i) => {
              const tenant = tenants.find(t => t.id === p.tenantId || t.id === Number(p.tenantId))
              const rental = rentals.find(r => r.id === p.rentalId || r.id === Number(p.rentalId))
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Clock size={18} className="text-amber-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                          {tenant?.name || `Tenant #${p.tenantId}`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {formatDate(p.date)} · {p.method} · {p.transactionId}
                        </div>
                        {rental && (
                          <div className="text-xs text-gray-400 mt-0.5">Rental #{rental.id}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-mono text-xl font-bold text-amber-600 dark:text-amber-400">
                        {formatKES(p.amount)}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => releaseEscrow(p)}
                        disabled={editMutation.isPending}
                        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                      >
                        Release Funds <ArrowRight size={14} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Full history table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-[#2A2A2A]">
          <h2 className="font-semibold text-gray-900 dark:text-white">All Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#2A2A2A]">
              <tr>
                {['Date', 'Tenant', 'Method', 'Amount', 'Transaction ID', 'Escrow', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({length: 8}).map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-20 rounded" /></td>)}</tr>
                ))
              ) : payments.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No payments yet</td></tr>
              ) : payments.map((p, i) => {
                const tenant = tenants.find(t => t.id === p.tenantId || t.id === Number(p.tenantId))
                return (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(p.date)}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{tenant?.name || `#${p.tenantId}`}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.method}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-brand-600 dark:text-brand-400">{formatKES(p.amount)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.transactionId}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.escrowStatus === 'Released'
                          ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      }`}>
                        {p.escrowStatus || 'Held'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.status === 'Completed'
                          ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'Pending' && (
                        <button
                          onClick={() => releaseEscrow(p)}
                          disabled={editMutation.isPending}
                          className="text-xs text-brand-500 hover:text-brand-600 font-semibold hover:underline disabled:opacity-50"
                        >
                          Release
                        </button>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}