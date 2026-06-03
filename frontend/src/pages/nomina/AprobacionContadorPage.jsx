import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { payrollService } from '../../services/payrollService'

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function AprobacionContadorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [observaciones, setObservaciones] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isContador = user?.rol === 'CONTADOR'

  const handleAprobar = async () => {
    if (!isContador) return
    setSaving(true)
    setError('')
    try {
      await payrollService.liquidacionContrato.aprobar(id, { observaciones, aprobado: true })
      setSuccess('Liquidación aprobada exitosamente por el Contador.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al aprobar la liquidación.')
    } finally {
      setSaving(false)
    }
  }

  const handleRechazar = async () => {
    if (!isContador) return
    setSaving(true)
    setError('')
    try {
      await payrollService.liquidacionContrato.aprobar(id, { observaciones, aprobado: false })
      setSuccess('Liquidación rechazada. Se notificó al equipo de RRHH.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al rechazar la liquidación.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/nomina/liquidacion-contrato')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-primary-container">Aprobación Contador</h2>
          <p className="text-on-surface-variant text-sm">Liquidación #{id}</p>
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

      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-5">Resumen de Liquidación</h3>
        <p className="text-xs text-on-surface-variant">Liquidación #{id} — los detalles se obtienen del servicio de nómina.</p>
      </div>

      {!isContador && (
        <div className="bg-tertiary-fixed/20 rounded-xl p-5 border border-tertiary-fixed/40 flex items-center gap-4">
          <span className="material-symbols-outlined text-2xl text-tertiary">lock</span>
          <div>
            <p className="font-bold text-tertiary text-sm">Solo el Contador puede aprobar</p>
            <p className="text-xs text-on-surface-variant">Esta acción está restringida al rol CONTADOR.</p>
          </div>
        </div>
      )}

      {isContador && (
        <div className="bg-tertiary-fixed/20 rounded-xl p-5 border border-tertiary-fixed/40">
          <h3 className="font-bold text-tertiary mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span>
            Verificación Requerida
          </h3>
          <p className="text-sm text-on-surface-variant">Confirme que los valores calculados cumplen con la normativa laboral colombiana antes de aprobar.</p>
        </div>
      )}

      {isContador && !success && (
        <>
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Observaciones del Contador</label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Observaciones adicionales (opcional)..."
              className="w-full px-4 py-3 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="danger" icon="cancel" onClick={handleRechazar} disabled={saving}>Rechazar</Button>
            <Button icon="check_circle" onClick={handleAprobar} disabled={saving}>
              {saving ? 'Procesando...' : 'Aprobar Liquidación'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
