import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, ChevronDown, Star, Shield, Zap, TrendingUp, Home, CheckCircle2, ArrowRight, Users } from 'lucide-react'
import Navbar from '../components/shared/Navbar'
import PropertyCard from '../components/shared/PropertyCard'
import { useHouses, useTestimonials } from '../hooks/useApi'
import { COUNTY_IMAGES } from '../data/counties'
import { formatKES } from '../utils/formatters'

const HERO_BG = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80'

const COUNTIES_SHOWCASE = [
  { name: 'Nairobi', count: 12 },
  { name: 'Mombasa', count: 8 },
  { name: 'Kisumu', count: 6 },
  { name: 'Nakuru', count: 5 },
  { name: 'Garissa', count: 3 },
  { name: 'Eldoret', count: 4 },
  { name: 'Kilifi', count: 5 },
  { name: 'Machakos', count: 4 },
]

const HOW_IT_WORKS = [
  { step: '01', icon: Search, title: 'Search & Filter', desc: 'Use our smart filters to find properties by county, type, price, and amenities. View on map or grid.' },
  { step: '02', icon: Home, title: 'View & Choose', desc: 'Explore detailed listings with photos, Fair Rent Estimator, and Neighborhood Intelligence scores.' },
  { step: '03', icon: CheckCircle2, title: 'Book & Move In', desc: 'Submit a booking, pay via M-Pesa with escrow protection, and move in on your chosen date.' },
]

const FEATURES = [
  { icon: Shield, title: 'Zero Agent Fees', desc: 'Connect directly with landlords. No middlemen, no hidden commissions. What you see is what you pay.' },
  { icon: TrendingUp, title: 'Fair Rent Estimator', desc: 'Our AI compares similar properties in your area to tell you if a listing is fairly priced or overpriced.' },
  { icon: Zap, title: 'Escrow Payments', desc: 'Rent is held for 24 hours before being released to landlords. Raise a dispute if anything is wrong.' },
  { icon: Star, title: 'RentScore™', desc: 'Build your tenant reputation with our scoring system. High scores unlock priority booking and rent discounts.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [county, setCounty] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const { data: houses = [], isLoading } = useHouses({})
  const { data: testimonials = [] } = useTestimonials()

  const featured = houses.slice(0, 6)
  const doubled = [...testimonials, ...testimonials]

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (county) params.set('county', county)
    if (bedrooms) params.set('bedrooms', bedrooms)
    if (maxPrice) params.set('maxPrice', maxPrice)
    navigate(`/browse?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0C]">
      <Navbar transparent />

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img src={HERO_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto">
          {/* Trust pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white text-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="font-medium">Kenya's #1 Verified Rental Platform</span>
            <Users size={14} />
            <span>10,000+ tenants</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
          >
            Find Your Perfect<br />Home in{' '}
            <span className="text-brand-400">Kenya</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-lg mb-8 max-w-xl mx-auto"
          >
            Browse verified rentals across all 47 counties. Zero agent fees, fair prices, M-Pesa escrow protection.
          </motion.p>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 shadow-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <select
                value={county}
                onChange={e => setCounty(e.target.value)}
                className="input-field"
              >
                <option value="">All Counties</option>
                {Object.keys(COUNTY_IMAGES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={bedrooms}
                onChange={e => setBedrooms(e.target.value)}
                className="input-field"
              >
                <option value="">Any Bedrooms</option>
                {['1','2','3','4','5+'].map(b => <option key={b} value={b}>{b} bed{b !== '1' ? 's' : ''}</option>)}
              </select>

              <input
                type="number"
                placeholder="Max price (KES)"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="input-field font-mono"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSearch}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Search size={16} />
                Search
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-500 font-semibold text-sm mb-1 uppercase tracking-wide">Hand-picked</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Featured Properties</h2>
          </div>
          <button onClick={() => navigate('/browse')} className="btn-outline flex items-center gap-2 text-sm hidden sm:flex">
            View All <ArrowRight size={14} />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton h-48 rounded-none" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-4 w-3/4 rounded-lg" />
                  <div className="skeleton h-3 w-1/2 rounded-lg" />
                  <div className="skeleton h-5 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((house, i) => (
              <motion.div
                key={house.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <PropertyCard house={house} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* EXPLORE BY COUNTY */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-brand-500 font-semibold text-sm mb-1 uppercase tracking-wide">Explore</p>
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Browse by County</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {COUNTIES_SHOWCASE.map((c, i) => (
            <motion.button
              key={c.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => navigate(`/browse?county=${c.name}`)}
              className="relative h-36 rounded-2xl overflow-hidden group"
            >
              <img
                src={COUNTY_IMAGES[c.name] || `https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=600&q=80`}
                alt={c.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={e => e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=60'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
              <div className="absolute bottom-0 left-0 p-3 text-left">
                <div className="text-white font-display font-bold text-base">{c.name}</div>
                <div className="text-white/70 text-xs">{c.count} properties</div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-white dark:bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-brand-500 font-semibold text-sm mb-1 uppercase tracking-wide">Simple</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white">How RentEasy Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="relative inline-flex mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                    <step.icon size={28} className="text-brand-500" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* KEY FEATURES */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-brand-500 font-semibold text-sm mb-1 uppercase tracking-wide">Why choose us</p>
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Built for Kenya</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-4">
                <f.icon size={22} className="text-brand-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
{testimonials.length > 0 && (
  <section className="py-16 bg-white dark:bg-[#1A1A1A] overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
      <p className="text-brand-500 font-semibold text-sm mb-1 uppercase tracking-wide">Social proof</p>
      <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white">What Tenants Say</h2>
    </div>
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <div
        className="testimonial-track"
        style={{ gap: '16px', paddingBottom: '4px' }}
        onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
        onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}
      >
        {[...testimonials, ...testimonials, ...testimonials, ...testimonials].map((t, i) => (
          <div
            key={i}
            style={{
              width: '300px',
              flexShrink: 0,
              background: 'var(--card-bg, white)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid var(--card-border, #f3f4f6)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            className="dark:[--card-bg:#1A1A1A] dark:[--card-border:#2A2A2A]"
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.04)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)'
              e.currentTarget.style.zIndex = '10'
              e.currentTarget.style.position = 'relative'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
              e.currentTarget.style.zIndex = '0'
            }}
          >
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 italic">"{t.quote}"</p>
            <div className="flex items-center gap-3">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-9 h-9 rounded-full object-cover"
                onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&size=64`}
              />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</div>
                <div className="text-gray-400 text-xs">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)}
      
