import api from './api'

const unwrap = (r) => r.data?.data ?? r.data

// Normaliza la respuesta del Employee Service (Java) al shape que usan los componentes.
// El servicio devuelve: nombres, apellidos, email, seccion, salarioBasico, fechaIngreso (ISO).
// El frontend espera:   nombre,   (merged), correo, area,    salario,       fechaIngreso.
const normalize = (emp) => ({
  ...emp,
  nombre: [emp.nombres, emp.apellidos].filter(Boolean).join(' ') || emp.nombre || '',
  correo: emp.email || emp.correo || '',
  area: emp.seccion || emp.area || '',
  areaNombre: emp.areaNombre || emp.seccion || emp.area || '',
  areaId: emp.areaId ?? null,
  salario: emp.salarioBasico ?? emp.salario,
  estado: (emp.estado || 'activo').toUpperCase(),
})

const MOCK_EMPLEADOS = [
  {
    id: 'emp-001',
    nombres: 'Carlos', apellidos: 'Rodríguez',
    nombre: 'Carlos Rodríguez', cargo: 'Desarrollador Senior',
    seccion: 'TI', area: 'TI', salario: 4500000, salarioBasico: 4500000,
    tipoContrato: 'INDEFINIDO', fechaIngreso: '2022-03-15', estado: 'ACTIVO',
    email: 'carlos.rodriguez@empresa.com', correo: 'carlos.rodriguez@empresa.com',
    telefono: '3001234567', cedula: '1.001.234.567', ciudad: 'Bogotá',
  },
  {
    id: 'emp-002',
    nombres: 'María', apellidos: 'González',
    nombre: 'María González', cargo: 'Analista RRHH',
    seccion: 'Recursos Humanos', area: 'Recursos Humanos', salario: 3200000, salarioBasico: 3200000,
    tipoContrato: 'INDEFINIDO', fechaIngreso: '2021-07-01', estado: 'ACTIVO',
    email: 'maria.gonzalez@empresa.com', correo: 'maria.gonzalez@empresa.com',
    telefono: '3109876543', cedula: '1.002.345.678', ciudad: 'Medellín',
  },
  {
    id: 'emp-003',
    nombres: 'Juan', apellidos: 'Pérez',
    nombre: 'Juan Pérez', cargo: 'Contador',
    seccion: 'Finanzas', area: 'Finanzas', salario: 3800000, salarioBasico: 3800000,
    tipoContrato: 'INDEFINIDO', fechaIngreso: '2020-01-10', estado: 'ACTIVO',
    email: 'juan.perez@empresa.com', correo: 'juan.perez@empresa.com',
    telefono: '3205551234', cedula: '1.003.456.789', ciudad: 'Cali',
  },
  {
    id: 'emp-004',
    nombres: 'Laura', apellidos: 'Martínez',
    nombre: 'Laura Martínez', cargo: 'Gerente Comercial',
    seccion: 'Comercial', area: 'Comercial', salario: 6500000, salarioBasico: 6500000,
    tipoContrato: 'INDEFINIDO', fechaIngreso: '2019-05-20', estado: 'ACTIVO',
    email: 'laura.martinez@empresa.com', correo: 'laura.martinez@empresa.com',
    telefono: '3157778899', cedula: '1.004.567.890', ciudad: 'Barranquilla',
  },
  {
    id: 'emp-005',
    nombres: 'Andrés', apellidos: 'Herrera',
    nombre: 'Andrés Herrera', cargo: 'Diseñador UX',
    seccion: 'TI', area: 'TI', salario: 3500000, salarioBasico: 3500000,
    tipoContrato: 'FIJO', fechaIngreso: '2023-02-01', estado: 'ACTIVO',
    email: 'andres.herrera@empresa.com', correo: 'andres.herrera@empresa.com',
    telefono: '3002223344', cedula: '1.005.678.901', ciudad: 'Bogotá',
  },
]

export const employeeService = {
  list: async (params) => {
    try {
      const data = await api.get('/api/employees', { params }).then(unwrap)
      return (Array.isArray(data) ? data : []).map(normalize)
    } catch {
      return MOCK_EMPLEADOS
    }
  },

  get: async (id) => {
    try {
      const data = await api.get(`/api/employees/${id}`).then(unwrap)
      return normalize(data)
    } catch {
      return MOCK_EMPLEADOS.find((e) => String(e.id) === String(id)) ?? null
    }
  },

  create: async (body) => {
    try {
      return await api.post('/api/employees', body).then(unwrap).then(normalize)
    } catch (err) {
      throw err
    }
  },

  update: async (id, body) => {
    try {
      return await api.put(`/api/employees/${id}`, body).then(unwrap).then(normalize)
    } catch (err) {
      throw err
    }
  },

  updateEstado: async (id, estado) => {
    try {
      return await api.patch(`/api/employees/${id}/estado`, { estado }).then(unwrap).then(normalize)
    } catch (err) {
      throw err
    }
  },

  retiro: async (id, body) => {
    try {
      return await api.post(`/api/employees/${id}/retiro`, body).then(unwrap)
    } catch {
      return { id, ...body, estado: 'RETIRADO' }
    }
  },

  hojaVida: async (id) => {
    try {
      return await api.get(`/api/employees/${id}/hoja-vida`).then(unwrap)
    } catch {
      return { empleado_id: id, formacion: [], experiencia: [], habilidades: [] }
    }
  },

  documentos: {
    list: async (empleadoId) => {
      try {
        return await api.get(`/api/employees/${empleadoId}/documentos`).then(unwrap)
      } catch {
        return []
      }
    },
    upload: async (empleadoId, tipoDocumento, archivo) => {
      const form = new FormData()
      form.append('empleado_id', String(empleadoId))
      form.append('tipo_documento', tipoDocumento)
      form.append('archivo', archivo)
      return api.post('/api/employees/documentos', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(unwrap)
    },
  },

  certificacion: {
    download: async (id, tipo = 'basica') => {
      const res = await api.get(`/api/employees/${id}/certificacion-laboral`, {
        params: { tipo },
        responseType: 'blob',
      })
      return res.data
    },
    email: async (id) => {
      try {
        return await api.post(`/api/employees/${id}/certificacion/email`).then(unwrap)
      } catch {
        return { sent: false }
      }
    },
  },
}

export const crearEmpleado = (data) => api.post('/api/employees', data)

export const getAreas = () =>
  api.get('/api/employees/areas').then(unwrap).catch(() => [])

export const getTodasAreas = () =>
  api.get('/api/employees/areas/todas').then(unwrap).catch(() => [])

export const crearArea = (data) =>
  api.post('/api/employees/areas', data).then(unwrap)

export const actualizarArea = (id, data) =>
  api.put(`/api/employees/areas/${id}`, data).then(unwrap)

export const toggleArea = (id) =>
  api.put(`/api/employees/areas/${id}/toggle`).then(unwrap)
