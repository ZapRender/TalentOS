import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function LiquidacionContratoPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ empleado: '', fechaIngreso: '', fechaRetiro: '', tipoRetiro: 'FINALIZACION', salario: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/nomina')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-primary-container">Calcular Liquidación de Contrato</h2>
          <p className="text-on-surface-variant text-sm">Prestaciones sociales al momento de retiro</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-card space-y-6">
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Empleado</label>
          <select value={form.empleado} onChange={set('empleado')} className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all">
            <option value="">Seleccionar empleado...</option>
            <option value="1">Juliana Pérez Castro</option>
            <option value="2">Andrés Villalba</option>
            <option value="3">Claudia Ortiz</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Input label="Fecha de Ingreso" type="date" value={form.fechaIngreso} onChange={set('fechaIngreso')} />
          <Input label="Fecha de Retiro" type="date" value={form.fechaRetiro} onChange={set('fechaRetiro')} />
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Tipo de Retiro</label>
          <select value={form.tipoRetiro} onChange={set('tipoRetiro')} className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all">
            <option value="FINALIZACION">Finalización de Contrato</option>
            <option value="RENUNCIA">Renuncia Voluntaria</option>
            <option value="DESPIDO">Despido sin Justa Causa</option>
            <option value="MUTUO">Mutuo Acuerdo</option>
            <option value="PENSION">Pensión</option>
          </select>
        </div>
        <Input label="Último Salario Base" value={form.salario} onChange={set('salario')} placeholder="Ej. 3,500,000" />
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => navigate('/nomina')}>Cancelar</Button>
        <Button icon="calculate" onClick={() => navigate('/nomina/liquidacion/L-001')}>Calcular</Button>
      </div>
    </div>
  )
}
