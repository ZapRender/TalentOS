import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'

const HISTORIAL = [
  { mes: 'Mayo 2025', empleados: 1280, total: '$48,250,000', estado: 'active', archivo: 'PILA_202505.txt' },
  { mes: 'Abril 2025', empleados: 1275, total: '$47,890,000', estado: 'active', archivo: 'PILA_202504.txt' },
  { mes: 'Marzo 2025', empleados: 1270, total: '$47,500,000', estado: 'active', archivo: 'PILA_202503.txt' },
]

export default function PILAPage() {
  const navigate = useNavigate()
  const [mes, setMes] = useState('')

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-3">
            <button onClick={() => navigate('/nomina')} className="hover:text-primary">Nómina</button>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-primary-container">PILA</span>
          </nav>
          <h2 className="text-3xl font-extrabold text-primary-container">Exportar Archivo Plano PILA</h2>
        </div>
      </div>

      {/* Generator */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-card">
        <h3 className="font-bold text-primary-container mb-5">Generar Nuevo Archivo</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Mes de Liquidación</label>
            <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="w-full h-12 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-all" />
          </div>
          <Button icon="description">Generar PILA</Button>
        </div>
      </div>

      {/* History */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        <div className="px-8 py-5 bg-surface-container-low/50 border-b border-outline-variant/10">
          <h3 className="font-bold text-primary-container">Historial de Archivos</h3>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-container-low/30">
              {['Periodo', 'Empleados', 'Total Aportes', 'Estado', 'Archivo', 'Descargar'].map((h, i) => (
                <th key={h} className={`px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {HISTORIAL.map((h, i) => (
              <tr key={h.mes} className={`group hover:bg-surface-container-low/20 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/10' : ''}`}>
                <td className="px-8 py-5 font-semibold text-on-surface text-sm">{h.mes}</td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">{h.empleados.toLocaleString()}</td>
                <td className="px-8 py-5 text-sm font-bold text-primary-container">{h.total}</td>
                <td className="px-8 py-5"><StatusOrb status={h.estado} label="Generado" /></td>
                <td className="px-8 py-5 text-xs text-on-surface-variant font-mono">{h.archivo}</td>
                <td className="px-8 py-5 text-right">
                  <button className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-sm">download</span>
                    Descargar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
