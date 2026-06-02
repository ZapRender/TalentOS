import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

const MOCK = {
  nombre: 'Sebastián Jaramillo',
  cargo: 'Desarrollador Backend',
  correo: 'sjaramillo@gmail.com',
  telefono: '+57 311 234 5678',
  ciudad: 'Bogotá',
  etapa: 'Entrevista Técnica',
  salarioAspira: '$5,800,000',
  disponibilidad: 'Inmediata',
  experiencia: '5 años',
}

const etapas = ['Revisión de CV', 'Entrevista RRHH', 'Prueba Técnica', 'Entrevista Técnica', 'Oferta', 'Contratado']

export default function CandidatoPerfilPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const etapaIdx = etapas.indexOf(MOCK.etapa)

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/seleccion/candidatos')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">{MOCK.nombre}</h2>
          <p className="text-on-surface-variant text-sm">{MOCK.cargo}</p>
        </div>
        <Button variant="primary" size="sm" icon="how_to_reg">Avanzar Etapa</Button>
      </div>

      {/* Etapas */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Progreso del Proceso</h3>
        <div className="flex items-center gap-1 flex-wrap">
          {etapas.map((e, i) => (
            <div key={e} className="flex items-center gap-1">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${i < etapaIdx ? 'bg-primary-fixed-dim/30 text-primary' : i === etapaIdx ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                {i < etapaIdx && <span className="material-symbols-outlined text-sm">check</span>}
                {e}
              </div>
              {i < etapas.length - 1 && <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { icon: 'mail', label: 'Correo', val: MOCK.correo },
          { icon: 'phone', label: 'Teléfono', val: MOCK.telefono },
          { icon: 'location_on', label: 'Ciudad', val: MOCK.ciudad },
          { icon: 'payments', label: 'Aspiración Salarial', val: MOCK.salarioAspira },
          { icon: 'calendar_today', label: 'Disponibilidad', val: MOCK.disponibilidad },
          { icon: 'work_history', label: 'Experiencia', val: MOCK.experiencia },
        ].map((f) => (
          <div key={f.label} className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-outline text-lg">{f.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{f.label}</p>
              <p className="text-sm font-semibold text-on-surface">{f.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" icon="description">Ver CV</Button>
        <Button variant="danger" icon="cancel">Descartar</Button>
        <div className="ml-auto">
          <Button icon="how_to_reg">Generar Oferta</Button>
        </div>
      </div>
    </div>
  )
}
