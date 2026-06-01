import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

const DEVENGADOS = [
  { concepto: 'Salario Básico', valor: 3500000 },
  { concepto: 'Horas Extra Diurnas (16h)', valor: 320000 },
  { concepto: 'Auxilio de Transporte', valor: 140606 },
]
const DEDUCIDOS = [
  { concepto: 'Salud (4%)', valor: 140000 },
  { concepto: 'Pensión (4%)', valor: 140000 },
  { concepto: 'Retención en la Fuente', valor: 140000 },
]

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function DetalleConceptosPage() {
  const { id, eid } = useParams()
  const navigate = useNavigate()
  const totalDev = DEVENGADOS.reduce((a, c) => a + c.valor, 0)
  const totalDed = DEDUCIDOS.reduce((a, c) => a + c.valor, 0)

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/nomina/periodos/${id}/resultado`)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Conceptos por Empleado</h2>
          <p className="text-on-surface-variant text-sm">Juliana Pérez · Periodo {id}</p>
        </div>
        <Button variant="secondary" icon="print" size="sm">Imprimir</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Devengados</h3>
          <div className="space-y-3">
            {DEVENGADOS.map((c) => (
              <div key={c.concepto} className="flex justify-between items-center">
                <span className="text-sm text-on-surface">{c.concepto}</span>
                <span className="text-sm font-semibold text-emerald-700">{fmt(c.valor)}</span>
              </div>
            ))}
            <div className="h-px bg-outline-variant/20 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-on-surface">Total Devengado</span>
              <span className="text-sm font-extrabold text-emerald-700">{fmt(totalDev)}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Deducidos</h3>
          <div className="space-y-3">
            {DEDUCIDOS.map((c) => (
              <div key={c.concepto} className="flex justify-between items-center">
                <span className="text-sm text-on-surface">{c.concepto}</span>
                <span className="text-sm font-semibold text-error">{fmt(c.valor)}</span>
              </div>
            ))}
            <div className="h-px bg-outline-variant/20 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-on-surface">Total Deducido</span>
              <span className="text-sm font-extrabold text-error">{fmt(totalDed)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary-container rounded-xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Neto a Pagar</p>
          <p className="text-3xl font-extrabold">{fmt(totalDev - totalDed)}</p>
        </div>
        <span className="material-symbols-outlined text-5xl text-white/10">payments</span>
      </div>
    </div>
  )
}
