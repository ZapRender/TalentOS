import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'

const APORTES = [
  { empleado: 'Juliana Pérez Castro', eps: 'Sura', arl: 'Positiva', pension: 'Protección', cajaComp: 'Compensar', periodo: 'Jun 2025', estado: 'active' },
  { empleado: 'Carlos Andrés Duarte', eps: 'Nueva EPS', arl: 'ARL SURA', pension: 'Colpensiones', cajaComp: 'Cafam', periodo: 'Jun 2025', estado: 'active' },
  { empleado: 'Beatriz Elena Salas', eps: 'Sanitas', arl: 'Positiva', pension: 'Old Mutual', cajaComp: 'Colsubsidio', periodo: 'Jun 2025', estado: 'pending' },
]

export default function AfiliacionesPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-primary-container tracking-tight">Aportes Seguridad Social</h2>
          <p className="text-on-surface-variant mt-1">Control de afiliaciones y aportes al sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="description" onClick={() => navigate('/nomina/pila')}>Exportar PILA</Button>
          <Button icon="add" onClick={() => navigate('/afiliaciones/nueva')}>Nueva Afiliación</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Afiliados', value: '1,284', icon: 'groups' },
          { label: 'Novedades Mes', value: '12', icon: 'notification_important' },
          { label: 'Retiros Mes', value: '3', icon: 'person_remove' },
          { label: 'Pendientes', value: '5', icon: 'pending_actions' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-card">
            <div className="w-9 h-9 rounded-lg bg-primary-fixed text-primary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-extrabold text-primary-container">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                {['Empleado', 'EPS', 'ARL', 'Pensión', 'Caja Comp.', 'Periodo', 'Estado', ''].map((h, i) => (
                  <th key={h} className="px-6 py-5 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {APORTES.map((a, i) => (
                <tr key={a.empleado} className={`group hover:bg-surface-container-low/30 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/10' : ''}`}>
                  <td className="px-6 py-5 text-sm font-semibold text-on-surface whitespace-nowrap">{a.empleado}</td>
                  <td className="px-6 py-5 text-xs text-on-surface-variant">{a.eps}</td>
                  <td className="px-6 py-5 text-xs text-on-surface-variant">{a.arl}</td>
                  <td className="px-6 py-5 text-xs text-on-surface-variant">{a.pension}</td>
                  <td className="px-6 py-5 text-xs text-on-surface-variant">{a.cajaComp}</td>
                  <td className="px-6 py-5 text-xs text-on-surface-variant">{a.periodo}</td>
                  <td className="px-6 py-5"><StatusOrb status={a.estado} /></td>
                  <td className="px-6 py-5">
                    <button className="text-[11px] font-bold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
