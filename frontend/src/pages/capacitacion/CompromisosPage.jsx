import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import StatusOrb from '../../components/ui/StatusOrb'
import { trainingService } from '../../services/trainingService'

export default function CompromisosPage() {
  const { evalId } = useParams()
  const navigate = useNavigate()
  const [compromisos, setCompromisos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ descripcion: '', fecha_limite: '', responsable: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const load = () => {
    trainingService.compromisos
      .list(evalId)
      .then(setCompromisos)
      .catch(() => setError('No se pudieron cargar los compromisos.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [evalId])

  const handleCreate = async () => {
    if (!form.descripcion || !form.fecha_limite) {
      setError('Descripción y fecha límite son requeridos.')
      return
    }
    setSaving(true)
    try {
      await trainingService.compromisos.create({ ...form, evaluacion_id: evalId })
      setModalOpen(false)
      setForm({ descripcion: '', fecha_limite: '', responsable: '' })
      load()
    } catch {
      setError('Error al crear el compromiso.')
    } finally {
      setSaving(false)
    }
  }

  const handleCumplir = async (compId) => {
    setCompleting(compId)
    try {
      await trainingService.compromisos.cumplir(compId)
      setCompromisos((prev) =>
        prev.map((c) => c.id === compId ? { ...c, cumplido: true, estado: 'CUMPLIDO' } : c)
      )
    } catch {
      setError('Error al marcar el compromiso como cumplido.')
    } finally {
      setCompleting(null)
    }
  }

  const cumplidos = compromisos.filter((c) => c.cumplido || c.estado === 'CUMPLIDO').length
  const pendientes = compromisos.length - cumplidos

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Compromisos de Mejora</h2>
          <p className="text-on-surface-variant text-sm">Evaluación #{evalId}</p>
        </div>
        <Button icon="add" onClick={() => setModalOpen(true)}>Nuevo Compromiso</Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: compromisos.length, icon: 'assignment' },
          { label: 'Cumplidos', value: cumplidos, icon: 'task_alt', color: 'text-emerald-700' },
          { label: 'Pendientes', value: pendientes, icon: 'pending_actions', color: 'text-error' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 text-center shadow-card">
            <span className={`material-symbols-outlined text-2xl block mb-1 ${s.color || 'text-primary'}`}>{s.icon}</span>
            <p className={`text-2xl font-extrabold ${s.color || 'text-primary-container'}`}>{s.value}</p>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin">autorenew</span>
          <span className="text-sm">Cargando compromisos...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {compromisos.map((c) => {
            const cumplido = c.cumplido || c.estado === 'CUMPLIDO'
            return (
              <div key={c.id} className={`bg-surface-container-lowest rounded-xl p-5 border shadow-card transition-all ${cumplido ? 'border-emerald-200 opacity-75' : 'border-outline-variant/10'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusOrb status={cumplido ? 'active' : 'pending'} label={cumplido ? 'Cumplido' : 'Pendiente'} />
                    </div>
                    <p className={`text-sm font-semibold ${cumplido ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{c.descripcion}</p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-on-surface-variant">
                      {c.fecha_limite && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          Límite: {c.fecha_limite}
                        </span>
                      )}
                      {c.responsable && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">person</span>
                          {c.responsable}
                        </span>
                      )}
                    </div>
                  </div>
                  {!cumplido && (
                    <button
                      onClick={() => handleCumplir(c.id)}
                      disabled={completing === c.id}
                      className="shrink-0 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50"
                    >
                      {completing === c.id ? '...' : 'Marcar cumplido'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {compromisos.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant text-sm">No hay compromisos registrados para esta evaluación.</div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Compromiso de Mejora">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Descripción del compromiso</label>
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={set('descripcion')}
              placeholder="Describe la acción de mejora a realizar..."
              className="w-full px-4 py-3 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all resize-none"
            />
          </div>
          <Input label="Fecha límite" type="date" value={form.fecha_limite} onChange={set('fecha_limite')} />
          <Input label="Responsable" value={form.responsable} onChange={set('responsable')} placeholder="Nombre del responsable..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? 'Guardando...' : 'Crear Compromiso'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
