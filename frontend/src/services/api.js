import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

let _getToken = null

export function setTokenGetter(fn) {
  _getToken = fn
}

api.interceptors.request.use((config) => {
  // _getToken es la fuente primaria (token en memoria desde AuthContext).
  // localStorage es fallback para la llamada de boot (/api/auth/me) que ocurre
  // antes de que AuthContext haya montado su efecto setTokenGetter.
  const token = _getToken?.() || localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      // No redirigir si ya estamos en /login (evita loop al enviar credenciales incorrectas)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
