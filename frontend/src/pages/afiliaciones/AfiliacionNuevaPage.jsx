import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { payrollService } from '../../services/payrollService'
import { employeeService } from '../../services/employeeService'

export default function AfiliacionNuevaPage() {
  const navigate = useNavigate()
  const [empleados, setEmpleados] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    empleado_id: '',
    tipo_entidad: 'EPS',
    nombre_entidad: '',
    fecha_afiliacion: '',
    region: '',
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  useEffect(() => {
    employeeService.list().then(setEmpleados).catch(() => {})
  }, [])

  const handleSubmit = async () => {
    if (!form.empleado_id || !form.nombre_entidad || !form.fecha_afiliacion) {
      setError('Complete los campos requeridos: empleado, entidad y fecha.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await payrollService.afiliaciones.create(form)
      setSuccess('Afiliación registrada exitosamente.')
      setTimeout(() => navigate('/afiliaciones'), 1500)
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al registrar la afiliación.')
    } finally {
      setSaving(false)
    }
  }

  const tiposEntidad = ['EPS', 'ARL', 'PENSION', 'CAJA_COMPENSACION']

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

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <p className="text-sm text-emerald-800 font-medium">{success}</p>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-card space-y-5">
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Empleado</label>
          <select value={form.empleado_id} onChange={set('empleado_id')} className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all">
            <option value="">Seleccionar empleado...</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre || `${e.primer_nombre} ${e.primer_apellido}`}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Tipo de Entidad</label>
          <select value={form.tipo_entidad} onChange={set('tipo_entidad')} className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all">
            {tiposEntidad.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
        <Input label="Nombre de la Entidad" value={form.nombre_entidad} onChange={set('nombre_entidad')} placeholder="Ej. Sura, Positiva, Colpensiones..." />
        <Input label="Fecha de Afiliación" type="date" value={form.fecha_afiliacion} onChange={set('fecha_afiliacion')} />
        <Input label="Región" value={form.region} onChange={set('region')} placeholder="Ej. Bogotá, Medellín..." />
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => navigate('/afiliaciones')}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Registrando...' : 'Registrar Afiliación'}</Button>
      </div>
    </div>
  )
}
