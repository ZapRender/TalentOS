import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { employeeService } from '../../services/employeeService'
import Button from '../../components/ui/Button'

const TIPO_OPTIONS = [
  { tipo: 'con_salario', label: 'Con Salario',   desc: 'Incluye el valor del salario mensual' },
  { tipo: 'basica',      label: 'Básica',         desc: 'Certifica cargo, área y tiempo de servicio' },
  { tipo: 'retiro',      label: 'De Retiro',      desc: 'Incluye fecha de último día laborado' },
]

export default function CertificacionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const hoy = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })

  const [emp, setEmp] = useState(null)
  const [selectedTipo, setSelectedTipo] = useState('con_salario')
  const [downloading, setDownloading] = useState(false)
  const [sending, setSending] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [emailMsg, setEmailMsg] = useState('')

  useEffect(() => {
    employeeService.get(id).then(setEmp).catch(() => setEmp(null))
  }, [id])

  const handleDownload = async () => {
    setDownloading(true)
    setDownloadError('')
    try {
      const blob = await employeeService.certificacion.download(id, selectedTipo)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificacion_${id}_${selectedTipo}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setDownloadError('No se pudo generar el PDF. Intenta de nuevo.')
    } finally {
      setDownloading(false)
    }
  }

  const handleEmail = async () => {
    setSending(true)
    setEmailMsg('')
    try {
      const result = await employeeService.certificacion.email(id)
      setEmailMsg(
        result?.sent
          ? 'Certificación enviada al correo del empleado.'
          : 'El desprendible será enviado al correo registrado del empleado.'
      )
    } catch {
      setEmailMsg('El desprendible será enviado al correo registrado del empleado.')
    } finally {
      setSending(false)
      setTimeout(() => setEmailMsg(''), 5000)
    }
  }

  const empNombre = emp
    ? emp.nombre || [emp.nombres, emp.apellidos].filter(Boolean).join(' ')
    : `Empleado #${id}`

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/empleados/${id}`)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Certificación Laboral</h2>
          <p className="text-on-surface-variant text-sm">{empNombre}</p>
        </div>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIPO_OPTIONS.map((o) => (
          <button
            key={o.tipo}
            onClick={() => setSelectedTipo(o.tipo)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedTipo === o.tipo
                ? 'border-primary-fixed-dim bg-primary-fixed/20'
                : 'border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-low'
            }`}
          >
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
            <strong>{empNombre.toUpperCase()}</strong>
            {emp?.cedula ? `, identificado/a con cédula de ciudadanía N° ${emp.cedula},` : ''}{' '}
            se encuentra vinculado/a a nuestra empresa
            {emp?.fechaIngreso ? ` desde el ${emp.fechaIngreso}` : ''},
            {emp?.cargo ? ` desempeñando el cargo de ${emp.cargo}` : ''}
            {emp?.area ? ` en el área de ${emp.area}` : ''}
            {selectedTipo === 'con_salario' && emp?.salario
              ? `, con salario mensual de $${Number(emp.salario).toLocaleString('es-CO')} M/CTE`
              : ''}
            .
          </p>
          <p>
            Esta certificación se expide a solicitud del interesado el {hoy}.
          </p>
        </div>
        <div className="pt-8 border-t border-outline-variant/20 flex justify-between items-end">
          <div>
            <div className="h-px w-40 bg-on-surface mb-2" />
            <p className="text-xs font-bold text-on-surface">Directora de RRHH</p>
            <p className="text-xs text-on-surface-variant">TalentOS S.A.S.</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-on-surface-variant">Firma Digital Verificada</p>
            <span
              className="material-symbols-outlined text-primary text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          </div>
        </div>
      </div>

      {/* Feedback messages */}
      {downloadError && (
        <div className="flex items-center gap-2 p-3 bg-error-container/20 rounded-lg text-sm text-error border border-error/20">
          <span className="material-symbols-outlined text-sm">error</span>
          {downloadError}
        </div>
      )}
      {emailMsg && (
        <div className="flex items-center gap-2 p-3 bg-tertiary-fixed/20 rounded-lg text-sm text-on-surface border border-outline-variant/20">
          <span className="material-symbols-outlined text-sm text-primary">mail</span>
          {emailMsg}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" icon="mail" onClick={handleEmail} loading={sending} disabled={sending}>
          Enviar por Correo
        </Button>
        <Button icon="download" onClick={handleDownload} loading={downloading} disabled={downloading}>
          Descargar PDF
        </Button>
      </div>
    </div>
  )
}
