import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { payrollService } from '../../services/payrollService'
import { trainingService } from '../../services/trainingService'
import StatusOrb from '../../components/ui/StatusOrb'

const rolLabels = {
  ADMIN_RRHH: 'Admin RRHH',
  GERENTE: 'Gerente',
  CONTADOR: 'Contador',
  EMPLEADO: 'Empleado',
  LIDER_PROCESO: 'Líder de Proceso',
}

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
    : '—'

export default function DashboardPage() {
  const { user: ctxUser } = useAuth()
  const navigate = useNavigate()
  const [me, setMe] = useState(null)
  const [periodos, setPeriodos] = useState([])
  const [caps, setCaps] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authService.getMe().then(setMe).catch(() => {})
    Promise.all([
      payrollService.periodos.list().catch(() => []),
      trainingService.capacitaciones.list().catch(() => []),
      authService.getUsers().catch(() => []),
    ]).then(([p, c, u]) => {
      setPeriodos(Array.isArray(p) ? p : [])
      setCaps(Array.isArray(c) ? c : [])
      setUsuarios(Array.isArray(u) ? u : [])
    }).finally(() => setLoading(false))
  }, [])

  const user = me || ctxUser
  const nombre = user?.nombre?.split(' ')[0] || 'Administrador'

  const periodosPendientes = periodos.filter((p) =>
    p.estado === 'LIQUIDADO' || p.estado === 'PENDIENTE_APROBACION' || p.estado === 'pending'
  )
  const capsActivas = caps.filter((c) => c.estado === 'ACTIVO' || c.estado === 'active')

  const stats = [
    {
      icon: 'receipt_long',
      iconBg: 'bg-primary-fixed',
      iconColor: 'text-primary',
      label: 'Periodos de Nómina',
      value: loading ? '…' : periodos.length.toString(),
      badge: 'Total',
      badgeCls: 'text-on-surface-variant bg-surface-container',
    },
    {
      icon: 'pending_actions',
      iconBg: 'bg-error-container',
      iconColor: 'text-error',
      label: 'Pendientes Aprobación',
      value: loading ? '…' : periodosPendientes.length.toString(),
      orb: !loading && periodosPendientes.length > 0,
    },
    {
      icon: 'school',
      iconBg: 'bg-tertiary-fixed',
      iconColor: 'text-tertiary',
      label: 'Capacitaciones Activas',
      value: loading ? '…' : capsActivas.length.toString(),
      badge: 'Training',
      badgeCls: 'text-tertiary bg-tertiary-fixed-dim/20',
    },
    {
      icon: 'manage_accounts',
      iconBg: 'bg-secondary-fixed',
      iconColor: 'text-secondary',
      label: 'Usuarios del Sistema',
      value: loading ? '…' : usuarios.length.toString(),
      badge: 'Sistema',
      badgeCls: 'text-on-surface-variant bg-surface-container',
    },
  ]

  return (
    <div className="space-y-10">
      {/* Greeting + user info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">
            Bienvenido de nuevo, {nombre}
          </h2>
          <p className="text-on-surface-variant mt-2 text-lg">
            Aquí está el resumen ejecutivo de la gestión humana para hoy.
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-5 py-3 shadow-card shrink-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
              {user.nombre?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">{user.nombre}</p>
              <p className="text-[10px] text-on-surface-variant">
                {rolLabels[user.rol] || user.rol}
                {user.ultimo_acceso
                  ? ` · Último acceso: ${new Date(user.ultimo_acceso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}`
                  : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-6 rounded-xl shadow-card border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 ${s.iconBg} rounded-lg`}>
                <span className={`material-symbols-outlined ${s.iconColor}`}>{s.icon}</span>
              </div>
              {s.orb ? (
                <span className="w-2 h-2 rounded-full bg-error animate-pulse shadow-[0_0_8px_rgba(186,26,26,0.5)]" />
              ) : (
                <span className={`text-xs font-bold px-2 py-1 rounded ${s.badgeCls}`}>{s.badge}</span>
              )}
            </div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">{s.label}</p>
            <h3 className="text-3xl font-extrabold text-primary-container">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Periodos recientes */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-card-md border border-outline-variant/10 overflow-hidden">
          <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-primary-container">Periodos de Nómina</h4>
              <p className="text-sm text-on-surface-variant">Estado actual de los periodos de liquidación</p>
            </div>
            <button
              onClick={() => navigate('/nomina/periodos')}
              className="text-xs font-bold text-primary hover:underline"
            >
              Ver todos
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin">autorenew</span>
              <span className="text-sm">Cargando...</span>
            </div>
          ) : periodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl">receipt_long</span>
              <p className="text-sm">No hay periodos registrados aún.</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  {['Periodo', 'Fechas', 'Total Nómina', 'Estado'].map((h) => (
                    <th key={h} className="px-8 py-4 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {periodos.slice(0, 5).map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-surface-container-low/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/nomina/periodos/${p.id}/resultado`)}
                  >
                    <td className="px-8 py-4 font-semibold text-on-surface text-sm">
                      {p.nombre || `${p.mes}/${p.anio}`}
                    </td>
                    <td className="px-8 py-4 text-xs text-on-surface-variant">
                      {p.fecha_inicial} — {p.fecha_final}
                    </td>
                    <td className="px-8 py-4 text-sm font-bold text-primary-container">
                      {fmt(p.total)}
                    </td>
                    <td className="px-8 py-4">
                      <StatusOrb
                        status={p.estado === 'ABIERTO' || p.estado === 'pending' ? 'pending' : 'active'}
                        label={p.estado || '—'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Side panels */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          {/* Capacitaciones activas */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <h5 className="font-bold text-primary-container flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">school</span>
                Capacitaciones
              </h5>
              <button
                onClick={() => navigate('/capacitacion')}
                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
              >
                Ver todas
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <span className="material-symbols-outlined animate-spin text-primary">autorenew</span>
              </div>
            ) : capsActivas.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-4">
                No hay capacitaciones activas.
              </p>
            ) : (
              <div className="space-y-3">
                {capsActivas.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-surface-container-lowest transition-colors"
                    onClick={() => navigate(`/capacitacion/${c.id}`)}
                  >
                    <div className="w-9 h-9 rounded-full bg-tertiary-fixed flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-tertiary text-sm">school</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{c.nombre}</p>
                      <p className="text-[11px] text-on-surface-variant">{c.fecha} · {c.area}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Periodos pendientes de aprobación */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
            <h5 className="font-bold text-primary-container flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-sm">pending_actions</span>
              Pendientes de Aprobación
            </h5>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <span className="material-symbols-outlined animate-spin text-primary">autorenew</span>
              </div>
            ) : periodosPendientes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4 text-on-surface-variant">
                <span className="material-symbols-outlined text-2xl text-emerald-500">check_circle</span>
                <p className="text-xs text-center">Sin periodos pendientes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {periodosPendientes.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-primary cursor-pointer hover:bg-surface-container-lowest transition-colors"
                    onClick={() => navigate(`/nomina/periodos/${p.id}/aprobar`)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold">{p.nombre || `${p.mes}/${p.anio}`}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed rounded">
                        {p.estado}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>{p.fecha_pago ? `Pago: ${p.fecha_pago}` : p.fecha_final}</span>
                      <span className="font-bold text-primary">{fmt(p.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 primary-gradient text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-105 transition-transform group z-30">
        <span className="material-symbols-outlined">add</span>
        <div className="absolute right-16 bg-primary-container text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Nuevo Trámite
        </div>
      </button>
    </div>
  )
}
