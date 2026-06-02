import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'

const DOCS = [
  { nombre: 'Cédula de Ciudadanía', tipo: 'Identificación', estado: 'active', fecha: '05/07/2019', size: '1.2 MB' },
  { nombre: 'Diploma de Grado', tipo: 'Educación', estado: 'active', fecha: '10/01/2020', size: '2.8 MB' },
  { nombre: 'Certificado ARL', tipo: 'Afiliaciones', estado: 'active', fecha: '01/01/2024', size: '0.5 MB' },
  { nombre: 'Examen de Ingreso', tipo: 'Salud', estado: 'pending', fecha: 'Pendiente', size: '-' },
  { nombre: 'Antecedentes Penales', tipo: 'Legal', estado: 'error', fecha: 'Vencido', size: '0.3 MB' },
]

export default function DocumentosPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/empleados/${id}`)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Documentos</h2>
          <p className="text-on-surface-variant text-sm">Juliana Pérez Castro</p>
        </div>
        <Button variant="primary" icon="upload" size="sm">Subir Documento</Button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              {['Documento', 'Tipo', 'Estado', 'Fecha', 'Tamaño', ''].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {DOCS.map((doc, i) => (
              <tr key={i} className="hover:bg-surface-container-low/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-fixed/30 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-lg">description</span>
                    </div>
                    <span className="text-sm font-semibold text-on-surface">{doc.nombre}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-on-surface-variant font-medium">{doc.tipo}</td>
                <td className="px-6 py-4"><StatusOrb status={doc.estado} /></td>
                <td className="px-6 py-4 text-xs text-on-surface-variant">{doc.fecha}</td>
                <td className="px-6 py-4 text-xs text-on-surface-variant">{doc.size}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-7 h-7 flex items-center justify-center rounded text-primary hover:bg-primary/5 transition-colors">
                      <span className="material-symbols-outlined text-lg">download</span>
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded text-error/70 hover:bg-error/5 transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
