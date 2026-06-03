import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { payrollService } from '../../services/payrollService'

export default function PeriodosPage() {
  const navigate = useNavigate()
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
                {['Periodo', 'Fechas', 'Empleados', 'Total Nómina', 'Estado', 'Acciones'].map((h, i) => (
                  <th key={h} className={`px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {periodos.map((p, i) => (
                <tr key={p.id} className={`group hover:bg-surface-container-low/30 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/10' : ''}`}>
                  <td className="px-8 py-5">
                    <p className="font-bold text-on-surface">{p.nombre || `${p.mes}/${p.anio}`}</p>
                    <p className="text-[11px] text-on-surface-variant">{p.id}</p>
                  </td>
                  <td className="px-8 py-5 text-xs text-on-surface-variant">{p.fecha_inicial} — {p.fecha_final}</td>
                  <td className="px-8 py-5 text-sm font-semibold text-on-surface">{(p.empleados || 0).toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm font-bold text-primary-container">
                    {p.total ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.total) : '—'}
                  </td>
                  <td className="px-8 py-5">
                    <StatusOrb status={p.estado === 'ABIERTO' || p.estado === 'pending' ? 'pending' : 'active'} label={p.estado === 'ABIERTO' || p.estado === 'pending' ? 'En Proceso' : 'Cerrado'} />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/nomina/periodos/${p.id}/novedades`)} className="text-[11px] font-bold text-primary hover:underline">Novedades</button>
                      <button onClick={() => navigate(`/nomina/periodos/${p.id}/resultado`)} className="text-[11px] font-bold text-primary hover:underline">Resultado</button>
                      <button onClick={() => navigate(`/nomina/periodos/${p.id}/aprobar`)} className="text-[11px] font-bold text-primary hover:underline">Aprobar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {periodos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm text-on-surface-variant">No hay periodos registrados.</td>
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
