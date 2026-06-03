import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { payrollService } from '../../services/payrollService'

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function ResultadoLiquidacionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    payrollService.periodos
      .liquidar(id)
      .then(setResultado)
      .catch(() => setError('No se pudo calcular la liquidación. Verifique que el periodo tenga novedades registradas.'))
      .finally(() => setLoading(false))
  }, [id])

  const empleados = resultado?.empleados || resultado?.detalle || []
  const totDevengado = empleados.reduce((a, e) => a + (e.devengado || e.total_devengado || 0), 0)
  const totDeducido = empleados.reduce((a, e) => a + (e.deducido || e.total_deducido || 0), 0)
  const totNeto = empleados.reduce((a, e) => a + (e.neto || e.neto_pagar || 0), 0)

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/nomina/periodos')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-primary-container">Resultado de Liquidación</h2>
          <p className="text-on-surface-variant text-sm">Periodo: {id}</p>
        </div>
        {resultado && (
          <div className="flex gap-2">
            <Button variant="secondary" icon="download">Exportar</Button>
            <Button icon="send" onClick={() => navigate(`/nomina/periodos/${id}/aprobar`)}>Enviar a Aprobación</Button>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
          <p className="text-sm font-medium">Calculando liquidación del periodo...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container rounded-lg">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container font-medium">{error}</p>
        </div>
      )}

      {resultado && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Devengado', value: fmt(totDevengado || resultado.total_devengado || 0), color: 'text-emerald-700' },
              { label: 'Total Deducido', value: fmt(totDeducido || resultado.total_deducido || 0), color: 'text-error' },
              { label: 'Total a Pagar', value: fmt(totNeto || resultado.total_neto || resultado.neto_pagar || 0), color: 'text-primary-container', highlight: true },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-5 ${s.highlight ? 'bg-primary-container text-white' : 'bg-surface-container-lowest border border-outline-variant/10'} shadow-card`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${s.highlight ? 'text-white/70' : 'text-on-surface-variant'}`}>{s.label}</p>
                <p className={`text-2xl font-extrabold ${s.highlight ? 'text-white' : s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {empleados.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    {['Empleado', 'Salario Base', 'Total Devengado', 'Total Deducido', 'Neto a Pagar', 'Detalle'].map((h, i) => (
                      <th key={h} className={`px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {empleados.map((e, i) => (
                    <tr key={e.id || e.empleado_id || i} className={`group hover:bg-surface-container-low/30 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/10' : ''}`}>
                      <td className="px-8 py-5">
                        <p className="font-semibold text-on-surface text-sm">{e.nombre || e.empleado}</p>
                        <p className="text-[11px] text-on-surface-variant">{e.cargo}</p>
                      </td>
                      <td className="px-8 py-5 text-sm text-on-surface-variant">{fmt(e.salario || e.salario_base || 0)}</td>
                      <td className="px-8 py-5 text-sm font-semibold text-emerald-700">{fmt(e.devengado || e.total_devengado || 0)}</td>
                      <td className="px-8 py-5 text-sm font-semibold text-error">{fmt(e.deducido || e.total_deducido || 0)}</td>
                      <td className="px-8 py-5 text-sm font-bold text-primary-container">{fmt(e.neto || e.neto_pagar || 0)}</td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => navigate(`/nomina/periodos/${id}/empleado/${e.id || e.empleado_id}`)} className="text-[11px] font-bold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver conceptos
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
