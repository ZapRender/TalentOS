import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function HojaVidaPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const sections = [
    { title: 'Educación', icon: 'school', items: [
      { title: 'Ingeniería Financiera', sub: 'Universidad EAFIT · 2012 - 2017', detail: 'Grado Profesional' },
      { title: 'Especialización en Finanzas', sub: 'Universidad de los Andes · 2018 - 2019', detail: 'Especialización' },
    ]},
    { title: 'Experiencia Laboral', icon: 'work', items: [
      { title: 'Analista Financiero Jr.', sub: 'Bancolombia · 2017 - 2019', detail: '2 años' },
      { title: 'Analista Contable', sub: 'Empresa Actual · 2019 - Presente', detail: 'Actual' },
    ]},
    { title: 'Certificaciones', icon: 'verified', items: [
      { title: 'Contador Público', sub: 'Junta Central de Contadores · 2017', detail: 'Tarjeta Profesional' },
    ]},
  ]

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/empleados/${id}`)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-primary-container">Hoja de Vida Digital</h2>
          <p className="text-on-surface-variant text-sm">Juliana Pérez Castro · Analista Contable</p>
        </div>
        <div className="ml-auto">
          <Button variant="secondary" icon="download" size="sm">Exportar PDF</Button>
        </div>
      </div>

      {sections.map((sec) => (
        <div key={sec.title} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
          <h3 className="flex items-center gap-2 text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-5">
            <span className="material-symbols-outlined text-primary text-lg">{sec.icon}</span>
            {sec.title}
          </h3>
          <div className="space-y-4">
            {sec.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary-fixed-dim mt-1.5" />
                  {i < sec.items.length - 1 && <div className="flex-1 w-px bg-outline-variant/30 my-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-semibold text-on-surface text-sm">{item.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{item.sub}</p>
                  <span className="inline-block mt-1.5 text-[10px] font-bold bg-surface-container px-2 py-0.5 rounded text-on-surface-variant uppercase tracking-wider">
                    {item.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
