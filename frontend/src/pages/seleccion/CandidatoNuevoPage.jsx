import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function CandidatoNuevoPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', ciudad: '', cargo: '', salario: '', disponibilidad: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/seleccion/candidatos')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-primary-container">Registrar Candidato</h2>
          <p className="text-on-surface-variant text-sm">Nuevo proceso de selección</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Nombre completo" value={form.nombre} onChange={set('nombre')} placeholder="Ej. Sebastián Jaramillo" />
          <Input label="Correo electrónico" type="email" value={form.correo} onChange={set('correo')} placeholder="candidato@email.com" />
          <Input label="Teléfono" type="tel" value={form.telefono} onChange={set('telefono')} placeholder="+57 311 000 0000" />
          <Input label="Ciudad" value={form.ciudad} onChange={set('ciudad')} placeholder="Ej. Bogotá" />
          <Input label="Cargo al que aplica" value={form.cargo} onChange={set('cargo')} placeholder="Ej. Desarrollador Backend" />
          <Input label="Aspiración salarial" value={form.salario} onChange={set('salario')} placeholder="Ej. 5.000.000" />
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Disponibilidad</label>
          <select value={form.disponibilidad} onChange={set('disponibilidad')} className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all">
            <option value="">Seleccionar...</option>
            <option value="inmediata">Inmediata</option>
            <option value="15_dias">15 días</option>
            <option value="30_dias">30 días</option>
            <option value="60_dias">60 días</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Hoja de Vida (CV)</label>
          <div className="border-2 border-dashed border-outline-variant/40 rounded-xl p-8 text-center hover:border-primary-fixed-dim transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-3xl text-outline-variant mb-2 block">upload_file</span>
            <p className="text-sm font-medium text-on-surface-variant">Arrastra el archivo aquí o haz clic para seleccionar</p>
            <p className="text-xs text-outline mt-1">PDF, DOC — Máx. 5MB</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => navigate('/seleccion/candidatos')}>Cancelar</Button>
        <Button variant="primary">Registrar Candidato</Button>
      </div>
    </div>
  )
}
