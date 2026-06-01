import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'

const AFILS = [
  { entidad: 'Sura', tipo: 'EPS', inicio: '05/07/2019', estado: 'active', aporte: '$140,000' },
  { entidad: 'Positiva', tipo: 'ARL', inicio: '05/07/2019', estado: 'active', aporte: '$38,000' },
  { entidad: 'Protección', tipo: 'Pensión', inicio: '05/07/2019', estado: 'active', aporte: '$140,000' },
  { entidad: 'Compensar', tipo: 'Caja Compensación', inicio: '05/07/2019', estado: 'active', aporte: '$42,000' },
]

export default function AfiliacionesEmpleadoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/empleados/${id}`)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Afiliaciones del Empleado</h2>
          <p className="text-on-surface-variant text-sm">Juliana Pérez Castro</p>
        </div>
        <Button icon="add" size="sm" onClick={() => navigate('/afiliaciones/nueva')}>Nueva</Button>
      </div>

      <div className="space-y-4">
        {AFILS.map((a) => (
          <div key={a.tipo} className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10 shadow-card flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">health_and_safety</span>
              </div>
              <div>
                <p className="font-bold text-on-surface text-sm">{a.entidad}</p>
                <p className="text-xs text-on-surface-variant">{a.tipo} · Desde {a.inicio}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-right">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Aporte Empleado</p>
                <p className="text-sm font-bold text-primary-container">{a.aporte}</p>
              </div>
              <StatusOrb status={a.estado} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
