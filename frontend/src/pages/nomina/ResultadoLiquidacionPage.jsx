import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

const EMPLEADOS = [
  { id: 'E1', nombre: 'Juliana Pérez', cargo: 'Analista Contable', salario: 3500000, devengado: 3820000, deducido: 420000, neto: 3400000 },
  { id: 'E2', nombre: 'Carlos Duarte', cargo: 'Analista Financiero', salario: 4200000, devengado: 3784000, deducido: 504000, neto: 3280000 },
  { id: 'E3', nombre: 'Beatriz Salas', cargo: 'Gestora de Talento', salario: 3800000, devengado: 4300000, deducido: 456000, neto: 3844000 },
]

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function ResultadoLiquidacionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const total = EMPLEADOS.reduce((a, e) => a + e.neto, 0)

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/nomina/periodos')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Resultado de Liquidación</h2>
          <p className="text-on-surface-variant text-sm">Periodo: {id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="download">Exportar</Button>
          <Button icon="send" onClick={() => navigate(`/nomina/periodos/${id}/aprobar`)}>Enviar a Aprobación</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Devengado', value: fmt(EMPLEADOS.reduce((a, e) => a + e.devengado, 0)), color: 'text-emerald-700' },
          { label: 'Total Deducido', value: fmt(EMPLEADOS.reduce((a, e) => a + e.deducido, 0)), color: 'text-error' },
          { label: 'Total a Pagar', value: fmt(total), color: 'text-primary-container', highlight: true },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-5 ${s.highlight ? 'bg-primary-container text-white' : 'bg-surface-container-lowest border border-outline-variant/10'} shadow-card`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${s.highlight ? 'text-white/70' : 'text-on-surface-variant'}`}>{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.highlight ? 'text-white' : s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              {['Empleado', 'Salario Base', 'Total Devengado', 'Total Deducido', 'Neto a Pagar', 'Detalle'].map((h, i) => (
                <th key={h} className={`px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {EMPLEADOS.map((e, i) => (
              <tr key={e.id} className={`group hover:bg-surface-container-low/30 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/10' : ''}`}>
                <td className="px-8 py-5">
                  <p className="font-semibold text-on-surface text-sm">{e.nombre}</p>
                  <p className="text-[11px] text-on-surface-variant">{e.cargo}</p>
                </td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">{fmt(e.salario)}</td>
                <td className="px-8 py-5 text-sm font-semibold text-emerald-700">{fmt(e.devengado)}</td>
                <td className="px-8 py-5 text-sm font-semibold text-error">{fmt(e.deducido)}</td>
                <td className="px-8 py-5 text-sm font-bold text-primary-container">{fmt(e.neto)}</td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => navigate(`/nomina/periodos/${id}/empleado/${e.id}`)} className="text-[11px] font-bold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver conceptos
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
