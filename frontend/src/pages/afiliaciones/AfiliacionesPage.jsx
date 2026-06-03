import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'
import { payrollService } from '../../services/payrollService'

export default function AfiliacionesPage() {
  const navigate = useNavigate()
  const [afiliaciones, setAfiliaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    payrollService.afiliaciones
      .list()
      .then(setAfiliaciones)
      .catch(() => setError('No se pudieron cargar las afiliaciones.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-primary-container tracking-tight">Aportes Seguridad Social</h2>
          <p className="text-on-surface-variant mt-1">Control de afiliaciones y aportes al sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="description" onClick={() => navigate('/nomina/pila')}>Exportar PILA</Button>
          <Button icon="add" onClick={() => navigate('/afiliaciones/nueva')}>Nueva Afiliación</Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Afiliados', value: afiliaciones.length.toString(), icon: 'groups' },
          { label: 'Novedades Mes', value: '—', icon: 'notification_important' },
          { label: 'Retiros Mes', value: '—', icon: 'person_remove' },
          { label: 'Pendientes', value: afiliaciones.filter((a) => a.estado === 'pending' || a.estado === 'PENDIENTE').length.toString(), icon: 'pending_actions' },
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

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">autorenew</span>
            <span className="text-sm">Cargando afiliaciones...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  {['Empleado', 'EPS', 'ARL', 'Pensión', 'Caja Comp.', 'Fecha Afiliación', 'Estado', ''].map((h) => (
                    <th key={h} className="px-6 py-5 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {afiliaciones.map((a, i) => (
                  <tr key={a.id || i} className={`group hover:bg-surface-container-low/30 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/10' : ''}`}>
                    <td className="px-6 py-5 text-sm font-semibold text-on-surface whitespace-nowrap">{a.empleado || a.empleado_nombre || a.empleado_id}</td>
                    <td className="px-6 py-5 text-xs text-on-surface-variant">{a.eps || a.nombre_entidad_eps || '—'}</td>
                    <td className="px-6 py-5 text-xs text-on-surface-variant">{a.arl || a.nombre_entidad_arl || '—'}</td>
                    <td className="px-6 py-5 text-xs text-on-surface-variant">{a.pension || a.nombre_entidad_pension || '—'}</td>
                    <td className="px-6 py-5 text-xs text-on-surface-variant">{a.cajaComp || a.nombre_entidad_caja || '—'}</td>
                    <td className="px-6 py-5 text-xs text-on-surface-variant">{a.fecha_afiliacion || '—'}</td>
                    <td className="px-6 py-5"><StatusOrb status={a.estado === 'ACTIVO' || a.estado === 'active' ? 'active' : 'pending'} /></td>
                    <td className="px-6 py-5">
                      <button className="text-[11px] font-bold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
                {afiliaciones.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-8 py-12 text-center text-sm text-on-surface-variant">No hay afiliaciones registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
