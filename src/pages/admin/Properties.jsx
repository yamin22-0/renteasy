import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, Search, X, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useHouses } from '../../hooks/useApi'
import { formatKES } from '../../utils/formatters'
import toast from 'react-hot-toast'

function DeleteConfirmModal({ onClose, onConfirm }) {
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
        className="card p-6 w-full max-w-md"
      >
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">Delete Property</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          Are you sure you want to delete this property? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all">Delete</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StatusBadge({ status }) {
  if (status === 'Available') {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300">
        <CheckCircle size={10} /> Available
      </span>
    )
  }
  if (status === 'Rented') {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300">
        <XCircle size={10} /> Rented
      </span>
    )
  }
  if (status === 'Pending') {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
        <Clock size={10} /> Pending
      </span>
    )
  }
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#2A2A2A] text-gray-500">
      {status || 'Unknown'}
    </span>
  )
}

export default function AdminProperties() {
  const navigate = useNavigate()
  const { data: houses = [], isLoading, deleteMutation } = useHouses({})
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deletedId, setDeletedId] = useState(null)
  const [undoTimeout, setUndoTimeout] = useState(null)

  const filtered = houses.filter(h => 
    h.title?.toLowerCase().includes(search.toLowerCase()) ||
    h.location?.toLowerCase().includes(search.toLowerCase()) ||
    h.county?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    const houseToDelete = houses.find(h => h.id === id)
    setDeletedId(id)
    setDeleteId(null)
    
    // Show undo toast
    toast.success('Property deleted', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          // Clear timeout and restore
          if (undoTimeout) clearTimeout(undoTimeout)
          setDeletedId(null)
          toast.success('Restored successfully')
        }
      }
    })
    
    // Actually delete after 5 seconds if not undone
    const timeout = setTimeout(async () => {
      if (deletedId === id) {
        try {
          await deleteMutation.mutateAsync(id)
          toast.success('Property permanently deleted')
          setDeletedId(null)
        } catch (error) {
          toast.error('Failed to delete property')
          setDeletedId(null)
        }
      }
    }, 5000)
    
    setUndoTimeout(timeout)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Properties</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {filtered.length} total properties • {houses.filter(h => h.status === 'Available').length} available
          </p>
        </div>
        <Link
          to="/admin/properties/add"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          <Plus size={16} /> Add Property
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, location, or county..."
          className="input-field pl-9"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          No properties found
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#2A2A2A] border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filtered.map((house) => (
                  <motion.tr
                    key={house.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors ${deletedId === house.id ? 'opacity-50 line-through' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={house.images?.[0]}
                          alt={house.title}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={e => e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=60'}
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-sm">{house.title}</div>
                          <div className="text-xs text-gray-500">{house.bedrooms} bed • {house.bathrooms} bath</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs max-w-[120px] truncate">{house.location}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{house.type}</td>
                    <td className="px-4 py-3 font-mono text-brand-600 dark:text-brand-400 font-semibold text-xs">{formatKES(house.price)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={house.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/house/${house.id}`)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/properties/edit/${house.id}`)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(house.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Delete"
                          disabled={deletedId === house.id}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {deleteId && (
          <DeleteConfirmModal
            onClose={() => setDeleteId(null)}
            onConfirm={() => handleDelete(deleteId)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}