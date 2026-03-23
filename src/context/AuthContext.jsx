import { createContext, useContext, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('renteasy_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  // loading covers login/register async ops only
  // user from localStorage is synchronous so no async init needed
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await axios.get(`http://localhost:3001/users?email=${email}`)
      const found = data.find(u => u.email === email && u.password === password)
      if (!found) throw new Error('Invalid credentials')
      const { password: _, ...safeUser } = found
      setUser(safeUser)
      localStorage.setItem('renteasy_user', JSON.stringify(safeUser))
      toast.success(`Welcome back, ${safeUser.name.split(' ')[0]}!`)
      return safeUser
    } catch (err) {
      toast.error(err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async ({ name, email, password, phone }) => {
    setLoading(true)
    try {
      const { data: existing } = await axios.get(`http://localhost:3001/users?email=${email}`)
      if (existing.length > 0) throw new Error('Email already registered')
      const { data: newUser } = await axios.post('http://localhost:3001/users', {
        name, email, password, phone,
        role: 'tenant',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=22c55e&color=fff&size=128`,
        joinDate: new Date().toISOString().split('T')[0],
      })
      const { password: _, ...safeUser } = newUser
      setUser(safeUser)
      localStorage.setItem('renteasy_user', JSON.stringify(safeUser))
      toast.success('Account created! Welcome to RentEasy.')
      return safeUser
    } catch (err) {
      toast.error(err.message || 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('renteasy_user')
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)