import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusOrb from '../../components/ui/StatusOrb'
import { seleccionService, etapaLabel, etapaOrb, candidatoNombre } from '../../services/seleccionService'

export default function CandidatosPage() {
  const navigate = useNavigate()
  const [candidatos, setCandidatos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [etapaFilter, setEtapaFilter] = useState('todos')

  const load = () => {
    setLoading(true)
    setError('')
    seleccionService.candidatos.list()
      .then((data) => setCandidatos(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudo cargar la lista de candidatos.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = candidatos.filter((c) => {
    const q = search.toLowerCase()
    const matchQ = !q
      || candidatoNombre(c).toLowerCase().includes(q)
      || c.cargoAplicado?.toLowerCase().includes(q)
      || c.email?.toLowerCase().includes(q)
    const matchEtapa = etapaFilter === 'todos' || c.etapaActual === etapaFilter
    return matchQ && matchEtapa
  })

  function initials(c) {
    return [c.nombres, c.apellidos]
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-3">
            <button onClick={() => navigate('/seleccion')} className="hover:text-primary transition-colors">Selección</button>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-primary-container">Candidatos</span>
          </nav>
          <h2 className="text-3xl font-extrabold text-primary-container">Listado de Candidatos</h2>
        </div>
        <Button icon="person_add" onClick={() => navigate('/seleccion/candidatos/nuevo')}>Registrar Candidato</Button>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-low rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, cargo o correo..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim/30"
          />
        </div>
        <select
          value={etapaFilter}
          onChange={(e) => setEtapaFilter(e.target.value)}
          className="bg-white border border-outline-variant/20 rounded-lg text-sm text-on-surface px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim/30"
        >
          <option value="todos">Todas las etapas</option>
          <option value="preseleccion">Preselección</option>
          <option value="entrevista">Entrevista</option>
          <option value="prueba_tecnica">Prueba Técnica</option>
          <option value="oferta">Oferta</option>
          <option value="vinculado">Vinculado</option>
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-error-container/20 border border-error/20 rounded-xl text-sm text-error">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">autorenew</span>
            <span className="text-sm">Cargando candidatos...</span>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                {['Candidato', 'Cargo Aplicado', 'Etapa', 'Estado', 'Registro', 'Acciones'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 ${i === 5 ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="group hover:bg-surface-container-low/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/seleccion/candidatos/${c.id}`)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {initials(c)}
                      </div>
                      <div>
                        <div className="font-semibold text-primary-container text-sm">{candidatoNombre(c)}</div>
                        <div className="text-[11px] text-on-surface-variant/70">{c.email || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">{c.cargoAplicado || '—'}</td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-bold bg-surface-container px-2 py-1 rounded uppercase tracking-wider text-on-surface-variant">
                      {etapaLabel(c.etapaActual)}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <StatusOrb status={etapaOrb(c.etapaActual)} />
                  </td>
                  <td className="px-8 py-5 text-xs text-on-surface-variant">
                    {c.fechaRegistro ? new Date(c.fechaRegistro).toLocaleDateString('es-CO') : '—'}
                  </td>
                  <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/seleccion/candidatos/${c.id}`)}
                      className="text-xs font-bold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Ver perfil
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm text-on-surface-variant">
                    {candidatos.length === 0 ? 'No hay candidatos registrados aún.' : 'No se encontraron candidatos con ese criterio.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        {!loading && (
          <div className="px-8 py-3 bg-surface-container-low/20 border-t border-outline-variant/5">
            <p className="text-xs text-on-surface-variant">
              {filtered.length} candidato{filtered.length !== 1 ? 's' : ''}{search || etapaFilter !== 'todos' ? ' encontrados' : ' en total'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
