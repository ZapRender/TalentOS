import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function AfiliacionNuevaPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ empleado: '', eps: '', arl: '', pension: '', cajaComp: '', fechaInicio: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const selects = [
    { k: 'eps', label: 'EPS', opts: ['Sura', 'Sanitas', 'Nueva EPS', 'Compensar', 'Famisanar'] },
    { k: 'arl', label: 'ARL', opts: ['Positiva', 'ARL SURA', 'Colmena', 'Bolivar'] },
    { k: 'pension', label: 'Fondo de Pensiones', opts: ['Protección', 'Colpensiones', 'Old Mutual', 'Colfondos', 'Porvenir'] },
    { k: 'cajaComp', label: 'Caja de Compensación', opts: ['Compensar', 'Cafam', 'Colsubsidio', 'Comfama', 'Comfenalco'] },
  ]

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/afiliaciones')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-primary-container">Registrar Afiliación</h2>
          <p className="text-on-surface-variant text-sm">Afiliación a entidades de seguridad social</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-card space-y-5">
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Empleado</label>
          <select value={form.empleado} onChange={set('empleado')} className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all">
            <option value="">Seleccionar empleado...</option>
            <option>Juliana Pérez Castro</option>
            <option>Carlos Andrés Duarte</option>
            <option>Beatriz Elena Salas</option>
          </select>
        </div>
        {selects.map(({ k, label, opts }) => (
          <div key={k} className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">{label}</label>
            <select value={form[k]} onChange={set(k)} className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all">
              <option value="">Seleccionar {label}...</option>
              {opts.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <Input label="Fecha de Inicio" type="date" value={form.fechaInicio} onChange={set('fechaInicio')} />
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => navigate('/afiliaciones')}>Cancelar</Button>
        <Button>Registrar Afiliación</Button>
      </div>
    </div>
  )
}
