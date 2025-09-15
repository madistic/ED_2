import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '../services/api'

interface User {
  id: string
  username: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded: any = jwtDecode(token)
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            id: decoded.sub,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role || 'user'
          })
        } else {
          localStorage.removeItem('token')
        }
      } catch (error) {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password })
      const { token, user: userData } = response.data
      
      localStorage.setItem('token', token)
      setUser(userData)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}