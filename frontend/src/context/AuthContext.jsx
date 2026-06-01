import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('refreshToken')
  }, [])

  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      setLoading(false)
      return
    }
    authService
      .refresh(refreshToken)
      .then(({ accessToken, user: u }) => {
        setToken(accessToken)
        setUser(u)
      })
      .catch(() => {
        localStorage.removeItem('refreshToken')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { accessToken, refreshToken, user: u } = await authService.login(email, password)
    setToken(accessToken)
    setUser(u)
    localStorage.setItem('refreshToken', refreshToken)
    return u
  }, [])

  const value = { user, token, login, logout, loading }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
