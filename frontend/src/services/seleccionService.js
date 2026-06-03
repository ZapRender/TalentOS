import api from './api'

const unwrap = (r) => r.data?.data ?? r.data

export const seleccionService = {
  candidatos: {
    list:        (params)        => api.get('/api/employees/candidatos', { params }).then(unwrap),
    get:         (id)            => api.get(`/api/employees/candidatos/${id}`).then(unwrap),
    create:      (body)          => api.post('/api/employees/candidatos', body).then(unwrap),
    avanzarEtapa:(id, etapa, obs)=> api.put(`/api/employees/candidatos/${id}/etapa`, { etapa, observaciones: obs }).then(unwrap),
    contratar:   (id, body)      => api.post(`/api/employees/candidatos/${id}/contratar`, body).then(unwrap),
  },

  requerimientos: {
    list:         (params)       => api.get('/api/employees/requerimientos', { params }).then(unwrap),
    get:          (id)           => api.get(`/api/employees/requerimientos/${id}`).then(unwrap),
    create:       (body)         => api.post('/api/employees/requerimientos', body).then(unwrap),
    update:       (id, body)     => api.put(`/api/employees/requerimientos/${id}`, body).then(unwrap),
    cambiarEstado:(id, estado)   => api.patch(`/api/employees/requerimientos/${id}/estado`, { estado }).then(unwrap),
  },
}

// Helpers compartidos entre páginas
export const ETAPAS = [
  { key: 'preseleccion',  label: 'Preselección' },
  { key: 'entrevista',    label: 'Entrevista' },
  { key: 'prueba_tecnica',label: 'Prueba Técnica' },
  { key: 'oferta',        label: 'Oferta' },
  { key: 'vinculado',     label: 'Vinculado' },
]

export const etapaLabel = (k) =>
  ETAPAS.find((e) => e.key === k?.toLowerCase())?.label ?? k ?? '—'

export const etapaOrb = (k) =>
  (k === 'vinculado' || k === 'oferta') ? 'active' : 'pending'

export const candidatoNombre = (c) =>
  [c?.nombres, c?.apellidos].filter(Boolean).join(' ') || '—'
