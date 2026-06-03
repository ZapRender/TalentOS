import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'
import { payrollService } from '../../services/payrollService'

export default function DesprendiblesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    payrollService.periodos
      .liquidar(id)
      .then((res) => setEmpleados(res?.empleados || res?.detalle || []))
      .catch(() => setError('No se pudo cargar la lista de empleados del periodo.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleEnviarTodos = async () => {
    setSending(true)
    setError('')
    try {
      const res = await payrollService.periodos.enviarDesp(id)
      setSuccess(res?.mensaje || `Desprendibles enviados exitosamente a ${empleados.length} colaboradores.`)
      setEmpleados((prev) => prev.map((e) => ({ ...e, enviado: true })))
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al enviar los desprendibles.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/nomina/periodos')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Envío de Desprendibles</h2>
          <p className="text-on-surface-variant text-sm">Periodo: {id}</p>
        </div>
        <Button icon="send" onClick={handleEnviarTodos} disabled={sending || !!success}>
          {sending ? 'Enviando...' : 'Enviar a Todos'}
        </Button>
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

      <div className="bg-surface-container-low rounded-xl p-5 flex items-center gap-4 border border-outline-variant/10">
        <span className="material-symbols-outlined text-2xl text-primary">info</span>
        <p className="text-sm text-on-surface-variant">Los desprendibles se enviarán al correo registrado de cada colaborador en formato PDF.</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">autorenew</span>
            <span className="text-sm">Cargando colaboradores...</span>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                {['Colaborador', 'Correo', 'Neto a Pagar', 'Estado Envío'].map((h, i) => (
                  <th key={h} className="px-8 py-5 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {empleados.map((e, idx) => (
                <tr key={e.id || e.empleado_id || idx} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="px-8 py-5 text-sm font-semibold text-on-surface">{e.nombre || e.empleado}</td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">{e.correo || e.email || '—'}</td>
                  <td className="px-8 py-5 text-sm font-bold text-primary-container">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(e.neto || e.neto_pagar || 0)}
                  </td>
                  <td className="px-8 py-5">
                    <StatusOrb status={e.enviado ? 'active' : 'inactive'} label={e.enviado ? 'Enviado' : 'Pendiente'} />
                  </td>
                </tr>
              ))}
              {empleados.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-sm text-on-surface-variant">No hay empleados en este periodo.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