{/* CTA BANNER */}
<section className="py-20 px-4 relative overflow-hidden">
  {/* Background image */}
  <div
    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=600&fit=crop')" }}
  />
  {/* Dark overlay to keep text readable */}
  <div className="absolute inset-0 bg-brand-600/80" />
  {/* Dot grid */}
  <div className="absolute inset-0 opacity-10" style={{
    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
    backgroundSize: '24px 24px'
  }} />
  <div className="relative z-10 max-w-3xl mx-auto text-center">
    <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
      Ready to Find Your Perfect Home?
    </h2>
    <p className="text-white/80 text-lg mb-8">
      Join thousands of happy tenants across Kenya. Zero agent fees, verified listings.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/browse')}
        className="bg-white text-brand-600 font-bold px-8 py-3 rounded-xl hover:bg-brand-50 transition-all"
      >
        Browse Listings
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/register')}
        className="bg-white/10 border border-white/30 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/20 transition-all"
      >
        Create Account
      </motion.button>
    </div>
  </div>
</section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-[#0A0A0B] py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <Home size={14} color="white" />
          </div>
          <span className="font-display font-bold text-white text-lg">RentEasy</span>
        </div>
        <p className="text-gray-500 text-sm">© 2024 RentEasy Kenya. All rights reserved.</p>
        <p className="text-gray-600 text-xs mt-1">Built with ❤️ for the Kenyan market</p>
      </footer>
    </div>
  )
}
