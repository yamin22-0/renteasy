import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Search, MapPin, ChevronDown, Star, Shield, Zap, TrendingUp, Home, 
  CheckCircle2, ArrowRight, Users, Menu, X, Phone, Mail, Facebook, 
  Twitter, Instagram, Linkedin, Youtube, Github, Globe, Award, 
  Building2, Clock, Thermometer, Activity, Compass, Trees, 
  Coffee, Dumbbell, Wifi, Car, ShieldCheck, Heart, MessageCircle,
  Calendar, CreditCard, Smartphone, Package, ChevronRight, ExternalLink,
  Sun, Moon // Added Sun and Moon for dark mode toggle
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import PropertyCard from '../components/shared/PropertyCard'
import { useHouses, useTestimonials } from '../hooks/useApi'
import { COUNTY_IMAGES } from '../data/counties'
import { useTheme } from '../context/ThemeContext' // Import useTheme

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const HERO_BG = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80'

const COUNTIES_SHOWCASE = [
  { name: 'Nairobi', count: 124, image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80' },
  { name: 'Mombasa', count: 86, image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80' },
  { name: 'Kisumu', count: 54, image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&q=80' },
  { name: 'Nakuru', count: 48, image: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=600&q=80' },
  { name: 'Kiambu', count: 67, image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=600&q=80' },
  { name: 'Eldoret', count: 42, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80' },
  { name: 'Kilifi', count: 38, image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&q=80' },
  { name: 'Machakos', count: 45, image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&q=80' },
]

const HOW_IT_WORKS = [
  { step: '01', icon: Search, title: 'Search & Filter', desc: 'Use our smart filters to find properties by county, type, price, and amenities. View on map or grid with real-time updates.' },
  { step: '02', icon: Home, title: 'View & Choose', desc: 'Explore detailed listings with 360° tours, Fair Rent Estimator, and Neighborhood Intelligence scores.' },
  { step: '03', icon: CheckCircle2, title: 'Book & Move In', desc: 'Submit a booking, pay via M-Pesa with escrow protection, and move in on your chosen date with zero stress.' },
]

const FEATURES = [
  { icon: Shield, title: 'Zero Agent Fees', desc: 'Connect directly with landlords. No middlemen, no hidden commissions. What you see is what you pay.', color: 'from-blue-500 to-cyan-500' },
  { icon: TrendingUp, title: 'Fair Rent Estimator', desc: 'Our AI compares similar properties in your area to tell you if a listing is fairly priced or overpriced.', color: 'from-green-500 to-emerald-500' },
  { icon: Zap, title: 'Escrow Payments', desc: 'Rent is held for 24 hours before being released to landlords. Raise a dispute if anything is wrong.', color: 'from-purple-500 to-pink-500' },
  { icon: Star, title: 'RentScore™', desc: 'Build your tenant reputation with our scoring system. High scores unlock priority booking and rent discounts.', color: 'from-orange-500 to-red-500' },
]

const AMENITIES = [
  { icon: Wifi, name: 'High-Speed WiFi', available: true },
  { icon: Car, name: 'Parking Space', available: true },
  { icon: Dumbbell, name: 'Fitness Center', available: true },
  { icon: Coffee, name: 'Coffee Lounge', available: true },
  { icon: ShieldCheck, name: '24/7 Security', available: true },
  { icon: Trees, name: 'Green Spaces', available: true },
]

const NEIGHBORHOOD_STATS = {
  buildingAge: '12 Years',
  dailyVisitors: '7,980',
  temperature: '24°C',
  occupancyRate: '85%',
  walkability: '92/100',
  transit: '88/100',
}

const COMMUNITY_EVENTS = [
  { title: 'Weekly Farmers Market', date: 'Every Saturday', location: 'Central Plaza' },
  { title: 'Yoga in the Park', date: 'Sundays 9AM', location: 'Community Garden' },
  { title: 'Art Exhibition', date: 'March 28th', location: 'Gallery Space' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { dark, toggle } = useTheme() // Get theme state and toggle function
  const [county, setCounty] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const { data: houses = [], isLoading } = useHouses({})
  const { data: testimonials = [] } = useTestimonials()

  const { scrollYProgress } = useScroll()
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  const heroRef = useRef(null)
  const featuredRef = useRef(null)
  const countiesRef = useRef(null)
  const howItWorksRef = useRef(null)
  const featuresRef = useRef(null)
  const testimonialsRef = useRef(null)
  const neighborhoodRef = useRef(null)
  const amenitiesRef = useRef(null)
  const mapRef = useRef(null)
  const ctaRef = useRef(null)

  const featured = houses.slice(0, 6)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (county) params.set('county', county)
    if (bedrooms) params.set('bedrooms', bedrooms)
    if (maxPrice) params.set('maxPrice', maxPrice)
    navigate(`/browse?${params.toString()}`)
  }

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileMenuOpen(false)
  }

  const navItems = [
    { label: 'Home', ref: heroRef },
    { label: 'Properties', ref: featuredRef },
    { label: 'Counties', ref: countiesRef },
    { label: 'How It Works', ref: howItWorksRef },
    { label: 'Amenities', ref: amenitiesRef },
    { label: 'Neighborhood', ref: neighborhoodRef },
    { label: 'Testimonials', ref: testimonialsRef },
  ]

  // Map center (Nairobi coordinates)
  const mapCenter = [-1.286389, 36.817223]
  const propertyLocations = [
    { position: [-1.2921, 36.8219], name: 'Westlands', price: 'KES 45,000' },
    { position: [-1.2762, 36.7968], name: 'Kilimani', price: 'KES 55,000' },
    { position: [-1.3072, 36.8155], name: 'Upper Hill', price: 'KES 70,000' },
    { position: [-1.3134, 36.8466], name: 'South B', price: 'KES 35,000' },
    { position: [-1.2845, 36.8419], name: 'Eastlands', price: 'KES 25,000' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0C]">
      {/* Custom Navbar with Dark Mode Toggle */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0A0A0B]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => scrollToSection(heroRef)}>
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center mr-2">
                <Home size={18} color="white" />
              </div>
              <span className="font-display font-bold text-gray-900 dark:text-white text-xl">RentEasy</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.ref)}
                  className="text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors text-sm font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-3">
              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation with Dark Mode Toggle */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#0A0A0B] border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.ref)}
                  className="block w-full text-left px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 space-y-2 border-t border-gray-200 dark:border-gray-800 mt-2">
                {/* Dark Mode Toggle for Mobile */}
                <button
                  onClick={toggle}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white px-3 py-2 rounded-lg text-center font-medium"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <motion.img 
          src={HERO_BG} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ scale }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        
        <div className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white text-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="font-medium">Kenya's #1 Verified Rental Platform</span>
            <Users size={14} />
            <span>10,000+ active tenants</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Find Your Perfect<br />Home in{' '}
            <span className="text-brand-400">Kenya</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/90 text-xl mb-10 max-w-2xl mx-auto"
          >
            Browse 5,000+ verified rentals across all 47 counties. Zero agent fees, fair prices, and M-Pesa escrow protection.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <select
                value={county}
                onChange={e => setCounty(e.target.value)}
                className="input-field"
              >
                <option value="">Select County</option>
                {Object.keys(COUNTY_IMAGES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={bedrooms}
                onChange={e => setBedrooms(e.target.value)}
                className="input-field"
              >
                <option value="">Bedrooms</option>
                {['1','2','3','4','5+'].map(b => <option key={b} value={b}>{b} bed{b !== '1' ? 's' : ''}</option>)}
              </select>

              <input
                type="number"
                placeholder="Max monthly rent (KES)"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="input-field font-mono"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSearch}
                className="btn-primary flex items-center justify-center gap-2 py-3"
              >
                <Search size={18} />
                Search Properties
              </motion.button>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Popular:</span>
              {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'].map(city => (
                <button
                  key={city}
                  onClick={() => setCounty(city)}
                  className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex justify-center gap-8 text-white/70 text-sm"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>Verified Listings</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} />
              <span>Instant Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone size={16} />
              <span>M-Pesa Payments</span>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="text-white/50" size={24} />
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section ref={featuredRef} className="py-20 px-4 max-w-7xl mx-auto scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-brand-500 font-semibold text-sm mb-2 uppercase tracking-wider">Hand-picked for you</p>
            <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white">Featured Properties</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Discover our most popular listings across Kenya</p>
          </div>
          <button 
            onClick={() => navigate('/browse')} 
            className="btn-outline flex items-center gap-2 text-sm hidden sm:flex group"
          >
            View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton h-56 rounded-none" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-5 w-3/4 rounded-lg" />
                  <div className="skeleton h-4 w-1/2 rounded-lg" />
                  <div className="skeleton h-6 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((house, i) => (
              <motion.div
                key={house.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="transition-all duration-300"
              >
                <PropertyCard house={house} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* EXPLORE BY COUNTY */}
      <section ref={countiesRef} className="py-20 px-4 max-w-7xl mx-auto scroll-mt-20 bg-gradient-to-b from-gray-50 to-white dark:from-[#0B0B0C] dark:to-[#0A0A0B]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-brand-500 font-semibold text-sm mb-2 uppercase tracking-wider">Explore Kenya</p>
          <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white">Browse by County</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
            Discover properties in your favorite locations across all 47 counties
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {COUNTIES_SHOWCASE.map((c, i) => (
            <motion.button
              key={c.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => navigate(`/browse?county=${c.name}`)}
              className="relative h-48 rounded-2xl overflow-hidden group cursor-pointer"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-left">
                <div className="text-white font-display font-bold text-xl mb-1">{c.name}</div>
                <div className="text-white/80 text-sm">{c.count} properties</div>
              </div>
              <div className="absolute top-3 right-3 bg-brand-500/90 backdrop-blur-sm rounded-full px-2 py-1">
                <span className="text-white text-xs font-medium">{c.count}+</span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* AMENITIES SECTION */}
      <section ref={amenitiesRef} className="py-20 px-4 max-w-7xl mx-auto scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-brand-500 font-semibold text-sm mb-2 uppercase tracking-wider">Premium Living</p>
          <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white">World-Class Amenities</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Experience luxury living with our carefully curated amenities</p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {AMENITIES.map((amenity, i) => (
            <motion.div
              key={amenity.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-center p-6 rounded-2xl bg-white dark:bg-[#1A1A1A] hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500 transition-colors duration-300">
                <amenity.icon className="text-brand-500 group-hover:text-white transition-colors duration-300" size={28} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{amenity.name}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEIGHBORHOOD SECTION */}
      <section ref={neighborhoodRef} className="py-20 px-4 max-w-7xl mx-auto scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <p className="text-brand-500 font-semibold text-sm mb-2 uppercase tracking-wider">Vibrant Community</p>
            <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Experience the Best of Urban Living
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-white dark:bg-[#1A1A1A] rounded-xl">
                <Building2 className="text-brand-500 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{NEIGHBORHOOD_STATS.buildingAge}</div>
                <div className="text-xs text-gray-500">Building Age</div>
              </div>
              <div className="p-4 bg-white dark:bg-[#1A1A1A] rounded-xl">
                <Users className="text-brand-500 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{NEIGHBORHOOD_STATS.dailyVisitors}</div>
                <div className="text-xs text-gray-500">Daily Visitors</div>
              </div>
              <div className="p-4 bg-white dark:bg-[#1A1A1A] rounded-xl">
                <Thermometer className="text-brand-500 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{NEIGHBORHOOD_STATS.temperature}</div>
                <div className="text-xs text-gray-500">Avg Temperature</div>
              </div>
              <div className="p-4 bg-white dark:bg-[#1A1A1A] rounded-xl">
                <Activity className="text-brand-500 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{NEIGHBORHOOD_STATS.occupancyRate}</div>
                <div className="text-xs text-gray-500">Occupancy Rate</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-[#1A1A1A] rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Walkability Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="font-bold text-green-500">{NEIGHBORHOOD_STATS.walkability}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-[#1A1A1A] rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Transit Accessibility</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                  <span className="font-bold text-blue-500">{NEIGHBORHOOD_STATS.transit}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-500/10 dark:to-brand-500/5 rounded-2xl p-6">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-brand-500" />
                Community Highlights
              </h3>
              <div className="space-y-3">
                {COMMUNITY_EVENTS.map((event, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Calendar size={16} className="text-brand-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.date} • {event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Users size={20} className="text-brand-500" />
                Join Our Community
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Join over 8,500 active tenants benefiting from exclusive community perks, events, and networking opportunities.
              </p>
              <button className="text-brand-500 font-medium hover:underline inline-flex items-center gap-1">
                Learn more <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* MAP VIEW SECTION */}
      <section ref={mapRef} className="py-20 px-4 max-w-7xl mx-auto scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <p className="text-brand-500 font-semibold text-sm mb-2 uppercase tracking-wider">Explore on Map</p>
          <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white">Find Properties Near You</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Interactive map showing available properties in prime locations</p>
        </motion.div>
        
        <div className="rounded-2xl overflow-hidden shadow-xl">
          <MapContainer 
            center={mapCenter} 
            zoom={12} 
            style={{ height: '500px', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {propertyLocations.map((location, idx) => (
              <Marker key={idx} position={location.position}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-gray-900">{location.name}</h3>
                    <p className="text-brand-500 font-semibold">{location.price}</p>
                    <button 
                      onClick={() => navigate('/browse')}
                      className="mt-2 text-xs bg-brand-500 text-white px-2 py-1 rounded hover:bg-brand-600"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
            <Circle
              center={mapCenter}
              radius={5000}
              pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.1 }}
            />
          </MapContainer>
        </div>
        
        <div className="mt-6 flex justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-brand-500 rounded-full"></div>
            <span>Available Properties</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-brand-500 rounded-full"></div>
            <span>5km Search Radius</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={howItWorksRef} className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-[#1A1A1A] dark:to-[#0F0F10] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-brand-500 font-semibold text-sm mb-2 uppercase tracking-wider">Simple Process</p>
            <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white">How RentEasy Works</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Find your dream home in three easy steps</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center group"
              >
                <div className="relative inline-flex mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <step.icon size={36} className="text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold flex items-center justify-center shadow-lg">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* KEY FEATURES */}
      <section ref={featuresRef} className="py-20 px-4 max-w-7xl mx-auto scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-brand-500 font-semibold text-sm mb-2 uppercase tracking-wider">Why Choose Us</p>
          <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white">Built for Kenya</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Innovative features designed for the Kenyan rental market</p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="card p-8 group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon size={26} className="text-white" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section ref={testimonialsRef} className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-[#1A1A1A] dark:to-[#0F0F10] overflow-hidden scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-brand-500 font-semibold text-sm mb-2 uppercase tracking-wider">Success Stories</p>
              <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white">What Our Tenants Say</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Join thousands of satisfied tenants across Kenya</p>
            </motion.div>
          </div>
          
          <div style={{ overflow: 'hidden', width: '100%' }}>
            <div
              className="testimonial-track"
              style={{ gap: '24px', paddingBottom: '8px' }}
              onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
              onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}
            >
              {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                <div
                  key={i}
                  style={{
                    width: '350px',
                    flexShrink: 0,
                    background: 'var(--card-bg, white)',
                    borderRadius: '20px',
                    padding: '28px',
                    border: '1px solid var(--card-border, #f3f4f6)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                  }}
                  className="dark:[--card-bg:#1A1A1A] dark:[--card-border:#2A2A2A] hover:shadow-xl"
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'
                  }}
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={18} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-5 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-brand-500"
                      onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&size=64`}
                    />
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{t.name}</div>
                      <div className="text-gray-400 text-sm">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* CTA BANNER */}
      <section ref={ctaRef} className="py-24 px-4 relative overflow-hidden scroll-mt-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=800&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/90 to-brand-700/90" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Find Your Perfect Home?
            </h2>
            <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of happy tenants across Kenya. Zero agent fees, verified listings, and secure payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/browse')}
                className="bg-white text-brand-600 font-bold px-10 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg"
              >
                Start Searching
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/register')}
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold px-10 py-4 rounded-xl hover:bg-white/20 transition-all"
              >
                Create Free Account
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ENHANCED FOOTER */}
      <footer className="bg-gray-900 dark:bg-[#0A0A0B] pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Column 1 - Brand Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                  <Home size={20} color="white" />
                </div>
                <span className="font-display font-bold text-white text-2xl">RentEasy</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Kenya's #1 verified rental platform. Find your perfect home with zero agent fees and secure payments.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-500 transition-colors">
                  <Facebook size={16} className="text-gray-400 hover:text-white" />
                </a>
                <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-500 transition-colors">
                  <Twitter size={16} className="text-gray-400 hover:text-white" />
                </a>
                <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-500 transition-colors">
                  <Instagram size={16} className="text-gray-400 hover:text-white" />
                </a>
                <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-500 transition-colors">
                  <Linkedin size={16} className="text-gray-400 hover:text-white" />
                </a>
              </div>
            </div>
            
            {/* Column 2 - Quick Links */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection(heroRef)} className="text-gray-400 hover:text-brand-400 text-sm transition-colors">Home</button></li>
                <li><button onClick={() => navigate('/browse')} className="text-gray-400 hover:text-brand-400 text-sm transition-colors">Browse Properties</button></li>
                <li><button onClick={() => navigate('/about')} className="text-gray-400 hover:text-brand-400 text-sm transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/contact')} className="text-gray-400 hover:text-brand-400 text-sm transition-colors">Contact</button></li>
                <li><button onClick={() => navigate('/blog')} className="text-gray-400 hover:text-brand-400 text-sm transition-colors">Blog</button></li>
              </ul>
            </div>
            
            {/* Column 3 - Support */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-brand-400 text-sm transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-brand-400 text-sm transition-colors">Safety Tips</a></li>
                <li><a href="#" className="text-gray-400 hover:text-brand-400 text-sm transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-brand-400 text-sm transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-brand-400 text-sm transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            
            {/* Column 4 - Contact Info */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-brand-500 mt-0.5" />
                  <span className="text-gray-400 text-sm">Westlands, Nairobi, Kenya</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-brand-500" />
                  <a href="tel:+254700000000" className="text-gray-400 hover:text-brand-400 text-sm">+254 700 000 000</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-brand-500" />
                  <a href="mailto:info@renteasy.co.ke" className="text-gray-400 hover:text-brand-400 text-sm">info@renteasy.co.ke</a>
                </li>
                <li className="flex items-center gap-3">
                  <Clock size={18} className="text-brand-500" />
                  <span className="text-gray-400 text-sm">Mon-Fri: 8AM - 6PM</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* App Download Badges */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-3">
                <a href="#" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Smartphone size={20} className="text-white" />
                  <div>
                    <div className="text-xs text-gray-400">Download on</div>
                    <div className="text-white font-semibold">App Store</div>
                  </div>
                </a>
                <a href="#" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Package size={20} className="text-white" />
                  <div>
                    <div className="text-xs text-gray-400">Get it on</div>
                    <div className="text-white font-semibold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">© 2024 RentEasy Kenya. All rights reserved.</p>
            <p className="text-gray-600 text-xs mt-1">Built with ❤️ for the Kenyan market</p>
          </div>
        </div>
      </footer>
      
      {/* Add CSS for testimonial track */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .testimonial-track {
          display: flex;
          animation: scroll 40s linear infinite;
          width: max-content;
        }
        @media (prefers-reduced-motion: reduce) {
          .testimonial-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}