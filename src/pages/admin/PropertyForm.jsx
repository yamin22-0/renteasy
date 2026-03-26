import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react'
import { useHouseDetail, useHouses } from '../../hooks/useApi'
import { COUNTIES } from '../../data/counties'
import toast from 'react-hot-toast'

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.coerce.number().min(1000, 'Price must be at least KES 1,000'),
  type: z.string().min(1, 'Property type is required'),
  location: z.string().min(1, 'Location is required'),
  county: z.string().min(1, 'County is required'),
  bedrooms: z.coerce.number().int().min(1, 'Bedrooms must be at least 1'),
  bathrooms: z.coerce.number().int().min(1, 'Bathrooms must be at least 1'),
  lat: z.coerce.number().optional().nullable(),
  lng: z.coerce.number().optional().nullable(),
  images: z.array(z.string().url('Must be a valid URL').or(z.literal(''))).refine(arr => arr.filter(Boolean).length > 0, { message: 'At least one image URL is required' }),
  amenities: z.array(z.string()).optional(),
  status: z.enum(['Available', 'Rented']),
  verified: z.boolean(),
  popular: z.boolean(),
});

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
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { 
      title: '', description: '', price: 0, type: 'Apartment', location: '', county: 'Nairobi',
      bedrooms: 1, bathrooms: 1, amenities: [], status: 'Available', verified: false, popular: false,
      lat: null, lng: null, images: ['', '', '', '', ''],
    }
  });

  const form = watch(); // Watch all form values for dynamic updates and summary

  useEffect(() => {
    if (house && isEdit) {
      // Set form values for react-hook-form
      for (const key in house) {
        if (key === 'price' || key === 'bedrooms' || key === 'bathrooms') {
          setValue(key, Number(house[key]));
        } else if (key === 'lat' || key === 'lng') {
          setValue(key, house[key] === null ? null : Number(house[key]));
        } else if (key === 'images') {
          setValue(key, [...(house.images || []), '', '', '', '', ''].slice(0, 5));
        } else if (key === 'amenities') {
          setValue(key, house[key] || []);
        } else {
          setValue(key, house[key]);
        }
      }
    }
  }, [house, isEdit, setValue]);

  const toggleAmenity = (a) => {
    const currentAmenities = form.amenities || [];
    setValue('amenities', currentAmenities.includes(a) ? currentAmenities.filter(x => x !== a) : [...currentAmenities, a]);
  }

  const onSubmit = async (data) => {
    const payload = { ...data, 
      price: Number(data.price), 
      images: data.images.filter(Boolean),
      lat: data.lat === null ? -1.2921 : Number(data.lat), // Default if null
      lng: data.lng === null ? 36.8219 : Number(data.lng), // Default if null
    };

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
        <form onSubmit={handleSubmit(onSubmit)}>
        {step === 0 && ( // Basic Info
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Property Title</label>
              <input id="title" {...register('title')} placeholder="e.g. Modern 3BR Apartment in Westlands" className="input-field" />
              {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.title.message}</p>}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea id="description" {...register('description')} rows={4} placeholder="Describe the property..." className="input-field resize-none" />
              {errors.description && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Monthly Price (KES)</label>
                <input id="price" type="number" {...register('price')} placeholder="45000" className="input-field font-mono" />
                {errors.price && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.price.message}</p>}
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Property Type</label>
                <select id="type" {...register('type')} className="input-field">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.type.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="county" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">County</label>
                <select id="county" {...register('county')} className="input-field">
                  {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.county && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.county.message}</p>}
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select id="status" {...register('status')} className="input-field">
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                </select>
                {errors.status && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.status.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Address / Location</label>
              <input id="location" {...register('location')} placeholder="e.g. Westlands, Nairobi" className="input-field" />
              {errors.location && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.location.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="lat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Latitude</label>
                <input id="lat" type="number" {...register('lat')} placeholder="-1.2921" className="input-field font-mono" />
                {errors.lat && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.lat.message}</p>}
              </div>
              <div>
                <label htmlFor="lng" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Longitude</label>
                <input id="lng" type="number" {...register('lng')} placeholder="36.8219" className="input-field font-mono" />
                {errors.lng && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.lng.message}</p>}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bedrooms</label>
                <select id="bedrooms" {...register('bedrooms')} className="input-field">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                {errors.bedrooms && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.bedrooms.message}</p>}
              </div>
              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bathrooms</label>
                <select id="bathrooms" {...register('bathrooms')} className="input-field">
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                {errors.bathrooms && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.bathrooms.message}</p>}
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('verified')} className="rounded accent-brand-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Verified Listing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('popular')} className="rounded accent-brand-500" />
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
                    {...register(`images.${i}`)}
                    placeholder={`Image ${i + 1} URL`}
                    className="input-field text-xs"
                  />
                ))}
              </div>
              {errors.images && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.images.message}</p>}
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
        </form>
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
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || addMutation.isPending || editMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Check size={16} /> {isEdit ? 'Save Changes' : 'Add Property'}
          </motion.button>
        )}
      </div>
    </div>
  )
}
