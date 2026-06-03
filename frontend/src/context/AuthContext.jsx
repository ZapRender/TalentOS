import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import { setTokenGetter } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Inicializar token desde localStorage para que esté disponible en el primer render
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mantener el getter en sync con el token en memoria — declarado antes del boot
  // para que _getToken esté listo cuando se haga la primera llamada a la API
  useEffect(() => {
    setTokenGetter(() => token)
  }, [token])

  // Boot: verificar sesión con GET /api/auth/me usando el token guardado
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    if (!storedToken) {
      setLoading(false)
      return
    }
    authService
      .getMe()
      .then((u) => setUser(u))
      .catch(() => {
        // 401 → el interceptor de api.js ya limpia localStorage y redirige a /login
        // Para otros errores (red, etc.) limpiamos el estado manualmente
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { accessToken, refreshToken, user: u } = await authService.login(email, password)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setToken(accessToken)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) await authService.logout(refreshToken)
    } catch {
      // Ignorar errores del endpoint — limpiar sesión de todas formas
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setToken(null)
  }, [])

  const value = { user, token, login, logout, loading }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
