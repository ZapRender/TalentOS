import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { getAreas, crearEmpleado } from '../../services/employeeService'
import { authService } from '../../services/authService'
import { crearInduccion } from '../../services/trainingService'

const SMMLV = 1_300_000

const STEP_LABELS = ['Datos personales', 'Datos de pago', 'Confirmación']

const CONTRATO_LABELS = {
  indefinido:   'Indefinido',
  termino_fijo: 'Término Fijo',
  temporal:     'Temporal',
}

const INGRESO_LABELS = {
  directo:  'Directo',
  temporal: 'A través de empresa temporal',
}

const CUENTA_LABELS = {
  ahorros:   'Ahorros',
  corriente: 'Corriente',
}

function FieldError({ msg }) {
  if (!msg) return null
  return <p className="text-xs text-error mt-1">{msg}</p>
}

function SummaryRow({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</dt>
      <dd className="text-sm font-semibold text-on-surface mt-0.5">{value || '—'}</dd>
    </div>
  )
}

const parseSalario = (str) => parseFloat(String(str ?? '').replace(/[.,\s]/g, '') || '0')

const fmtSalario = (str) => {
  const n = parseSalario(str)
  if (!n) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)
}

export default function EmpleadoNuevoPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [confirmado, setConfirmado] = useState(false)
  const [areas, setAreas] = useState([])
  const [areasError, setAreasError] = useState(false)

  const [s1, setS1] = useState({
    nombres: '', apellidos: '', cedula: '', fechaNacimiento: '',
    email: '', telefono: '', cargo: '', areaId: '',
    tipoContrato: 'indefinido', tipoIngreso: 'directo',
    salarioBasico: '', fechaIngreso: '',
  })

  const [s2, setS2] = useState({
    banco: '', tipoCuenta: 'ahorros', numeroCuenta: '',
    direccion: '', ciudad: '', fechaFinContrato: '', empresaTemporal: '',
  })

  useEffect(() => {
    getAreas()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setAreas(data)
        else setAreasError(true)
      })
      .catch(() => setAreasError(true))
  }, [])

  const up1 = (k) => (e) => setS1((prev) => ({ ...prev, [k]: e.target.value }))
  const up2 = (k) => (e) => setS2((prev) => ({ ...prev, [k]: e.target.value }))

  const selectClass =
    'w-full h-12 px-4 bg-surface-container-low border border-outline-variant/30 rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all'

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateStep1 = () => {
    const e = {}
    if (!s1.nombres.trim())   e.nombres   = 'Este campo es requerido'
    if (!s1.apellidos.trim()) e.apellidos = 'Este campo es requerido'
    if (!s1.cedula.trim())    e.cedula    = 'Este campo es requerido'
    else if (!/^\d[\d.\s]*$/.test(s1.cedula)) e.cedula = 'Debe ser numérico'
    if (!s1.email.trim())     e.email     = 'Este campo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s1.email)) e.email = 'Formato de email inválido'
    if (!s1.cargo.trim())     e.cargo     = 'Este campo es requerido'
    if (!s1.areaId)           e.areaId    = 'Este campo es requerido'
    if (!s1.tipoContrato)     e.tipoContrato = 'Este campo es requerido'
    if (!s1.tipoIngreso)      e.tipoIngreso  = 'Este campo es requerido'
    if (!s1.salarioBasico)    e.salarioBasico = 'Este campo es requerido'
    else if (parseSalario(s1.salarioBasico) < SMMLV)
      e.salarioBasico = 'El salario no puede ser menor al SMMLV ($1.300.000)'
    if (!s1.fechaIngreso)     e.fechaIngreso = 'Este campo es requerido'
    return e
  }

  const validateStep2 = () => {
    const e = {}
    if (!s2.banco.trim())        e.banco        = 'Este campo es requerido'
    if (!s2.tipoCuenta)          e.tipoCuenta   = 'Este campo es requerido'
    if (!s2.numeroCuenta.trim()) e.numeroCuenta = 'Este campo es requerido'
    return e
  }

  // ── Step navigation ──────────────────────────────────────────────────────────

  const goToStep2 = () => {
    const errs = validateStep1()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToStep3 = () => {
    const errs = validateStep2()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = (toStep) => {
    setErrors({})
    setStep(toStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  const submitForm = async () => {
    setLoading(true)
    setErrors({})
    try {
      const empRes = await crearEmpleado({
        cedula:           s1.cedula.replace(/[.\s]/g, ''),
        nombres:          s1.nombres,
        apellidos:        s1.apellidos,
        email:            s1.email,
        telefono:         s1.telefono || null,
        fechaNacimiento:  s1.fechaNacimiento || null,
        cargo:            s1.cargo,
        areaId:           s1.areaId,
        tipoContrato:     s1.tipoContrato,
        tipoIngreso:      s1.tipoIngreso,
        salarioBasico:    parseSalario(s1.salarioBasico),
        fechaIngreso:     s1.fechaIngreso,
        fechaFinContrato: s2.fechaFinContrato || null,
        empresaTemporal:  s2.empresaTemporal || null,
        banco:            s2.banco,
        tipoCuenta:       s2.tipoCuenta,
        numeroCuenta:     s2.numeroCuenta,
        ciudad:           s2.ciudad || null,
        direccion:        s2.direccion || null,
      })

      const nuevoEmpleado = empRes.data?.data ?? empRes.data
      const empleadoId = nuevoEmpleado?.id

      try {
        await authService.crearUsuario({
          nombre:     s1.nombres,
          apellidos:  s1.apellidos,
          email:      s1.email,
          rol:        'EMPLEADO',
          empleadoId: empleadoId,
        })
      } catch (userErr) {
        console.warn('No se pudo crear usuario del sistema:', userErr)
      }

      try {
        await crearInduccion({
          empleado_id:  empleadoId,
          fecha_inicio: s1.fechaIngreso,
        })
      } catch (indErr) {
        console.warn('No se pudo crear plan de inducción:', indErr)
      }

      navigate(`/empleados/${empleadoId}`)
    } catch (err) {
      if (err.response?.status === 409) {
        setErrors({ cedula: 'Ya existe un empleado con esa cédula' })
        setStep(1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setErrors({ general: 'Error al vincular el empleado. Intente de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const areaNombre =
    areas.find((a) => String(a.id) === String(s1.areaId))?.nombre || s1.areaId || '—'

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => (step > 1 ? goBack(step - 1) : navigate('/empleados'))}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-primary-container">Vincular Nuevo Empleado</h2>
          <p className="text-on-surface-variant text-sm">
            Paso {step} de 3 — {STEP_LABELS[step - 1]}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-start">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="flex items-start">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s < step
                    ? 'bg-green-600 text-white'
                    : s === step
                    ? 'bg-primary text-white'
                    : 'border-2 border-gray-300 text-gray-400 bg-white'
                }`}
              >
                {s < step
                  ? <span className="material-symbols-outlined text-base">check</span>
                  : s}
              </div>
              <span
                className={`text-[10px] font-semibold mt-1.5 whitespace-nowrap ${
                  s === step ? 'text-primary-container'
                  : s < step ? 'text-green-600'
                  : 'text-gray-400'
                }`}
              >
                {STEP_LABELS[i]}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`h-0.5 mt-[18px] mx-3 w-28 transition-colors ${
                  s < step ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* General error banner */}
      {errors.general && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{errors.general}</p>
        </div>
      )}

      {/* ─── STEP 1: Datos personales + laborales ─────────────────────────── */}
      {step === 1 && (
        <>
          <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-card space-y-6">
            <h3 className="text-lg font-bold text-primary-container">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Input label="Nombres *" value={s1.nombres} onChange={up1('nombres')} placeholder="Ej. Juliana" />
                <FieldError msg={errors.nombres} />
              </div>
              <div>
                <Input label="Apellidos *" value={s1.apellidos} onChange={up1('apellidos')} placeholder="Ej. Pérez Castro" />
                <FieldError msg={errors.apellidos} />
              </div>
              <div>
                <Input label="Número de Cédula *" value={s1.cedula} onChange={up1('cedula')} placeholder="Ej. 1023456789" />
                <FieldError msg={errors.cedula} />
              </div>
              <div>
                <Input label="Fecha de Nacimiento" type="date" value={s1.fechaNacimiento} onChange={up1('fechaNacimiento')} />
              </div>
              <div>
                <Input label="Correo Electrónico *" type="email" value={s1.email} onChange={up1('email')} placeholder="correo@empresa.com" />
                <FieldError msg={errors.email} />
              </div>
              <div>
                <Input label="Teléfono" type="tel" value={s1.telefono} onChange={up1('telefono')} placeholder="+57 300 000 0000" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-primary-container pt-2">Información Laboral</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Input label="Cargo *" value={s1.cargo} onChange={up1('cargo')} placeholder="Ej. Analista Contable" />
                <FieldError msg={errors.cargo} />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Área / Departamento *
                </label>
                {areasError ? (
                  <input
                    type="text"
                    value={s1.areaId}
                    onChange={up1('areaId')}
                    placeholder="Ej. Finanzas"
                    className={selectClass}
                  />
                ) : (
                  <select value={s1.areaId} onChange={up1('areaId')} className={selectClass}>
                    <option value="">Seleccionar área...</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                )}
                <FieldError msg={errors.areaId} />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Tipo de Contrato *
                </label>
                <select value={s1.tipoContrato} onChange={up1('tipoContrato')} className={selectClass}>
                  <option value="indefinido">Indefinido</option>
                  <option value="termino_fijo">Término Fijo</option>
                  <option value="temporal">Temporal</option>
                </select>
                <FieldError msg={errors.tipoContrato} />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Tipo de Ingreso *
                </label>
                <select value={s1.tipoIngreso} onChange={up1('tipoIngreso')} className={selectClass}>
                  <option value="directo">Directo</option>
                  <option value="temporal">A través de empresa temporal</option>
                </select>
                <FieldError msg={errors.tipoIngreso} />
              </div>

              <div>
                <Input
                  label="Salario Base *"
                  value={s1.salarioBasico}
                  onChange={up1('salarioBasico')}
                  placeholder="Ej. 1800000"
                  type="number"
                />
                <FieldError msg={errors.salarioBasico} />
              </div>

              <div>
                <Input label="Fecha de Ingreso *" type="date" value={s1.fechaIngreso} onChange={up1('fechaIngreso')} />
                <FieldError msg={errors.fechaIngreso} />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => navigate('/empleados')}>Cancelar</Button>
            <Button iconRight="arrow_forward" onClick={goToStep2}>Continuar</Button>
          </div>
        </>
      )}

      {/* ─── STEP 2: Datos de pago y seguridad social ─────────────────────── */}
      {step === 2 && (
        <>
          <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-card space-y-6">
            <h3 className="text-lg font-bold text-primary-container">Información Bancaria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Input
                  label="Banco *"
                  value={s2.banco}
                  onChange={up2('banco')}
                  placeholder="Ej. Bancolombia"
                />
                <FieldError msg={errors.banco} />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Tipo de Cuenta *
                </label>
                <select value={s2.tipoCuenta} onChange={up2('tipoCuenta')} className={selectClass}>
                  <option value="ahorros">Ahorros</option>
                  <option value="corriente">Corriente</option>
                </select>
                <FieldError msg={errors.tipoCuenta} />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Número de Cuenta *"
                  value={s2.numeroCuenta}
                  onChange={up2('numeroCuenta')}
                  placeholder="Ej. 123-456789-00"
                />
                <FieldError msg={errors.numeroCuenta} />
              </div>
            </div>

            {/* Afiliaciones note */}
            <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="material-symbols-outlined text-blue-600 flex-shrink-0 mt-0.5">info</span>
              <p className="text-sm text-blue-800">
                Las afiliaciones a ARL, EPS, Caja de Compensación y Fondo de Pensiones se registrarán
                automáticamente en el módulo de Seguridad Social después de vincular al empleado.
              </p>
            </div>

            <h3 className="text-lg font-bold text-primary-container pt-2">Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Input label="Dirección" value={s2.direccion} onChange={up2('direccion')} placeholder="Ej. Cra 10 # 5-20" />
              </div>
              <div>
                <Input label="Ciudad" value={s2.ciudad} onChange={up2('ciudad')} placeholder="Ej. Pereira" />
              </div>

              {s1.tipoContrato === 'termino_fijo' && (
                <div>
                  <Input
                    label="Fecha fin de contrato"
                    type="date"
                    value={s2.fechaFinContrato}
                    onChange={up2('fechaFinContrato')}
                  />
                </div>
              )}

              {s1.tipoIngreso === 'temporal' && (
                <div>
                  <Input
                    label="Empresa temporal"
                    value={s2.empresaTemporal}
                    onChange={up2('empresaTemporal')}
                    placeholder="Ej. Laboramos S.A.S."
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" icon="arrow_back" onClick={() => goBack(1)}>
              Volver
            </Button>
            <Button iconRight="arrow_forward" onClick={goToStep3}>Continuar</Button>
          </div>
        </>
      )}

      {/* ─── STEP 3: Confirmación y resumen ───────────────────────────────── */}
      {step === 3 && (
        <>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-card overflow-hidden">
            <div className="px-8 py-5 bg-surface-container border-b border-outline-variant/10">
              <h3 className="text-lg font-bold text-primary-container">Resumen de la vinculación</h3>
              <p className="text-sm text-on-surface-variant mt-0.5">Revisa los datos antes de confirmar</p>
            </div>

            <div className="divide-y divide-outline-variant/10">
              {/* Personal */}
              <div className="px-8 py-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">
                  Datos Personales
                </h4>
                <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <SummaryRow label="Nombres completos" value={`${s1.nombres} ${s1.apellidos}`} />
                  <SummaryRow label="Cédula" value={s1.cedula} />
                  <SummaryRow label="Email" value={s1.email} />
                  <SummaryRow label="Teléfono" value={s1.telefono || '—'} />
                </dl>
              </div>

              {/* Laboral */}
              <div className="px-8 py-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">
                  Información Laboral
                </h4>
                <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <SummaryRow label="Cargo" value={s1.cargo} />
                  <SummaryRow label="Área / Departamento" value={areaNombre} />
                  <SummaryRow label="Tipo de contrato" value={CONTRATO_LABELS[s1.tipoContrato] ?? s1.tipoContrato} />
                  <SummaryRow label="Tipo de ingreso" value={INGRESO_LABELS[s1.tipoIngreso] ?? s1.tipoIngreso} />
                  <SummaryRow label="Salario base" value={fmtSalario(s1.salarioBasico)} />
                  <SummaryRow label="Fecha de ingreso" value={s1.fechaIngreso} />
                  {s2.fechaFinContrato && <SummaryRow label="Fecha fin contrato" value={s2.fechaFinContrato} />}
                  {s2.empresaTemporal && <SummaryRow label="Empresa temporal" value={s2.empresaTemporal} />}
                </dl>
              </div>

              {/* Pago */}
              <div className="px-8 py-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">
                  Datos de Pago
                </h4>
                <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <SummaryRow label="Banco" value={s2.banco} />
                  <SummaryRow label="Tipo de cuenta" value={CUENTA_LABELS[s2.tipoCuenta] ?? s2.tipoCuenta} />
                  <SummaryRow label="Número de cuenta" value={s2.numeroCuenta} />
                  {s2.ciudad && <SummaryRow label="Ciudad" value={s2.ciudad} />}
                </dl>
              </div>
            </div>
          </div>

          {/* Confirmation checkbox */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmado}
              onChange={(e) => setConfirmado(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-primary rounded flex-shrink-0"
            />
            <span className="text-sm text-on-surface">
              Confirmo que los datos ingresados son correctos y autorizo la vinculación del empleado al sistema.
            </span>
          </label>

          <div className="flex justify-between">
            <Button variant="secondary" icon="arrow_back" onClick={() => goBack(2)}>
              Volver
            </Button>
            <Button
              icon="person_add"
              disabled={!confirmado || loading}
              loading={loading}
              onClick={submitForm}
            >
              Vincular Empleado
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
