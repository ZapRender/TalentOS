import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'

const REQS = [
  { id: 1, cargo: 'Desarrollador Backend', area: 'Tecnología', plazas: 2, fechaLimite: '30/06/2025', estado: 'active', prioridad: 'Alta' },
  { id: 2, cargo: 'Analista de RRHH', area: 'Recursos Humanos', plazas: 1, fechaLimite: '15/07/2025', estado: 'active', prioridad: 'Media' },
  { id: 3, cargo: 'Contador Senior', area: 'Finanzas', plazas: 1, fechaLimite: '01/07/2025', estado: 'pending', prioridad: 'Alta' },
]

export default function RequerimientosPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-3">
            <button onClick={() => navigate('/seleccion')} className="hover:text-primary">Selección</button>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-primary-container">Requerimientos</span>
          </nav>
          <h2 className="text-3xl font-extrabold text-primary-container">Requerimientos de Personal</h2>
        </div>
        <Button icon="add">Nuevo Requerimiento</Button>
      </div>

      <div className="space-y-4">
        {REQS.map((r) => (
          <div key={r.id} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card flex items-center gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-primary-container">{r.cargo}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${r.prioridad === 'Alta' ? 'bg-error-container text-error' : 'bg-tertiary-fixed text-tertiary'}`}>
                  {r.prioridad}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant">{r.area} · {r.plazas} plaza{r.plazas > 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-6 flex-wrap text-xs text-on-surface-variant">
              <div>
                <p className="font-bold uppercase tracking-wider text-[10px] mb-0.5">Fecha límite</p>
                <p className="font-semibold">{r.fechaLimite}</p>
              </div>
              <StatusOrb status={r.estado} />
              <Button variant="secondary" size="sm" onClick={() => navigate('/seleccion/candidatos')}>Ver candidatos</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
