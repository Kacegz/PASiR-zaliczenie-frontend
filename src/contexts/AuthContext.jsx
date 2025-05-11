import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-toastify'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAdminStatus = async () => {
    try {
      const response = await axios.get('/api/isadmin')
      setIsAdmin(response.data.isAdmin)
    } catch (error) {
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded)
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          checkAdminStatus()
        } else {
          localStorage.removeItem('token')
          delete axios.defaults.headers.common['Authorization']
          setUser(null)
          setIsAdmin(false)
        }
      } catch (error) {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        setUser(null)
        setIsAdmin(false)
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/login', { username, password })
      const { token } = response.data
      localStorage.setItem('token', token)
      const decoded = jwtDecode(token)
      setUser(decoded)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      await checkAdminStatus()
      toast.success('Successfully logged in!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      return false
    }
  }

  const register = async (username, password) => {
    try {
      await axios.post('/api/register', { username, password })
      toast.success('Registration successful! Please log in.')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    setIsAdmin(false)
    toast.info('Logged out successfully')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 