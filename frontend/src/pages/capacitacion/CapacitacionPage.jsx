import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { trainingService } from '../../services/trainingService'

export default function CapacitacionPage() {
  const navigate = useNavigate()
  const anioActual = new Date().getFullYear()
  const [caps, setCaps] = useState([])
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nombre: '', area: '', fecha: '', tipo: 'Obligatoria', duracion_horas: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const load = () => {
    setLoading(true)
    Promise.all([
      trainingService.capacitaciones.list(),
      trainingService.plan.get(anioActual),
    ])
      .then(([capsList, planData]) => {
        setCaps(capsList)
        setPlan(planData)
      })
      .catch(() => setError('No se pudo cargar la información de capacitaciones.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.nombre || !form.fecha) {
      setError('El nombre y la fecha son requeridos.')
      return
    }
    setSaving(true)
    try {
      await trainingService.capacitaciones.create(form)
      setModalOpen(false)
      setForm({ nombre: '', area: '', fecha: '', tipo: 'Obligatoria', duracion_horas: '' })
      load()
    } catch {
      setError('Error al crear la capacitación.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-primary-container tracking-tight">Plan de Capacitación {anioActual}</h2>
          <p className="text-on-surface-variant mt-1">Programas de formación y desarrollo del talento</p>
        </div>
        <Button icon="add" onClick={() => setModalOpen(true)}>Nueva Capacitación</Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Programas', value: plan?.total_programas?.toString() || caps.length.toString(), icon: 'school' },
          { label: 'Empleados Formados', value: plan?.empleados_formados?.toString() || '—', icon: 'groups' },
          { label: 'Horas Ejecutadas', value: plan?.horas_ejecutadas?.toString() || '—', icon: 'schedule' },
          { label: 'Pendientes', value: caps.filter((c) => c.estado === 'pending' || c.estado === 'PENDIENTE').length.toString(), icon: 'pending' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-card">
            <div className="w-9 h-9 rounded-lg bg-primary-fixed text-primary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-extrabold text-primary-container">{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin">autorenew</span>
          <span className="text-sm">Cargando capacitaciones...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {caps.map((c) => (
            <div
              key={c.id}
              className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10 shadow-card hover:shadow-editorial transition-shadow cursor-pointer group"
              onClick={() => navigate(`/capacitacion/${c.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${c.tipo === 'Obligatoria' ? 'bg-primary-fixed text-primary' : c.tipo === 'Gerencial' ? 'bg-secondary-fixed text-secondary' : 'bg-surface-container text-on-surface-variant'}`}>
                  {c.tipo}
                </span>
                <StatusOrb status={c.estado === 'ACTIVO' || c.estado === 'active' ? 'active' : 'pending'} />
              </div>
              <h3 className="font-bold text-on-surface text-lg mb-1">{c.nombre}</h3>
              <p className="text-xs text-on-surface-variant mb-4">{c.area}</p>
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  {c.fecha}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">people</span>
                  {c.inscritos || 0} inscritos
                </span>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
          ))}
          {caps.length === 0 && (
            <p className="col-span-2 text-center text-sm text-on-surface-variant py-12">No hay capacitaciones registradas.</p>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Capacitación">
        <div className="space-y-4">
          <Input label="Nombre del programa" value={form.nombre} onChange={set('nombre')} placeholder="Ej. Seguridad en el Trabajo" />
          <Input label="Área" value={form.area} onChange={set('area')} placeholder="Ej. SST, Finanzas, RRHH..." />
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Tipo</label>
            <select value={form.tipo} onChange={set('tipo')} className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all">
              <option value="Obligatoria">Obligatoria</option>
              <option value="Voluntaria">Voluntaria</option>
              <option value="Gerencial">Gerencial</option>
            </select>
          </div>
          <Input label="Fecha" type="date" value={form.fecha} onChange={set('fecha')} />
          <Input label="Duración (horas)" type="number" value={form.duracion_horas} onChange={set('duracion_horas')} placeholder="Ej. 8" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? 'Creando...' : 'Crear Capacitación'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
