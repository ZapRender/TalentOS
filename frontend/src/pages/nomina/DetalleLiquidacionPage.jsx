import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function DetalleLiquidacionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/nomina/liquidacion-contrato')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Detalle de Liquidación</h2>
          <p className="text-on-surface-variant text-sm">Liquidación #{id}</p>
        </div>
        <Button variant="secondary" icon="picture_as_pdf" size="sm">Exportar PDF</Button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card space-y-4">
        <h3 className="font-bold text-primary-container">Andrés Villalba · Analista de Sistemas</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Tipo de Retiro', 'Finalización de Contrato'],
            ['Fecha Ingreso', '15/03/2020'],
            ['Fecha Retiro', '15/07/2025'],
            ['Tiempo Laborado', '5 años, 4 meses'],
            ['Último Salario', fmt(3800000)],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">{k}</p>
              <p className="font-semibold text-on-surface">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Conceptos de Liquidación</h3>
        <div className="space-y-3">
          {[
            { concepto: 'Cesantías', valor: 3800000 * 5 / 12 },
            { concepto: 'Intereses sobre Cesantías (12%)', valor: 3800000 * 5 / 12 * 0.12 },
            { concepto: 'Prima de Servicios', valor: 3800000 * 4 / 12 },
            { concepto: 'Vacaciones Proporcionales', valor: 3800000 / 2 * 5 / 12 },
            { concepto: 'Indemnización', valor: 3800000 * 2 },
          ].map((c) => (
            <div key={c.concepto} className="flex justify-between items-center">
              <span className="text-sm text-on-surface">{c.concepto}</span>
              <span className="text-sm font-semibold text-emerald-700">{fmt(Math.round(c.valor))}</span>
            </div>
          ))}
          <div className="h-px bg-outline-variant/20 pt-2" />
          <div className="flex justify-between items-center pt-1">
            <span className="font-bold text-on-surface">Total Liquidación</span>
            <span className="font-extrabold text-xl text-primary-container">{fmt(4250000)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
