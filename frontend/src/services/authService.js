import api from './api'

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password })
    return data
  },

  async logout() {
    await api.post('/api/auth/logout')
  },

  async me() {
    const { data } = await api.get('/api/auth/me')
    return data
  },

  async refresh(refreshToken) {
    const { data } = await api.post('/api/auth/refresh', { refreshToken })
    return data
  },
}
