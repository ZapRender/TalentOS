import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { trainingService } from '../../services/trainingService'
import { useAuth } from '../../context/AuthContext'

export default function EvaluacionPage() {
  const { empleadoId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [evaluaciones, setEvaluaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    empleado_id: empleadoId || '',
    tipo: 'DESEMPENO',
    fecha_evaluacion: '',
    evaluador_id: user?.id || '',
    resultado_general: '',
    puntaje_total: '',
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const load = () => {
    if (!empleadoId) { setLoading(false); return }
    trainingService.evaluaciones
      .get(empleadoId)
      .then(setEvaluaciones)
      .catch(() => setError('No se pudieron cargar las evaluaciones.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [empleadoId])

  const handleCreate = async () => {
    if (!form.empleado_id || !form.fecha_evaluacion) {
      setError('Empleado y fecha son requeridos.')
      return
    }
    setSaving(true)
    try {
      await trainingService.evaluaciones.create({
        ...form,
        puntaje_total: Number(form.puntaje_total),
        evaluador_id: form.evaluador_id || user?.id,
      })
      setModalOpen(false)
      load()
    } catch {
      setError('Error al guardar la evaluación.')
    } finally {
      setSaving(false)
    }
  }

  const puntajeColor = (p) => {
    if (p >= 80) return 'text-emerald-700'
    if (p >= 60) return 'text-yellow-600'
    return 'text-error'
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Evaluaciones de Desempeño</h2>
          {empleadoId && <p className="text-on-surface-variant text-sm">Empleado: {empleadoId}</p>}
        </div>
        <Button icon="add" onClick={() => setModalOpen(true)}>Nueva Evaluación</Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin">autorenew</span>
          <span className="text-sm">Cargando evaluaciones...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {evaluaciones.map((ev) => (
            <div key={ev.id} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-primary-fixed text-primary">{ev.tipo}</span>
                  <p className="text-sm text-on-surface-variant mt-1">{ev.fecha_evaluacion}</p>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-extrabold ${puntajeColor(ev.puntaje_total)}`}>{ev.puntaje_total}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">/ 100</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-on-surface mb-3">{ev.resultado_general}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => navigate(`/capacitacion/compromisos/${ev.id}`)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">assignment</span>
                  Ver compromisos
                </button>
              </div>
            </div>
          ))}
          {evaluaciones.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant text-sm">
              No hay evaluaciones registradas para este empleado.
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Evaluación de Desempeño">
        <div className="space-y-4">
          {!empleadoId && (
            <Input label="ID Empleado" value={form.empleado_id} onChange={set('empleado_id')} placeholder="UUID del empleado" />
          )}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Tipo</label>
            <select value={form.tipo} onChange={set('tipo')} className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all">
              <option value="DESEMPENO">Desempeño</option>
              <option value="COMPETENCIAS">Competencias</option>
              <option value="360">Evaluación 360°</option>
              <option value="INDUCCION">Inducción</option>
            </select>
          </div>
          <Input label="Fecha de evaluación" type="date" value={form.fecha_evaluacion} onChange={set('fecha_evaluacion')} />
          <Input label="Puntaje total (0-100)" type="number" value={form.puntaje_total} onChange={set('puntaje_total')} placeholder="Ej. 85" />
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Resultado general</label>
            <textarea
              rows={3}
              value={form.resultado_general}
              onChange={set('resultado_general')}
              placeholder="Descripción del resultado..."
              className="w-full px-4 py-3 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? 'Guardando...' : 'Guardar Evaluación'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
