import api from './api'

const unwrap = (r) => r.data.data ?? r.data

export const payrollService = {
  periodos: {
    list:       ()           => api.get('/api/payroll/periodos').then(unwrap),
    get:        (id)         => api.get(`/api/payroll/periodos/${id}`).then(unwrap),
    create:     (body)       => api.post('/api/payroll/periodos', body).then(unwrap),
    resultado:       (id)         => api.get(`/api/payroll/periodos/${id}/resultado`).then(unwrap),
    liquidar:        (id)         => api.post(`/api/payroll/periodos/${id}/liquidar`).then(unwrap),
    enviarAprobacion:(id)         => api.post(`/api/payroll/periodos/${id}/enviar-aprobacion`).then(unwrap),
    aprobar:         (id, body)   => api.post(`/api/payroll/periodos/${id}/aprobar`, body).then(unwrap),
    enviarDesp:      (id)         => api.post(`/api/payroll/periodos/${id}/enviar-desp`).then(unwrap),
  },

  novedades: {
    list:   (periodoId)  => api.get(`/api/payroll/novedades/${periodoId}`).then(unwrap),
    create: (body)       => api.post('/api/payroll/novedades', body).then(unwrap),
    update: (id, body)   => api.put(`/api/payroll/novedades/${id}`, body).then(unwrap),
    delete: (id)         => api.delete(`/api/payroll/novedades/${id}`).then(unwrap),
  },

  afiliaciones: {
    list:    ()              => api.get('/api/payroll/afiliaciones').then(unwrap),
    get:     (empleadoId)    => api.get(`/api/payroll/afiliaciones/${empleadoId}`).then(unwrap),
    create:  (body)          => api.post('/api/payroll/afiliaciones', body).then(unwrap),
    retirar: (id, body)      => api.put(`/api/payroll/afiliaciones/${id}/retirar`, body).then(unwrap),
  },

  liquidacionContrato: {
    create:  (body)       => api.post('/api/payroll/liquidacion-contrato', body).then(unwrap),
    get:     (id)         => api.get(`/api/payroll/liquidacion-contrato/${id}`).then(unwrap),
    aprobar: (id, body)   => api.post(`/api/payroll/liquidacion-contrato/${id}/aprobar`, body).then(unwrap),
  },

  pila: {
    generar:      (body) => api.post('/api/payroll/pila/generar', body).then(unwrap),
    list:         ()     => api.get('/api/payroll/pila').then(unwrap),
    // Devuelve contenido binario — no se unwrapea
    archivoPlano: (mes)  => api.get(`/api/payroll/pila/${mes}/archivo-plano`).then((r) => r.data),
  },

  nomina: {
    resultado:    (periodoId)              => api.get(`/api/payroll/nomina/${periodoId}/resultado`).then(unwrap),
    // Devuelven archivos — no se unwrapean
    excel:        (periodoId)              => api.get(`/api/payroll/nomina/${periodoId}/excel`, { responseType: 'blob' }).then((r) => r.data),
    desprendible: (periodoId, empleadoId)  => api.get(`/api/payroll/nomina/${periodoId}/desprendible/${empleadoId}`, { responseType: 'blob' }).then((r) => r.data),
  },
}
