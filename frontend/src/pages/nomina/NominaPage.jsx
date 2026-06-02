import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'

const stats = [
  { label: 'Empleados en Nómina', value: '1,284', icon: 'groups', bg: 'bg-primary-fixed', color: 'text-primary' },
  { label: 'Nómina del Periodo', value: '$4.2B', icon: 'payments', bg: 'bg-secondary-fixed', color: 'text-secondary' },
  { label: 'Periodos Cerrados', value: '6', icon: 'check_circle', bg: 'bg-tertiary-fixed', color: 'text-tertiary' },
  { label: 'Pendientes Aprobación', value: '1', icon: 'pending_actions', bg: 'bg-error-container', color: 'text-error' },
]

const periodos = [
  { id: 'P-2025-06', nombre: 'Junio 2025', empleados: 1284, total: '$4,248,000,000', estado: 'pending', fecha: '30/06/2025' },
  { id: 'P-2025-05', nombre: 'Mayo 2025', empleados: 1280, total: '$4,220,000,000', estado: 'active', fecha: '31/05/2025' },
  { id: 'P-2025-04', nombre: 'Abril 2025', empleados: 1275, total: '$4,198,000,000', estado: 'active', fecha: '30/04/2025' },
]

export default function NominaPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-primary-container tracking-tight">Gestión de Nómina</h2>
          <p className="text-on-surface-variant mt-1">Liquidación y control de periodos de pago</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="list" onClick={() => navigate('/nomina/periodos')}>Periodos</Button>
          <Button icon="add">Nuevo Periodo</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-card">
            <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-extrabold text-primary-container">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-card overflow-hidden">
        <div className="px-8 py-5 bg-surface-container-low/50 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="font-bold text-primary-container">Periodos Recientes</h3>
          <Button variant="secondary" size="sm" onClick={() => navigate('/nomina/periodos')}>Ver todos</Button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low/30">
              {['Periodo', 'Empleados', 'Total Nómina', 'Estado', 'Fecha Cierre', 'Acciones'].map((h) => (
                <th key={h} className="px-8 py-4 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {periodos.map((p) => (
              <tr key={p.id} className="hover:bg-surface-container-low/20 transition-colors group">
                <td className="px-8 py-5">
                  <p className="font-bold text-on-surface">{p.nombre}</p>
                  <p className="text-[11px] text-on-surface-variant">{p.id}</p>
                </td>
                <td className="px-8 py-5 text-sm font-semibold text-on-surface">{p.empleados.toLocaleString()}</td>
                <td className="px-8 py-5 text-sm font-bold text-primary-container">{p.total}</td>
                <td className="px-8 py-5"><StatusOrb status={p.estado} label={p.estado === 'pending' ? 'Pendiente' : 'Liquidado'} /></td>
                <td className="px-8 py-5 text-xs text-on-surface-variant">{p.fecha}</td>
                <td className="px-8 py-5">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/nomina/periodos/${p.id}/novedades`)} className="text-xs font-bold text-primary hover:underline">Novedades</button>
                    <button onClick={() => navigate(`/nomina/periodos/${p.id}/aprobar`)} className="text-xs font-bold text-primary hover:underline">Aprobar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Liquidación Contrato', icon: 'account_balance_wallet', to: '/nomina/liquidacion-contrato', desc: 'Calcular prestaciones y liquidaciones' },
          { label: 'Exportar PILA', icon: 'description', to: '/nomina/pila', desc: 'Generar archivo plano PILA' },
          { label: 'Desprendibles', icon: 'receipt', to: `/nomina/periodos/P-2025-06/desprendibles`, desc: 'Enviar comprobantes de pago' },
        ].map((a) => (
          <button key={a.label} onClick={() => navigate(a.to)} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-card flex items-center gap-4 hover:bg-surface-container-low transition-colors text-left group">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center flex-shrink-0 group-hover:bg-primary-fixed-dim transition-colors">
              <span className="material-symbols-outlined text-primary">{a.icon}</span>
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm">{a.label}</p>
              <p className="text-xs text-on-surface-variant">{a.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
