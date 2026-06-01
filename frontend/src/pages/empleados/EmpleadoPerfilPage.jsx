import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { employeeService } from '../../services/employeeService'
import StatusOrb from '../../components/ui/StatusOrb'
import Button from '../../components/ui/Button'

const MOCK = {
  id: 1,
  nombre: 'Juliana Pérez Castro',
  cargo: 'Analista Contable',
  area: 'Finanzas & Contabilidad',
  correo: 'jperez@empresa.com',
  telefono: '+57 310 456 7890',
  cedula: '1.023.456.789',
  fechaIngreso: '05/07/2019',
  tipoContrato: 'Indefinido',
  estado: 'ACTIVO',
  salario: '$3,500,000',
  eps: 'Sura',
  arl: 'Positiva',
  fondo: 'Protección',
  ciudad: 'Medellín, Antioquia',
}

export default function EmpleadoPerfilPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [emp, setEmp] = useState(MOCK)

  useEffect(() => {
    employeeService.get(id).then(setEmp).catch(() => setEmp(MOCK))
  }, [id])

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest">
        <button onClick={() => navigate('/empleados')} className="hover:text-primary transition-colors">Empleados</button>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-primary-container">{emp.nombre}</span>
      </nav>

      {/* Profile header */}
      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-card">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="w-20 h-20 rounded-xl bg-primary-fixed flex items-center justify-center font-black text-primary text-2xl flex-shrink-0">
            {emp.nombre.split(' ').slice(0, 2).map((w) => w[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-extrabold text-primary-container">{emp.nombre}</h2>
            <p className="text-on-surface-variant font-medium">{emp.cargo} · {emp.area}</p>
            <div className="mt-3 flex items-center gap-4 flex-wrap">
              <StatusOrb status={emp.estado === 'ACTIVO' ? 'active' : 'inactive'} />
              <span className="text-xs text-on-surface-variant">Ingreso: {emp.fechaIngreso}</span>
              <span className="text-xs text-on-surface-variant">Contrato: {emp.tipoContrato}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="sm" icon="description" onClick={() => navigate(`/empleados/${id}/hoja-vida`)}>
              Hoja de Vida
            </Button>
            <Button variant="secondary" size="sm" icon="folder" onClick={() => navigate(`/empleados/${id}/documentos`)}>
              Documentos
            </Button>
            <Button variant="primary" size="sm" icon="badge" onClick={() => navigate(`/empleados/${id}/certificacion`)}>
              Certificación
            </Button>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos personales */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-5">
            Datos Personales
          </h3>
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
                  <p className="text-sm font-semibold text-on-surface">{f.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Datos laborales */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-5">
            Datos Laborales
          </h3>
          <div className="space-y-4">
            {[
              { icon: 'payments', label: 'Salario', val: emp.salario },
              { icon: 'local_hospital', label: 'EPS', val: emp.eps },
              { icon: 'security', label: 'ARL', val: emp.arl },
              { icon: 'savings', label: 'Fondo de Pensión', val: emp.fondo },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-outline text-lg">{f.icon}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{f.label}</p>
                  <p className="text-sm font-semibold text-on-surface">{f.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Afiliaciones', icon: 'assignment_ind', to: `/empleados/${id}/afiliaciones` },
          { label: 'Retiro', icon: 'exit_to_app', to: `/empleados/${id}/retiro`, danger: true },
        ].map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.to)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-0.5 ${a.danger ? 'border-error/20 bg-error-container/10 text-error hover:bg-error-container/20' : 'border-outline-variant/10 bg-surface-container-lowest text-primary-container hover:bg-surface-container-low'}`}
          >
            <span className="material-symbols-outlined text-2xl">{a.icon}</span>
            <span className="text-xs font-bold">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
