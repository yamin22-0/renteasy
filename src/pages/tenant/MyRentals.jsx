import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Calendar, AlertCircle, CheckCircle, Clock, ChevronRight,
  FileText, MessageSquare, Wrench, TrendingUp, Shield, X,
  CalendarDays, CreditCard, DoorOpen, RefreshCw, Phone, Mail,
  Download, History, Building2, User, Star, ExternalLink, MapPin
} from 'lucide-react'
import { 
  useRentals, useHouses, usePayments, useIssues, 
  useMoveOutRequests, useAddMoveOutRequest, 
  useRenewalRequests, useAddRenewalRequest 
} from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { formatKES, formatDate, calculateRentScore } from '../../utils/formatters'
import toast from 'react-hot-toast'

// Helper function to calculate days remaining
function getDaysRemaining(endDate) {
  const today = new Date()
  const end = new Date(endDate)
  const diffTime = end - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Helper function to get status color based on days remaining
function getRenewalStatus(daysRemaining) {
  if (daysRemaining > 30) return { color: 'bg-green-500', text: 'Healthy', icon: CheckCircle }
  if (daysRemaining > 15) return { color: 'bg-yellow-500', text: 'Getting Close', icon: Clock }
  if (daysRemaining > 7) return { color: 'bg-orange-500', text: 'Due Soon', icon: AlertCircle }
  return { color: 'bg-red-500', text: 'Critical', icon: AlertCircle }
}

// Helper to calculate progress percentage
function getProgressPercentage(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()
  const total = end - start
  const elapsed = today - start
  const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100))
  return Math.floor(percentage)
}

