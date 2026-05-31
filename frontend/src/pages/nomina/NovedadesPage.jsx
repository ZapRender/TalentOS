import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

const TIPOS = ['Horas Extra', 'Incapacidad', 'Vacaciones', 'Descuento', 'Bonificación', 'Embargo']

const NOVEDADES = [
  { id: 1, empleado: 'Juliana Pérez', tipo: 'Horas Extra', cantidad: 16, valor: '$320,000', fecha: '10/06/2025' },
  { id: 2, empleado: 'Carlos Duarte', tipo: 'Incapacidad', cantidad: 5, valor: '-$416,000', fecha: '12/06/2025' },
  { id: 3, empleado: 'Beatriz Salas', tipo: 'Bonificación', cantidad: 1, valor: '$500,000', fecha: '15/06/2025' },
]

export default function NovedadesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/nomina/periodos')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Novedades del Periodo</h2>
          <p className="text-on-surface-variant text-sm">Periodo: {id}</p>
        </div>
        <Button icon="add">Registrar Novedad</Button>
      </div>

      {/* Tipo filters */}
      <div className="flex flex-wrap gap-2">
        <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-md">Todas</button>
        {TIPOS.map((t) => (
          <button key={t} className="px-3 py-1.5 bg-surface-container text-on-surface-variant text-xs font-medium rounded-md hover:bg-surface-container-high transition-colors">{t}</button>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              {['Empleado', 'Tipo de Novedad', 'Cantidad / Días', 'Valor', 'Fecha', 'Acciones'].map((h, i) => (
                <th key={h} className={`px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {NOVEDADES.map((n, i) => (
              <tr key={n.id} className={`group hover:bg-surface-container-low/30 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/10' : ''}`}>
                <td className="px-8 py-5 text-sm font-semibold text-on-surface">{n.empleado}</td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-bold bg-primary-fixed text-primary px-2 py-0.5 rounded uppercase tracking-wider">{n.tipo}</span>
                </td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">{n.cantidad}</td>
                <td className={`px-8 py-5 text-sm font-bold ${n.valor.startsWith('-') ? 'text-error' : 'text-emerald-700'}`}>{n.valor}</td>
                <td className="px-8 py-5 text-xs text-on-surface-variant">{n.fecha}</td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-7 h-7 flex items-center justify-center rounded text-primary hover:bg-primary/5">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded text-error/70 hover:bg-error/5">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button icon="calculate" onClick={() => navigate(`/nomina/periodos/${id}/resultado`)}>Calcular Liquidación</Button>
      </div>
    </div>
  )
}
