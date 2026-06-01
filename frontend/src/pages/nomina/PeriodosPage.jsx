import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'

const PERIODOS = [
  { id: 'P-2025-06', nombre: 'Junio 2025', inicio: '01/06/2025', fin: '30/06/2025', empleados: 1284, total: '$4,248,000,000', estado: 'pending' },
  { id: 'P-2025-05', nombre: 'Mayo 2025', inicio: '01/05/2025', fin: '31/05/2025', empleados: 1280, total: '$4,220,000,000', estado: 'active' },
  { id: 'P-2025-04', nombre: 'Abril 2025', inicio: '01/04/2025', fin: '30/04/2025', empleados: 1275, total: '$4,198,000,000', estado: 'active' },
  { id: 'P-2025-03', nombre: 'Marzo 2025', inicio: '01/03/2025', fin: '31/03/2025', empleados: 1270, total: '$4,155,000,000', estado: 'active' },
]

export default function PeriodosPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-3">
            <button onClick={() => navigate('/nomina')} className="hover:text-primary">Nómina</button>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-primary-container">Periodos</span>
          </nav>
          <h2 className="text-3xl font-extrabold text-primary-container">Listado de Periodos</h2>
        </div>
        <Button icon="add">Nuevo Periodo</Button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              {['Periodo', 'Fechas', 'Empleados', 'Total Nómina', 'Estado', 'Acciones'].map((h, i) => (
                <th key={h} className={`px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {PERIODOS.map((p, i) => (
              <tr key={p.id} className={`group hover:bg-surface-container-low/30 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/10' : ''}`}>
                <td className="px-8 py-5">
                  <p className="font-bold text-on-surface">{p.nombre}</p>
                  <p className="text-[11px] text-on-surface-variant">{p.id}</p>
                </td>
                <td className="px-8 py-5 text-xs text-on-surface-variant">{p.inicio} — {p.fin}</td>
                <td className="px-8 py-5 text-sm font-semibold text-on-surface">{p.empleados.toLocaleString()}</td>
                <td className="px-8 py-5 text-sm font-bold text-primary-container">{p.total}</td>
                <td className="px-8 py-5"><StatusOrb status={p.estado} label={p.estado === 'pending' ? 'En Proceso' : 'Cerrado'} /></td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/nomina/periodos/${p.id}/novedades`)} className="text-[11px] font-bold text-primary hover:underline">Novedades</button>
                    <button onClick={() => navigate(`/nomina/periodos/${p.id}/resultado`)} className="text-[11px] font-bold text-primary hover:underline">Resultado</button>
                    <button onClick={() => navigate(`/nomina/periodos/${p.id}/aprobar`)} className="text-[11px] font-bold text-primary hover:underline">Aprobar</button>
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
