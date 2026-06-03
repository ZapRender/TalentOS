import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { payrollService } from '../../services/payrollService'

const TIPOS = ['Horas Extra', 'Incapacidad', 'Vacaciones', 'Descuento', 'Bonificación', 'Embargo']

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function NovedadesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [novedades, setNovedades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editNovedad, setEditNovedad] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    empleado_id: '', concepto_codigo: '', concepto_descripcion: '', valor: '', es_deduccion: false, fecha_novedad: '',
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const load = () => {
    setLoading(true)
    payrollService.novedades
      .list(id)
      .then(setNovedades)
      .catch(() => setError('No se pudieron cargar las novedades.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const openNew = () => {
    setEditNovedad(null)
    setForm({ empleado_id: '', concepto_codigo: '', concepto_descripcion: '', valor: '', es_deduccion: false, fecha_novedad: '' })
    setModalOpen(true)
  }

  const openEdit = (n) => {
    setEditNovedad(n)
    setForm({
      empleado_id: n.empleado_id || '',
      concepto_codigo: n.concepto_codigo || '',
      concepto_descripcion: n.concepto_descripcion || '',
      valor: n.valor || '',
      es_deduccion: n.es_deduccion || false,
      fecha_novedad: n.fecha_novedad || '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editNovedad) {
        await payrollService.novedades.update(editNovedad.id, form)
      } else {
        await payrollService.novedades.create({ ...form, periodo_id: id, valor: Number(form.valor) })
      }
      setModalOpen(false)
      load()
    } catch {
      setError('Error al guardar la novedad.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (novId) => {
    if (!window.confirm('¿Eliminar esta novedad?')) return
    try {
      await payrollService.novedades.delete(novId)
      load()
    } catch {
      setError('Error al eliminar la novedad.')
    }
  }

  const displayed = tipoFilter
    ? novedades.filter((n) => n.concepto_descripcion?.toLowerCase().includes(tipoFilter.toLowerCase()))
    : novedades

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/nomina/periodos')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Novedades del Periodo</h2>
          <p className="text-on-surface-variant text-sm">Periodo: {id}</p>
        </div>
        <Button icon="add" onClick={openNew}>Registrar Novedad</Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTipoFilter('')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${!tipoFilter ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>Todas</button>
        {TIPOS.map((t) => (
          <button key={t} onClick={() => setTipoFilter(t)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${tipoFilter === t ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>{t}</button>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">autorenew</span>
            <span className="text-sm">Cargando novedades...</span>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                {['Empleado', 'Tipo de Novedad', 'Valor', 'Fecha', 'Acciones'].map((h, i) => (
                  <th key={h} className={`px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {displayed.map((n, i) => (
                <tr key={n.id} className={`group hover:bg-surface-container-low/30 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/10' : ''}`}>
                  <td className="px-8 py-5 text-sm font-semibold text-on-surface">{n.empleado || n.empleado_id}</td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-bold bg-primary-fixed text-primary px-2 py-0.5 rounded uppercase tracking-wider">{n.concepto_descripcion || n.concepto_codigo}</span>
                  </td>
                  <td className={`px-8 py-5 text-sm font-bold ${n.es_deduccion ? 'text-error' : 'text-emerald-700'}`}>
                    {n.es_deduccion ? '-' : ''}{fmt(n.valor)}
                  </td>
                  <td className="px-8 py-5 text-xs text-on-surface-variant">{n.fecha_novedad}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(n)} className="w-7 h-7 flex items-center justify-center rounded text-primary hover:bg-primary/5">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button onClick={() => handleDelete(n.id)} className="w-7 h-7 flex items-center justify-center rounded text-error/70 hover:bg-error/5">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-sm text-on-surface-variant">No hay novedades para este periodo.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-end">
        <Button icon="calculate" onClick={() => navigate(`/nomina/periodos/${id}/resultado`)}>Calcular Liquidación</Button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editNovedad ? 'Editar Novedad' : 'Registrar Novedad'}>
        <div className="space-y-4">
          <Input label="ID Empleado" value={form.empleado_id} onChange={set('empleado_id')} placeholder="UUID o código del empleado" />
          <Input label="Código concepto" value={form.concepto_codigo} onChange={set('concepto_codigo')} placeholder="Ej. HORA_EXTRA" />
          <Input label="Descripción concepto" value={form.concepto_descripcion} onChange={set('concepto_descripcion')} placeholder="Ej. Horas Extra" />
          <Input label="Valor" type="number" value={form.valor} onChange={set('valor')} placeholder="Ej. 320000" />
          <Input label="Fecha de novedad" type="date" value={form.fecha_novedad} onChange={set('fecha_novedad')} />
          <div className="flex items-center gap-3">
            <input type="checkbox" id="esDed" checked={form.es_deduccion} onChange={set('es_deduccion')} className="w-4 h-4 accent-primary" />
            <label htmlFor="esDed" className="text-sm font-medium text-on-surface">Es deducción</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : editNovedad ? 'Guardar Cambios' : 'Registrar'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
