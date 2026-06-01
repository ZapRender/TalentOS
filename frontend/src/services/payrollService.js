import api from './api'

export const payrollService = {
  periodos: {
    list: () => api.get('/api/payroll/periodos').then((r) => r.data),
    create: (body) => api.post('/api/payroll/periodos', body).then((r) => r.data),
    liquidar: (id) => api.post(`/api/payroll/periodos/${id}/liquidar`).then((r) => r.data),
    aprobar: (id, body) => api.post(`/api/payroll/periodos/${id}/aprobar`, body).then((r) => r.data),
  },
  novedades: {
    list: (periodoId) => api.get(`/api/payroll/novedades/${periodoId}`).then((r) => r.data),
    create: (body) => api.post('/api/payroll/novedades', body).then((r) => r.data),
  },
  afiliaciones: {
    create: (body) => api.post('/api/payroll/afiliaciones', body).then((r) => r.data),
    get: (empleadoId) => api.get(`/api/payroll/afiliaciones/${empleadoId}`).then((r) => r.data),
  },
  liquidacionContrato: {
    create: (body) => api.post('/api/payroll/liquidacion-contrato', body).then((r) => r.data),
  },
  pila: {
    generar: (body) => api.post('/api/payroll/pila/generar', body).then((r) => r.data),
    archivoPlano: (mes) => api.get(`/api/payroll/pila/${mes}/archivo-plano`).then((r) => r.data),
  },
}
