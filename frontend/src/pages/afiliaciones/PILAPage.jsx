import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'
import { payrollService } from '../../services/payrollService'

export default function PILAPage() {
  const navigate = useNavigate()
  const [mes, setMes] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generado, setGenerado] = useState(null)
  const [historial, setHistorial] = useState([])
  const [downloading, setDownloading] = useState('')
  const [error, setError] = useState('')

  const handleGenerar = async () => {
    if (!mes) {
      setError('Seleccione el mes de liquidación.')
      return
    }
    setGenerating(true)
    setError('')
    try {
      const [anio, mesNum] = mes.split('-')
      const res = await payrollService.pila.generar({ anio: Number(anio), mes: Number(mesNum) })
      setGenerado(res)
      setHistorial((prev) => [{ mes: `${mesNum}/${anio}`, ...res, estado: 'active', archivo: res.archivo || `PILA_${anio}${mesNum}.txt` }, ...prev])
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al generar el archivo PILA.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDescargar = async (mesKey) => {
    setDownloading(mesKey)
    try {
      const res = await payrollService.pila.archivoPlano(mesKey)
      const blob = new Blob([res], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PILA_${mesKey}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Error al descargar el archivo.')
    } finally {
      setDownloading('')
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-3">
            <button onClick={() => navigate('/nomina')} className="hover:text-primary">Nómina</button>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-primary-container">PILA</span>
          </nav>
          <h2 className="text-3xl font-extrabold text-primary-container">Exportar Archivo Plano PILA</h2>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{error}</p>
        </div>
      )}

      {generado && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <p className="text-sm text-emerald-800 font-medium">Archivo PILA generado: {generado.archivo || `PILA_${mes.replace('-', '')}.txt`}</p>
        </div>
      )}

      {/* Generator */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
        <h3 className="font-bold text-primary-container mb-5">Generar Nuevo Archivo</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Mes de Liquidación</label>
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all"
            />
          </div>
          <Button icon="description" onClick={handleGenerar} disabled={generating}>
            {generating ? 'Generando...' : 'Generar PILA'}
          </Button>
        </div>
      </div>

      {/* History */}
      {historial.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
          <div className="px-8 py-5 bg-surface-container-low/50 border-b border-outline-variant/10">
            <h3 className="font-bold text-primary-container">Archivos Generados en esta Sesión</h3>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low/30">
                {['Periodo', 'Estado', 'Archivo', 'Descargar'].map((h, i) => (
                  <th key={h} className={`px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {historial.map((h, i) => (
                <tr key={i} className="hover:bg-surface-container-low/20 transition-colors group">
                  <td className="px-8 py-5 font-semibold text-on-surface text-sm">{h.mes}</td>
                  <td className="px-8 py-5"><StatusOrb status="active" label="Generado" /></td>
                  <td className="px-8 py-5 text-xs text-on-surface-variant font-mono">{h.archivo}</td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => handleDescargar(h.mes.replace('/', '-'))}
                      disabled={downloading === h.mes}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      {downloading === h.mes ? 'Descargando...' : 'Descargar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
