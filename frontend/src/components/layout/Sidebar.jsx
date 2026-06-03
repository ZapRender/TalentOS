import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  {
    id: 'dashboard',
    icon: 'dashboard',
    label: 'Dashboard',
    to: '/dashboard',
  },
  {
    id: 'empleados',
    icon: 'groups',
    label: 'Empleados',
    roles: ['ADMIN_RRHH', 'LIDER_PROCESO'],
    children: [
      { to: '/empleados',       label: 'Listado',               end: true, roles: ['ADMIN_RRHH'] },
      { to: '/empleados/nuevo', label: 'Nuevo empleado',                   roles: ['ADMIN_RRHH'] },
      { to: '/seleccion',       label: 'Selección de talento',             roles: ['ADMIN_RRHH', 'LIDER_PROCESO'] },
    ],
  },
  {
    id: 'nomina',
    icon: 'payments',
    label: 'Nómina',
    roles: ['ADMIN_RRHH', 'GERENTE', 'CONTADOR'],
    children: [
      { to: '/nomina/periodos',              label: 'Períodos',               roles: ['ADMIN_RRHH', 'GERENTE'] },
      { to: '/nomina/novedades',             label: 'Novedades',              roles: ['ADMIN_RRHH', 'GERENTE'] },
      { to: '/nomina/liquidacion-contrato',  label: 'Liquidación contrato',   roles: ['ADMIN_RRHH', 'GERENTE', 'CONTADOR'] },
      { to: '/nomina/pila',                  label: 'Planilla PILA',          roles: ['ADMIN_RRHH', 'GERENTE'] },
    ],
  },
  {
    id: 'seguridad',
    icon: 'assignment_ind',
    label: 'Seguridad Social',
    roles: ['ADMIN_RRHH'],
    children: [
      { to: '/afiliaciones',        label: 'Afiliaciones' },
      { to: '/afiliaciones/nueva',  label: 'Nueva afiliación' },
    ],
  },
  {
    id: 'capacitacion',
    icon: 'school',
    label: 'Capacitación',
    roles: ['ADMIN_RRHH', 'LIDER_PROCESO'],
    children: [
      { to: '/capacitacion',           label: 'Plan de capacitación', end: true },
      { to: '/capacitacion/induccion', label: 'Inducciones',          roles: ['ADMIN_RRHH'] },
    ],
  },
  {
    id: 'evaluaciones',
    icon: 'quiz',
    label: 'Evaluaciones',
    roles: ['ADMIN_RRHH', 'LIDER_PROCESO'],
    children: [
      { to: '/capacitacion/evaluaciones', label: 'Evaluaciones' },
      { to: '/capacitacion/compromisos',  label: 'Compromisos de mejora' },
    ],
  },
  {
    id: 'admin',
    icon: 'admin_panel_settings',
    label: 'Administración',
    roles: ['ADMIN_RRHH'],
    children: [
      { to: '/usuarios',     label: 'Gestión de usuarios',    roles: ['ADMIN_RRHH'] },
      { to: '/admin/areas',  label: 'Áreas y Departamentos',  roles: ['ADMIN_RRHH'] },
    ],
  },
]

function canAccess(item, role) {
  if (!item.roles) return true
  return item.roles.includes(role)
}

// Exact match first to avoid prefix collisions (e.g. /capacitacion vs /capacitacion/evaluaciones)
// Then longest-prefix match so /capacitacion/evaluaciones/123 correctly picks Evaluaciones, not Capacitación
function getActiveSectionId(path, sections) {
  for (const s of sections) {
    if (s.children?.some((c) => c.to === path)) return s.id
  }
  let best = null
  let bestLen = 0
  for (const s of sections) {
    for (const c of (s.children || [])) {
      if (path.startsWith(c.to + '/') && c.to.length > bestLen) {
        best = s.id
        bestLen = c.to.length
      }
    }
  }
  return best
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const role = user?.rol || ''

  const visibleSections = NAV
    .filter((s) => canAccess(s, role))
    .map((s) => ({
      ...s,
      children: s.children?.filter((c) => canAccess(c, role)),
    }))
    .filter((s) => !s.children || s.children.length > 0)

  const [open, setOpen] = useState(() => {
    const id = getActiveSectionId(location.pathname, NAV)
    return id ? new Set([id]) : new Set()
  })

  useEffect(() => {
    const id = getActiveSectionId(location.pathname, visibleSections)
    if (id) setOpen((prev) => new Set([...prev, id]))
  }, [location.pathname])

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials =
    user?.nombre
      ?.split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() ?? '?'

  const activeSection = getActiveSectionId(location.pathname, visibleSections)

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] bg-primary-container flex flex-col z-50 shadow-xl overflow-hidden">
      {/* Logo */}
      <div className="px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-primary-container text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              corporate_fare
            </span>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">TalentOS</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold mt-0.5">
              Gestión Humana
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin">
        <div>
          {visibleSections.map((section) => {
            if (section.to) {
              return (
                <NavLink
                  key={section.to}
                  to={section.to}
                  className={({ isActive }) => (isActive ? 'sidebar-item-active' : 'sidebar-item')}
                >
                  <span className="material-symbols-outlined text-[22px]">{section.icon}</span>
                  <span>{section.label}</span>
                </NavLink>
              )
            }

            const isExpanded = open.has(section.id)
            const hasActiveChild = section.id === activeSection

            return (
              <div key={section.id}>
                <button
                  onClick={() => toggle(section.id)}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-all duration-200 ${
                    hasActiveChild
                      ? 'text-white font-semibold hover:bg-white/5'
                      : 'text-white/70 hover:text-white hover:bg-white/5 font-medium'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px] flex-shrink-0">{section.icon}</span>
                  <span className="flex-1 text-left">{section.label}</span>
                  <span
                    className={`material-symbols-outlined text-base flex-shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {isExpanded && (
                  <div className="pb-1">
                    {section.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        end={child.end}
                        className={({ isActive }) =>
                          isActive
                            ? 'flex items-center gap-2.5 pl-12 pr-3 py-2 text-white border-l-4 border-primary-fixed-dim bg-white/10 text-xs font-semibold transition-all duration-200'
                            : 'flex items-center gap-2.5 pl-12 pr-3 py-2 text-white/60 hover:text-white hover:bg-white/5 text-xs font-medium transition-all duration-200'
                        }
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />
                        <span className="truncate">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* User card */}
      <div className="p-4">
        <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-fixed-dim text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-xs text-white font-semibold truncate">{user?.nombre || 'Usuario'}</p>
            <p className="text-[10px] text-white/50 truncate">{user?.rol || ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/50 hover:text-white transition-colors"
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
