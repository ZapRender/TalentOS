import api from './api'

export const trainingService = {
  induccion: {
    create: (body) => api.post('/api/training/induccion', body).then((r) => r.data),
    get: (empleadoId) => api.get(`/api/training/induccion/${empleadoId}`).then((r) => r.data),
  },
  plan: (anio) => api.get(`/api/training/plan/${anio}`).then((r) => r.data),
  capacitaciones: {
    create: (body) => api.post('/api/training/capacitaciones', body).then((r) => r.data),
    list: () => api.get('/api/training/capacitaciones').then((r) => r.data),
  },
  evaluaciones: {
    create: (body) => api.post('/api/training/evaluaciones', body).then((r) => r.data),
    get: (empleadoId) => api.get(`/api/training/evaluaciones/${empleadoId}`).then((r) => r.data),
  },
  compromisos: {
    create: (body) => api.post('/api/training/compromisos', body).then((r) => r.data),
  },
}