// Move-out Request Modal
function MoveOutModal({ rental, house, onClose, onSubmit }) {
  const [moveOutDate, setMoveOutDate] = useState('')
  const [reason, setReason] = useState('')
  const [inspectionRequest, setInspectionRequest] = useState(false)
  const [forwardingAddress, setForwardingAddress] = useState('')

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 30)
  const minDateStr = minDate.toISOString().split('T')[0]

  const handleSubmit = () => {
    if (!moveOutDate) {
      toast.error('Please select a move-out date')
      return
    }
    if (!reason) {
      toast.error('Please provide a reason for moving out')
      return
    }
    onSubmit({ moveOutDate, reason, inspectionRequest, forwardingAddress })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="card w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">Request Move-Out</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Move-Out Date (30 days minimum notice) *
            </label>
            <input
              type="date"
              value={moveOutDate}
              min={minDateStr}
              onChange={e => setMoveOutDate(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason for Moving Out *
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="input-field"
            >
              <option value="">Select a reason</option>
              <option value="Relocating to another city">Relocating to another city</option>
              <option value="Found a bigger place">Found a bigger place</option>
              <option value="Found a smaller place">Found a smaller place</option>
              <option value="Financial reasons">Financial reasons</option>
              <option value="Job change">Job change</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {reason === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Please specify
              </label>
              <textarea
                value={forwardingAddress}
                onChange={e => setForwardingAddress(e.target.value)}
                rows={2}
                placeholder="Tell us more..."
                className="input-field resize-none"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="inspection"
              checked={inspectionRequest}
              onChange={e => setInspectionRequest(e.target.checked)}
              className="w-4 h-4 text-brand-500 rounded"
            />
            <label htmlFor="inspection" className="text-sm text-gray-700 dark:text-gray-300">
              Request final inspection
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Forwarding Address (for deposit refund)
            </label>
            <textarea
              value={forwardingAddress}
              onChange={e => setForwardingAddress(e.target.value)}
              rows={2}
              placeholder="Enter your new address..."
              className="input-field resize-none"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1">Submit Request</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Renewal Request Modal
function RenewalModal({ rental, house, onClose, onSubmit }) {
  const [duration, setDuration] = useState('12')
  const [suggestedRent, setSuggestedRent] = useState(rental.price)

  const durations = [
    { value: '6', label: '6 Months' },
    { value: '12', label: '1 Year' },
    { value: '24', label: '2 Years' }
  ]

  const handleSubmit = () => {
    onSubmit({ duration: parseInt(duration), suggestedRent })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="card w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">Request Renewal</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-brand-50 dark:bg-brand-500/10 rounded-lg p-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Monthly Rent</div>
            <div className="font-mono text-xl font-bold text-brand-600 dark:text-brand-400">
              {formatKES(rental.price)}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Lease Duration *
            </label>
            <div className="flex gap-2">
              {durations.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    duration === d.value
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Suggested New Rent (Optional)
            </label>
            <input
              type="number"
              value={suggestedRent}
              onChange={e => setSuggestedRent(parseInt(e.target.value))}
              className="input-field font-mono"
              placeholder={`${formatKES(rental.price)}`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to continue with current rent
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1">Request Renewal</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Rental Card Component
function RentalCard({ rental, house, onMoveOut, onRenewal, onReportIssue, moveOutRequest, renewalRequest }) {
  const navigate = useNavigate()
  const daysRemaining = getDaysRemaining(rental.endDate)
  const progressPercent = getProgressPercentage(rental.startDate, rental.endDate)
  const renewalStatus = getRenewalStatus(daysRemaining)
  const StatusIcon = renewalStatus.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Header with Image */}
      <div className="flex flex-col sm:flex-row gap-4 p-5">
        <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={house?.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=60'}
            alt={house?.title}
            className="w-full h-full object-cover"
            onError={e => e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=60'}
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-1">
                {house?.title || `Property #${rental.houseId}`}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <MapPin size={14} />
                <span>{house?.location || 'Location not specified'}</span>
              </div>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${renewalStatus.color} text-white text-xs font-semibold`}>
              <StatusIcon size={10} />
              <span>{renewalStatus.text}</span>
            </div>
          </div>
          
          {/* Request Status Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {moveOutRequest && (
              <div className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded shadow-sm border ${
                moveOutRequest.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                moveOutRequest.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                Move-Out: {moveOutRequest.status}
              </div>
            )}
            {renewalRequest && (
              <div className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded shadow-sm border ${
                renewalRequest.status === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                renewalRequest.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                Renewal: {renewalRequest.status}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500">Monthly Rent</div>
              <div className="font-mono font-bold text-brand-600 dark:text-brand-400">
                {formatKES(rental.price)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Days Remaining</div>
              <div className={`font-semibold ${daysRemaining <= 7 ? 'text-red-500' : daysRemaining <= 30 ? 'text-orange-500' : 'text-green-500'}`}>
                {daysRemaining} days
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{formatDate(rental.startDate)}</span>
              <span>{progressPercent}% Complete</span>
              <span>{formatDate(rental.endDate)}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/house/${house?.id}`)}
              className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink size={12} /> View Property
            </button>
            <button
              onClick={() => navigate(`/payments?houseId=${house?.id}`)}
              className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <CreditCard size={12} /> Payment History
            </button>
            <button
              onClick={() => onReportIssue(house?.id)}
              className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Wrench size={12} /> Report Issue
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer with Action Buttons */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-[#1A1A1A]">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onRenewal}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-semibold transition-all"
          >
            <RefreshCw size={14} /> Request Renewal
          </button>
          <button
            onClick={onMoveOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-all"
          >
            <DoorOpen size={14} /> Request Move-Out
          </button>
          <button
            onClick={() => onReportIssue(house?.id)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-semibold transition-all"
          >
            <AlertCircle size={14} /> Report Problem
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function MyRentals() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: rentals = [], isLoading: rentalsLoading } = useRentals({ tenantId: user?.id })
  const { data: houses = [] } = useHouses({})
  const { data: payments = [] } = usePayments({ tenantId: user?.id })
  const { data: issues = [] } = useIssues({ tenantId: user?.id })
  
  // Fetch Requests to show status back to tenant
  const { data: moveOutRequests = [] } = useMoveOutRequests({ tenantId: user?.id })
  const { data: renewalRequests = [] } = useRenewalRequests({ tenantId: user?.id })

  const addMoveOut = useAddMoveOutRequest()
  const addRenewal = useAddRenewalRequest()
  
  const [moveOutRental, setMoveOutRental] = useState(null)
  const [renewalRental, setRenewalRental] = useState(null)
  
  const activeRentals = rentals.filter(r => r.status === 'active')
  const pastRentals = rentals.filter(r => r.status !== 'active')
  
  // Calculate RentScore
  const tenantPayments = payments
  const tenantRentals = rentals
  const tenantIssues = issues
  const rentScore = useMemo(() => 
    calculateRentScore(tenantPayments, tenantRentals, tenantIssues),
    [tenantPayments, tenantRentals, tenantIssues]
  );
  
  // Stats
  const onTimePayments = tenantPayments.filter(p => p.status === 'completed').length
  const pendingIssues = tenantIssues.filter(i => i.status !== 'Resolved').length
  
  const handleMoveOutRequest = async (rental, data) => {
    try {
      await addMoveOut.mutateAsync({
        rentalId: rental.id,
        houseId: rental.houseId,
        tenantId: user.id,
        ...data
      })
      setMoveOutRental(null)
    } catch (error) {
      // toast handled in useApi
    }
  }
  
  const handleRenewalRequest = async (rental, data) => {
    try {
      await addRenewal.mutateAsync({
        rentalId: rental.id,
        houseId: rental.houseId,
        tenantId: user.id,
        currentRent: rental.price,
        ...data
      })
      setRenewalRental(null)
    } catch (error) {
      // toast handled in useApi
    }
  }
  
  const handleReportIssue = (houseId) => {
    navigate(`/report-issue?houseId=${houseId}`)
  }
  
  if (rentalsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="skeleton h-64 rounded-2xl" />
        ))}
      </div>
    )
  }
  
  if (activeRentals.length === 0 && pastRentals.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Home size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Active Rentals</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          You haven't rented any properties yet.
        </p>
        <Link to="/browse" className="btn-primary inline-flex items-center gap-2">
          Browse Properties <ChevronRight size={16} />
        </Link>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">My Rentals</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage your active leases and rental history
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-500/10 flex items-center justify-center">
              <Home size={20} className="text-brand-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeRentals.length}</div>
              <div className="text-xs text-gray-500">Active Rentals</div>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
              <Star size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{rentScore}</div>
              <div className="text-xs text-gray-500">RentScore™ Rating</div>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <CreditCard size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{onTimePayments}</div>
              <div className="text-xs text-gray-500">On-Time Payments</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Active Rentals */}
      {activeRentals.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Active Leases</h2>
          <div className="space-y-4">
            {activeRentals.map(rental => {
              const house = houses.find(h => h.id === rental.houseId)
              const moveOutReq = moveOutRequests.find(r => r.rentalId === rental.id && r.status === 'pending')
              const renewalReq = renewalRequests.find(r => r.rentalId === rental.id && r.status === 'pending')
              
              return (
                <RentalCard
                  key={rental.id}
                  rental={rental}
                  house={house}
                  moveOutRequest={moveOutReq}
                  renewalRequest={renewalReq}
                  onMoveOut={() => setMoveOutRental(rental)}
                  onRenewal={() => setRenewalRental(rental)}
                  onReportIssue={handleReportIssue}
                />
              )
            })}
          </div>
        </div>
      )}
      
      {/* Past Rentals */}
      {pastRentals.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Past Rentals</h2>
          <div className="space-y-3">
            {pastRentals.map(rental => {
              const house = houses.find(h => h.id === rental.houseId)
              return (
                <div key={rental.id} className="card p-4 opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-4">
                    <img
                      src={house?.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=60'}
                      alt={house?.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{house?.title || `Property #${rental.houseId}`}</h3>
                      <div className="text-sm text-gray-500">{house?.location}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-brand-600">{formatKES(rental.price)}/mo</div>
                      <span className="text-xs text-gray-400">Completed</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Modals */}
      <AnimatePresence>
        {moveOutRental && (
          <MoveOutModal
            rental={moveOutRental}
            house={houses.find(h => h.id === moveOutRental.houseId)}
            onClose={() => setMoveOutRental(null)}
            onSubmit={(data) => handleMoveOutRequest(moveOutRental, data)}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {renewalRental && (
          <RenewalModal
            rental={renewalRental}
            house={houses.find(h => h.id === renewalRental.houseId)}
            onClose={() => setRenewalRental(null)}
            onSubmit={(data) => handleRenewalRequest(renewalRental, data)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}