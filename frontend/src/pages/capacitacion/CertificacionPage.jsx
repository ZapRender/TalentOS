import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function CertificacionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const hoy = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/empleados/${id}`)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Certificación Laboral</h2>
          <p className="text-on-surface-variant text-sm">Juliana Pérez Castro</p>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Con Salario', desc: 'Incluye el valor del salario actual', active: true },
          { label: 'Sin Salario', desc: 'Solo certifica cargo y tiempo', active: false },
          { label: 'Con Funciones', desc: 'Incluye descripción del cargo', active: false },
        ].map((o) => (
          <button key={o.label} className={`p-4 rounded-xl border text-left transition-all ${o.active ? 'border-primary-fixed-dim bg-primary-fixed/20' : 'border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-low'}`}>
            <p className="font-bold text-on-surface text-sm">{o.label}</p>
            <p className="text-xs text-on-surface-variant mt-1">{o.desc}</p>
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-surface-container-lowest rounded-xl p-10 border border-outline-variant/10 shadow-editorial space-y-6">
        <div className="text-center border-b border-outline-variant/20 pb-6">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">TalentOS S.A.S.</p>
          <h3 className="text-xl font-extrabold text-primary-container">CERTIFICACIÓN LABORAL</h3>
        </div>
        <div className="space-y-4 text-sm text-on-surface leading-relaxed">
          <p>
            La empresa <strong>TalentOS S.A.S.</strong>, identificada con NIT 900.123.456-7, certifica que:
          </p>
          <p>
            <strong>JULIANA PÉREZ CASTRO</strong>, identificada con cédula de ciudadanía
            N° 1.023.456.789 expedida en Medellín, se encuentra vinculada a nuestra empresa desde
            el <strong>05 de julio de 2019</strong>, desempeñando el cargo de{' '}
            <strong>Analista Contable</strong> en el área de Finanzas & Contabilidad, con contrato
            a término indefinido y salario mensual de <strong>$3,500,000 M/CTE</strong>.
          </p>
          <p>
            Esta certificación se expide a solicitud del interesado el {hoy}.
          </p>
        </div>
        <div className="pt-8 border-t border-outline-variant/20 flex justify-between items-end">
          <div>
            <div className="h-px w-40 bg-on-surface mb-2" />
            <p className="text-xs font-bold text-on-surface">Margarita Rosa de Francisco</p>
            <p className="text-xs text-on-surface-variant">Directora de RRHH</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-on-surface-variant">Firma Digital Verificada</p>
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" icon="mail">Enviar por Correo</Button>
        <Button icon="download">Descargar PDF</Button>
      </div>
    </div>
  )
}
