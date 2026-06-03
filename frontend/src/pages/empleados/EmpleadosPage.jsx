import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { employeeService, getAreas } from '../../services/employeeService'
import StatusOrb from '../../components/ui/StatusOrb'
import Button from '../../components/ui/Button'

const PAGE_SIZE = 10

function initials(n) {
  return (n || '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function fmtDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('es-CO', { dateStyle: 'short' }) } catch { return d }
}

export default function EmpleadosPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [data, setData] = useState([])
  const [openMenu, setOpenMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [deptFilter, setDeptFilter] = useState('todos')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [page, setPage] = useState(1)
  const [areas, setAreas] = useState([])

  const filtro = searchParams.get('filtro')

  const now = new Date()
  const mesActual = now.getMonth()
  const anioActual = now.getFullYear()
  const mesLabel = now.toLocaleString('es-CO', { month: 'long', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase())

  useEffect(() => {
    setLoading(true)
    employeeService.list().then(setData).catch(() => setData([])).finally(() => setLoading(false))
    getAreas().then((data) => { if (Array.isArray(data)) setAreas(data) }).catch(() => {})
  }, [])

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1) }, [search, deptFilter, estadoFilter, filtro])

  const isIncorporacion = (e) => {
    if (!e.fechaIngreso) return false
    const d = new Date(e.fechaIngreso)
    return d.getMonth() === mesActual && d.getFullYear() === anioActual
  }

  const incorporacionesCount = data.filter(isIncorporacion).length

  const filtered = data.filter((e) => {
    const q = search.toLowerCase()
    const matchQ = !q || e.nombre?.toLowerCase().includes(q) || e.correo?.toLowerCase().includes(q)
    const matchDept = deptFilter === 'todos' ||
      (e.areaId != null ? String(e.areaId) === deptFilter : e.area?.toLowerCase().includes(deptFilter.toLowerCase()))
    const matchEst = estadoFilter === 'todos' || e.estado === estadoFilter.toUpperCase()
    const matchIncorp = filtro !== 'incorporaciones' || isIncorporacion(e)
    return matchQ && matchDept && matchEst && matchIncorp
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const startItem = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endItem = Math.min(page * PAGE_SIZE, filtered.length)

  // sliding window of up to 5 page numbers
  const winStart = Math.max(1, Math.min(page - 2, totalPages - 4))
  const winEnd = Math.min(totalPages, winStart + 4)
  const pageNums = []
  for (let i = winStart; i <= winEnd; i++) pageNums.push(i)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-4">
            <span>TalentOS</span>
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

      {/* Banner incorporaciones */}
      {filtro === 'incorporaciones' && (
        <div className="flex items-center justify-between px-5 py-3 bg-primary-fixed/20 border border-primary-fixed/30 rounded-xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
            <span className="material-symbols-outlined text-primary text-[18px]">person_add</span>
            Mostrando incorporaciones de {mesLabel} — {incorporacionesCount} empleado{incorporacionesCount !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => navigate('/empleados')}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary-fixed/30 text-on-surface-variant transition-colors"
            aria-label="Limpiar filtro"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

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
            {areas.map((a) => (
              <option key={a.id} value={String(a.id)}>{a.nombre}</option>
            ))}
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
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">autorenew</span>
            <span className="text-sm">Cargando colaboradores...</span>
          </div>
        ) : (
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
              {paginated.map((e) => (
                <tr
                  key={e.id}
                  className="cursor-pointer hover:bg-surface-container-low/30 transition-colors group"
                  onClick={() => navigate(`/empleados/${e.id}`)}
                >
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
                    <div className="text-sm font-medium text-on-surface-variant">{fmtDate(e.fechaIngreso)}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div
                      className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(ev) => ev.stopPropagation()}
                    >
                      <button
                        onClick={() => navigate(`/empleados/${e.id}`)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary/5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">visibility</span>
                      </button>
                      <button
                        onClick={() => navigate(`/empleados/${e.id}?modo=editar`)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary/5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      {/* Menú contextual de tres puntos */}
                      <div className="relative">
                        <button
                          onClick={(ev) => { ev.stopPropagation(); setOpenMenu(openMenu === e.id ? null : e.id) }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">more_vert</span>
                        </button>

                        {openMenu === e.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-outline-variant/10 z-50 overflow-hidden py-1">
                              {[
                                { label: 'Ver perfil completo',  icon: 'person',           to: `/empleados/${e.id}` },
                                { label: 'Ver hoja de vida',     icon: 'folder_open',      to: `/empleados/${e.id}/hoja-vida` },
                                { label: 'Generar certificación',icon: 'description',      to: `/empleados/${e.id}/certificacion` },
                                { label: 'Registrar evaluación', icon: 'star',             to: `/capacitacion/evaluaciones?empleadoId=${e.id}` },
                                { label: 'Ver afiliaciones',     icon: 'health_and_safety',to: `/empleados/${e.id}/afiliaciones` },
                              ].map((item) => (
                                <button
                                  key={item.label}
                                  onClick={() => { setOpenMenu(null); navigate(item.to) }}
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-surface-container text-sm text-on-surface transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{item.icon}</span>
                                  {item.label}
                                </button>
                              ))}
                              {(e.estado === 'ACTIVO' || e.estado === 'activo') && (
                                <>
                                  <div className="my-1 border-t border-outline-variant/10" />
                                  <button
                                    onClick={() => { setOpenMenu(null); navigate(`/empleados/${e.id}/retiro`) }}
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-sm text-error transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">logout</span>
                                    Iniciar retiro
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-sm text-on-surface-variant">
                    No se encontraron colaboradores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="px-8 py-4 bg-surface-container-low/20 flex items-center justify-between border-t border-surface-container-low">
          <p className="text-xs font-medium text-on-surface-variant">
            {filtered.length === 0
              ? 'Sin resultados'
              : `Mostrando ${startItem}–${endItem} de ${filtered.length} colaboradores`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            {pageNums.map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-colors ${
                  n === page
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
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
          <button
            onClick={() => navigate('/empleados?filtro=incorporaciones')}
            className="text-primary text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
          >
            Ver incorporaciones <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
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
