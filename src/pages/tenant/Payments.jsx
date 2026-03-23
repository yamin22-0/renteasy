import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Smartphone, CreditCard, Building2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import Navbar from '../../components/shared/Navbar'
import { useAuth } from '../../context/AuthContext'
import { usePayments, useRentals } from '../../hooks/useApi'
import { formatKES, formatDate, generateTransactionId } from '../../utils/formatters'
import toast from 'react-hot-toast'

const METHODS = [
  { id: 'M-Pesa', icon: Smartphone, label: 'M-Pesa', color: 'text-brand-500' },
  { id: 'Airtel Money', icon: Smartphone, label: 'Airtel Money', color: 'text-red-500' },
  { id: 'Bank Transfer', icon: Building2, label: 'Bank Transfer', color: 'text-blue-500' },
]

const ESCROW_STEPS = [
  { label: 'Payment Sent', desc: 'Your payment has been received.' },
  { label: 'Held in Escrow', desc: 'Funds secured for 24 hours.' },
  { label: 'Funds Released', desc: 'Landlord receives payment.' },
]

export default function Payments() {
  const { user } = useAuth()
  const { data: payments = [], isLoading, addMutation } = usePayments({ tenantId: user?.id })
  const { data: rentals = [] } = useRentals({ tenantId: user?.id })
  const [method, setMethod] = useState('M-Pesa')
  const [phone, setPhone] = useState('')
  const [paying, setPaying] = useState(false)

  const activeRental = rentals[0]
  const amountDue = activeRental?.price || 0

  // Most recent payment drives the escrow display
  const latestPayment = payments[payments.length - 1]
  const escrowStep = !latestPayment ? 0
    : latestPayment.escrowStatus === 'Released' ? 3
    : latestPayment.escrowStatus === 'Held' ? 2
    : 1

  const handlePay = async () => {
    if (!activeRental) { toast.error('No active rental found'); return }
    if (method !== 'Bank Transfer' && !phone) { toast.error('Enter your phone number'); return }
    setPaying(true)
    try {
      await addMutation.mutateAsync({
        rentalId: activeRental.id,
        tenantId: user.id,
        amount: amountDue,
        method,
        transactionId: generateTransactionId(),
        status: 'Pending',
        escrowStatus: 'Held',
        date: new Date().toISOString().split('T')[0],
      })
      toast.success('Payment submitted! Funds held in escrow — awaiting admin release.')
    } catch {
      toast.error('Payment failed')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0C]">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Pay rent securely via M-Pesa escrow</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Form */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Make a Payment</h2>
              <span className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded-full font-semibold">
                <Shield size={12} /> Escrow Protected
              </span>
            </div>

            <div className="bg-gray-50 dark:bg-[#2A2A2A] rounded-xl p-4 mb-5">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Amount Due</div>
              <div className="font-mono text-3xl font-bold text-brand-600 dark:text-brand-400">{formatKES(amountDue)}</div>
              <div className="text-xs text-gray-400 mt-1">Monthly rent — {activeRental ? `Rental #${activeRental.id}` : 'No active rental'}</div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</div>
              <div className="grid grid-cols-3 gap-2">
                {METHODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${method === m.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-gray-200 dark:border-[#3A3A3A] hover:border-gray-300 dark:hover:border-[#4A4A4A]'}`}
                  >
                    <m.icon size={20} className={`mx-auto mb-1 ${method === m.id ? 'text-brand-500' : 'text-gray-400'}`} />
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">{m.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {method !== 'Bank Transfer' ? (
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="input-field"
                />
              </div>
            ) : (
              <div className="mb-5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">Bank Transfer Details</p>
                <p>Bank: Equity Bank Kenya</p>
                <p>Account: 0100XXXXXXX</p>
                <p>Reference: RENT-{user?.id}-{activeRental?.id}</p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePay}
              disabled={paying || !activeRental}
              className="btn-primary w-full py-3"
            >
              {paying ? 'Processing...' : `Pay ${formatKES(amountDue)}`}
            </motion.button>
          </div>

          {/* Escrow Flow */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Escrow Flow</h2>
            <div className="space-y-1 mb-6">
              {ESCROW_STEPS.map((step, i) => (
                <div key={i}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${
                      i < escrowStep ? 'bg-brand-500' :
                      i === escrowStep ? 'bg-brand-100 dark:bg-brand-500/20 border-2 border-brand-500' :
                      'bg-gray-100 dark:bg-[#2A2A2A]'
                    }`}>
                      {i < escrowStep ? (
                        <CheckCircle2 size={20} className="text-white" />
                      ) : i === escrowStep ? (
                        <Clock size={18} className="text-brand-500 animate-pulse" />
                      ) : (
                        <span className="text-gray-400 text-sm font-bold">{i + 1}</span>
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold text-sm ${i <= escrowStep ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step.label}</div>
                      <div className="text-xs text-gray-400">{step.desc}</div>
                    </div>
                  </div>
                  {i < ESCROW_STEPS.length - 1 && (
                    <div className={`ml-5 w-0.5 h-6 transition-all duration-500 ${i < escrowStep ? 'bg-brand-500' : 'bg-gray-200 dark:bg-[#3A3A3A]'}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gray-50 dark:bg-[#2A2A2A] rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <Shield size={16} className="text-brand-500 inline mr-2" />
              Your payment is held securely for 24 hours. If the landlord fails to confirm your tenancy, funds are returned within 48 hours.
            </div>

            <button className="btn-outline w-full text-sm flex items-center justify-center gap-2">
              <AlertCircle size={14} /> Raise a Dispute
            </button>
          </div>
        </div>

        {/* Payment History */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-[#2A2A2A]">
            <h2 className="font-semibold text-gray-900 dark:text-white">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-[#2A2A2A]">
                <tr>
                  {['Date', 'Method', 'Amount', 'Transaction ID', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No payments yet</td></tr>
                ) : (
                  payments.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(p.date)}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{p.method}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-brand-600 dark:text-brand-400">{formatKES(p.amount)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.transactionId}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.status === 'Completed' ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}