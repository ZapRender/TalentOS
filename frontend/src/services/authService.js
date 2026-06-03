import api from './api'

// Todos los endpoints del auth-service responden con { success, data: {…}, message }
// unwrap extrae el contenido real de data.data
const unwrap = (r) => r.data.data ?? r.data

export const authService = {
  login:      (email, password) => api.post('/api/auth/login', { email, password }).then(unwrap),
  logout:     (refreshToken)    => api.post('/api/auth/logout', { refreshToken }).then(unwrap),
  getMe:      ()                => api.get('/api/auth/me').then(unwrap),
  refresh:    (refreshToken)    => api.post('/api/auth/refresh', { refreshToken }).then(unwrap),

  getUsers:   ()                => api.get('/api/auth/users').then(unwrap),
  crearUsuario: (body)          => api.post('/api/auth/users', body),
  createUser: (body)            => api.post('/api/auth/users', body).then(unwrap),
  updateUser: (id, body)        => api.put(`/api/auth/users/${id}`, body).then(unwrap),
  toggleUser: (id)              => api.put(`/api/auth/users/${id}/toggle`).then(unwrap),
}
