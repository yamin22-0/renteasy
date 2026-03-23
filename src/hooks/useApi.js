import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API = 'http://localhost:3001'

// Houses
export function useHouses(params = {}) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['houses', params],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/houses`)
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
  })

  const addMutation = useMutation({
    mutationFn: (data) => axios.post(`${API}/houses`, { ...data, dateAdded: new Date().toISOString().split('T')[0], rating: 4.0 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['houses'] }),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, ...data }) => axios.put(`${API}/houses/${id}`, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['houses'] })
      qc.invalidateQueries({ queryKey: ['house', Number(variables.id)] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (id) => {
      // Cascade: delete all associated records before deleting the house
      const [favRes, bookingRes, rentalRes] = await Promise.all([
        axios.get(`${API}/favorites?houseId=${id}`),
        axios.get(`${API}/bookings?houseId=${id}`),
        axios.get(`${API}/rentals?houseId=${id}`),
      ])
      await Promise.all([
        ...favRes.data.map(f => axios.delete(`${API}/favorites/${f.id}`)),
        ...bookingRes.data.map(b => axios.delete(`${API}/bookings/${b.id}`)),
        ...rentalRes.data.map(r => axios.delete(`${API}/rentals/${r.id}`)),
        axios.delete(`${API}/houses/${id}`),
      ])
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['houses'] })
      qc.invalidateQueries({ queryKey: ['favorites'] })
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['rentals'] })
    },
  })

  return { ...query, addMutation, editMutation, removeMutation }
}

export function useHouseDetail(id) {
  const numericId = id ? Number(id) : undefined
  return useQuery({
    queryKey: ['house', numericId],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/houses/${id}`)
      return data
    },
    enabled: !!id,
  })
}

// Rentals
export function useRentals(params = {}) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['rentals', params],
    queryFn: async () => {
      let url = `${API}/rentals`
      if (params.tenantId) url += `?tenantId=${params.tenantId}`
      const { data } = await axios.get(url)
      return data
    },
  })

  const addMutation = useMutation({
    mutationFn: (data) => axios.post(`${API}/rentals`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rentals'] }),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, ...data }) => axios.patch(`${API}/rentals/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rentals'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`${API}/rentals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rentals'] }),
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
      const { data } = await axios.get(`${API}/favorites?tenantId=${tenantId}`)
      return data
    },
    enabled: !!tenantId,
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ houseId }) => {
      const { data: existing } = await axios.get(`${API}/favorites?tenantId=${tenantId}&houseId=${houseId}`)
      if (existing.length > 0) {
        await axios.delete(`${API}/favorites/${existing[0].id}`)
        return { added: false }
      } else {
        await axios.post(`${API}/favorites`, { tenantId, houseId })
        return { added: true }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites', tenantId] }),
  })

  return { ...query, toggleMutation }
}

// Issues
export function useIssues(params = {}) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['issues', params],
    queryFn: async () => {
      let url = `${API}/issues`
      const parts = []
      if (params.tenantId) parts.push(`tenantId=${params.tenantId}`)
      if (parts.length) url += '?' + parts.join('&')
      const { data } = await axios.get(url)
      return data
    },
  })

  const addMutation = useMutation({
    mutationFn: (data) => axios.post(`${API}/issues`, { ...data, status: 'Open', adminNote: null, createdAt: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, ...data }) => axios.patch(`${API}/issues/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  })

  return { ...query, addMutation, editMutation }
}

// Bookings
export function useBookings(params = {}) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['bookings', params],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/bookings`)
      let result = data
      if (params.tenantId) result = result.filter(b => b.tenantId === params.tenantId)
      return result
    },
  })

  const addMutation = useMutation({
    mutationFn: (data) => axios.post(`${API}/bookings`, { ...data, status: 'Pending', rejectionNote: null, createdAt: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, ...data }) => axios.patch(`${API}/bookings/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`${API}/bookings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  })

  return { ...query, addMutation, editMutation, deleteMutation }
}

// Payments
export function usePayments(params = {}) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['payments', params],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/payments`)
      let result = data
      if (params.tenantId) result = result.filter(p => p.tenantId === params.tenantId)
      return result
    },
  })

  const addMutation = useMutation({
    mutationFn: (data) => axios.post(`${API}/payments`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, ...data }) => axios.patch(`${API}/payments/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  })

  return { ...query, addMutation, editMutation }
}

// Reviews
export function useReviews(houseId) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['reviews', houseId],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/reviews?houseId=${houseId}`)
      return data
    },
    enabled: !!houseId,
  })

  const addMutation = useMutation({
    mutationFn: (data) => axios.post(`${API}/reviews`, { ...data, createdAt: new Date().toISOString().split('T')[0] }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', houseId] }),
  })

  return { ...query, addMutation }
}

// Users
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/users`)
      return data.filter(u => u.role === 'tenant')
    },
  })
}

// Testimonials
export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/testimonials`)
      return data
    },
  })
}