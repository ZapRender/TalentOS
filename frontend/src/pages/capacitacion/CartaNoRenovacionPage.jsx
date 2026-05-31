import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function CartaNoRenovacionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const hoy = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/empleados/${id}/retiro`)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Carta de No Renovación</h2>
          <p className="text-on-surface-variant text-sm">Juliana Pérez Castro</p>
        </div>
        <Button variant="secondary" icon="print" size="sm">Imprimir</Button>
      </div>

      {/* Carta preview */}
      <div className="bg-surface-container-lowest rounded-xl p-10 border border-outline-variant/10 shadow-editorial space-y-6 font-serif">
        <div className="text-right text-sm text-on-surface-variant">{hoy}</div>
        <div>
          <p className="font-bold text-on-surface">Juliana Pérez Castro</p>
          <p className="text-sm text-on-surface-variant">Analista Contable</p>
        </div>
        <div className="space-y-4 text-sm text-on-surface leading-relaxed">
          <p><strong>Asunto:</strong> Notificación de No Renovación de Contrato</p>
          <p>Estimada Juliana,</p>
          <p>
            Por medio de la presente, la empresa le comunica que el contrato de trabajo a término fijo
            suscrito con usted, con vigencia al <strong>31 de julio de 2025</strong>, no será renovado
            a su vencimiento.
          </p>
          <p>
            Esta decisión no obedece a una causa disciplinaria, sino a necesidades de reestructuración
            organizacional. Se le agradece su dedicación y compromiso durante el tiempo de su vinculación.
          </p>
          <p>
            Recibirá la liquidación completa de sus prestaciones sociales en los términos establecidos
            por la ley. El área de Recursos Humanos coordinará los detalles correspondientes.
          </p>
          <p>Atentamente,</p>
        </div>
        <div className="pt-6 border-t border-outline-variant/20">
          <p className="text-sm font-bold text-on-surface">Margarita Rosa de Francisco</p>
          <p className="text-xs text-on-surface-variant">Directora de Recursos Humanos</p>
          <p className="text-xs text-on-surface-variant">TalentOS S.A.S.</p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => navigate(`/empleados/${id}/retiro`)}>Cancelar</Button>
        <Button icon="send">Enviar al Empleado</Button>
      </div>
    </div>
  )
}
