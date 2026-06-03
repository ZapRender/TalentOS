import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { payrollService } from '../../services/payrollService'

export default function NominaPage() {
  const navigate = useNavigate()
  const [periodos, setPeriodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
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

  const stats = [
    { label: 'Empleados en Nómina', value: periodos[0]?.empleados?.toLocaleString() || '—', icon: 'groups', bg: 'bg-primary-fixed', color: 'text-primary' },
    { label: 'Nómina del Periodo', value: periodos[0]?.total ? new Intl.NumberFormat('es-CO', { notation: 'compact', currency: 'COP' }).format(periodos[0].total) : '—', icon: 'payments', bg: 'bg-secondary-fixed', color: 'text-secondary' },
    { label: 'Periodos Cerrados', value: periodos.filter((p) => p.estado !== 'ABIERTO' && p.estado !== 'pending').length.toString(), icon: 'check_circle', bg: 'bg-tertiary-fixed', color: 'text-tertiary' },
    { label: 'Pendientes Aprobación', value: periodos.filter((p) => p.estado === 'LIQUIDADO' || p.estado === 'pending').length.toString(), icon: 'pending_actions', bg: 'bg-error-container', color: 'text-error' },
  ]

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
          <h2 className="text-3xl font-extrabold text-primary-container tracking-tight">Gestión de Nómina</h2>
          <p className="text-on-surface-variant mt-1">Liquidación y control de periodos de pago</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="list" onClick={() => navigate('/nomina/periodos')}>Periodos</Button>
          <Button icon="add" onClick={() => setModalOpen(true)}>Nuevo Periodo</Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-card">
            <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-extrabold text-primary-container">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-card overflow-hidden">
        <div className="px-8 py-5 bg-surface-container-low/50 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="font-bold text-primary-container">Periodos Recientes</h3>
          <Button variant="secondary" size="sm" onClick={() => navigate('/nomina/periodos')}>Ver todos</Button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">autorenew</span>
            <span className="text-sm">Cargando...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low/30">
                {['Periodo', 'Empleados', 'Total Nómina', 'Estado', 'Fecha Cierre', 'Acciones'].map((h) => (
                  <th key={h} className="px-8 py-4 text-left text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {periodos.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low/20 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-bold text-on-surface">{p.nombre || `${p.mes}/${p.anio}`}</p>
                    <p className="text-[11px] text-on-surface-variant">{p.id}</p>
                  </td>
                  <td className="px-8 py-5 text-sm font-semibold text-on-surface">{(p.empleados || 0).toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm font-bold text-primary-container">
                    {p.total ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.total) : '—'}
                  </td>
                  <td className="px-8 py-5">
                    <StatusOrb status={p.estado === 'ABIERTO' || p.estado === 'pending' ? 'pending' : 'active'} label={p.estado === 'ABIERTO' ? 'Pendiente' : p.estado || 'Liquidado'} />
                  </td>
                  <td className="px-8 py-5 text-xs text-on-surface-variant">{p.fecha_final || p.fecha}</td>
                  <td className="px-8 py-5">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/nomina/periodos/${p.id}/novedades`)} className="text-xs font-bold text-primary hover:underline">Novedades</button>
                      <button onClick={() => navigate(`/nomina/periodos/${p.id}/aprobar`)} className="text-xs font-bold text-primary hover:underline">Aprobar</button>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Liquidación Contrato', icon: 'account_balance_wallet', to: '/nomina/liquidacion-contrato', desc: 'Calcular prestaciones y liquidaciones' },
          { label: 'Exportar PILA', icon: 'description', to: '/nomina/pila', desc: 'Generar archivo plano PILA' },
          { label: 'Desprendibles', icon: 'receipt', to: periodos[0] ? `/nomina/periodos/${periodos[0].id}/desprendibles` : '/nomina/periodos', desc: 'Enviar comprobantes de pago' },
        ].map((a) => (
          <button key={a.label} onClick={() => navigate(a.to)} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-card flex items-center gap-4 hover:bg-surface-container-low transition-colors text-left group">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center flex-shrink-0 group-hover:bg-primary-fixed-dim transition-colors">
              <span className="material-symbols-outlined text-primary">{a.icon}</span>
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm">{a.label}</p>
              <p className="text-xs text-on-surface-variant">{a.desc}</p>
            </div>
          </button>
        ))}
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
