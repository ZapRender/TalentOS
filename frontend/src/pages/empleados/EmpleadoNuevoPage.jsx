import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function EmpleadoNuevoPage() {
  const navigate = useNavigate()
  const [step] = useState(1)
  const [form, setForm] = useState({
    nombre: '', apellido: '', cedula: '', fechaNac: '', correo: '', telefono: '',
    cargo: '', area: '', tipoContrato: 'INDEFINIDO', salario: '', fechaIngreso: '',
    eps: '', arl: '', fondo: '', cajaComp: '',
  })

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/empleados')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-primary-container">Vincular Nuevo Empleado</h2>
          <p className="text-on-surface-variant text-sm">Paso 1 de 3 — Datos personales</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${s === step ? 'bg-primary text-white' : s < step ? 'bg-primary-fixed-dim text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
              {s < step ? <span className="material-symbols-outlined text-sm">check</span> : s}
            </div>
            {s < 3 && <div className={`h-px flex-1 w-12 ${s < step ? 'bg-primary-fixed-dim' : 'bg-outline-variant/30'}`} />}
          </div>
        ))}
        <span className="ml-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          {step === 1 ? 'Datos Personales' : step === 2 ? 'Datos Laborales' : 'Afiliaciones'}
        </span>
      </div>

      {/* Form */}
      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-card space-y-6">
        <h3 className="text-lg font-bold text-primary-container">Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Nombres" value={form.nombre} onChange={set('nombre')} placeholder="Ej. Juliana" />
          <Input label="Apellidos" value={form.apellido} onChange={set('apellido')} placeholder="Ej. Pérez Castro" />
          <Input label="Número de Cédula" value={form.cedula} onChange={set('cedula')} placeholder="Ej. 1.023.456.789" />
          <Input label="Fecha de Nacimiento" type="date" value={form.fechaNac} onChange={set('fechaNac')} />
          <Input label="Correo Electrónico" type="email" value={form.correo} onChange={set('correo')} placeholder="correo@empresa.com" />
          <Input label="Teléfono" type="tel" value={form.telefono} onChange={set('telefono')} placeholder="+57 300 000 0000" />
        </div>

        <h3 className="text-lg font-bold text-primary-container pt-2">Información Laboral</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Cargo" value={form.cargo} onChange={set('cargo')} placeholder="Ej. Analista Contable" />
          <Input label="Área / Departamento" value={form.area} onChange={set('area')} placeholder="Ej. Finanzas" />
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Tipo de Contrato</label>
            <select value={form.tipoContrato} onChange={set('tipoContrato')} className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all">
              <option value="INDEFINIDO">Indefinido</option>
              <option value="FIJO">Término Fijo</option>
              <option value="OBRA">Obra y Labor</option>
              <option value="PRESTACION">Prestación de Servicios</option>
            </select>
          </div>
          <Input label="Salario Base" value={form.salario} onChange={set('salario')} placeholder="Ej. 3.500.000" />
          <Input label="Fecha de Ingreso" type="date" value={form.fechaIngreso} onChange={set('fechaIngreso')} />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => navigate('/empleados')}>Cancelar</Button>
        <Button variant="primary" iconRight="arrow_forward">Continuar</Button>
      </div>
    </div>
  )
}
