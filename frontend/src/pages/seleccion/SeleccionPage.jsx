import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'

const stats = [
  { label: 'Vacantes Activas', value: '7', icon: 'work', color: 'bg-primary-fixed text-primary' },
  { label: 'Candidatos Activos', value: '34', icon: 'people', color: 'bg-secondary-fixed text-secondary' },
  { label: 'Entrevistas Hoy', value: '5', icon: 'event', color: 'bg-tertiary-fixed text-tertiary' },
  { label: 'Ofertas Enviadas', value: '2', icon: 'send', color: 'bg-error-container text-error' },
]

const vacantes = [
  { id: 1, cargo: 'Desarrollador Backend', area: 'Tecnología', candidatos: 8, estado: 'active', prioridad: 'Alta' },
  { id: 2, cargo: 'Analista de RRHH', area: 'Recursos Humanos', candidatos: 5, estado: 'active', prioridad: 'Media' },
  { id: 3, cargo: 'Contador Senior', area: 'Finanzas', candidatos: 3, estado: 'pending', prioridad: 'Alta' },
]

export default function SeleccionPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-primary-container tracking-tight">Selección de Talento</h2>
          <p className="text-on-surface-variant mt-1">Gestión de procesos de contratación</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/seleccion/requerimientos')}>Requerimientos</Button>
          <Button icon="person_add" onClick={() => navigate('/seleccion/candidatos')}>Ver Candidatos</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-card">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-3xl font-extrabold text-primary-container">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-card overflow-hidden">
        <div className="px-8 py-5 bg-surface-container-low/50 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="font-bold text-primary-container">Vacantes Activas</h3>
          <Button variant="secondary" size="sm" onClick={() => navigate('/seleccion/requerimientos')}>Ver todas</Button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low/30">
              {['Cargo', 'Área', 'Candidatos', 'Prioridad', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="px-8 py-4 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {vacantes.map((v) => (
              <tr key={v.id} className="hover:bg-surface-container-low/20 transition-colors group">
                <td className="px-8 py-4 text-sm font-semibold text-on-surface">{v.cargo}</td>
                <td className="px-8 py-4 text-xs text-on-surface-variant">{v.area}</td>
                <td className="px-8 py-4">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-primary-container">
                    <span className="material-symbols-outlined text-lg text-primary">people</span>
                    {v.candidatos}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${v.prioridad === 'Alta' ? 'bg-error-container text-error' : 'bg-tertiary-fixed text-tertiary'}`}>
                    {v.prioridad}
                  </span>
                </td>
                <td className="px-8 py-4"><StatusOrb status={v.estado} /></td>
                <td className="px-8 py-4">
                  <button onClick={() => navigate('/seleccion/candidatos')} className="text-xs font-bold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver candidatos
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
