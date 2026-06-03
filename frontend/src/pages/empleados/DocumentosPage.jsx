import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { employeeService } from '../../services/employeeService'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import StatusOrb from '../../components/ui/StatusOrb'

const TIPO_OPTIONS = [
  { value: 'cedula', label: 'Cédula de Ciudadanía' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'examen_medico', label: 'Examen Médico' },
  { value: 'afiliacion_arl', label: 'Afiliación ARL' },
  { value: 'afiliacion_eps', label: 'Afiliación EPS' },
  { value: 'certificacion', label: 'Certificación' },
  { value: 'otro', label: 'Otro' },
]

const MAX_BYTES = 5 * 1024 * 1024

function docStatus(doc) {
  const s = doc.estado?.toLowerCase()
  if (s === 'activo' || s === 'active') return 'active'
  if (s === 'pending' || s === 'pendiente') return 'pending'
  return 'error'
}

export default function DocumentosPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [tipo, setTipo] = useState('cedula')
  const [archivo, setArchivo] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const loadDocs = () => {
    setLoading(true)
    employeeService.documentos.list(id)
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadDocs() }, [id])

  const openUpload = () => {
    setTipo('cedula')
    setArchivo(null)
    setUploadError('')
    setUploadOpen(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) { setArchivo(null); return }
    if (file.size > MAX_BYTES) {
      setUploadError('El archivo supera el límite de 5 MB.')
      setArchivo(null)
      e.target.value = ''
      return
    }
    setUploadError('')
    setArchivo(file)
  }

  const handleUpload = async () => {
    if (!archivo) { setUploadError('Selecciona un archivo antes de continuar.'); return }
    setUploading(true)
    setUploadError('')
    try {
      await employeeService.documentos.upload(id, tipo, archivo)
      setUploadOpen(false)
      loadDocs()
    } catch {
      setUploadError('Error al subir el documento. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/empleados/${id}`)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Documentos</h2>
          <p className="text-on-surface-variant text-sm">Gestión de documentos del empleado</p>
        </div>
        <Button variant="primary" icon="upload" size="sm" onClick={openUpload}>
          Subir Documento
        </Button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">autorenew</span>
            <span className="text-sm">Cargando documentos...</span>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                {['Documento', 'Tipo', 'Estado', 'Fecha', 'Tamaño', ''].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {docs.map((doc, i) => (
                <tr key={doc.id ?? i} className="hover:bg-surface-container-low/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-fixed/30 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-lg">description</span>
                      </div>
                      <span className="text-sm font-semibold text-on-surface">
                        {doc.nombre || doc.tipo_documento || 'Documento'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant font-medium">
                    {doc.tipo || doc.tipo_documento || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusOrb status={docStatus(doc)} />
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant">
                    {doc.fecha || (doc.created_at ? new Date(doc.created_at).toLocaleDateString('es-CO') : '—')}
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant">{doc.size || '—'}</td>
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
              {docs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                    No hay documentos registrados. Sube el primero usando el botón superior.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload Modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Subir Documento">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              Tipo de documento
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full h-12 px-4 bg-surface-container-low rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim border border-outline-variant/20"
            >
              {TIPO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              Archivo
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
              className="w-full text-sm text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-fixed file:text-on-primary-fixed hover:file:bg-primary-fixed-dim cursor-pointer"
            />
            <p className="text-xs text-on-surface-variant ml-1">PDF, JPG o PNG · Máximo 5 MB</p>
          </div>

          {uploadError && (
            <p className="flex items-center gap-1.5 text-xs text-error font-medium pl-1">
              <span className="material-symbols-outlined text-sm">error</span>
              {uploadError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleUpload} loading={uploading} disabled={uploading}>
              Subir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
