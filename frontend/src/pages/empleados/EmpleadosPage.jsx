import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeeService } from '../../services/employeeService'
import StatusOrb from '../../components/ui/StatusOrb'
import Button from '../../components/ui/Button'

const MOCK = [
  { id: 1, nombre: 'Andrés Felipe Mendoza', correo: 'amendoza@empresa.com', cargo: 'Director Creativo', area: 'Marketing & Branding', estado: 'ACTIVO', fechaIngreso: '15/03/2018' },
  { id: 2, nombre: 'Claudia Lucía Restrepo', correo: 'crestrepo@empresa.com', cargo: 'Lead Developer', area: 'Tecnología', estado: 'ACTIVO', fechaIngreso: '02/11/2020' },
  { id: 3, nombre: 'Jorge Iván Duarte', correo: 'jduarte@empresa.com', cargo: 'Analista Financiero', area: 'Finanzas & Contabilidad', estado: 'INACTIVO', fechaIngreso: '20/05/2015' },
  { id: 4, nombre: 'Beatriz Elena Salas', correo: 'bsalas@empresa.com', cargo: 'Gestor de Talento', area: 'Recursos Humanos', estado: 'ACTIVO', fechaIngreso: '10/01/2022' },
  { id: 5, nombre: 'Juliana Pérez Castro', correo: 'jperez@empresa.com', cargo: 'Analista Contable', area: 'Finanzas & Contabilidad', estado: 'ACTIVO', fechaIngreso: '05/07/2019' },
]

function initials(n) {
  return n.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export default function EmpleadosPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(MOCK)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('todos')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [page, setPage] = useState(1)

  useEffect(() => {
    employeeService.list().then(setData).catch(() => setData(MOCK))
  }, [])

  const filtered = data.filter((e) => {
    const q = search.toLowerCase()
    const matchQ = !q || e.nombre.toLowerCase().includes(q) || e.correo.toLowerCase().includes(q)
    const matchDept = deptFilter === 'todos' || e.area?.toLowerCase().includes(deptFilter.toLowerCase())
    const matchEst = estadoFilter === 'todos' || e.estado === estadoFilter.toUpperCase()
    return matchQ && matchDept && matchEst
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-4">
            <span>SGRH</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-primary-container">Gestión de Empleados</span>
          </nav>
          <h2 className="text-4xl font-extrabold text-primary-container tracking-tight">
            Directorio de Colaboradores
          </h2>
        </div>
        <Button icon="person_add" onClick={() => navigate('/empleados/nuevo')}>
          Agregar Nuevo Empleado
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-low rounded-xl p-6 flex flex-wrap items-center gap-6">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">
            Filtro por Departamento
          </label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-white border-transparent rounded-lg text-sm text-on-surface p-2 shadow-sm focus:ring-2 focus:ring-primary-fixed-dim/30 outline-none"
          >
            <option value="todos">Todos los Departamentos</option>
            <option value="tecnología">Tecnología</option>
            <option value="recursos humanos">Recursos Humanos</option>
            <option value="finanzas">Finanzas</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">
            Estado Laboral
          </label>
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
            {['todos', 'activo', 'inactivo'].map((s) => (
              <button
                key={s}
                onClick={() => setEstadoFilter(s)}
                className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${estadoFilter === s ? 'bg-primary-fixed text-on-primary-fixed' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                {s === 'todos' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 self-end mb-1">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar colaborador..."
              className="pl-10 pr-4 py-2 bg-white rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim/30"
            />
          </div>
          <button className="p-2.5 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-white transition-all">
            <span className="material-symbols-outlined">download</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-card">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-surface-container-low/50">
              {['Colaborador', 'Cargo & Área', 'Estado', 'Fecha Ingreso', 'Acciones'].map((h, i) => (
                <th key={h} className={`px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ${i === 4 ? 'text-right' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed/30 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                      {initials(e.nombre)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-primary-container">{e.nombre}</div>
                      <div className="text-[11px] text-on-surface-variant/70 font-medium">{e.correo}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm font-semibold text-on-surface">{e.cargo}</div>
                  <div className="text-xs text-on-surface-variant/70">{e.area}</div>
                </td>
                <td className="px-8 py-6">
                  <StatusOrb status={e.estado === 'ACTIVO' ? 'active' : 'inactive'} />
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm font-medium text-on-surface-variant">{e.fechaIngreso}</div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/empleados/${e.id}`)} className="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary/5 transition-colors">
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary/5 transition-colors">
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined text-xl">more_vert</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-8 py-4 bg-surface-container-low/20 flex items-center justify-between border-t border-surface-container-low">
          <p className="text-xs font-medium text-on-surface-variant">
            Mostrando {filtered.length} de {data.length} colaboradores
          </p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-fixed text-on-primary-fixed font-bold text-xs">
              {page}
            </button>
            <button onClick={() => setPage(2)} className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low font-bold text-xs">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bento cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary-container text-white p-6 rounded-xl flex flex-col justify-between h-48 relative overflow-hidden group">
          <div>
            <h4 className="text-lg font-bold mb-1">Análisis de Retención</h4>
            <p className="text-white/60 text-xs">Basado en el último trimestre laboral.</p>
          </div>
          <div className="text-4xl font-black tracking-tighter">94.2%</div>
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-white/5 group-hover:scale-110 transition-transform">analytics</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-card border border-outline-variant/10 border-l-4 border-l-primary-fixed-dim flex flex-col justify-between h-48">
          <div>
            <h4 className="text-sm font-bold text-primary-container mb-1">Nuevas Contrataciones</h4>
            <p className="text-on-surface-variant/60 text-[10px] uppercase font-bold tracking-widest">Mes Actual</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {['AM', 'CR', 'BE'].map((ini) => (
                <div key={ini} className="w-10 h-10 rounded-full border-4 border-white bg-primary-fixed flex items-center justify-center text-xs font-bold text-primary">
                  {ini}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-white bg-surface-container-low flex items-center justify-center text-[10px] font-bold text-primary">+8</div>
            </div>
          </div>
          <a href="/empleados/nuevo" className="text-primary text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
            Ver incorporaciones <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-card border border-outline-variant/10 h-48 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-tertiary-fixed rounded-full flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-on-tertiary-fixed-variant text-3xl">celebration</span>
          </div>
          <p className="text-xs font-bold text-primary-container">Próximos Cumpleaños</p>
          <p className="text-[10px] text-on-surface-variant">3 colaboradores esta semana</p>
        </div>
      </div>
    </div>
  )
}
