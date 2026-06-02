import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function AprobacionContadorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/nomina/liquidacion-contrato')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-primary-container">Aprobación Contador</h2>
          <p className="text-on-surface-variant text-sm">Liquidación #{id}</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-5">Resumen de Liquidación</h3>
        <div className="space-y-3">
          {[
            ['Empleado', 'Andrés Villalba'],
            ['Cargo', 'Analista de Sistemas'],
            ['Tipo de Retiro', 'Finalización de Contrato'],
            ['Total Calculado', fmt(4250000)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-2 border-b border-outline-variant/10 last:border-0">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{k}</span>
              <span className="text-sm font-semibold text-on-surface">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-tertiary-fixed/20 rounded-xl p-5 border border-tertiary-fixed/40">
        <h3 className="font-bold text-tertiary mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined">warning</span>
          Verificación Requerida
        </h3>
        <p className="text-sm text-on-surface-variant">Confirme que los valores calculados cumplen con la normativa laboral colombiana antes de aprobar.</p>
      </div>

      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Observaciones del Contador</label>
        <textarea
          rows={3}
          placeholder="Observaciones adicionales (opcional)..."
          className="w-full px-4 py-3 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all resize-none"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="danger" icon="cancel">Rechazar</Button>
        <Button icon="check_circle">Aprobar Liquidación</Button>
      </div>
    </div>
  )
}
