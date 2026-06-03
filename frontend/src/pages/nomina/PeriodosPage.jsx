import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { payrollService } from '../../services/payrollService'
import { useAuth } from '../../context/AuthContext'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const ESTADO_BADGE = {
  abierto:              { label: 'Abierto',      cls: 'bg-amber-100 text-amber-700' },
  liquidado:            { label: 'Liquidado',    cls: 'bg-blue-100 text-blue-700' },
  pendiente_aprobacion: { label: 'Pend. Aprob.', cls: 'bg-yellow-100 text-yellow-700' },
  aprobado:             { label: 'Aprobado',     cls: 'bg-emerald-100 text-emerald-700' },
  pagado:               { label: 'Pagado',       cls: 'bg-emerald-100 text-emerald-700' },
}

const fmtCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

function fmtShortDate(d) {
  if (!d) return '—'
  try { const [, m, day] = d.split('-'); return `${day}/${m}` } catch { return d }
}

function periodoLabel(p) {
  const mes = MESES[(p.mes || 1) - 1] ?? '?'
  const q = p.quincena
  const qLabel = (q === 1 || q === '1') ? 'Q1' : (q === 2 || q === '2') ? 'Q2' : 'Mensual'
  return `${mes} ${p.anio} · ${qLabel}`
}

function StateBadge({ estado }) {
  const key = estado?.toLowerCase()
  const badge = ESTADO_BADGE[key]
  if (badge) {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${badge.cls}`}>
        {badge.label}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-surface-container text-on-surface-variant">
      {estado || '—'}
    </span>
  )
}

function AccionesPeriodo({ p, navigate, userRol }) {
  const id = p.id
  const estado = p.estado?.toLowerCase()
  const btn = 'text-[11px] font-bold text-primary border border-primary/30 rounded-md px-2.5 py-1 hover:bg-primary/5 transition-colors whitespace-nowrap'
  const btnSecondary = 'text-[11px] font-bold text-on-surface-variant border border-outline-variant/30 rounded-md px-2.5 py-1 hover:bg-surface-container transition-colors whitespace-nowrap'

  if (estado === 'abierto') return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => navigate(`/nomina/periodos/${id}/novedades`)} className={btnSecondary}>Novedades</button>
      <button onClick={() => navigate(`/nomina/periodos/${id}/resultado`)} className={btn}>Liquidar</button>
    </div>
  )
  if (estado === 'liquidado') return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => navigate(`/nomina/periodos/${id}/novedades`)} className={btnSecondary}>Novedades</button>
      <button onClick={() => navigate(`/nomina/periodos/${id}/resultado`)} className={btn}>Resultado</button>
      <button onClick={() => navigate(`/nomina/periodos/${id}/aprobar`)} className={btn}>Enviar aprob.</button>
    </div>
  )
  if (estado === 'pendiente_aprobacion') return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => navigate(`/nomina/periodos/${id}/resultado`)} className={btn}>Resultado</button>
      {userRol === 'GERENTE' && (
        <button onClick={() => navigate(`/nomina/periodos/${id}/aprobar`)} className={btn}>Aprobar</button>
      )}
    </div>
  )
  if (estado === 'aprobado') return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => navigate(`/nomina/periodos/${id}/resultado`)} className={btn}>Resultado</button>
      <button onClick={() => navigate(`/nomina/periodos/${id}/desprendibles`)} className={btn}>Desprendibles</button>
    </div>
  )
  // pagado o cualquier otro
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => navigate(`/nomina/periodos/${id}/resultado`)} className={btn}>Resultado</button>
    </div>
  )
}

export default function PeriodosPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userRol = user?.rol || ''

  const [periodos, setPeriodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ anio: '', mes: '', quincena: '', fecha_inicial: '', fecha_final: '', fecha_pago: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const load = () => {
    setLoading(true)
    payrollService.periodos
      .list()
      .then(setPeriodos)
      .catch(() => setError('No se pudieron cargar los periodos.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    setSaving(true)
    try {
      await payrollService.periodos.create(form)
      setModalOpen(false)
      setForm({ anio: '', mes: '', quincena: '', fecha_inicial: '', fecha_final: '', fecha_pago: '' })
      load()
    } catch {
      setError('Error al crear el periodo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-3">
            <button onClick={() => navigate('/nomina')} className="hover:text-primary">Nómina</button>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-primary-container">Periodos</span>
          </nav>
          <h2 className="text-3xl font-extrabold text-primary-container">Listado de Periodos</h2>
        </div>
        <Button icon="add" onClick={() => setModalOpen(true)}>Nuevo Periodo</Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{error}</p>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">autorenew</span>
            <span className="text-sm">Cargando periodos...</span>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                {['Periodo', 'Fechas', 'Total Nómina', 'Estado', 'Acciones'].map((h, i) => (
                  <th key={h} className={`px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {periodos.map((p, i) => (
                <tr key={p.id} className={`group hover:bg-surface-container-low/30 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/10' : ''}`}>

                  {/* Periodo */}
                  <td className="px-6 py-5">
                    <p className="font-bold text-on-surface">{periodoLabel(p)}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {fmtShortDate(p.fecha_inicial)} — {fmtShortDate(p.fecha_final)}
                    </p>
                  </td>

                  {/* Fechas completas */}
                  <td className="px-6 py-5 text-xs text-on-surface-variant">
                    <div>{p.fecha_inicial || '—'}</div>
                    <div>{p.fecha_final || '—'}</div>
                  </td>

                  {/* Total nómina */}
                  <td className="px-6 py-5">
                    {(parseFloat(p.total_neto) === 0 && p.estado?.toLowerCase() === 'abierto')
                      ? <span className="text-sm text-on-surface-variant italic">Sin liquidar</span>
                      : parseFloat(p.total_neto) > 0
                        ? <span className="text-sm font-bold text-primary-container">{fmtCOP(parseFloat(p.total_neto))}</span>
                        : <span className="text-sm text-on-surface-variant">—</span>
                    }
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-5">
                    <StateBadge estado={p.estado} />
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-5 text-right">
                    <AccionesPeriodo p={p} navigate={navigate} userRol={userRol} />
                  </td>
                </tr>
              ))}
              {periodos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-sm text-on-surface-variant">No hay periodos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Periodo de Nómina">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Año" type="number" placeholder="2025" value={form.anio} onChange={set('anio')} />
            <Input label="Mes" type="number" placeholder="1-12" value={form.mes} onChange={set('mes')} />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Quincena</label>
            <select value={form.quincena} onChange={set('quincena')} className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all">
              <option value="">Seleccionar...</option>
              <option value="1">Primera quincena</option>
              <option value="2">Segunda quincena</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha inicial" type="date" value={form.fecha_inicial} onChange={set('fecha_inicial')} />
            <Input label="Fecha final" type="date" value={form.fecha_final} onChange={set('fecha_final')} />
          </div>
          <Input label="Fecha de pago" type="date" value={form.fecha_pago} onChange={set('fecha_pago')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? 'Creando...' : 'Crear Periodo'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
