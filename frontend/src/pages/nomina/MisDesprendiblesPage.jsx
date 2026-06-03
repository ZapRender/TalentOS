import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { payrollService } from '../../services/payrollService'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n ?? 0)

function periodoLabel(p) {
  const mes = MESES[(p.mes || 1) - 1] ?? '?'
  const q = p.quincena === 1 || p.quincena === '1' ? 'Q1' : p.quincena === 2 || p.quincena === '2' ? 'Q2' : 'Mensual'
  return `${mes} ${p.anio} · ${q}`
}

function fmtFecha(str) {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  return `${parseInt(d)} ${MESES[parseInt(m) - 1]} ${y}`
}

const ESTADOS_PAGO = ['aprobado', 'pagado']

export default function MisDesprendiblesPage() {
  const { user } = useAuth()
  const empleadoId = user?.empleadoId

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [descargando, setDescargando] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!empleadoId) {
      setLoading(false)
      return
    }
    const load = async () => {
      try {
        const periodos = await payrollService.periodos.list()
        const qualifying = (Array.isArray(periodos) ? periodos : [])
          .filter((p) => ESTADOS_PAGO.includes((p.estado ?? '').toLowerCase()))
          .sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))
          .slice(0, 12)

        const resultados = await Promise.allSettled(qualifying.map((p) => payrollService.periodos.resultado(p.id)))

        const data = qualifying
          .map((p, i) => {
            const r = resultados[i].status === 'fulfilled' ? resultados[i].value : null
            const liq = r?.liquidaciones?.find((l) => String(l.empleado_id) === String(empleadoId))
            return liq ? { periodo: p, liq } : null
          })
          .filter(Boolean)

        setRows(data)
      } catch {
        setError('No se pudieron cargar los desprendibles.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [empleadoId])

  const handleDescargar = async (periodoId, periodo) => {
    setDescargando(periodoId)
    try {
      const blob = await payrollService.nomina.desprendible(periodoId, empleadoId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `desprendible_${periodo.mes ?? periodoId}_${periodo.anio ?? ''}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('No se pudo descargar el desprendible.')
    } finally {
      setDescargando(null)
    }
  }

  if (!empleadoId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">link_off</span>
        <p className="text-sm text-on-surface-variant max-w-sm">
          Tu perfil de empleado no está vinculado a este usuario. Contacta al administrador.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-primary-container">Mis Desprendibles de Pago</h2>
        <p className="text-sm text-on-surface-variant mt-1">Historial de liquidaciones de nómina</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/10">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">receipt_long</span>
          <p className="text-sm text-on-surface-variant">Aún no tienes desprendibles de pago disponibles.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/20">
                {['Período', 'Fechas', 'Total devengado', 'Deducido', 'Neto', 'PDF'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ periodo, liq }) => (
                <tr
                  key={periodo.id}
                  className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container/50 transition-colors"
                >
                  <td className="px-5 py-3 font-semibold text-on-surface">{periodoLabel(periodo)}</td>
                  <td className="px-5 py-3 text-xs text-on-surface-variant">
                    {fmtFecha(periodo.fecha_inicial)} — {fmtFecha(periodo.fecha_final)}
                  </td>
                  <td className="px-5 py-3 text-on-surface">{fmt(liq.total_devengado)}</td>
                  <td className="px-5 py-3 text-error">{fmt(liq.total_deducido)}</td>
                  <td className="px-5 py-3 font-bold text-primary-container">{fmt(liq.neto_pagar)}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDescargar(periodo.id, periodo)}
                      disabled={descargando === periodo.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-sm ${descargando === periodo.id ? 'animate-spin' : ''}`}>
                        {descargando === periodo.id ? 'autorenew' : 'download'}
                      </span>
                      Descargar
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
