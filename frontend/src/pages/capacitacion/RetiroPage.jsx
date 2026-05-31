import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

const PASOS = [
  { label: 'Iniciar Proceso', icon: 'play_arrow', done: true },
  { label: 'Devolución de Implementos', icon: 'inventory', done: false, to: 'implementos' },
  { label: 'Carta de No Renovación', icon: 'description', done: false, to: 'carta' },
  { label: 'Liquidación', icon: 'account_balance_wallet', done: false },
  { label: 'Proceso Completado', icon: 'check_circle', done: false },
]

export default function RetiroPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/empleados/${id}`)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-primary-container">Proceso de Retiro</h2>
          <p className="text-on-surface-variant text-sm">Juliana Pérez Castro</p>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-error-container/30 rounded-xl p-5 border border-error/20 flex items-center gap-4">
        <span className="material-symbols-outlined text-2xl text-error">warning</span>
        <div>
          <p className="font-bold text-error text-sm">Proceso Irreversible</p>
          <p className="text-xs text-on-surface-variant">Una vez iniciado el proceso de retiro, no podrá revertirse sin autorización especial.</p>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card space-y-4">
        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Pasos del Proceso</h3>
        {PASOS.map((paso, i) => (
          <div key={paso.label} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${paso.done ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-container text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-lg">{paso.done ? 'check' : paso.icon}</span>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${paso.done ? 'text-emerald-700 line-through' : 'text-on-surface'}`}>{paso.label}</p>
            </div>
            {paso.to && !paso.done && (
              <button onClick={() => navigate(`/empleados/${id}/retiro/${paso.to}`)} className="text-xs font-bold text-primary hover:underline">
                Iniciar
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Motivo de Retiro</label>
        <select className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all">
          <option>Finalización de Contrato</option>
          <option>Renuncia Voluntaria</option>
          <option>Despido sin Justa Causa</option>
          <option>Pensión</option>
          <option>Fallecimiento</option>
        </select>
      </div>

      <div className="flex justify-end">
        <Button variant="danger" icon="exit_to_app">Confirmar Retiro</Button>
      </div>
    </div>
  )
}
