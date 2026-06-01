import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

const INSCRITOS = [
  { nombre: 'Juliana Pérez', area: 'Finanzas', asistencia: true },
  { nombre: 'Carlos Duarte', area: 'Finanzas', asistencia: true },
  { nombre: 'Beatriz Salas', area: 'RRHH', asistencia: false },
]

export default function DetalleCapacitacionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/capacitacion')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Seguridad en el Trabajo</h2>
          <p className="text-on-surface-variant text-sm">SST · Obligatoria · 15/07/2025</p>
        </div>
        <Button icon="edit" size="sm" variant="secondary">Editar</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Inscritos', value: '45', icon: 'people' },
          { label: 'Asistencia', value: '38', icon: 'how_to_reg' },
          { label: 'Horas', value: '8', icon: 'schedule' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 text-center shadow-card">
            <span className="material-symbols-outlined text-primary text-2xl block mb-1">{s.icon}</span>
            <p className="text-2xl font-extrabold text-primary-container">{s.value}</p>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        <div className="px-8 py-5 bg-surface-container-low/50 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="font-bold text-primary-container">Lista de Asistencia</h3>
          <Button size="sm" variant="secondary" icon="download">Exportar</Button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-container-low/30">
              {['Empleado', 'Área', 'Asistencia'].map((h) => (
                <th key={h} className="px-8 py-4 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {INSCRITOS.map((ins) => (
              <tr key={ins.nombre} className="hover:bg-surface-container-low/20 transition-colors">
                <td className="px-8 py-4 text-sm font-semibold text-on-surface">{ins.nombre}</td>
                <td className="px-8 py-4 text-xs text-on-surface-variant">{ins.area}</td>
                <td className="px-8 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${ins.asistencia ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`} />
                    <span className={`text-xs font-semibold ${ins.asistencia ? 'text-emerald-700' : 'text-slate-500'}`}>{ins.asistencia ? 'Asistió' : 'No asistió'}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
