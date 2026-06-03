import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'
import { useAuth } from '../../context/AuthContext'
import { payrollService } from '../../services/payrollService'

export default function FlujAprobacionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [aprobaciones, setAprobaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    payrollService.periodos
      .list()
      .then((periodos) => {
        const periodo = periodos.find((p) => String(p.id) === String(id))
        if (periodo?.aprobaciones) setAprobaciones(periodo.aprobaciones)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const isGerente = user?.rol === 'GERENTE'

  const handleAprobar = async () => {
    if (!isGerente) return
    setSaving(true)
    setError('')
    try {
      await payrollService.periodos.aprobar(id, { observaciones, aprobado_por: user.id })
      setSuccess('Nómina aprobada exitosamente.')
      setAprobaciones((prev) =>
        prev.map((a) => a.rol === 'Gerente General' ? { ...a, estado: 'active', fecha: new Date().toLocaleString('es-CO') } : a)
      )
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al aprobar la nómina.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/nomina/periodos/${id}/resultado`)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-primary-container">Flujo de Aprobación</h2>
          <p className="text-on-surface-variant text-sm">Periodo: {id}</p>
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

      {aprobaciones.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-6">Estado de Aprobaciones</h3>
          <div className="space-y-0">
            {aprobaciones.map((a, i) => (
              <div key={a.rol} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${a.estado === 'active' ? 'bg-emerald-100 text-emerald-700' : a.estado === 'pending' ? 'bg-tertiary-fixed text-tertiary' : 'bg-surface-container text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-lg">{a.estado === 'active' ? 'check' : a.estado === 'pending' ? 'hourglass_empty' : 'lock'}</span>
                  </div>
                  {i < aprobaciones.length - 1 && <div className="w-px flex-1 bg-outline-variant/20 my-1" />}
                </div>
                <div className="pb-6 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-on-surface text-sm">{a.nombre}</p>
                      <p className="text-[11px] text-on-surface-variant">{a.rol}</p>
                    </div>
                    <div className="text-right">
                      <StatusOrb status={a.estado} label={a.estado === 'active' ? 'Aprobado' : a.estado === 'pending' ? 'Pendiente' : 'Bloqueado'} />
                      <p className="text-[10px] text-on-surface-variant mt-1">{a.fecha}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isGerente && (
        <div className="bg-tertiary-fixed/20 rounded-xl p-5 border border-tertiary-fixed/40 flex items-center gap-4">
          <span className="material-symbols-outlined text-2xl text-tertiary">hourglass_empty</span>
          <div>
            <p className="font-bold text-tertiary text-sm">Solo el Gerente puede aprobar</p>
            <p className="text-xs text-on-surface-variant">Esta acción está restringida al rol GERENTE.</p>
          </div>
        </div>
      )}

      {isGerente && !success && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Observaciones (opcional)</label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Observaciones adicionales..."
              className="w-full px-4 py-3 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button icon="check_circle" onClick={handleAprobar} disabled={saving}>
              {saving ? 'Aprobando...' : 'Aprobar Nómina'}
            </Button>
          </div>
        </div>
      )}

      {!isGerente && (
        <div className="flex justify-end">
          <Button icon="notifications" variant="secondary">Enviar Recordatorio</Button>
        </div>
      )}
    </div>
  )
}
