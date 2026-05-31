import { useState } from 'react'
import Badge from '../../components/ui/Badge'
import StatusOrb from '../../components/ui/StatusOrb'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const MOCK_USERS = [
  { id: 1, nombre: 'Margarita Rosa de Francisco', correo: 'm.rosa@empresa.com.co', rol: 'ADMIN_RRHH', activo: true, ultimoAcceso: 'Hoy, 09:42 AM' },
  { id: 2, nombre: 'Carlos Alberto Vives', correo: 'c.vives@empresa.com.co', rol: 'GERENTE', activo: true, ultimoAcceso: 'Ayer, 18:20 PM' },
  { id: 3, nombre: 'Mariana Pajón Londoño', correo: 'm.pajon@empresa.com.co', rol: 'CONTADOR', activo: true, ultimoAcceso: '12 Oct 2023' },
  { id: 4, nombre: 'Falcao García', correo: 'f.garcia@empresa.com.co', rol: 'EMPLEADO', activo: false, ultimoAcceso: '05 Oct 2023' },
  { id: 5, nombre: 'Sofía Vergara', correo: 's.vergara@empresa.com.co', rol: 'EMPLEADO', activo: true, ultimoAcceso: 'Hoy, 08:30 AM' },
]

const rolVariant = {
  ADMIN_RRHH: 'primary',
  GERENTE: 'gerente',
  CONTADOR: 'contador',
  EMPLEADO: 'empleado',
  LIDER_PROCESO: 'lider',
}

const rolLabels = {
  ADMIN_RRHH: 'ADMIN RRHH',
  GERENTE: 'GERENTE',
  CONTADOR: 'CONTADOR',
  EMPLEADO: 'EMPLEADO',
  LIDER_PROCESO: 'LÍDER PROCESO',
}

function initials(nombre) {
  return nombre.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export default function UsuariosPage() {
  const [search, setSearch] = useState('')
  const [rolFilter, setRolFilter] = useState('todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)

  const [form, setForm] = useState({ nombre: '', correo: '', rol: 'EMPLEADO', password: '' })

  const filtered = MOCK_USERS.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q) || u.rol.toLowerCase().includes(q)
    const matchRol = rolFilter === 'todos' || u.rol === rolFilter
    return matchSearch && matchRol
  })

  const openNew = () => {
    setEditUser(null)
    setForm({ nombre: '', correo: '', rol: 'EMPLEADO', password: '' })
    setModalOpen(true)
  }

  const openEdit = (u) => {
    setEditUser(u)
    setForm({ nombre: u.nombre, correo: u.correo, rol: u.rol, password: '' })
    setModalOpen(true)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-primary-container tracking-tight">
            Gestión de Usuarios
          </h2>
          <p className="text-on-surface-variant font-medium mt-1">
            Administra los accesos al sistema
          </p>
        </div>
        <Button onClick={openNew} icon="add">Nuevo Usuario</Button>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-wrap items-center gap-4 border border-outline-variant/10">
        <div className="flex-1 min-w-[280px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o rol..."
            className="w-full bg-background border border-outline-variant/20 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-fixed-dim/50 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Roles:</label>
          <select
            value={rolFilter}
            onChange={(e) => setRolFilter(e.target.value)}
            className="bg-background border border-outline-variant/20 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary-fixed-dim/50 outline-none"
          >
            <option value="todos">Todos los roles</option>
            <option value="ADMIN_RRHH">ADMIN RRHH</option>
            <option value="GERENTE">GERENTE</option>
            <option value="CONTADOR">CONTADOR</option>
            <option value="EMPLEADO">EMPLEADO</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              {['Nombre', 'Correo', 'Rol', 'Estado', 'Último acceso', 'Acciones'].map((h, i) => (
                <th key={h} className={`px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 ${i === 5 ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {filtered.map((u, i) => (
              <tr key={u.id} className={`group hover:bg-surface-container-low/30 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/10' : ''}`}>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {initials(u.nombre)}
                    </div>
                    <span className="font-semibold text-primary-container">{u.nombre}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant font-medium">{u.correo}</td>
                <td className="px-6 py-5">
                  <Badge variant={rolVariant[u.rol]}>{rolLabels[u.rol]}</Badge>
                </td>
                <td className="px-6 py-5">
                  <StatusOrb status={u.activo ? 'active' : 'inactive'} />
                </td>
                <td className="px-6 py-5 text-xs text-on-surface-variant font-medium">{u.ultimoAcceso}</td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(u)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed rounded transition-all">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button className={`p-2 rounded transition-all ${u.activo ? 'text-primary hover:bg-primary-fixed' : 'text-slate-300 hover:text-primary'}`}>
                      <span className="material-symbols-outlined text-xl">{u.activo ? 'toggle_on' : 'toggle_off'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-6 bg-surface-container-low/50 flex justify-between items-center border-t border-outline-variant/10">
          <span className="text-sm font-medium text-on-surface-variant">
            Mostrando <span className="text-primary">{filtered.length}</span> de{' '}
            <span className="text-primary">128</span> registros
          </span>
          <div className="flex items-center gap-1">
            {['first_page', 'chevron_left'].map((ic) => (
              <button key={ic} className="p-2 rounded-lg text-outline-variant hover:text-primary hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined">{ic}</span>
              </button>
            ))}
            <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded">1</span>
            {['chevron_right', 'last_page'].map((ic) => (
              <button key={ic} className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined">{ic}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: 'verified_user', label: 'Seguridad', val: '12 Usuarios Admin Activos' },
          { icon: 'history', label: 'Auditoría', val: 'Última actualización: hace 4 min' },
          { icon: 'badge', label: 'Licencias', val: '128 / 500 Cupos utilizados' },
        ].map((c) => (
          <div key={c.label} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex items-center gap-4">
            <div className="p-3 bg-primary/5 rounded-full text-primary">
              <span className="material-symbols-outlined">{c.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em]">{c.label}</p>
              <p className="text-sm font-semibold text-primary-container">{c.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <div className="space-y-5">
          <Input label="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Lucía Martínez" />
          <Input label="Correo electrónico" type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} placeholder="correo@empresa.com" />
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Rol</label>
            <select
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
              className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all text-sm"
            >
              <option value="ADMIN_RRHH">Admin RRHH</option>
              <option value="GERENTE">Gerente</option>
              <option value="CONTADOR">Contador</option>
              <option value="EMPLEADO">Empleado</option>
              <option value="LIDER_PROCESO">Líder de Proceso</option>
            </select>
          </div>
          {!editUser && (
            <Input label="Contraseña temporal" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              {editUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
