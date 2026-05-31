import api from './api'

export const employeeService = {
  list: (params) => api.get('/api/employees', { params }).then((r) => r.data),
  get: (id) => api.get(`/api/employees/${id}`).then((r) => r.data),
  create: (body) => api.post('/api/employees', body).then((r) => r.data),
  update: (id, body) => api.put(`/api/employees/${id}`, body).then((r) => r.data),
  retiro: (id, body) => api.post(`/api/employees/${id}/retiro`, body).then((r) => r.data),
  hojaVida: (id) => api.get(`/api/employees/${id}/hoja-vida`).then((r) => r.data),
  documentos: (body) => api.post('/api/employees/documentos', body).then((r) => r.data),
  certificacion: (id) => api.get(`/api/employees/${id}/certificacion`).then((r) => r.data),
}
