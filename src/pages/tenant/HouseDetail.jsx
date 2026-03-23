import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Bed, Bath, Star, BadgeCheck, ChevronLeft, ChevronRight,
  Wifi, Car, Dumbbell, Shield, Waves, Zap, TreePine, Tv,
  ChevronDown, ChevronUp, AlertCircle, Calendar, ArrowLeft, Send
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Navbar from '../../components/shared/Navbar'
import { useHouseDetail, useHouses, useBookings, useReviews } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { formatKES, formatDate, getFairRentRange } from '../../utils/formatters'
import { NEIGHBORHOOD_DATA } from '../../data/counties'
import toast from 'react-hot-toast'

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const greenIcon = L.divIcon({
  html: `<div style="background:#22c55e;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  className: '',
})

const AMENITY_ICONS = { WiFi: Wifi, Parking: Car, Gym: Dumbbell, Security: Shield, 'Swimming Pool': Waves, Pool: Waves, Solar: Zap, Garden: TreePine, DSTV: Tv }

function AmenityChip({ name }) {
  const Icon = AMENITY_ICONS[name]
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#2A2A2A] rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
      {Icon && <Icon size={12} className="text-brand-500" />}
      {name}
    </span>
  )
}

function FairRentBar({ house, allHouses }) {
  const range = getFairRentRange(house, allHouses)
  const pct = Math.max(0, Math.min(100, ((house.price - range.min) / (range.max - range.min + 1)) * 100))
  const colors = { fair: 'text-brand-500', above: 'text-red-500', below: 'text-blue-500' }
  const labels = { fair: 'Fairly Priced', above: `${Math.abs(range.percentDiff).toFixed(0)}% Above Market`, below: `${Math.abs(range.percentDiff).toFixed(0)}% Below Market` }

  return (
    <div className="card p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
          <AlertCircle size={16} className="text-brand-500" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">Fair Rent Estimator</h3>
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1 font-mono">
        <span>{formatKES(range.min)}</span>
        <span>Market Avg {formatKES(range.avg)}</span>
        <span>{formatKES(range.max)}</span>
      </div>
      <div className="relative h-3 bg-gray-200 dark:bg-[#3A3A3A] rounded-full mb-2">
        <div className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-blue-400 via-brand-400 to-red-400 rounded-full opacity-30" />
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-brand-500 rounded-full shadow-md"
        />
      </div>
      <div className={`font-semibold text-sm ${colors[range.verdict]}`}>{labels[range.verdict]}</div>
    </div>
  )
}

function NeighborhoodCard({ county }) {
  const [open, setOpen] = useState(false)
  const nd = NEIGHBORHOOD_DATA[county]
  if (!nd) return null

  return (
    <div className="card mb-4 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-5 text-left">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-brand-500" />
          <span className="font-semibold text-gray-900 dark:text-white">Neighborhood Intelligence</span>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-[#2A2A2A] pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">CBD Distance</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{nd.cbdDistance}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Walk Score</div>
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < nd.walkScore ? 'bg-brand-500' : 'bg-gray-200 dark:bg-[#3A3A3A]'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Matatu Routes</div>
                <div className="flex flex-wrap gap-1">{nd.matatu.slice(0, 3).map(r => <span key={r} className="text-xs bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full">{r}</span>)}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Nearby Hospitals</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">{nd.hospitals.slice(0, 2).join(', ')}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Schools Nearby</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">{nd.schools.slice(0, 2).join(', ')}</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300">
                <Shield size={14} className="inline mr-1" /> {nd.safetyNote}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ReviewForm({ houseId, tenantId, addReview, existingReviews }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')

  const alreadyReviewed = existingReviews.some(r => r.tenantId === tenantId || r.tenantId === String(tenantId))

  const submit = async () => {
    if (!rating) { toast.error('Please select a star rating'); return }
    if (!comment.trim()) { toast.error('Please write a comment'); return }
    try {
      await addReview.mutateAsync({ houseId, tenantId, rating, comment: comment.trim() })
      toast.success('Review submitted!')
      setRating(0)
      setComment('')
    } catch {
      toast.error('Failed to submit review')
    }
  }

  if (alreadyReviewed) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#2A2A2A] rounded-xl p-3 text-center">
        You've already reviewed this property.
      </div>
    )
  }

  return (
    <div className="border-t border-gray-100 dark:border-[#2A2A2A] pt-5">
      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Leave a Review</h4>
      {/* Star picker */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setRating(i + 1)}
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={24}
              className={(hovered || rating) > i ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-600'}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 self-center">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </span>
        )}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
        placeholder="Share your experience with this property..."
        className="input-field resize-none mb-3"
      />
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={submit}
        disabled={addReview.isPending}
        className="btn-primary flex items-center gap-2 px-5"
      >
        <Send size={14} />
        {addReview.isPending ? 'Submitting...' : 'Submit Review'}
      </motion.button>
    </div>
  )
}

function BookingModal({ house, onClose }) {
  const { user } = useAuth()
  const { addMutation, data: existingBookings = [] } = useBookings({ tenantId: user?.id })
  const navigate = useNavigate()
  const submitted = useRef(false)
  const [date, setDate] = useState('')

  const alreadyBooked = existingBookings.some(
    b => b.houseId === house.id && (b.status === 'Pending' || b.status === 'Approved')
  )

  const submit = async () => {
    if (submitted.current) return
    if (!date) { toast.error('Please select a move-in date'); return }
    if (!user) { navigate('/login'); return }
    if (alreadyBooked) { toast.error('You already have an active booking for this property'); return }
    submitted.current = true
    try {
      await addMutation.mutateAsync({ houseId: house.id, tenantId: user.id, moveInDate: date, price: house.price })
      toast.success('Booking submitted! Awaiting approval.')
      onClose()
    } catch {
      submitted.current = false
      toast.error('Booking failed, please try again')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="card w-full max-w-md p-6"
      >
        <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-4">Book This Property</h3>
        <div className="bg-gray-50 dark:bg-[#2A2A2A] rounded-xl p-4 mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Rent</div>
          <div className="font-mono text-2xl font-bold text-brand-600 dark:text-brand-400">{formatKES(house.price)}</div>
        </div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Preferred Move-in Date</label>
        <input
          type="date"
          value={date}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => setDate(e.target.value)}
          className="input-field mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          {alreadyBooked ? (
            <div className="flex-1 text-center py-2.5 text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl">
              Already booked
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={submit}
              disabled={addMutation.isPending}
              className="btn-primary flex-1"
            >
              {addMutation.isPending ? 'Submitting...' : 'Confirm Booking'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function HouseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: house, isLoading } = useHouseDetail(id)
  const { data: allHouses = [] } = useHouses({})
  const { data: reviews = [], addMutation: addReview } = useReviews(id)
  const [imgIdx, setImgIdx] = useState(0)
  const [showBooking, setShowBooking] = useState(false)

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0C]">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
        <div className="skeleton h-96 rounded-2xl mb-6" />
      </div>
    </div>
  )

  if (!house) return null

  const imgs = house.images || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0C]">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-24 lg:pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link to="/browse" className="flex items-center gap-1 hover:text-brand-500 transition-colors"><ArrowLeft size={14} /> Browse</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white truncate">{house.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col */}
          <div className="lg:col-span-2">
            {/* Image Carousel */}
            <div className="relative rounded-2xl overflow-hidden mb-4 bg-gray-200 dark:bg-[#2A2A2A]" style={{ height: 360 }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIdx}
                  src={imgs[imgIdx]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  alt={house.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=60'}
                />
              </AnimatePresence>
              {imgs.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow hover:scale-110 transition-all">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % imgs.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow hover:scale-110 transition-all">
                    <ChevronRight size={18} />
                  </button>
                  {/* Dots */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {imgs.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white w-4' : 'bg-white/50'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {imgs.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-brand-500' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" onError={e => e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=40'} />
                  </button>
                ))}
              </div>
            )}

            {/* Main Info */}
            <div className="card p-6 mb-4">
              <div className="flex flex-wrap items-start gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${house.status === 'Available' ? 'bg-brand-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {house.status}
                </span>
                {house.verified && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <BadgeCheck size={12} /> Verified
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">{house.title}</h1>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-3">
                <MapPin size={14} className="text-brand-500" />
                <span>{house.location}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300"><Bed size={15} /> {house.bedrooms} Bedrooms</span>
                <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300"><Bath size={15} /> {house.bathrooms} Bathrooms</span>
                <span className="flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">{house.rating}</span>
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-5">{house.description}</p>

              {/* Amenities */}
              {house.amenities?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {house.amenities.map(a => <AmenityChip key={a} name={a} />)}
                  </div>
                </div>
              )}
            </div>

            <FairRentBar house={house} allHouses={allHouses} />
            <NeighborhoodCard county={house.county} />

            {/* Property Map */}
            {house.lat && house.lng && (
              <div className="card overflow-hidden mb-4">
                <div className="px-5 pt-5 pb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-brand-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Property Location</h3>
                </div>
                <div style={{ height: 260 }}>
                  <MapContainer
                    center={[house.lat, house.lng]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="© OpenStreetMap contributors"
                    />
                    <Marker position={[house.lat, house.lng]} icon={greenIcon}>
                      <Popup>
                        <div className="text-sm font-semibold">{house.title}</div>
                        <div className="text-xs text-gray-500">{house.location}</div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Reviews {reviews.length > 0 && <span className="text-gray-400 font-normal">({reviews.length})</span>}
              </h3>

              {reviews.length > 0 && (
                <div className="space-y-4 mb-6">
                  {reviews.map(r => (
                    <div key={r.id} className="border-b border-gray-100 dark:border-[#2A2A2A] pb-4 last:border-0 last:pb-0">
                      <div className="flex gap-0.5 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-700'} />)}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{r.comment}</p>
                      <div className="text-xs text-gray-400 mt-1">{formatDate(r.createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Review Form — only tenants who have rented this property */}
              {user?.role === 'tenant' ? (
                <ReviewForm
                  houseId={house.id}
                  tenantId={user.id}
                  addReview={addReview}
                  existingReviews={reviews}
                />
              ) : !user ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Link to="/login" className="text-brand-500 hover:underline">Login</Link> to leave a review.
                </p>
              ) : null}
            </div>
          </div>

          {/* Right col — sticky booking */}
          <div className="hidden lg:block">
            <div className="sticky top-24 card p-6">
              <div className="font-mono text-3xl font-bold text-brand-600 dark:text-brand-400 mb-1">{formatKES(house.price)}</div>
              <div className="text-gray-400 text-sm mb-5">per month</div>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1.5"><Bed size={14} /> Bedrooms</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{house.bedrooms}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1.5"><Bath size={14} /> Bathrooms</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{house.bathrooms}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span>County</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{house.county}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span>Type</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{house.type}</span>
                </div>
              </div>
              {house.status === 'Available' ? (
                user?.role === 'tenant' ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowBooking(true)}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                  >
                    <Calendar size={16} /> Book Now
                  </motion.button>
                ) : user?.role === 'admin' ? (
                  <div className="text-center py-3 text-gray-500 font-medium text-sm bg-gray-100 dark:bg-[#2A2A2A] rounded-xl">Available for Booking</div>
                ) : (
                  <Link to="/login" className="btn-primary w-full py-3 text-center block">Login to Book</Link>
                )
              ) : (
                <div className="text-center py-3 text-gray-500 font-medium text-sm bg-gray-100 dark:bg-[#2A2A2A] rounded-xl">Currently Rented</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-[#2A2A2A] px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-mono font-bold text-brand-600 dark:text-brand-400 text-lg">{formatKES(house.price)}</div>
          <div className="text-gray-400 text-xs">per month</div>
        </div>
        {house.status === 'Available' ? (
          user?.role === 'tenant' ? (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowBooking(true)} className="btn-primary px-8">
              Book Now
            </motion.button>
          ) : user?.role === 'admin' ? (
            <span className="text-sm font-medium text-gray-500">Admin View</span>
          ) : (
            <Link to="/login" className="btn-primary px-8">Login to Book</Link>
          )
        ) : (
          <span className="text-sm font-semibold text-gray-500 bg-gray-100 dark:bg-[#2A2A2A] px-4 py-2 rounded-xl">Currently Rented</span>
        )}
      </div>

      <AnimatePresence>
        {showBooking && <BookingModal house={house} onClose={() => setShowBooking(false)} />}
      </AnimatePresence>
    </div>
  )
}