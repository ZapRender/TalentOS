// Employee Service — MOCK DATA
// El Employee Service (Java/Spring Boot) aún no está disponible.
// Todas las funciones retornan datos de prueba realistas para
// que el resto del frontend pueda desarrollarse sin bloquearse.

const MOCK_EMPLEADOS = [
  {
    id: 'emp-001',
    primer_nombre: 'Carlos',   primer_apellido: 'Rodríguez',
    nombre: 'Carlos Rodríguez', cargo: 'Desarrollador Senior',
    area: 'TI', salario: 4500000, tipo_contrato: 'INDEFINIDO',
    fecha_ingreso: '2022-03-15', estado: 'ACTIVO',
    correo: 'carlos.rodriguez@empresa.com', telefono: '3001234567',
  },
  {
    id: 'emp-002',
    primer_nombre: 'María',    primer_apellido: 'González',
    nombre: 'María González',   cargo: 'Analista RRHH',
    area: 'Recursos Humanos', salario: 3200000, tipo_contrato: 'INDEFINIDO',
    fecha_ingreso: '2021-07-01', estado: 'ACTIVO',
    correo: 'maria.gonzalez@empresa.com', telefono: '3109876543',
  },
  {
    id: 'emp-003',
    primer_nombre: 'Juan',     primer_apellido: 'Pérez',
    nombre: 'Juan Pérez',       cargo: 'Contador',
    area: 'Finanzas', salario: 3800000, tipo_contrato: 'INDEFINIDO',
    fecha_ingreso: '2020-01-10', estado: 'ACTIVO',
    correo: 'juan.perez@empresa.com', telefono: '3205551234',
  },
  {
    id: 'emp-004',
    primer_nombre: 'Laura',    primer_apellido: 'Martínez',
    nombre: 'Laura Martínez',   cargo: 'Gerente Comercial',
    area: 'Comercial', salario: 6500000, tipo_contrato: 'INDEFINIDO',
    fecha_ingreso: '2019-05-20', estado: 'ACTIVO',
    correo: 'laura.martinez@empresa.com', telefono: '3157778899',
  },
  {
    id: 'emp-005',
    primer_nombre: 'Andrés',   primer_apellido: 'Herrera',
    nombre: 'Andrés Herrera',   cargo: 'Diseñador UX',
    area: 'TI', salario: 3500000, tipo_contrato: 'FIJO',
    fecha_ingreso: '2023-02-01', estado: 'ACTIVO',
    correo: 'andres.herrera@empresa.com', telefono: '3002223344',
  },
]

const delay = (ms = 80) => new Promise((res) => setTimeout(res, ms))

export const employeeService = {
  // TODO: conectar a GET /api/employees cuando el Employee Service esté disponible
  list: async (_params) => {
    await delay()
    return MOCK_EMPLEADOS
  },

  // TODO: conectar a GET /api/employees/:id cuando el Employee Service esté disponible
  get: async (id) => {
    await delay()
    return MOCK_EMPLEADOS.find((e) => e.id === String(id)) ?? null
  },

  // TODO: conectar a POST /api/employees cuando el Employee Service esté disponible
  create: async (body) => {
    await delay()
    return { ...body, id: `emp-${Date.now()}`, estado: 'ACTIVO' }
  },

  // TODO: conectar a PUT /api/employees/:id cuando el Employee Service esté disponible
  update: async (id, body) => {
    await delay()
    return { id, ...body }
  },

  // TODO: conectar a POST /api/employees/:id/retiro cuando el Employee Service esté disponible
  retiro: async (id, body) => {
    await delay()
    return { id, ...body, estado: 'RETIRADO' }
  },

  // TODO: conectar a GET /api/employees/:id/hoja-vida cuando el Employee Service esté disponible
  hojaVida: async (id) => {
    await delay()
    return { empleado_id: id, formacion: [], experiencia: [], habilidades: [] }
  },

  // TODO: conectar a POST /api/employees/documentos cuando el Employee Service esté disponible
  documentos: async (_body) => {
    await delay()
    return { success: true }
  },

  // TODO: conectar a GET /api/employees/:id/certificacion cuando el Employee Service esté disponible
  certificacion: async (id) => {
    await delay()
    const emp = MOCK_EMPLEADOS.find((e) => e.id === String(id))
    return { empleado: emp, fecha_generacion: new Date().toISOString() }
  },
}
