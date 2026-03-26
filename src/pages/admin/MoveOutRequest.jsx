import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DoorOpen, Check, X, Clock, AlertCircle, MapPin, Calendar,
  MessageSquare, User, Home, Eye, ChevronRight, Send, RefreshCw
} from 'lucide-react'
import { 
  useMoveOutRequests, useEditMoveOutRequest, 
  useRenewalRequests, useEditRenewalRequest, 
  useRentals, useHouses, useUsers 
} from '../../hooks/useApi'
import { formatDate, formatKES } from '../../utils/formatters'
import toast from 'react-hot-toast'

function RequestModal({ request, type, onClose, onApprove, onReject }) {
  const [note, setNote] = useState('')
  
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
        <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-4">
          {type === 'moveout' ? 'Process Move-Out Request' : 'Process Renewal Request'}
        </h3>
        
        <div className="space-y-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Requested:</span>
            <span className="font-medium">{formatDate(request.requestDate)}</span>
          </div>
          {type === 'moveout' && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Requested Move-Out:</span>
                <span className="font-medium text-orange-600">{formatDate(request.moveOutDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Reason:</span>
                <span className="font-medium">{request.reason}</span>
              </div>
              {request.inspectionRequested && (
                <div className="text-sm text-blue-600">✓ Final inspection requested</div>
              )}
              {request.forwardingAddress && (
                <div className="text-sm">
                  <span className="text-gray-500">Forwarding Address:</span>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">{request.forwardingAddress}</p>
                </div>
              )}
            </>
          )}
          {type === 'renewal' && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current Rent:</span>
                <span className="font-mono font-bold">{formatKES(request.currentRent)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Suggested Rent:</span>
                <span className="font-mono font-bold text-brand-600">{formatKES(request.suggestedRent)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Requested Duration:</span>
                <span className="font-medium">{request.duration} months</span>
              </div>
            </>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Admin Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder="Add a note about this request..."
            className="input-field resize-none"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={() => onReject(request.id, note)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all order-3 sm:order-none">
            <X size={16} className="inline mr-1" /> Reject
          </button>
          <button onClick={() => onApprove(request.id, note)} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all">
            <Check size={16} className="inline mr-1" /> Approve
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function AdminMoveOutRequests() {
  const { data: moveOutRequests = [], isLoading: moveOutLoading } = useMoveOutRequests({})
  const { data: renewalRequests = [], isLoading: renewalLoading } = useRenewalRequests({})
  const editMoveOut = useEditMoveOutRequest()
  const editRenewal = useEditRenewalRequest()

  const { data: rentals = [], editMutation: editRental } = useRentals({})
  const { data: houses = [], editMutation: editHouse } = useHouses({})
  const { data: users = [] } = useUsers()
  
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [requestType, setRequestType] = useState(null)
  const [activeTab, setActiveTab] = useState('moveout')
  
  const pendingMoveOut = moveOutRequests.filter(r => r.status === 'pending')
  const processedMoveOut = moveOutRequests.filter(r => r.status !== 'pending')
  const pendingRenewal = renewalRequests.filter(r => r.status === 'pending')
  const processedRenewal = renewalRequests.filter(r => r.status !== 'pending')
  
  const handleApprove = async (id, note) => {
    try {
      if (activeTab === 'moveout') {
        const request = moveOutRequests.find(r => r.id === id)
        
        // Update the rental status to 'ended'
        const rental = rentals.find(r => r.id === request.rentalId)
        if (rental) {
          await editRental.mutateAsync({ id: rental.id, status: 'Ended' })
        }

        // Update house to Available
        const house = houses.find(h => h.id === request.houseId)
        if (house) {
          await editHouse.mutateAsync({ ...house, status: 'Available' })
        }
        
        await editMoveOut.mutateAsync({
          id,
          status: 'approved',
          adminNote: note,
          processedDate: new Date().toISOString()
        })
        toast.success('Move-out request approved')
      } else {
        const request = renewalRequests.find(r => r.id === id)
        
        // Update rental with new end date and price
        const rental = rentals.find(r => r.id === request.rentalId)
        if (rental) {
          const newEndDate = new Date(rental.endDate)
          newEndDate.setMonth(newEndDate.getMonth() + Number(request.duration))
          
          await editRental.mutateAsync({ 
            id: rental.id, 
            endDate: newEndDate.toISOString().split('T')[0],
            price: request.suggestedRent || rental.price,
            renewals: (rental.renewals || 0) + 1
          })
        }
        
        await editRenewal.mutateAsync({
          id,
          status: 'approved',
          adminNote: note,
          processedDate: new Date().toISOString()
        })
        toast.success('Renewal request approved')
      }
      setSelectedRequest(null)
    } catch (error) {
      toast.error('Failed to process request')
    }
  }
  
  const handleReject = async (id, note) => {
    try {
      if (activeTab === 'moveout') {
        await editMoveOut.mutateAsync({
          id,
          status: 'rejected',
          adminNote: note,
          processedDate: new Date().toISOString()
        })
        toast.success('Move-out request rejected')
      } else {
        await editRenewal.mutateAsync({
          id,
          status: 'rejected',
          adminNote: note,
          processedDate: new Date().toISOString()
        })
        toast.success('Renewal request rejected')
      }
      setSelectedRequest(null)
    } catch (error) {
      toast.error('Failed to process request')
    }
  }
  
  const renderMoveOutCard = (request) => {
    const rental = rentals.find(r => r.id === request.rentalId)
    const house = houses.find(h => h.id === request.houseId)
    const tenant = users.find(u => u.id === request.tenantId)
    
    return (
      <motion.div
        key={request.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
            <DoorOpen size={20} className="text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {house?.title || `Property #${request.houseId}`}
                </h3>
                <div className="text-sm text-gray-500">{house?.location}</div>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                request.status === 'pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700' :
                request.status === 'approved' ? 'bg-green-100 dark:bg-green-500/20 text-green-700' :
                'bg-red-100 dark:bg-red-500/20 text-red-700'
              }`}>
                {request.status === 'pending' ? 'Pending' : request.status === 'approved' ? 'Approved' : 'Rejected'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm">
              <div>
                <div className="text-xs text-gray-500">Tenant</div>
                <div className="font-medium">{tenant?.name || `Tenant #${request.tenantId}`}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Requested Move-Out</div>
                <div className="font-medium text-orange-600">{formatDate(request.moveOutDate)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Reason</div>
                <div className="text-sm">{request.reason}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Request Date</div>
                <div className="text-sm">{formatDate(request.requestDate)}</div>
              </div>
            </div>
            
            {request.inspectionRequested && (
              <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                <Check size={12} /> Final inspection requested
              </div>
            )}
            
            {request.adminNote && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                <span className="text-xs text-gray-500">Admin Note:</span>
                <p className="text-gray-700 dark:text-gray-300">{request.adminNote}</p>
              </div>
            )}
            
            {request.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setSelectedRequest(request)
                    setRequestType('moveout')
                  }}
                  className="flex-1 flex items-center justify-center gap-1 bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                >
                  <Check size={14} /> Process Request
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }
  
  const renderRenewalCard = (request) => {
    const rental = rentals.find(r => r.id === request.rentalId)
    const house = houses.find(h => h.id === request.houseId)
    const tenant = users.find(u => u.id === request.tenantId)
    
    return (
      <motion.div
        key={request.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
            <RefreshCw size={20} className="text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {house?.title || `Property #${request.houseId}`}
                </h3>
                <div className="text-sm text-gray-500">{house?.location}</div>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                request.status === 'pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700' :
                request.status === 'approved' ? 'bg-green-100 dark:bg-green-500/20 text-green-700' :
                'bg-red-100 dark:bg-red-500/20 text-red-700'
              }`}>
                {request.status === 'pending' ? 'Pending' : request.status === 'approved' ? 'Approved' : 'Rejected'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm">
              <div>
                <div className="text-xs text-gray-500">Tenant</div>
                <div className="font-medium">{tenant?.name || `Tenant #${request.tenantId}`}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Current Rent</div>
                <div className="font-mono">{formatKES(request.currentRent)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Suggested Rent</div>
                <div className="font-mono text-brand-600">{formatKES(request.suggestedRent)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">New Duration</div>
                <div className="font-medium">{request.duration} months</div>
              </div>
            </div>
            
            {request.adminNote && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                <span className="text-xs text-gray-500">Admin Note:</span>
                <p className="text-gray-700 dark:text-gray-300">{request.adminNote}</p>
              </div>
            )}
            
            {request.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setSelectedRequest(request)
                    setRequestType('renewal')
                  }}
                  className="flex-1 flex items-center justify-center gap-1 bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                >
                  <Check size={14} /> Process Request
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }
  
  if (moveOutLoading || renewalLoading) {
    return <div className="space-y-4">{/* Loading skeletons */}</div>
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Lease Requests</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage move-out and renewal requests from tenants
        </p>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('moveout')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'moveout'
              ? 'text-brand-500 border-b-2 border-brand-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Move-Out Requests ({pendingMoveOut.length})
        </button>
        <button
          onClick={() => setActiveTab('renewal')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'renewal'
              ? 'text-brand-500 border-b-2 border-brand-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Renewal Requests ({pendingRenewal.length})
        </button>
      </div>
      
      {/* Pending Requests */}
      {(activeTab === 'moveout' ? pendingMoveOut : pendingRenewal).length > 0 && (
        <div>
          <h2 className="font-semibold text-amber-600 dark:text-amber-400 text-sm mb-3 flex items-center gap-2">
            <Clock size={15} /> Pending Requests
          </h2>
          <div className="space-y-3">
            {activeTab === 'moveout' 
              ? pendingMoveOut.map(renderMoveOutCard)
              : pendingRenewal.map(renderRenewalCard)
            }
          </div>
        </div>
      )}
      
      {/* Processed Requests */}
      {(activeTab === 'moveout' ? processedMoveOut : processedRenewal).length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-600 dark:text-gray-400 text-sm mb-3">Processed Requests</h2>
          <div className="space-y-3">
            {activeTab === 'moveout' 
              ? processedMoveOut.map(renderMoveOutCard)
              : processedRenewal.map(renderRenewalCard)
            }
          </div>
        </div>
      )}
      
      {activeTab === 'moveout' && moveOutRequests.length === 0 && (
        <div className="card p-8 text-center text-gray-400">
          <DoorOpen size={48} className="mx-auto mb-3 opacity-50" />
          <p>No move-out requests yet</p>
        </div>
      )}
      
      {activeTab === 'renewal' && renewalRequests.length === 0 && (
        <div className="card p-8 text-center text-gray-400">
          <RefreshCw size={48} className="mx-auto mb-3 opacity-50" />
          <p>No renewal requests yet</p>
        </div>
      )}
      
      <AnimatePresence>
        {selectedRequest && (
          <RequestModal
            request={selectedRequest}
            type={requestType}
            onClose={() => setSelectedRequest(null)}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>
    </div>
  )
}