import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API
})

// Houses
export function useHouses(params = {}) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['houses', params],
    queryFn: async () => {
      const { data } = await api.get('/houses')
      // Filtering logic remains...
      let result = data
      if (params.county) result = result.filter(h => h.county === params.county)
      if (params.type) result = result.filter(h => h.type === params.type)
      if (params.bedrooms) result = result.filter(h => h.bedrooms >= Number(params.bedrooms))
      if (params.minPrice) result = result.filter(h => h.price >= Number(params.minPrice))
      if (params.maxPrice) result = result.filter(h => h.price <= Number(params.maxPrice))
      if (params.status) result = result.filter(h => h.status === params.status)
      if (params.search) {
        const s = params.search.toLowerCase()
        result = result.filter(h =>
          h.title.toLowerCase().includes(s) ||
          h.location.toLowerCase().includes(s) ||
          h.county.toLowerCase().includes(s)
        )
      }
      return result
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const addMutation = useMutation({
    mutationFn: (data) => api.post('/houses', { ...data, dateAdded: new Date().toISOString().split('T')[0], rating: 4.0 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['houses'] });
      toast.success('Property added successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to add property: ${error.message || 'Unknown error'}`);
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/houses/${id}`, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['houses'] });
      qc.invalidateQueries({ queryKey: ['house', Number(variables.id)] });
      // Also invalidate bookings/rentals as status change affects them
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      toast.error(`Failed to update property: ${error.message || 'Unknown error'}`);
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (id) => {
      // Cascade: delete all associated records before deleting the house
      const [favRes, bookingRes, rentalRes] = await Promise.all([
        api.get(`/favorites?houseId=${id}`),
        api.get(`/bookings?houseId=${id}`),
        api.get(`/rentals?houseId=${id}`),
      ])
      await Promise.all([
        ...favRes.data.map(f => api.delete(`/favorites/${f.id}`)),
        ...bookingRes.data.map(b => api.delete(`/bookings/${b.id}`)),
        ...rentalRes.data.map(r => api.delete(`/rentals/${r.id}`)),
        api.delete(`/houses/${id}`),
      ])
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['houses'] });
      qc.invalidateQueries({ queryKey: ['favorites'] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['rentals'] });
      toast.success('Property and all related data cleared');
    },
    onError: (error) => {
      toast.error(`Failed to delete property: ${error.message || 'Unknown error'}`);
    },
  })

  return { ...query, addMutation, editMutation, removeMutation }
}

export function useHouseDetail(id, options = {}) {
  const numericId = id ? Number(id) : undefined
  return useQuery({
    queryKey: ['house', numericId],
    queryFn: async () => {
      const { data } = await api.get(`/houses/${id}`)
      return data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 1, // 1 minute
    ...options,
  })
}

// Rentals
export function useRentals(params = {}) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['rentals', params],
    queryFn: async () => {
      const { data } = await api.get('/rentals', { params })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })

  const addMutation = useMutation({
    mutationFn: (data) => api.post('/rentals', { ...data, createdAt: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rentals'] }),
    onError: (error) => {
      toast.error(`Failed to add rental: ${error.message || 'Unknown error'}`);
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/rentals/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rentals'] }),
    onError: (error) => {
      toast.error(`Failed to update rental: ${error.message || 'Unknown error'}`);
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/rentals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rentals'] }),
    onError: (error) => {
      toast.error(`Failed to delete rental: ${error.message || 'Unknown error'}`);
    },
  })

  return { ...query, addMutation, editMutation, deleteMutation }
}

// Favorites
export function useFavorites(tenantId) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['favorites', tenantId],
    queryFn: async () => {
      if (!tenantId) return []
      const { data } = await api.get(`/favorites?tenantId=${tenantId}`)
      return data
    },
    enabled: !!tenantId,
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ houseId }) => {
      const { data: existing } = await api.get(`/favorites?tenantId=${tenantId}&houseId=${houseId}`)
      if (existing.length > 0) {
        await api.delete(`/favorites/${existing[0].id}`)
        return { added: false }
      } else {
        await api.post('/favorites', { tenantId, houseId })
        return { added: true }
      }
    },
    onSuccess: ({ added }) => {
      qc.invalidateQueries({ queryKey: ['favorites', tenantId] });
      toast.success(added ? 'Added to favorites' : 'Removed from favorites');
    },
    onError: (error) => {
      toast.error(`Failed to update favorites: ${error.message || 'Unknown error'}`);
    },
  })

  return { ...query, toggleMutation }
}

// Issues
export function useIssues(params = {}) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['issues', params],
    queryFn: async () => {
      const { data } = await api.get('/issues', { params })
      return data
    },
  })

  const addMutation = useMutation({
    mutationFn: (data) => api.post('/issues', { ...data, status: 'Open', adminNote: null, createdAt: new Date().toISOString() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue reported successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to report issue: ${error.message || 'Unknown error'}`);
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/issues/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
    onError: (error) => {
      toast.error(`Failed to update issue: ${error.message || 'Unknown error'}`);
    },
  })

  return { ...query, addMutation, editMutation }
}

