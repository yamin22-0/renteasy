import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Bed, Bath, Star, Heart, BadgeCheck, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatKES } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'
import { useFavorites } from '../../hooks/useApi'
import toast from 'react-hot-toast'

export default function PropertyCard({ house }) {
  const { user } = useAuth()
  const { data: favs, toggleMutation } = useFavorites(user?.id)
  const isFav = favs?.some(f => f.houseId === house.id)

  const handleFav = (e) => {
    e.preventDefault()
    if (!user) { toast.error('Login to save favorites'); return }
    if (user.role !== 'tenant') return
    toggleMutation.mutate({ houseId: house.id }, {
      onSuccess: ({ added }) => toast.success(added ? 'Added to favorites' : 'Removed from favorites'),
    })
  }

  // Get status badge with PascalCase
  const getStatusBadge = () => {
    const status = house.status?.toLowerCase() || 'available'
    
    switch (status) {
      case 'available':
        return {
          text: 'Available',
          color: 'bg-green-500',
          icon: <CheckCircle size={12} className="mr-1" />
        }
      case 'rented':
        return {
          text: 'Rented',
          color: 'bg-red-500',
          icon: <XCircle size={12} className="mr-1" />
        }
      case 'Pending':
        return {
          text: 'Pending', // Assuming pending is always PascalCase
          color: 'bg-amber-500',
          icon: <Clock size={12} className="mr-1" />
        }
      default:
        return {
          text: house.status || 'Available',
          color: 'bg-gray-500',
          icon: null
        }
    }
  }

  const statusBadge = getStatusBadge()

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15 }}>
      <Link to={`/house/${house.id}`} className="card block overflow-hidden group">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={house.images?.[0]}
            alt={house.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=60' }}
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            {/* Status Badge */}
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadge.color} text-white flex items-center gap-1`}>
              {statusBadge.icon}
              {statusBadge.text}
            </span>
            {house.popular && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-500 text-white flex items-center gap-1">
                <TrendingUp size={10} /> Popular
              </span>
            )}
          </div>
          {user?.role === 'tenant' && (
            <button
              onClick={handleFav}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-[#1A1A1A]/90 flex items-center justify-center shadow transition-all hover:scale-110"
            >
              <Heart size={15} className={isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 flex-1">
              {house.title}
            </h3>
            {house.verified && (
              <BadgeCheck size={16} className="text-brand-500 shrink-0 mt-0.5" />
            )}
          </div>

          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-3">
            <MapPin size={11} />
            <span className="truncate">{house.location}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
            <span className="flex items-center gap-1"><Bed size={11} /> {house.bedrooms} bed</span>
            <span className="flex items-center gap-1"><Bath size={11} /> {house.bathrooms} bath</span>
            <span className="flex items-center gap-1 ml-auto">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span>{house.rating || '4.5'}</span>
            </span>
          </div>

          <div className="font-mono font-bold text-brand-600 dark:text-brand-400 text-sm">
            {formatKES(house.price)}
            <span className="text-xs font-sans font-normal text-gray-400">/mo</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}