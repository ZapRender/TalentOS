import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'

const CAPS = [
  { id: 1, nombre: 'Seguridad en el Trabajo', area: 'SST', fecha: '15/07/2025', inscritos: 45, estado: 'active', tipo: 'Obligatoria' },
  { id: 2, nombre: 'Excel Avanzado para Finanzas', area: 'Finanzas', fecha: '20/07/2025', inscritos: 12, estado: 'pending', tipo: 'Voluntaria' },
  { id: 3, nombre: 'Liderazgo y Gestión de Equipos', area: 'RRHH', fecha: '01/08/2025', inscritos: 18, estado: 'pending', tipo: 'Gerencial' },
  { id: 4, nombre: 'Inducción Corporativa', area: 'General', fecha: '05/06/2025', inscritos: 8, estado: 'active', tipo: 'Obligatoria' },
]

export default function CapacitacionPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-primary-container tracking-tight">Plan de Capacitación 2025</h2>
          <p className="text-on-surface-variant mt-1">Programas de formación y desarrollo del talento</p>
        </div>
        <Button icon="add">Nueva Capacitación</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Programas', value: '12', icon: 'school' },
          { label: 'Empleados Formados', value: '348', icon: 'groups' },
          { label: 'Horas Ejecutadas', value: '1,240', icon: 'schedule' },
          { label: 'Pendientes', value: '3', icon: 'pending' },
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CAPS.map((c) => (
          <div key={c.id} className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10 shadow-card hover:shadow-editorial transition-shadow cursor-pointer group" onClick={() => navigate(`/capacitacion/${c.id}`)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${c.tipo === 'Obligatoria' ? 'bg-primary-fixed text-primary' : c.tipo === 'Gerencial' ? 'bg-secondary-fixed text-secondary' : 'bg-surface-container text-on-surface-variant'}`}>
                  {c.tipo}
                </span>
              </div>
              <StatusOrb status={c.estado} />
            </div>
            <h3 className="font-bold text-on-surface text-lg mb-1">{c.nombre}</h3>
            <p className="text-xs text-on-surface-variant mb-4">{c.area}</p>
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                {c.fecha}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">people</span>
                {c.inscritos} inscritos
              </span>
              <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