// Bookings
export function useBookings(params = {}) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['bookings', params],
    queryFn: async () => {
      const { data } = await api.get('/bookings')
      let result = data
      if (params.tenantId) result = result.filter(b => b.tenantId === params.tenantId)
      return result
    },
  })

  const addMutation = useMutation({
    mutationFn: (data) => api.post('/bookings', { ...data, status: 'Pending', rejectionNote: null, createdAt: new Date().toISOString() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking submitted! Awaiting approval.');
    },
    onError: (error) => {
      toast.error(`Failed to submit booking: ${error.message || 'Unknown error'}`);
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/bookings/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
    onError: (error) => {
      toast.error(`Failed to update booking: ${error.message || 'Unknown error'}`);
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/bookings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
    onError: (error) => {
      toast.error(`Failed to delete booking: ${error.message || 'Unknown error'}`);
    },
  })

  return { ...query, addMutation, editMutation, deleteMutation }
}

// Payments
export function usePayments(params = {}) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['payments', params],
    queryFn: async () => {
      const { data } = await api.get('/payments')
      let result = data
      if (params.tenantId) result = result.filter(p => p.tenantId === params.tenantId)
      return result
    },
  })

  const addMutation = useMutation({
    mutationFn: (data) => api.post('/payments', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment submitted! Funds held in escrow — awaiting admin release.');
    },
    onError: (error) => {
      toast.error(`Payment failed: ${error.message || 'Unknown error'}`);
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/payments/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
    onError: (error) => {
      toast.error(`Failed to update payment: ${error.message || 'Unknown error'}`);
    },
  })

  return { ...query, addMutation, editMutation }
}

// Reviews
export function useReviews(houseId) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['reviews', houseId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews?houseId=${houseId}`)
      return data
    },
    enabled: !!houseId,
  })

  const addMutation = useMutation({
    mutationFn: (data) => api.post('/reviews', { ...data, createdAt: new Date().toISOString().split('T')[0] }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', houseId] });
      toast.success('Review submitted!');
    },
    onError: (error) => {
      toast.error(`Failed to submit review: ${error.message || 'Unknown error'}`);
    },
  })

  return { ...query, addMutation }
}

// Move-Out Requests
export const useMoveOutRequests = (params) => {
  return useQuery({
    queryKey: ['moveOutRequests', params],
    queryFn: async () => {
      const { data } = await api.get('/moveOutRequests', { params })
      return data
    },
    staleTime: 60000
  })
}

export const useAddMoveOutRequest = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/moveOutRequests', { ...data, status: 'pending', requestDate: new Date().toISOString() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['moveOutRequests'] })
      toast.success('Move-out request submitted!')
    }
  })
}

export const useEditMoveOutRequest = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/moveOutRequests/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['moveOutRequests'] });
      qc.invalidateQueries({ queryKey: ['rentals'] });
      qc.invalidateQueries({ queryKey: ['houses'] });
      toast.success('Move-out request processed');
    }
  })
}

// Renewal Requests
export const useRenewalRequests = (params) => {
  return useQuery({
    queryKey: ['renewalRequests', params],
    queryFn: async () => {
      const { data } = await api.get('/renewalRequests', { params })
      return data
    },
    staleTime: 60000
  })
}

export const useAddRenewalRequest = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/renewalRequests', { ...data, status: 'pending', requestDate: new Date().toISOString() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['renewalRequests'] })
      toast.success('Renewal request submitted!')
    }
  })
}

export const useEditRenewalRequest = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/renewalRequests/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['renewalRequests'] });
      qc.invalidateQueries({ queryKey: ['rentals'] });
      toast.success('Renewal request processed');
    }
  })
}

// Users
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users')
      return data.filter(u => u.role === 'tenant')
    },
  })
}

// Testimonials
export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data } = await api.get('/testimonials')
      return data
    },
  })
}