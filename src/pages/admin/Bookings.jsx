import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock } from 'lucide-react'
import { useBookings, useHouses, useUsers, useRentals, usePayments, useIssues } from '../../hooks/useApi'
import { formatKES, formatDate, calculateRentScore } from '../../utils/formatters'
import toast from 'react-hot-toast'

function RentScoreBadge({ score }) {
  const color = score >= 80 ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300' :
    score >= 60 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' :
    'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>Score {score}</span>
}

function RejectModal({ onClose, onConfirm }) {
  const [note, setNote] = useState('')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={e => e.stopPropagation()} className="card p-6 w-full max-w-md">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Rejection Note (Optional)</h3>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Reason for rejection..." className="input-field mb-4 resize-none" />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={() => onConfirm(note)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.97]">Reject</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function AdminBookings() {
  const { data: bookings = [], isLoading, editMutation } = useBookings({})
  const { data: houses = [], editMutation: editHouse } = useHouses({})
  const { data: users = [] } = useUsers()
  const { data: allRentals = [], addMutation: addRental, deleteMutation: deleteRental } = useRentals({})
  const { data: allPayments = [] } = usePayments({})
  const { data: allIssues = [] } = useIssues({})
  const [rejectId, setRejectId] = useState(null)

  const pending = bookings.filter(b => b.status === 'Pending')
  const other = bookings.filter(b => b.status !== 'Pending')

  const approve = (booking) => {
    editMutation.mutate({ id: booking.id, status: 'Approved' }, {
      onSuccess: () => {
        // Mark the house as Rented
        const house = houses.find(h => h.id === booking.houseId)
        if (house) editHouse.mutate({ ...house, id: house.id, status: 'Rented' })
        // Create a rental record
        const startDate = booking.moveInDate || new Date().toISOString().split('T')[0]
        const endDate = new Date(new Date(startDate).setFullYear(new Date(startDate).getFullYear() + 1)).toISOString().split('T')[0]
        addRental.mutate({
          tenantId: booking.tenantId,
          houseId: booking.houseId,
          bookingId: booking.id,
          startDate,
          endDate,
          price: booking.price,
          status: 'active',
          renewals: 0,
        }, {
          onSuccess: () => toast.success('Booking approved & rental created!')
        })
      }
    })
  }

  const reject = (id, note) => {
    const booking = bookings.find(b => b.id === id)
    const linkedRental = allRentals.find(r => r.bookingId === id)
    editMutation.mutate({ id, status: 'Rejected', rejectionNote: note || null }, {
      onSuccess: () => {
        // Free up the house back to Available
        if (booking) {
          const house = houses.find(h => h.id === booking.houseId)
          if (house) editHouse.mutate({ ...house, id: house.id, status: 'Available' })
        }
        if (linkedRental) deleteRental.mutate(linkedRental.id)
        toast.success('Booking rejected')
        setRejectId(null)
      }
    })
  }

  const renderCard = (b) => {
    const house = houses.find(h => h.id === b.houseId)
    const tenant = users.find(u => u.id === b.tenantId)
    const tenantPayments = allPayments.filter(p => p.tenantId === b.tenantId)
    const tenantRentals = allRentals.filter(r => r.tenantId === b.tenantId)
    const tenantIssues = allIssues.filter(i => i.tenantId === b.tenantId)
    const score = calculateRentScore(tenantPayments, tenantRentals, tenantIssues)

    return (
      <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
        <div className="flex gap-4">
          {house && (
            <img src={house.images?.[0]} alt={house.title} className="w-20 h-16 rounded-xl object-cover shrink-0" onError={e => e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=60'} />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">{house?.title || `House #${b.houseId}`}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{house?.location}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {b.status === 'Pending' && (
                  <span className="flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending Review
                  </span>
                )}
                {b.status === 'Approved' && <span className="text-xs bg-brand-100 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full font-semibold">Approved</span>}
                {b.status === 'Rejected' && <span className="text-xs bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-semibold">Rejected</span>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
              <RentScoreBadge score={score} />
              <span className="text-gray-600 dark:text-gray-400">{tenant?.name || `Tenant #${b.tenantId}`}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">Move-in: {formatDate(b.moveInDate)}</span>
              <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{formatKES(b.price)}/mo</span>
            </div>
            {b.status === 'Pending' && (
              <div className="flex gap-2">
                <button onClick={() => approve(b)} className="flex items-center gap-1 text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-all">
                  <Check size={12} /> Approve
                </button>
                <button onClick={() => setRejectId(b.id)} className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-all">
                  <X size={12} /> Reject
                </button>
              </div>
            )}
            {b.rejectionNote && (
              <p className="text-xs text-red-500 mt-1">Note: {b.rejectionNote}</p>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Bookings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{pending.length} pending review</p>
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="font-semibold text-amber-600 dark:text-amber-400 text-sm mb-3 flex items-center gap-2">
            <Clock size={15} /> Pending Review
          </h2>
          <div className="space-y-3">{pending.map(renderCard)}</div>
        </div>
      )}

      {other.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-600 dark:text-gray-400 text-sm mb-3">All Bookings</h2>
          <div className="space-y-3">{other.map(renderCard)}</div>
        </div>
      )}

      {!isLoading && bookings.length === 0 && (
        <div className="card p-8 text-center text-gray-400">No bookings yet</div>
      )}

      <AnimatePresence>
        {rejectId && <RejectModal onClose={() => setRejectId(null)} onConfirm={(note) => reject(rejectId, note)} />}
      </AnimatePresence>
    </div>
  )
}