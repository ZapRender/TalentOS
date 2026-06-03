import api from './api'

const unwrap = (r) => r.data.data ?? r.data

export const crearInduccion = (data) => api.post('/api/training/induccion', data)

export const trainingService = {
  induccion: {
    create:    (body)        => api.post('/api/training/induccion', body).then(unwrap),
    get:       (empleadoId)  => api.get(`/api/training/induccion/${empleadoId}`).then(unwrap),
    update:    (id, body)    => api.put(`/api/training/induccion/${id}`, body).then(unwrap),
    completar: (id)          => api.put(`/api/training/induccion/${id}/completar`).then(unwrap),
  },

  // plan es objeto (no función directa) para soportar tanto GET como POST
  plan: {
    get:    (anio) => api.get(`/api/training/plan/${anio}`).then(unwrap),
    create: (body) => api.post('/api/training/plan', body).then(unwrap),
  },

  capacitaciones: {
    list:   ()          => api.get('/api/training/capacitaciones').then(unwrap),
    get:    (id)        => api.get(`/api/training/capacitaciones/${id}`).then(unwrap),
    create: (body)      => api.post('/api/training/capacitaciones', body).then(unwrap),
    update: (id, body)  => api.put(`/api/training/capacitaciones/${id}`, body).then(unwrap),
  },

  asistencia: {
    get:    (capId)       => api.get(`/api/training/asistencia/${capId}`).then(unwrap),
    create: (capId, body) => api.post(`/api/training/asistencia/${capId}`, body).then(unwrap),
  },

  evaluaciones: {
    list:   (empleadoId) => api.get(`/api/training/evaluaciones/${empleadoId}`).then(unwrap),
    get:    (id)         => api.get(`/api/training/evaluaciones/${id}`).then(unwrap),
    create: (body)       => api.post('/api/training/evaluaciones', body).then(unwrap),
    update: (id, body)   => api.put(`/api/training/evaluaciones/${id}`, body).then(unwrap),
  },

  compromisos: {
    list:   (evalId) => api.get(`/api/training/compromisos/${evalId}`).then(unwrap),
    create: (body)   => api.post('/api/training/compromisos', body).then(unwrap),
    cumplir: (id)    => api.put(`/api/training/compromisos/${id}/cumplir`).then(unwrap),
  },

  alertas: {
    reinduccion: () => api.get('/api/training/alertas/reinduccion').then(unwrap),
  },
}
