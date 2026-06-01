import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'

const APROBACIONES = [
  { rol: 'Analista RRHH', nombre: 'Carlos Rodríguez', estado: 'active', fecha: '20/06/2025 09:42' },
  { rol: 'Jefe RRHH', nombre: 'Margarita Rosa de Francisco', estado: 'active', fecha: '20/06/2025 11:15' },
  { rol: 'Gerente General', nombre: 'Carlos Alberto Vives', estado: 'pending', fecha: 'Pendiente' },
  { rol: 'Contador', nombre: 'Mariana Pajón', estado: 'inactive', fecha: 'Pendiente' },
]

export default function FlujAprobacionPage() {
  const { id } = useParams()
  const navigate = useNavigate()

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

      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-6">Estado de Aprobaciones</h3>
        <div className="space-y-0">
          {APROBACIONES.map((a, i) => (
            <div key={a.rol} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${a.estado === 'active' ? 'bg-emerald-100 text-emerald-700' : a.estado === 'pending' ? 'bg-tertiary-fixed text-tertiary' : 'bg-surface-container text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-lg">{a.estado === 'active' ? 'check' : a.estado === 'pending' ? 'hourglass_empty' : 'lock'}</span>
                </div>
                {i < APROBACIONES.length - 1 && <div className="w-px flex-1 bg-outline-variant/20 my-1" />}
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

      <div className="bg-tertiary-fixed/20 rounded-xl p-5 border border-tertiary-fixed/40 flex items-center gap-4">
        <span className="material-symbols-outlined text-2xl text-tertiary">hourglass_empty</span>
        <div>
          <p className="font-bold text-tertiary text-sm">Esperando aprobación del Gerente General</p>
          <p className="text-xs text-on-surface-variant">El proceso continúa una vez sea aprobado por Carlos Alberto Vives</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button icon="notifications">Enviar Recordatorio</Button>
      </div>
    </div>
  )
}
