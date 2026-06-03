import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { payrollService } from '../../services/payrollService'
import { trainingService } from '../../services/trainingService'
import { employeeService } from '../../services/employeeService'
import api from '../../services/api'
import StatusOrb from '../../components/ui/StatusOrb'
import SpeedDial from '../../components/ui/SpeedDial'

const rolLabels = {
  ADMIN_RRHH: 'Admin RRHH',
  GERENTE: 'Gerente',
  CONTADOR: 'Contador',
  EMPLEADO: 'Empleado',
  LIDER_PROCESO: 'Líder de Proceso',
}

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

function periodoLabel(p) {
  if (p.nombre) return p.nombre
  const mes = MESES[(p.mes || 1) - 1] || String(p.mes)
  const q = p.quincena === 1 ? '1ª quincena' : p.quincena === 2 ? '2ª quincena' : ''
  return `${mes} ${p.anio}${q ? ` · ${q}` : ''}`
}

function fmtNeto(p) {
  const v = p.total_neto ?? p.total ?? null
  if (!v) return 'Sin liquidar'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(v)
}

function getSpeedDialActions(role, navigate) {
  const map = {
    ADMIN_RRHH: [
      { icon: 'person_add',        label: 'Vincular empleado',       onClick: () => navigate('/empleados/nuevo') },
      { icon: 'receipt_long',      label: 'Nuevo período nómina',    onClick: () => navigate('/nomina/periodos') },
      { icon: 'edit_note',         label: 'Registrar novedad',       onClick: () => navigate('/nomina/novedades') },
      { icon: 'health_and_safety', label: 'Nueva afiliación',        onClick: () => navigate('/afiliaciones/nueva') },
      { icon: 'school',            label: 'Nueva capacitación',      onClick: () => navigate('/capacitacion') },
      { icon: 'manage_accounts',   label: 'Crear usuario',           onClick: () => navigate('/usuarios') },
    ],
    GERENTE: [
      { icon: 'task_alt', label: 'Aprobar nómina pendiente', onClick: () => navigate('/nomina/periodos?estado=pendiente_aprobacion') },
    ],
    CONTADOR: [
      { icon: 'task_alt', label: 'Aprobar liquidación', onClick: () => navigate('/nomina/liquidacion-contrato?estado=enviado_contador') },
    ],
    LIDER_PROCESO: [
      { icon: 'star',          label: 'Nueva evaluación', onClick: () => navigate('/capacitacion/evaluaciones') },
      { icon: 'person_search', label: 'Ver candidatos',   onClick: () => navigate('/seleccion/candidatos') },
    ],
    EMPLEADO: [
      { icon: 'description', label: 'Mis desprendibles',       onClick: () => navigate('/nomina/mis-desprendibles') },
      { icon: 'badge',       label: 'Solicitar certificación', onClick: () => navigate('/empleados/mi-perfil/certificacion') },
    ],
  }
  return map[role] ?? map['ADMIN_RRHH']
}

const QUICK_ACTIONS = [
  { label: 'Nuevo período',      icon: 'receipt_long',   to: '/nomina/periodos',           roles: ['ADMIN_RRHH', 'GERENTE'] },
  { label: 'Registrar novedad',  icon: 'edit_note',       to: '/nomina/novedades',          roles: ['ADMIN_RRHH'] },
  { label: 'Nueva afiliación',   icon: 'assignment_ind',  to: '/afiliaciones/nueva',        roles: ['ADMIN_RRHH'] },
  { label: 'Vincular empleado',  icon: 'person_add',      to: '/empleados/nuevo',           roles: ['ADMIN_RRHH'] },
  { label: 'Nueva capacitación', icon: 'school',          to: '/capacitacion',              roles: ['ADMIN_RRHH', 'LIDER_PROCESO'] },
]

