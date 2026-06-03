import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { payrollService } from '../../services/payrollService'
import { useAuth } from '../../context/AuthContext'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n ?? 0)

function periodoLabel(p) {
  if (!p) return '—'
  const mes = MESES[(p.mes || 1) - 1] ?? '?'
  const q = p.quincena
  const qLabel = (q === 1 || q === '1') ? 'Q1' : (q === 2 || q === '2') ? 'Q2' : 'Mensual'
  return `${mes} ${p.anio} · ${qLabel}`
}

function fmtDate(str) {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

const ESTADO_BADGE = {
  abierto:              'bg-blue-100 text-blue-800',
  liquidado:            'bg-amber-100 text-amber-800',
  pendiente_aprobacion: 'bg-orange-100 text-orange-800',
  aprobado:             'bg-green-100 text-green-800',
  pagado:               'bg-gray-100 text-gray-700',
}

const LIQUIDADOS = ['liquidado', 'pendiente_aprobacion', 'aprobado', 'pagado']

export default function ResultadoLiquidacionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const userRol = user?.rol || ''

  const [periodo, setPeriodo] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accionando, setAccionando] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const p = await payrollService.periodos.get(id)
      setPeriodo(p)
      setResultado(null)

      if (LIQUIDADOS.includes(p.estado)) {
        const r = await payrollService.periodos.resultado(id)
        setResultado(r)
      }
    } catch {
      setError('No se pudieron cargar los resultados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleAction = async (action) => {
    setAccionando(true)
    setError('')
    setSuccessMsg('')
    try {
      const msg = await action()
      if (msg) setSuccessMsg(msg)
      await load()
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al ejecutar la acción.')
    } finally {
      setAccionando(false)
    }
  }

  const estado = (periodo?.estado ?? '').toLowerCase()
  const badgeClass = ESTADO_BADGE[estado] ?? 'bg-gray-100 text-gray-700'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
        <p className="text-sm font-medium">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate('/nomina/periodos')}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant mt-1"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Resultado de Liquidación</h2>
          {periodo && (
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-on-surface-variant">
              <span>
                <span className="font-semibold text-on-surface">Período:</span>{' '}
                {periodoLabel(periodo)}
              </span>
              <span>
                <span className="font-semibold text-on-surface">Fechas:</span>{' '}
                {fmtDate(periodo.fecha_inicial)} — {fmtDate(periodo.fecha_final)}
              </span>
              <span>
                <span className="font-semibold text-on-surface">Fecha pago:</span>{' '}
                {fmtDate(periodo.fecha_pago)}
              </span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                {estado.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{error}</p>
        </div>
      )}

      {/* Success */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <p className="text-sm text-green-800 font-medium">{successMsg}</p>
        </div>
      )}

      {/* Estado: abierto → empty state */}
      {!error && estado === 'abierto' && (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600 text-3xl">receipt_long</span>
          </div>
          <div>
            <p className="text-base font-bold text-primary-container">Este período no ha sido liquidado</p>
            <p className="text-sm text-on-surface-variant mt-1 max-w-md">
              Registra las novedades del período y ejecuta la liquidación para ver los resultados.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon="edit_note" onClick={() => navigate(`/nomina/novedades?periodoId=${id}`)}>
              Ir a novedades
            </Button>
            <Button
              icon="calculate"
              loading={accionando}
              disabled={accionando}
              onClick={() => handleAction(() => payrollService.periodos.liquidar(id))}
            >
              Ejecutar liquidación
            </Button>
          </div>
        </div>
      )}

      {/* Estado: liquidado en adelante → show results */}
      {!error && LIQUIDADOS.includes(estado) && resultado && (
        <>
          {/* Summary cards — 4 in a row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl p-5 bg-surface-container-lowest border border-outline-variant/10 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Empleados liquidados
              </p>
              <p className="text-2xl font-extrabold text-on-surface">{resultado.totalEmpleados}</p>
            </div>
            <div className="rounded-xl p-5 bg-surface-container-lowest border border-outline-variant/10 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Total devengado
              </p>
              <p className="text-lg font-extrabold text-on-surface">{fmt(resultado.totalDevengado)}</p>
            </div>
            <div className="rounded-xl p-5 bg-surface-container-lowest border border-outline-variant/10 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Total deducido
              </p>
              <p className="text-lg font-extrabold text-on-surface">{fmt(resultado.totalDeducido)}</p>
            </div>
            <div className="rounded-xl p-5 bg-primary-container shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">
                Total neto a pagar
              </p>
              <p className="text-lg font-extrabold text-white">{fmt(resultado.totalNeto)}</p>
            </div>
          </div>

          {/* Employee table */}
          {resultado.liquidaciones?.length > 0 ? (
            <div className="rounded-xl border border-outline-variant/10 overflow-hidden shadow-card bg-surface-container-lowest">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant/20">
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Empleado
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Días trab.
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Devengado
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Deducido
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Neto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.liquidaciones.map((liq) => (
                    <tr
                      key={liq.id}
                      className="cursor-pointer hover:bg-surface-container transition-colors border-b border-outline-variant/10 last:border-0"
                      onClick={() => navigate(`/nomina/periodos/${id}/empleado/${liq.empleado_id}`)}
                    >
                      <td className="px-4 py-3 font-medium text-on-surface">
                        {liq.nombre_empleado ?? `Empleado #${liq.empleado_id}`}
                      </td>
                      <td className="px-4 py-3 text-right text-on-surface-variant">{liq.dias_trabajados}</td>
                      <td className="px-4 py-3 text-right text-on-surface">{fmt(liq.total_devengado)}</td>
                      <td className="px-4 py-3 text-right text-error">{fmt(liq.total_deducido)}</td>
                      <td className="px-4 py-3 text-right font-bold text-on-surface">{fmt(liq.neto_pagar)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/10">
              <span className="material-symbols-outlined text-3xl text-error">warning</span>
              <p className="text-sm text-on-surface-variant">
                No se encontraron liquidaciones para este período. Contacta al administrador del sistema.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end flex-wrap items-center">
            <Button
              variant="secondary"
              icon="download"
              onClick={() => {
                payrollService.nomina.excel(id)
                  .then((blob) => {
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `nomina-periodo-${id}.xlsx`
                    a.click()
                    URL.revokeObjectURL(url)
                  })
                  .catch(() => setError('No se pudo exportar el Excel.'))
              }}
            >
              Exportar Excel
            </Button>

            {estado === 'liquidado' && (
              <Button
                icon="send"
                loading={accionando}
                disabled={accionando}
                onClick={() => handleAction(() => payrollService.periodos.enviarAprobacion(id))}
              >
                Enviar a aprobación
              </Button>
            )}

            {estado === 'pendiente_aprobacion' && userRol === 'GERENTE' && (
              <Button
                icon="check_circle"
                loading={accionando}
                disabled={accionando}
                onClick={() => handleAction(() => payrollService.periodos.aprobar(id))}
              >
                Aprobar
              </Button>
            )}

            {estado === 'pendiente_aprobacion' && userRol !== 'GERENTE' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200">
                <span className="material-symbols-outlined text-base">schedule</span>
                Pendiente de aprobación por Gerente
              </span>
            )}

            {estado === 'aprobado' && (
              <Button
                icon="mark_email_read"
                loading={accionando}
                disabled={accionando}
                onClick={() => handleAction(async () => {
                  await payrollService.periodos.enviarDesp(id)
                  return 'Desprendibles enviados correctamente'
                })}
              >
                Enviar desprendibles
              </Button>
            )}

            {estado === 'pagado' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium border border-gray-200">
                <span className="material-symbols-outlined text-base">lock</span>
                Nómina pagada — solo lectura
              </span>
            )}
          </div>
        </>
      )}

      {/* Liquidated but resultado failed to load */}
      {!error && LIQUIDADOS.includes(estado) && !resultado && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/10">
          <span className="material-symbols-outlined text-3xl text-error">warning</span>
          <p className="text-sm text-on-surface-variant">
            No se encontraron liquidaciones para este período. Contacta al administrador del sistema.
          </p>
        </div>
      )}
    </div>
  )
}
