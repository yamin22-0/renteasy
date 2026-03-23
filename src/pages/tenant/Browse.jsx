import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutGrid, Map as MapIcon } from 'lucide-react'
import Navbar from '../../components/shared/Navbar'
import FilterBar from '../../components/shared/FilterBar'
import PropertyCard from '../../components/shared/PropertyCard'
import { SkeletonGrid } from '../../components/shared/SkeletonCard'
import EmptyState from '../../components/shared/EmptyState'
import { useHouses } from '../../hooks/useApi'
import { Home } from 'lucide-react'
import MapView from '../../components/tenant/MapView'

export default function Browse() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    county: searchParams.get('county') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: '',
    type: '',
    minPrice: '',
    status: '',
  })
  const [view, setView] = useState('grid')
  const { data: houses = [], isLoading } = useHouses(filters)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0C]">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Browse Properties</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Find your perfect home across Kenya</p>
        </div>

        <FilterBar onChange={setFilters} />

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isLoading ? 'Loading...' : <><span className="font-semibold text-gray-900 dark:text-white">{houses.length}</span> properties found</>}
          </span>
          <div className="flex items-center gap-1 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-1">
            <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]'}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setView('map')} className={`p-2 rounded-lg transition-all ${view === 'map' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]'}`}>
              <MapIcon size={16} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <SkeletonGrid count={9} />
        ) : houses.length === 0 ? (
          <EmptyState
            icon={Home}
            title="No properties found"
            description="Try adjusting your filters or search a different county."
            cta="Clear Filters"
            ctaHref="/browse"
          />
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {houses.map((house, i) => (
              <motion.div
                key={house.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <PropertyCard house={house} />
              </motion.div>
            ))}
          </div>
        ) : (
          <MapView houses={houses} />
        )}
      </div>
    </div>
  )
}