export default function DashboardPage() {
  const { user: ctxUser } = useAuth()
  const navigate = useNavigate()

  const [me, setMe] = useState(null)
  const [periodos, setPeriodos] = useState([])
  const [caps, setCaps] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [evalsPendientes, setEvalsPendientes] = useState(0)
  const [reinduccion, setReinduccion] = useState(null)
  const [afiliaciones, setAfiliaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authService.getMe().then(setMe).catch(() => {})
    Promise.all([
      payrollService.periodos.list().catch(() => []),
      trainingService.capacitaciones.list().catch(() => []),
      authService.getUsers().catch(() => []),
      employeeService.list().catch(() => []),
      api.get('/api/training/evaluaciones')
        .then((r) => r.data?.data ?? r.data ?? [])
        .catch(() => []),
      trainingService.alertas.reinduccion().catch(() => null),
      payrollService.afiliaciones.list().catch(() => []),
    ]).then(([p, c, u, emp, evals, rein, afil]) => {
      setPeriodos(Array.isArray(p) ? p : [])
      setCaps(Array.isArray(c) ? c : [])
      setUsuarios(Array.isArray(u) ? u : [])
      setEmpleados(Array.isArray(emp) ? emp : [])
      setEvalsPendientes(
        Array.isArray(evals)
          ? evals.filter((e) =>
              e.estado === 'PENDIENTE' || e.estado === 'pending' || e.estado === 'EN_PROCESO'
            ).length
          : 0
      )
      setReinduccion(rein)
      setAfiliaciones(Array.isArray(afil) ? afil : [])
    }).finally(() => setLoading(false))
  }, [])

  const user = me || ctxUser
  const nombre = user?.nombre?.split(' ')[0] || 'Administrador'

  const periodosPendientes = periodos.filter(
    (p) => p.estado === 'LIQUIDADO' || p.estado === 'PENDIENTE_APROBACION' || p.estado === 'pending'
  )
  const capsActivas = caps.filter((c) => c.estado === 'ACTIVO' || c.estado === 'active')
  const empleadosActivos = empleados.filter((e) => e.estado === 'ACTIVO')

  // Contratos por vencer en los próximos 30 días
  const now = new Date()
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const contratos30 = empleados
    .filter((e) => {
      if (!e.fecha_fin_contrato) return false
      const d = new Date(e.fecha_fin_contrato)
      return d >= now && d <= in30
    })
    .map((e) => ({
      id: e.id,
      nombre: e.nombre,
      dias: Math.ceil((new Date(e.fecha_fin_contrato) - now) / 86400000),
    }))

  // Empleados sin ARL o EPS activa
  const afilByEmp = {}
  afiliaciones.forEach((a) => {
    if (!a.empleado_id) return
    if (!afilByEmp[a.empleado_id]) afilByEmp[a.empleado_id] = []
    afilByEmp[a.empleado_id].push(a)
  })
  const sinAfilCount = Object.values(afilByEmp).filter((list) => {
    const hasARL = list.some((a) => a.tipo_entidad === 'arl' && (a.estado === 'activo' || a.estado === 'ACTIVO'))
    const hasEPS = list.some((a) => a.tipo_entidad === 'eps' && (a.estado === 'activo' || a.estado === 'ACTIVO'))
    return !hasARL || !hasEPS
  }).length

  const reinduccionCount = reinduccion
    ? (reinduccion.count ?? (Array.isArray(reinduccion) ? reinduccion.length : 0))
    : 0
  const totalAlertas = contratos30.length + reinduccionCount + sinAfilCount

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
    {
      icon: 'groups',
      iconBg: 'bg-primary-fixed',
      iconColor: 'text-primary',
      label: 'Empleados Activos',
      value: loading ? '…' : empleadosActivos.length.toString(),
      badge: 'Activos',
      badgeCls: 'text-primary bg-primary-fixed',
    },
    {
      icon: 'assessment',
      iconBg: 'bg-error-container',
      iconColor: 'text-error',
      label: 'Evaluaciones Pendientes',
      value: loading ? '…' : evalsPendientes.toString(),
      orb: !loading && evalsPendientes > 0,
    },
  ]

  const quickActions = QUICK_ACTIONS.filter(
    (a) => !a.roles || a.roles.includes(user?.rol)
  )

  const speedDialActions = getSpeedDialActions(user?.rol, navigate)

  return (
    <div className="space-y-10">
      {/* Greeting */}
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

      {/* Stats — 6 cards 2x3 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
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

      {/* Acciones rápidas */}
      {quickActions.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10 shadow-card">
          <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4">
            Acciones rápidas
          </h4>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((a) => (
              <button
                key={a.to}
                onClick={() => navigate(a.to)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-low hover:bg-surface-container text-sm font-semibold text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-primary text-[18px]">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Periodos recientes */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-card-md border border-outline-variant/10 overflow-hidden">
          <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-primary-container">Periodos de Nómina</h4>
              <p className="text-sm text-on-surface-variant">Estado actual de los periodos de liquidación</p>
            </div>
            <button onClick={() => navigate('/nomina/periodos')} className="text-xs font-bold text-primary hover:underline">
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
                      {periodoLabel(p)}
                    </td>
                    <td className="px-8 py-4 text-xs text-on-surface-variant">
                      {p.fecha_inicial} — {p.fecha_final}
                    </td>
                    <td className="px-8 py-4 text-sm font-bold text-primary-container">
                      {fmtNeto(p)}
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
          {/* Capacitaciones */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <h5 className="font-bold text-primary-container flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">school</span>
                Capacitaciones
              </h5>
              <button onClick={() => navigate('/capacitacion')} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">
                Ver todas
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <span className="material-symbols-outlined animate-spin text-primary">autorenew</span>
              </div>
            ) : capsActivas.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-4">No hay capacitaciones activas.</p>
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

          {/* Pendientes de aprobación */}
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
                      <p className="text-sm font-bold">{periodoLabel(p)}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed rounded">
                        {p.estado}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>{p.fecha_pago ? `Pago: ${p.fecha_pago}` : p.fecha_final}</span>
                      <span className="font-bold text-primary">{fmtNeto(p)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alertas */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-card overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-error-container rounded-lg">
              <span className="material-symbols-outlined text-error">notifications_active</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-primary-container">Alertas</h4>
              <p className="text-sm text-on-surface-variant">Situaciones que requieren atención</p>
            </div>
          </div>
          {!loading && totalAlertas > 0 && (
            <span className="px-3 py-1 bg-error-container text-error text-xs font-bold rounded-full">
              {totalAlertas} alerta{totalAlertas !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">autorenew</span>
            <span className="text-sm">Cargando alertas...</span>
          </div>
        ) : totalAlertas === 0 ? (
          <div className="flex items-center gap-3 px-8 py-8 text-emerald-600">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
            <p className="font-semibold">Sin alertas pendientes</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/5">
            {/* Contratos por vencer */}
            {contratos30.length > 0 && (
              <div className="px-8 py-6">
                <h5 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-amber-500">event_upcoming</span>
                  Contratos por vencer — próximos 30 días
                </h5>
                <div className="space-y-2">
                  {contratos30.slice(0, 5).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors"
                      onClick={() => navigate(`/empleados/${c.id}`)}
                    >
                      <span className="text-sm font-semibold text-on-surface">{c.nombre}</span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">
                        {c.dias} día{c.dias !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                  {contratos30.length > 5 && (
                    <button onClick={() => navigate('/empleados')} className="text-xs font-bold text-primary hover:underline mt-1">
                      Ver todos ({contratos30.length})
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Reinducción pendiente */}
            {reinduccionCount > 0 && (
              <div className="px-8 py-6">
                <h5 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">refresh</span>
                  Reinducción anual pendiente
                </h5>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-primary-fixed/20 border border-primary-fixed/30">
                  <span className="text-3xl font-extrabold text-primary-container">{reinduccionCount}</span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      empleado{reinduccionCount !== 1 ? 's' : ''} pendiente{reinduccionCount !== 1 ? 's' : ''} de reinducción
                    </p>
                    <button onClick={() => navigate('/capacitacion/induccion')} className="text-xs font-bold text-primary hover:underline">
                      Ver detalle →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Afiliaciones incompletas */}
            {sinAfilCount > 0 && (
              <div className="px-8 py-6">
                <h5 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-error">assignment_late</span>
                  Afiliaciones incompletas — sin ARL o EPS activa
                </h5>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-error-container/20 border border-error/20">
                  <span className="text-3xl font-extrabold text-error">{sinAfilCount}</span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      empleado{sinAfilCount !== 1 ? 's' : ''} sin afiliaciones completas
                    </p>
                    <button onClick={() => navigate('/afiliaciones')} className="text-xs font-bold text-primary hover:underline">
                      Gestionar afiliaciones →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <SpeedDial actions={speedDialActions} />
    </div>
  )
}
