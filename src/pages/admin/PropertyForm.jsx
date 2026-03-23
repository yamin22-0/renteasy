import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { useHouseDetail, useHouses } from '../../hooks/useApi'
import { COUNTIES } from '../../data/counties'
import toast from 'react-hot-toast'

const TYPES = ['Apartment', 'House', 'Bungalow', 'Villa', 'Townhouse', 'Studio', 'Bedsitter', 'Maisonette', 'Penthouse', 'Mansion', 'Cottage']
const AMENITIES_LIST = ['WiFi', 'Parking', 'Swimming Pool', 'Gym', 'Security', 'Balcony', 'DSTV', 'Garden', 'Borehole', 'Solar', 'Staff Quarters', 'Backup Generator', 'Lift', 'Smart Home', 'CCTV', 'Rooftop Terrace']

const STEPS = ['Basic Info', 'Details', 'Images & Review']

export default function PropertyForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { data: house } = useHouseDetail(id)
  const { addMutation, editMutation } = useHouses({})
  const [step, setStep] = useState(0)

  const [form, setForm] = useState({
    title: '', description: '', price: '', type: 'Apartment', location: '', county: 'Nairobi',
    bedrooms: 1, bathrooms: 1, amenities: [], status: 'Available', verified: false, popular: false,
    lat: '', lng: '', images: ['', '', '', '', ''],
  })

  useEffect(() => {
    if (house && isEdit) {
      setForm({
        ...house,
        price: String(house.price),
        lat: String(house.lat || ''),
        lng: String(house.lng || ''),
        images: [...(house.images || []), '', '', '', '', ''].slice(0, 5),
        amenities: house.amenities || [],
      })
    }
  }, [house, isEdit])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }))
  }

  const handleSubmit = async () => {
    const payload = {
      ...form,
      price: Number(form.price),
      lat: Number(form.lat) || -1.2921,
      lng: Number(form.lng) || 36.8219,
      images: form.images.filter(Boolean),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
    }

    try {
      if (isEdit) {
        await editMutation.mutateAsync({ id: Number(id), ...payload })
        toast.success('Property updated!')
      } else {
        await addMutation.mutateAsync(payload)
        toast.success('Property added!')
      }
      navigate('/admin/properties')
    } catch {
      toast.error('Failed to save property')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Property' : 'Add Property'}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Step {step + 1} of {STEPS.length}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-brand-500 text-white' : i === step ? 'bg-brand-500 text-white ring-4 ring-brand-100 dark:ring-brand-500/20' : 'bg-gray-200 dark:bg-[#3A3A3A] text-gray-400'}`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-medium ${i === step ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-brand-500' : 'bg-gray-200 dark:bg-[#3A3A3A]'}`} />}
          </div>
        ))}
      </div>

      <div className="card p-6">
        {/* Step 1 */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Property Title</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Modern 3BR Apartment in Westlands" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Describe the property..." className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Monthly Price (KES)</label>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="45000" className="input-field font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Property Type</label>
                <select value={form.type} onChange={e => set('type', e.target.value)} className="input-field">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">County</label>
                <select value={form.county} onChange={e => set('county', e.target.value)} className="input-field">
                  {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className="input-field">
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Address / Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Westlands, Nairobi" className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Latitude</label>
                <input type="number" value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="-1.2921" className="input-field font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Longitude</label>
                <input type="number" value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="36.8219" className="input-field font-mono" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bedrooms</label>
                <select value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} className="input-field">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bathrooms</label>
                <select value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} className="input-field">
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.verified} onChange={e => set('verified', e.target.checked)} className="rounded accent-brand-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Verified Listing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.popular} onChange={e => set('popular', e.target.checked)} className="rounded accent-brand-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Popular</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${form.amenities.includes(a) ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3A3A3A]'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URLs (up to 5)</label>
              <div className="space-y-2">
                {form.images.map((img, i) => (
                  <input
                    key={i}
                    value={img}
                    onChange={e => {
                      const imgs = [...form.images]
                      imgs[i] = e.target.value
                      set('images', imgs)
                    }}
                    placeholder={`Image ${i + 1} URL`}
                    className="input-field text-xs"
                  />
                ))}
              </div>
            </div>
            {form.images.filter(Boolean).length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {form.images.filter(Boolean).map((img, i) => (
                    <img key={i} src={img} alt="" className="w-24 h-20 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-[#3A3A3A]" onError={e => e.target.style.display = 'none'} />
                  ))}
                </div>
              </div>
            )}
            {/* Summary */}
            <div className="bg-gray-50 dark:bg-[#2A2A2A] rounded-xl p-4 space-y-2 text-sm">
              <div className="font-semibold text-gray-900 dark:text-white mb-2">Summary</div>
              <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                <span>Title:</span><span className="text-gray-900 dark:text-white truncate">{form.title || '—'}</span>
                <span>Type:</span><span className="text-gray-900 dark:text-white">{form.type}</span>
                <span>County:</span><span className="text-gray-900 dark:text-white">{form.county}</span>
                <span>Price:</span><span className="font-mono text-brand-600 dark:text-brand-400">KES {Number(form.price).toLocaleString()}/mo</span>
                <span>Beds/Baths:</span><span className="text-gray-900 dark:text-white">{form.bedrooms}bd / {form.bathrooms}ba</span>
                <span>Amenities:</span><span className="text-gray-900 dark:text-white">{form.amenities.length} selected</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 justify-between">
        <button
          onClick={() => step === 0 ? navigate('/admin/properties') : setStep(s => s - 1)}
          className="btn-outline flex items-center gap-2"
        >
          <ChevronLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
        </button>
        {step < STEPS.length - 1 ? (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setStep(s => s + 1)} className="btn-primary flex items-center gap-2">
            Next <ChevronRight size={16} />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={addMutation.isPending || editMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Check size={16} /> {isEdit ? 'Save Changes' : 'Add Property'}
          </motion.button>
        )}
      </div>
    </div>
  )
}
