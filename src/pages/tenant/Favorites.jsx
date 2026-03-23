import { Heart } from 'lucide-react'
import Navbar from '../../components/shared/Navbar'
import PropertyCard from '../../components/shared/PropertyCard'
import EmptyState from '../../components/shared/EmptyState'
import { SkeletonGrid } from '../../components/shared/SkeletonCard'
import { useAuth } from '../../context/AuthContext'
import { useFavorites, useHouses } from '../../hooks/useApi'
import { motion } from 'framer-motion'

export default function Favorites() {
  const { user } = useAuth()
  const { data: favs = [], isLoading: favsLoading } = useFavorites(user?.id)
  const { data: allHouses = [], isLoading: housesLoading } = useHouses({})

  const isLoading = favsLoading || housesLoading
  const favHouses = allHouses.filter(h => favs.some(f => f.houseId === h.id))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0C]">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Saved Properties</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{favHouses.length} saved {favHouses.length === 1 ? 'property' : 'properties'}</p>
        </div>

        {isLoading ? (
          <SkeletonGrid count={6} />
        ) : favHouses.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No saved properties"
            description="Heart any property to save it here for easy access later."
            cta="Browse Properties"
            ctaHref="/browse"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favHouses.map((house, i) => (
              <motion.div key={house.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <PropertyCard house={house} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
