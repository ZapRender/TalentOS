import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { payrollService } from '../../services/payrollService'
import { employeeService } from '../../services/employeeService'

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function LiquidacionContratoPage() {
  const navigate = useNavigate()
  const [empleados, setEmpleados] = useState([])
  const [form, setForm] = useState({ empleado_id: '', fecha_terminacion: '', motivo_retiro: 'FINALIZACION' })
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  useEffect(() => {
    employeeService.list().then(setEmpleados).catch(() => {})
  }, [])

  const handleCalcular = async () => {
    if (!form.empleado_id || !form.fecha_terminacion || !form.motivo_retiro) {
      setError('Complete todos los campos requeridos.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await payrollService.liquidacionContrato.create(form)
      setResultado(res)
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al calcular la liquidación.')
    } finally {
      setLoading(false)
    }
  }

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

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{error}</p>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-card space-y-6">
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Empleado</label>
          <select value={form.empleado_id} onChange={set('empleado_id')} className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all">
            <option value="">Seleccionar empleado...</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre || `${e.primer_nombre} ${e.primer_apellido}`}</option>
            ))}
          </select>
        </div>
        <Input label="Fecha de Terminación" type="date" value={form.fecha_terminacion} onChange={set('fecha_terminacion')} />
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Motivo de Retiro</label>
          <select value={form.motivo_retiro} onChange={set('motivo_retiro')} className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all">
            <option value="FINALIZACION">Finalización de Contrato</option>
            <option value="RENUNCIA">Renuncia Voluntaria</option>
            <option value="DESPIDO">Despido sin Justa Causa</option>
            <option value="MUTUO">Mutuo Acuerdo</option>
            <option value="PENSION">Pensión</option>
          </select>
        </div>
      </div>

      {resultado && (
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card space-y-4">
          <h3 className="font-bold text-primary-container">Resultado del Cálculo</h3>
          <div className="space-y-2">
            {[
              ['Vacaciones', resultado.vacaciones],
              ['Cesantías', resultado.cesantias],
              ['Intereses Cesantías', resultado.intereses_cesantias],
              ['Prima de Servicios', resultado.prima],
              ['Indemnización', resultado.indemnizacion],
              ['Total', resultado.total],
            ].filter(([, v]) => v !== undefined).map(([k, v]) => (
              <div key={k} className={`flex justify-between items-center py-2 border-b border-outline-variant/10 last:border-0 ${k === 'Total' ? 'font-bold' : ''}`}>
                <span className="text-sm text-on-surface-variant">{k}</span>
                <span className={`text-sm ${k === 'Total' ? 'text-primary-container text-base font-extrabold' : 'text-on-surface'}`}>{fmt(v)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button icon="send" onClick={() => navigate(`/nomina/liquidacion-contrato/${resultado.id}/aprobar`)}>
              Enviar a Aprobación Contador
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => navigate('/nomina')}>Cancelar</Button>
        <Button icon="calculate" onClick={handleCalcular} disabled={loading}>
          {loading ? 'Calculando...' : 'Calcular'}
        </Button>
      </div>
    </div>
  )
}
