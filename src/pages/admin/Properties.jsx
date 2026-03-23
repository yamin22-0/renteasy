import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Eye, Pencil, Trash2, BadgeCheck } from 'lucide-react'
import { useHouses } from '../../hooks/useApi'
import { formatKES, formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function AdminProperties() {
  const { data: houses = [], isLoading, removeMutation } = useHouses({})
  const [deleted, setDeleted] = useState({})
  const timers = useRef({})

  const handleDelete = (house) => {
    const timer = setTimeout(() => {
      removeMutation.mutate(house.id)
      setDeleted(d => { const n = { ...d }; delete n[house.id]; return n })
      delete timers.current[house.id]
    }, 5000)

    timers.current[house.id] = timer
    setDeleted(d => ({ ...d, [house.id]: true }))
    toast(
      (t) => (
        <span className="flex items-center gap-3">
          Property deleted
          <button
            onClick={() => {
              clearTimeout(timers.current[house.id])
              delete timers.current[house.id]
              setDeleted(d => { const n = { ...d }; delete n[house.id]; return n })
              toast.dismiss(t.id)
            }}
            className="text-brand-400 font-bold hover:underline"
          >
            Undo
          </button>
        </span>
      ),
      { duration: 5000 }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Properties</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{houses.length} total properties</p>
        </div>
        <Link to="/admin/properties/add" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Property
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#2A2A2A]">
              <tr>
                {['Property', 'Location', 'Type', 'Price', 'Status', 'Added', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-24 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : houses.filter(h => !deleted[h.id]).map(house => (
                <motion.tr
                  key={house.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={house.images?.[0]}
                        alt={house.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                        onError={e => e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=40'}
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-xs flex items-center gap-1 max-w-[160px] truncate">
                          {house.title}
                          {house.verified && <BadgeCheck size={12} className="text-brand-500 shrink-0" />}
                        </div>
                        <div className="text-xs text-gray-400">{house.bedrooms}bd/{house.bathrooms}ba</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs max-w-[120px] truncate">{house.location}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{house.type}</td>
                  <td className="px-4 py-3 font-mono text-brand-600 dark:text-brand-400 font-semibold text-xs">{formatKES(house.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${house.status === 'Available' ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300' : 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-500'}`}>
                      {house.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(house.dateAdded)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link to={`/house/${house.id}`} target="_blank" className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all">
                        <Eye size={14} />
                      </Link>
                      <Link to={`/admin/properties/edit/${house.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => handleDelete(house)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
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
    </div>
  )
}