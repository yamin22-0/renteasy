import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { COUNTIES } from '../../data/counties'

const TYPES = ['Apartment', 'House', 'Bungalow', 'Villa', 'Townhouse', 'Studio', 'Bedsitter', 'Maisonette', 'Penthouse', 'Mansion', 'Cottage']
const BEDS = ['1', '2', '3', '4', '5+']

export default function FilterBar({ onChange }) {
  const [search, setSearch] = useState('')
  const [county, setCounty] = useState('')
  const [type, setType] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [status, setStatus] = useState('')

  const [debouncedSearch] = useDebounce(search, 350)

  useEffect(() => {
    onChange({ search: debouncedSearch, county, type, minPrice, maxPrice, bedrooms: bedrooms === '5+' ? '5' : bedrooms, status })
  }, [debouncedSearch, county, type, minPrice, maxPrice, bedrooms, status])

  const activeCount = [county, type, minPrice, maxPrice, bedrooms, status].filter(Boolean).length

  const reset = () => {
    setSearch(''); setCounty(''); setType(''); setMinPrice(''); setMaxPrice(''); setBedrooms(''); setStatus('')
  }

  return (
    <div className="card p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* Search */}
        <div className="relative xl:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search location, title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        {/* County */}
        <select value={county} onChange={e => setCounty(e.target.value)} className="input-field">
          <option value="">All Counties</option>
          {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Type */}
        <select value={type} onChange={e => setType(e.target.value)} className="input-field">
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Min Price */}
        <input
          type="number"
          placeholder="Min KES"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
          className="input-field font-mono"
        />

        {/* Max Price */}
        <input
          type="number"
          placeholder="Max KES"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          className="input-field font-mono"
        />

        {/* Bedrooms */}
        <div className="flex gap-2">
          <select value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="input-field flex-1">
            <option value="">Beds</option>
            {BEDS.map(b => <option key={b} value={b}>{b}+</option>)}
          </select>
          {activeCount > 0 && (
            <button onClick={reset} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-[#3A3A3A] text-gray-500 hover:text-red-500 hover:border-red-300 transition-all flex items-center gap-1 text-sm whitespace-nowrap">
              <X size={14} />
              <span className="bg-brand-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{activeCount}</span>
            </button>
          )}
        </div>
      </div>

      {/* Status pills */}
      <div className="flex gap-2 mt-3">
        {['', 'Available', 'Rented'].map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              status === s
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3A3A3A]'
            }`}
          >
            {s || 'All Status'}
          </button>
        ))}
      </div>
    </div>
  )
}
