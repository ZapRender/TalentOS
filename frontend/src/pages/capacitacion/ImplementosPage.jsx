import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Button from '../../components/ui/Button'

const IMPLEMENTOS = [
  { id: 1, nombre: 'Laptop Dell XPS 15', serial: 'DXPS-2021-789', estado: false },
  { id: 2, nombre: 'Mouse Inalámbrico Logitech', serial: 'LOG-M345-2022', estado: false },
  { id: 3, nombre: 'Audífonos Sony', serial: 'SONY-MDR-987', estado: false },
  { id: 4, nombre: 'Cargador USB-C 65W', serial: 'CHG-65W-456', estado: false },
  { id: 5, nombre: 'Credencial de Acceso', serial: 'ACC-JP-2019-01', estado: false },
]

export default function ImplementosPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [checks, setChecks] = useState({})

  const toggle = (itemId) => setChecks((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
  const allChecked = IMPLEMENTOS.every((i) => checks[i.id])

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/empleados/${id}/retiro`)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-primary-container">Devolución de Implementos</h2>
          <p className="text-on-surface-variant text-sm">Juliana Pérez Castro</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-card overflow-hidden">
        <div className="px-8 py-5 bg-surface-container-low/50 border-b border-outline-variant/10">
          <p className="text-xs font-bold text-on-surface-variant">Marque cada implemento al recibirlo de vuelta</p>
        </div>
        <div className="divide-y divide-outline-variant/5">
          {IMPLEMENTOS.map((item) => (
            <label key={item.id} className={`flex items-center gap-4 px-8 py-4 cursor-pointer hover:bg-surface-container-low/20 transition-colors ${checks[item.id] ? 'bg-emerald-50/30' : ''}`}>
              <input type="checkbox" checked={!!checks[item.id]} onChange={() => toggle(item.id)} className="w-4 h-4 accent-primary rounded" />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${checks[item.id] ? 'text-emerald-700 line-through' : 'text-on-surface'}`}>{item.nombre}</p>
                <p className="text-[11px] text-on-surface-variant font-mono">{item.serial}</p>
              </div>
              {checks[item.id] && <span className="material-symbols-outlined text-emerald-600">check_circle</span>}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-on-surface-variant">
          {Object.values(checks).filter(Boolean).length} de {IMPLEMENTOS.length} recibidos
        </p>
        <Button disabled={!allChecked} onClick={() => navigate(`/empleados/${id}/retiro`)}>
          Confirmar Recepción
        </Button>
      </div>
    </div>
  )
}
