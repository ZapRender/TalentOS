import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'
import { seleccionService, etapaLabel } from '../../services/seleccionService'

export default function SeleccionPage() {
  const navigate = useNavigate()
  const [reqs, setReqs] = useState([])
  const [candidatos, setCandidatos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      seleccionService.requerimientos.list().catch(() => []),
      seleccionService.candidatos.list().catch(() => []),
    ]).then(([r, c]) => {
      setReqs(Array.isArray(r) ? r : [])
      setCandidatos(Array.isArray(c) ? c : [])
    }).finally(() => setLoading(false))
  }, [])

  const reqsActivos    = reqs.filter((r) => r.estado === 'abierto' || r.estado === 'en_proceso')
  const candidActivos  = candidatos.filter((c) => c.etapaActual !== 'vinculado')
  const enEntrevista   = candidatos.filter((c) => c.etapaActual === 'entrevista')
  const enOferta       = candidatos.filter((c) => c.etapaActual === 'oferta')

  const stats = [
    { label: 'Vacantes Activas',   value: reqsActivos.length,   icon: 'work',    color: 'bg-primary-fixed text-primary' },
    { label: 'Candidatos Activos', value: candidActivos.length, icon: 'people',  color: 'bg-secondary-fixed text-secondary' },
    { label: 'En Entrevista',      value: enEntrevista.length,  icon: 'event',   color: 'bg-tertiary-fixed text-tertiary' },
    { label: 'Ofertas Enviadas',   value: enOferta.length,      icon: 'send',    color: 'bg-error-container text-error' },
  ]

  // Candidatos por requerimiento (para mostrar conteo en la tabla)
  const candPorReq = (reqId) =>
    candidatos.filter((c) => c.requerimientoId === reqId).length

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-primary-container tracking-tight">Selección de Talento</h2>
          <p className="text-on-surface-variant mt-1">Gestión de procesos de contratación</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/seleccion/requerimientos')}>Requerimientos</Button>
          <Button icon="person_add" onClick={() => navigate('/seleccion/candidatos')}>Ver Candidatos</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-card">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-3xl font-extrabold text-primary-container">
              {loading ? '…' : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Vacantes activas */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-card overflow-hidden">
        <div className="px-8 py-5 bg-surface-container-low/50 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="font-bold text-primary-container">Vacantes Activas</h3>
          <Button variant="secondary" size="sm" onClick={() => navigate('/seleccion/requerimientos')}>Ver todas</Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">autorenew</span>
            <span className="text-sm">Cargando...</span>
          </div>
        ) : reqsActivos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl">work_off</span>
            <p className="text-sm">No hay vacantes activas.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low/30">
                {['Cargo', 'Plazas', 'Candidatos', 'Solicitud', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-8 py-4 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {reqsActivos.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container-low/20 transition-colors group">
                  <td className="px-8 py-4 text-sm font-semibold text-on-surface">{r.cargo}</td>
                  <td className="px-8 py-4 text-sm text-on-surface-variant">{r.numeroVacantes}</td>
                  <td className="px-8 py-4">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-primary-container">
                      <span className="material-symbols-outlined text-lg text-primary">people</span>
                      {candPorReq(r.id)}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-xs text-on-surface-variant">
                    {r.fechaSolicitud ? new Date(r.fechaSolicitud).toLocaleDateString('es-CO') : '—'}
                  </td>
                  <td className="px-8 py-4">
                    <StatusOrb status={r.estado === 'abierto' ? 'active' : 'pending'} label={r.estado} />
                  </td>
                  <td className="px-8 py-4">
                    <button
                      onClick={() => navigate(`/seleccion/candidatos`)}
                      className="text-xs font-bold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Ver candidatos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
