import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { employeeService, getAreas } from '../../services/employeeService'
import api from '../../services/api'
import StatusOrb from '../../components/ui/StatusOrb'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function EmpleadoPerfilPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [emp, setEmp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [afiliaciones, setAfiliaciones] = useState([])

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [areas, setAreas] = useState([])

  useEffect(() => {
    getAreas().then((data) => {
      if (Array.isArray(data)) setAreas(data)
    }).catch(() => {})
  }, [])

  const loadData = () => {
    setLoading(true)
    Promise.all([
      employeeService.get(id),
      api.get(`/api/payroll/afiliaciones/${id}`)
        .then((r) => r.data?.data ?? r.data ?? [])
        .catch(() => []),
    ])
      .then(([empData, afilData]) => {
        setEmp(empData)
        setAfiliaciones(Array.isArray(afilData) ? afilData : [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [id])

  // Auto-activate edit mode when navigated with ?modo=editar
  useEffect(() => {
    if (searchParams.get('modo') === 'editar' && emp && !isEditing) {
      startEdit()
    }
  }, [emp, searchParams])

  const getAfil = (tipo) => {
    const found = afiliaciones.find(
      (a) => a.tipo_entidad === tipo && (a.estado === 'activo' || a.estado === 'ACTIVO')
    )
    return found?.nombre_entidad || 'Sin registrar'
  }

  const startEdit = () => {
    setSaveError('')
    setSaveSuccess(false)
    setEditForm({
      nombres: emp.nombres || emp.nombre?.split(' ')[0] || '',
      apellidos: emp.apellidos || emp.nombre?.split(' ').slice(1).join(' ') || '',
      email: emp.correo || emp.email || '',
      telefono: emp.telefono || '',
      direccion: emp.direccion || '',
      ciudad: emp.ciudad || '',
      cargo: emp.cargo || '',
      areaId: emp.areaId ?? '',
      banco: emp.banco || '',
      numero_cuenta: emp.numero_cuenta || '',
      salario_basico: emp.salario ?? emp.salarioBasico ?? '',
    })
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setSaveError('')
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const payload = { ...editForm }
      if (payload.areaId) payload.areaId = Number(payload.areaId)
      const updated = await employeeService.update(id, payload)
      setEmp(updated)
      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch {
      setSaveError('Error al guardar los cambios. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin">autorenew</span>
        <span className="text-sm">Cargando perfil...</span>
      </div>
    )
  }

  if (!emp) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="material-symbols-outlined text-4xl text-error">error</span>
        <p className="text-sm text-on-surface-variant">No se pudo cargar el empleado.</p>
        <Button onClick={() => navigate('/empleados')}>Volver al listado</Button>
      </div>
    )
  }

  const empNombre = emp.nombre || [emp.nombres, emp.apellidos].filter(Boolean).join(' ') || '—'

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest">
        <button onClick={() => navigate('/empleados')} className="hover:text-primary transition-colors">Empleados</button>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-primary-container">{empNombre}</span>
      </nav>

      {/* Success banner */}
      {saveSuccess && (
        <div className="flex items-center gap-3 p-4 bg-tertiary-fixed/20 border border-tertiary-fixed/30 rounded-lg">
          <span className="material-symbols-outlined text-primary">check_circle</span>
          <p className="text-sm font-medium text-on-surface">Perfil actualizado correctamente.</p>
        </div>
      )}

      {/* Profile header card */}
      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-card">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="w-20 h-20 rounded-xl bg-primary-fixed flex items-center justify-center font-black text-primary text-2xl flex-shrink-0">
            {empNombre.split(' ').slice(0, 2).map((w) => w[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-extrabold text-primary-container">{empNombre}</h2>
            <p className="text-on-surface-variant font-medium">{emp.cargo} · {emp.areaNombre || emp.area}</p>
            <div className="mt-3 flex items-center gap-4 flex-wrap">
              <StatusOrb status={emp.estado === 'ACTIVO' ? 'active' : 'inactive'} />
              <span className="text-xs text-on-surface-variant">Ingreso: {emp.fechaIngreso || '—'}</span>
              <span className="text-xs text-on-surface-variant">Contrato: {emp.tipoContrato || emp.tipo_contrato || '—'}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isEditing ? (
              <>
                <Button variant="secondary" size="sm" onClick={cancelEdit} disabled={saving}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" icon="save" onClick={handleSave} loading={saving} disabled={saving}>
                  Guardar Cambios
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm" icon="edit" onClick={startEdit}>Editar</Button>
                <Button variant="secondary" size="sm" icon="description" onClick={() => navigate(`/empleados/${id}/hoja-vida`)}>
                  Hoja de Vida
                </Button>
                <Button variant="secondary" size="sm" icon="folder" onClick={() => navigate(`/empleados/${id}/documentos`)}>
                  Documentos
                </Button>
                <Button variant="primary" size="sm" icon="badge" onClick={() => navigate(`/empleados/${id}/certificacion`)}>
                  Certificación
                </Button>
              </>
            )}
          </div>
        </div>
        {saveError && (
          <div className="mt-4 flex items-center gap-2 text-sm text-error">
            <span className="material-symbols-outlined text-sm">error</span>
            {saveError}
          </div>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Datos Personales */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-5">
            Datos Personales
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              {/* Non-editable */}
              <div className="flex items-center gap-3 px-3 py-2 bg-surface-container-low/50 rounded-lg">
                <span className="material-symbols-outlined text-outline text-lg">badge</span>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Cédula (no editable)</p>
                  <p className="text-sm font-semibold text-on-surface">{emp.cedula || '—'}</p>
                </div>
              </div>
              <Input
                label="Nombres"
                value={editForm.nombres}
                onChange={(e) => setEditForm({ ...editForm, nombres: e.target.value })}
              />
              <Input
                label="Apellidos"
                value={editForm.apellidos}
                onChange={(e) => setEditForm({ ...editForm, apellidos: e.target.value })}
              />
              <Input
                label="Correo electrónico"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
              <Input
                label="Teléfono"
                value={editForm.telefono}
                onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
              />
              <Input
                label="Ciudad"
                value={editForm.ciudad}
                onChange={(e) => setEditForm({ ...editForm, ciudad: e.target.value })}
              />
              <Input
                label="Dirección"
                value={editForm.direccion}
                onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { icon: 'badge', label: 'Cédula', val: emp.cedula },
                { icon: 'mail', label: 'Correo', val: emp.correo },
                { icon: 'phone', label: 'Teléfono', val: emp.telefono },
                { icon: 'location_on', label: 'Ciudad', val: emp.ciudad },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-outline text-lg">{f.icon}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{f.label}</p>
                    <p className="text-sm font-semibold text-on-surface">{f.val || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Datos Laborales */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-5">
            Datos Laborales
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Cargo"
                value={editForm.cargo}
                onChange={(e) => setEditForm({ ...editForm, cargo: e.target.value })}
              />
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Área / Departamento
                </label>
                <select
                  value={editForm.areaId}
                  onChange={(e) => setEditForm({ ...editForm, areaId: e.target.value })}
                  className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all"
                >
                  <option value="">Seleccionar área...</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Salario básico"
                type="number"
                value={editForm.salario_basico}
                onChange={(e) => setEditForm({ ...editForm, salario_basico: e.target.value })}
              />
              <Input
                label="Banco"
                value={editForm.banco}
                onChange={(e) => setEditForm({ ...editForm, banco: e.target.value })}
              />
              <Input
                label="Número de cuenta"
                value={editForm.numero_cuenta}
                onChange={(e) => setEditForm({ ...editForm, numero_cuenta: e.target.value })}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {[
                {
                  icon: 'payments',
                  label: 'Salario',
                  val: emp.salario ? `$${Number(emp.salario).toLocaleString('es-CO')}` : '—',
                },
                { icon: 'work', label: 'Cargo', val: emp.cargo },
                { icon: 'corporate_fare', label: 'Área', val: emp.areaNombre || emp.area },
                { icon: 'event', label: 'Fecha Ingreso', val: emp.fechaIngreso },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-outline text-lg">{f.icon}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{f.label}</p>
                    <p className="text-sm font-semibold text-on-surface">{f.val || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seguridad Social — fetched from /api/payroll/afiliaciones/:id */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-5">
          Seguridad Social
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: 'local_hospital', label: 'EPS', val: getAfil('eps') },
            { icon: 'security', label: 'ARL', val: getAfil('arl') },
            { icon: 'savings', label: 'Pensión', val: getAfil('pension') },
            { icon: 'account_balance', label: 'Caja Comp.', val: getAfil('caja_comp') },
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-2 p-4 bg-surface-container-low rounded-xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-lg">{f.icon}</span>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{f.label}</p>
              </div>
              <p className="text-sm font-semibold text-on-surface">{f.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Afiliaciones', icon: 'assignment_ind', to: `/empleados/${id}/afiliaciones` },
          { label: 'Retiro', icon: 'exit_to_app', to: `/empleados/${id}/retiro`, danger: true },
        ].map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.to)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-0.5 ${
              a.danger
                ? 'border-error/20 bg-error-container/10 text-error hover:bg-error-container/20'
                : 'border-outline-variant/10 bg-surface-container-lowest text-primary-container hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">{a.icon}</span>
            <span className="text-xs font-bold">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
