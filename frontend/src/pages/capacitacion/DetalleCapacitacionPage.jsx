import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { trainingService } from '../../services/trainingService'

export default function DetalleCapacitacionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cap, setCap] = useState(null)
  const [asistencia, setAsistencia] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingAsistencia, setSavingAsistencia] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      trainingService.capacitaciones.get(id),
      trainingService.asistencia.get(id),
    ])
      .then(([capData, asistData]) => {
        setCap(capData)
        setAsistencia(asistData || [])
      })
      .catch(() => setError('No se pudo cargar la capacitación.'))
      .finally(() => setLoading(false))
  }, [id])

  const toggleAsistencia = async (ins) => {
    setSavingAsistencia(ins.id || ins.empleado_id)
    try {
      await trainingService.asistencia.create(id, {
        empleado_id: ins.empleado_id || ins.id,
        asistio: !ins.asistencia,
      })
      setAsistencia((prev) =>
        prev.map((a) => (a.id === ins.id || a.empleado_id === ins.empleado_id) ? { ...a, asistencia: !a.asistencia } : a)
      )
    } catch {
      setError('Error al actualizar la asistencia.')
    } finally {
      setSavingAsistencia(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
        <span className="text-sm">Cargando capacitación...</span>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/capacitacion')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">{cap?.nombre || 'Capacitación'}</h2>
          <p className="text-on-surface-variant text-sm">{cap?.area} · {cap?.tipo} · {cap?.fecha}</p>
        </div>
        <Button icon="edit" size="sm" variant="secondary">Editar</Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Inscritos', value: cap?.inscritos || asistencia.length, icon: 'people' },
          { label: 'Asistencia', value: asistencia.filter((a) => a.asistencia).length, icon: 'how_to_reg' },
          { label: 'Horas', value: cap?.duracion_horas || '—', icon: 'schedule' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 text-center shadow-card">
            <span className="material-symbols-outlined text-primary text-2xl block mb-1">{s.icon}</span>
            <p className="text-2xl font-extrabold text-primary-container">{s.value}</p>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        <div className="px-8 py-5 bg-surface-container-low/50 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="font-bold text-primary-container">Lista de Asistencia</h3>
          <Button size="sm" variant="secondary" icon="download">Exportar</Button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-container-low/30">
              {['Empleado', 'Área', 'Asistencia'].map((h) => (
                <th key={h} className="px-8 py-4 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {asistencia.map((ins) => (
              <tr key={ins.id || ins.empleado_id} className="hover:bg-surface-container-low/20 transition-colors">
                <td className="px-8 py-4 text-sm font-semibold text-on-surface">{ins.nombre || ins.empleado}</td>
                <td className="px-8 py-4 text-xs text-on-surface-variant">{ins.area}</td>
                <td className="px-8 py-4">
                  <button
                    onClick={() => toggleAsistencia(ins)}
                    disabled={savingAsistencia === (ins.id || ins.empleado_id)}
                    className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                  >
                    <span className={`w-2 h-2 rounded-full ${ins.asistencia ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`} />
                    <span className={`text-xs font-semibold ${ins.asistencia ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {savingAsistencia === (ins.id || ins.empleado_id) ? '...' : ins.asistencia ? 'Asistió' : 'No asistió'}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
            {asistencia.length === 0 && (
              <tr>
                <td colSpan={3} className="px-8 py-10 text-center text-sm text-on-surface-variant">No hay inscritos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
