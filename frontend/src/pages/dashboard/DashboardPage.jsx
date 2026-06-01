import { useAuth } from '../../context/AuthContext'

const stats = [
  {
    icon: 'groups',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-primary',
    badge: '+2.4%',
    badgeCls: 'text-emerald-600 bg-emerald-50',
    label: 'Total Empleados',
    value: '1,284',
  },
  {
    icon: 'person_add',
    iconBg: 'bg-secondary-fixed',
    iconColor: 'text-secondary',
    badge: 'Este mes',
    badgeCls: 'text-on-surface-variant bg-surface-container',
    label: 'Contrataciones',
    value: '12',
  },
  {
    icon: 'event_busy',
    iconBg: 'bg-tertiary-fixed',
    iconColor: 'text-tertiary',
    badge: 'Hoy',
    badgeCls: 'text-tertiary bg-tertiary-fixed-dim/20',
    label: 'Ausentismos',
    value: '8',
  },
  {
    icon: 'pending_actions',
    iconBg: 'bg-error-container',
    iconColor: 'text-error',
    orb: true,
    label: 'Sols. Pendientes',
    value: '24',
  },
]

const months = [
  { label: 'Ene', hire: 60, exit: 20 },
  { label: 'Feb', hire: 75, exit: 15 },
  { label: 'Mar', hire: 45, exit: 30 },
  { label: 'Abr', hire: 85, exit: 10 },
  { label: 'May', hire: 65, exit: 25 },
  { label: 'Jun', hire: 90, exit: 12 },
]

const tasks = [
  {
    icon: 'fact_check',
    title: 'Revisar documentación de nuevo ingreso: Felipe Salas',
    sub: 'Vence hoy a las 5:00 PM',
    action: 'Ejecutar',
    variant: 'primary',
  },
  {
    icon: 'mail',
    title: 'Enviar certificados laborales solicitados (12)',
    sub: '8 solicitudes pendientes de firma digital',
    action: 'Ver Detalles',
    variant: 'secondary',
  },
  {
    icon: 'update',
    title: 'Actualización de tablas de retención en la fuente',
    sub: 'Importante para la nómina del periodo actual',
    action: 'Configurar',
    variant: 'secondary',
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const nombre = user?.nombre?.split(' ')[0] || 'Administrador'

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div>
        <h2 className="text-3xl font-bold text-on-surface tracking-tight">
          Bienvenido de nuevo, {nombre}
        </h2>
        <p className="text-on-surface-variant mt-2 text-lg">
          Aquí está el resumen ejecutivo de la gestión humana para hoy.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-surface-container-lowest p-6 rounded-xl shadow-card border border-outline-variant/10"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 ${s.iconBg} rounded-lg`}>
                <span className={`material-symbols-outlined ${s.iconColor}`}>{s.icon}</span>
              </div>
              {s.orb ? (
                <span className="w-2 h-2 rounded-full bg-error animate-pulse shadow-[0_0_8px_rgba(186,26,26,0.5)]" />
              ) : (
                <span className={`text-xs font-bold px-2 py-1 rounded ${s.badgeCls}`}>
                  {s.badge}
                </span>
              )}
            </div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">
              {s.label}
            </p>
            <h3 className="text-3xl font-extrabold text-primary-container">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-card-md border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xl font-bold text-primary-container">Tendencia de Talento</h4>
              <p className="text-sm text-on-surface-variant">
                Contrataciones vs. Retiros (Últimos 6 meses)
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs font-medium text-on-surface-variant">Contrataciones</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary-fixed-dim" />
                <span className="text-xs font-medium text-on-surface-variant">Retiros</span>
              </div>
            </div>
          </div>
          <div className="h-[260px] w-full flex items-end justify-between gap-4 px-2 border-b border-outline-variant/30 pb-2">
            {months.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full flex justify-center gap-1 h-full items-end">
                  <div
                    className="w-4 bg-primary rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${m.hire}%` }}
                  />
                  <div
                    className="w-4 bg-primary-fixed-dim rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${m.exit}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase mt-2">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panels */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          {/* Birthdays */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <h5 className="font-bold text-primary-container flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">cake</span>
                Cumpleaños del mes
              </h5>
              <a href="#" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">
                Ver todos
              </a>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Lucía Méndez', dept: '14 de Julio • Marketing' },
                { name: 'Roberto Cano', dept: '22 de Julio • IT' },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                    {p.name
                      .split(' ')
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{p.dept}</p>
                  </div>
                  <span className="ml-auto material-symbols-outlined text-tertiary-fixed-dim">
                    celebration
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Liquidaciones */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
            <h5 className="font-bold text-primary-container flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
              Próximas Liquidaciones
            </h5>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-primary">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold">Andrés Villalba</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed rounded">
                    Finalización
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>Fecha: 15/07/2025</span>
                  <span className="font-bold text-primary">$4,250,000</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-outline-variant">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold">Claudia Ortiz</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-surface-container text-on-surface-variant rounded">
                    Renuncia
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>Fecha: 20/07/2025</span>
                  <span className="font-bold text-primary">$2,890,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority tasks */}
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-card-md border border-outline-variant/10">
        <h4 className="text-xl font-bold text-primary-container mb-6">Acciones Prioritarias</h4>
        <div className="space-y-1">
          {tasks.map((t, i) => (
            <div
              key={i}
              className="group flex items-center justify-between py-4 hover:bg-surface-container-low transition-colors px-4 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">{t.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.title}</p>
                  <p className="text-xs text-on-surface-variant">{t.sub}</p>
                </div>
              </div>
              <button
                className={
                  t.variant === 'primary'
                    ? 'ml-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-md hover:opacity-90 transition-opacity flex-shrink-0'
                    : 'ml-4 px-4 py-2 border border-outline-variant text-primary text-xs font-bold rounded-md hover:bg-surface-container transition-colors flex-shrink-0'
                }
              >
                {t.action}
              </button>
            </div>
          ))}
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
