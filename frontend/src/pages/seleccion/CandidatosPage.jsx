import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'

const CANDIDATES = [
  { id: 1, nombre: 'Sebastián Jaramillo', cargo: 'Desarrollador Backend', etapa: 'Entrevista Técnica', estado: 'active', fecha: '15/06/2025' },
  { id: 2, nombre: 'María Camila Torres', cargo: 'Analista RRHH', etapa: 'Prueba Psicotécnica', estado: 'pending', fecha: '16/06/2025' },
  { id: 3, nombre: 'Carlos Andrés López', cargo: 'Contador Senior', etapa: 'Entrevista RRHH', estado: 'active', fecha: '17/06/2025' },
  { id: 4, nombre: 'Laura Sofía Méndez', cargo: 'Desarrollador Backend', etapa: 'Revisión de CV', estado: 'pending', fecha: '10/06/2025' },
]

function initials(n) {
  return n.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export default function CandidatosPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-3">
            <button onClick={() => navigate('/seleccion')} className="hover:text-primary">Selección</button>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-primary-container">Candidatos</span>
          </nav>
          <h2 className="text-3xl font-extrabold text-primary-container">Listado de Candidatos</h2>
        </div>
        <Button icon="person_add" onClick={() => navigate('/seleccion/candidatos/nuevo')}>Registrar Candidato</Button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              {['Candidato', 'Cargo Aplicado', 'Etapa', 'Estado', 'Fecha', 'Acciones'].map((h, i) => (
                <th key={h} className={`px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {CANDIDATES.map((c, i) => (
              <tr key={c.id} className={`group hover:bg-surface-container-low/30 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/10' : ''}`}>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {initials(c.nombre)}
                    </div>
                    <span className="font-semibold text-primary-container text-sm">{c.nombre}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">{c.cargo}</td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-bold bg-surface-container px-2 py-1 rounded text-on-surface-variant uppercase tracking-wider">{c.etapa}</span>
                </td>
                <td className="px-8 py-5"><StatusOrb status={c.estado} /></td>
                <td className="px-8 py-5 text-xs text-on-surface-variant">{c.fecha}</td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => navigate(`/seleccion/candidatos/${c.id}`)} className="text-xs font-bold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver perfil
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
