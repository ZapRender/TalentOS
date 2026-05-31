import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'

const EMPLEADOS = [
  { id: 1, nombre: 'Juliana Pérez Castro', correo: 'jperez@empresa.com', neto: '$3,400,000', enviado: true },
  { id: 2, nombre: 'Carlos Andrés Duarte', correo: 'cduarte@empresa.com', neto: '$3,280,000', enviado: false },
  { id: 3, nombre: 'Beatriz Elena Salas', correo: 'bsalas@empresa.com', neto: '$3,844,000', enviado: true },
]

export default function DesprendiblesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
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
        <Button icon="send">Enviar a Todos</Button>
      </div>

      <div className="bg-surface-container-low rounded-xl p-5 flex items-center gap-4 border border-outline-variant/10">
        <span className="material-symbols-outlined text-2xl text-primary">info</span>
        <p className="text-sm text-on-surface-variant">Los desprendibles se enviarán al correo registrado de cada colaborador en formato PDF.</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              {['Colaborador', 'Correo', 'Neto a Pagar', 'Estado Envío', 'Acción'].map((h, i) => (
                <th key={h} className={`px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {EMPLEADOS.map((e) => (
              <tr key={e.id} className="hover:bg-surface-container-low/20 transition-colors group">
                <td className="px-8 py-5 text-sm font-semibold text-on-surface">{e.nombre}</td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">{e.correo}</td>
                <td className="px-8 py-5 text-sm font-bold text-primary-container">{e.neto}</td>
                <td className="px-8 py-5">
                  <StatusOrb status={e.enviado ? 'active' : 'inactive'} label={e.enviado ? 'Enviado' : 'Pendiente'} />
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-[11px] font-bold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                    {e.enviado ? 'Reenviar' : 'Enviar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
