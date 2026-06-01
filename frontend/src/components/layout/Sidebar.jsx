import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/empleados', icon: 'groups', label: 'Empleados' },
  { to: '/seleccion', icon: 'person_search', label: 'Selección' },
  { to: '/afiliaciones', icon: 'assignment_ind', label: 'Afiliaciones' },
  { to: '/nomina', icon: 'payments', label: 'Nómina' },
  { to: '/nomina/liquidacion-contrato', icon: 'account_balance_wallet', label: 'Liquidaciones' },
  { to: '/nomina/pila', icon: 'description', label: 'PILA' },
  { to: '/capacitacion', icon: 'school', label: 'Capacitación' },
  { to: '/usuarios', icon: 'manage_accounts', label: 'Usuarios', adminOnly: true },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    logout()
    navigate('/login')
  }

  const initials = user
    ? user.nombre
        ?.split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?'

  const visibleItems =
    user?.rol === 'ADMIN_RRHH'
      ? navItems
      : navItems.filter((i) => !i.adminOnly)

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
            <h1 className="text-xl font-black text-white tracking-tight leading-none">SGRH</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold mt-0.5">
              Gestión Humana
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-0 overflow-y-auto scrollbar-thin">
        <div className="space-y-0.5">
          {visibleItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? 'sidebar-item-active' : 'sidebar-item'
              }
            >
              <span className="material-symbols-outlined text-[22px]">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User card + logout */}
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
