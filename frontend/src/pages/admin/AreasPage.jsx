import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import {
  getTodasAreas,
  crearArea,
  actualizarArea,
  toggleArea,
} from '../../services/employeeService'

function AreaModal({ area, onClose, onSaved }) {
  const isEdit = !!area
  const [nombre, setNombre] = useState(area?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(area?.descripcion ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) { setError('El nombre es requerido.'); return }
    if (nombre.length > 100) { setError('El nombre no puede superar 100 caracteres.'); return }
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        await actualizarArea(area.id, { nombre: nombre.trim(), descripcion: descripcion.trim() })
      } else {
        await crearArea({ nombre: nombre.trim(), descripcion: descripcion.trim() })
      }
      onSaved()
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-primary-container">
            {isEdit ? 'Editar área' : 'Nueva área'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              Nombre <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={100}
              placeholder="Ej. Recursos Humanos"
              className="w-full h-11 px-4 bg-surface-container-low rounded-lg text-on-surface text-sm border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional..."
              rows={3}
              className="w-full px-4 py-3 bg-surface-container-low rounded-lg text-on-surface text-sm border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all resize-none"
            />
          </div>

          {error && (
            <p className="flex items-center gap-1 text-sm text-error">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" loading={saving} disabled={saving}>
              {isEdit ? 'Guardar cambios' : 'Crear área'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ToggleConfirmModal({ area, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)
  const activate = area.estado === 'INACTIVO' || area.activo === false

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 space-y-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${activate ? 'bg-primary-fixed' : 'bg-error-container/20'}`}>
            <span className={`material-symbols-outlined text-2xl ${activate ? 'text-primary' : 'text-error'}`}>
              {activate ? 'check_circle' : 'block'}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-primary-container">
            {activate ? `¿Activar el área "${area.nombre}"?` : `¿Desactivar el área "${area.nombre}"?`}
          </h3>
          {!activate && (
            <p className="text-sm text-on-surface-variant">
              Los empleados asignados no se verán afectados.
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant={activate ? 'primary' : 'danger'}
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
            className="flex-1"
          >
            {activate ? 'Activar' : 'Desactivar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AreasPage() {
  const navigate = useNavigate()
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [toggleTarget, setToggleTarget] = useState(null)
  const [actionError, setActionError] = useState('')

  const load = () => {
    setLoading(true)
    getTodasAreas()
      .then((data) => setAreas(Array.isArray(data) ? data : []))
      .catch(() => setAreas([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSaved = () => {
    setModal(null)
    load()
  }

  const handleToggleConfirm = async () => {
    setActionError('')
    try {
      await toggleArea(toggleTarget.id)
      setToggleTarget(null)
      load()
    } catch {
      setActionError('No se pudo cambiar el estado. Intenta de nuevo.')
      setToggleTarget(null)
    }
  }

  const isActive = (a) => a.activo !== false && a.estado !== 'INACTIVO'

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Breadcrumb + title */}
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-4">
            <button onClick={() => navigate('/dashboard')} className="hover:text-primary transition-colors">Talentos</button>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span>Administración</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-primary-container">Áreas</span>
          </nav>
          <h2 className="text-4xl font-extrabold text-primary-container tracking-tight">
            Áreas y Departamentos
          </h2>
        </div>
        <Button icon="add" onClick={() => setModal('new')}>
          Nueva área
        </Button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-error-container/20 border border-error/20 rounded-lg text-sm text-error">
          <span className="material-symbols-outlined text-sm">error</span>
          {actionError}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">autorenew</span>
            <span className="text-sm">Cargando áreas...</span>
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-surface-container-low/50">
                {['Nombre', 'Descripción', 'Estado', 'Acciones'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ${i === 3 ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {areas.map((a) => {
                const active = isActive(a)
                return (
                  <tr key={a.id} className={`transition-colors ${active ? 'hover:bg-surface-container-low/30' : 'opacity-50'}`}>
                    <td className="px-8 py-5">
                      <span className={`text-sm font-bold ${active ? 'text-primary-container' : 'text-on-surface-variant line-through'}`}>
                        {a.nombre}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm text-on-surface-variant">{a.descripcion || '—'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        active
                          ? 'bg-primary-fixed/30 text-primary'
                          : 'bg-surface-container-low text-on-surface-variant'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-primary' : 'bg-on-surface-variant/50'}`} />
                        {active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModal(a)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary/5 transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => setToggleTarget(a)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                            active
                              ? 'text-error hover:bg-error/5'
                              : 'text-primary hover:bg-primary/5'
                          }`}
                          title={active ? 'Desactivar' : 'Activar'}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {active ? 'toggle_on' : 'toggle_off'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {areas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-sm text-on-surface-variant">
                    No hay áreas registradas. Crea la primera.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create modal */}
      {modal === 'new' && (
        <AreaModal onClose={() => setModal(null)} onSaved={handleSaved} />
      )}

      {/* Edit modal */}
      {modal && modal !== 'new' && (
        <AreaModal area={modal} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}

      {/* Toggle confirm */}
      {toggleTarget && (
        <ToggleConfirmModal
          area={toggleTarget}
          onClose={() => setToggleTarget(null)}
          onConfirm={handleToggleConfirm}
        />
      )}
    </div>
  )
}
