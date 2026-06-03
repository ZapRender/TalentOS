import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

function initials(nombre) {
  return (nombre || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function Topbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hasNotif] = useState(true)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showDrop, setShowDrop] = useState(false)
  const [searching, setSearching] = useState(false)
  const timerRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setShowDrop(false)
      return
    }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.get('/api/employees', { params: { search: query.trim(), limit: 5 } })
        const raw = res.data?.data ?? res.data ?? []
        const list = Array.isArray(raw) ? raw : []
        setResults(
          list.slice(0, 5).map((e) => ({
            id: e.id,
            nombre: [e.nombres, e.apellidos].filter(Boolean).join(' ') || e.nombre || '',
            cargo: e.cargo || '',
            area: e.seccion || e.area || '',
          }))
        )
        setShowDrop(true)
      } catch {
        setResults([])
        setShowDrop(false)
      } finally {
        setSearching(false)
      }
    }, 500)
    return () => clearTimeout(timerRef.current)
  }, [query])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setShowDrop(false)
      navigate(`/empleados?search=${encodeURIComponent(query.trim())}`)
    }
    if (e.key === 'Escape') {
      setShowDrop(false)
      setQuery('')
    }
  }

  const pickResult = (emp) => {
    setQuery('')
    setShowDrop(false)
    navigate(`/empleados/${emp.id}`)
  }

  return (
    <header className="sticky top-0 right-0 w-full z-40 h-16 flex items-center justify-between px-8 glass border-b border-outline-variant/20">
      {/* Search */}
      <div className="flex items-center flex-1 max-w-md" ref={wrapRef}>
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            {searching ? 'autorenew' : 'search'}
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setShowDrop(true)}
            placeholder="Buscar empleados... (Enter para ver todos)"
            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim/50 transition-all"
          />

          {/* Dropdown */}
          {showDrop && results.length > 0 && (
            <div className="absolute top-full mt-1 left-0 w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xl z-50 overflow-hidden">
              {results.map((emp) => (
                <button
                  key={emp.id}
                  onMouseDown={() => pickResult(emp)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary text-xs flex-shrink-0">
                    {initials(emp.nombre)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-on-surface truncate">{emp.nombre}</p>
                    <p className="text-xs text-on-surface-variant truncate">{emp.cargo}{emp.area ? ` · ${emp.area}` : ''}</p>
                  </div>
                  <span className="material-symbols-outlined text-outline text-sm ml-auto flex-shrink-0">
                    arrow_forward
                  </span>
                </button>
              ))}
              <button
                onMouseDown={() => { setShowDrop(false); navigate(`/empleados?search=${encodeURIComponent(query)}`) }}
                className="w-full px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary-fixed/10 transition-colors border-t border-outline-variant/10 text-center"
              >
                Ver todos los resultados para "{query}"
              </button>
            </div>
          )}

          {showDrop && query.trim() && results.length === 0 && !searching && (
            <div className="absolute top-full mt-1 left-0 w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xl z-50 px-4 py-3 text-sm text-on-surface-variant">
              Sin resultados para "{query}"
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-outline relative">
            <span className="material-symbols-outlined">notifications</span>
            {hasNotif && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-white" />
            )}
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-outline">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>

        <div className="h-7 w-px bg-outline-variant/30" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-primary-container leading-none">
              {user?.nombre || 'Usuario'}
            </p>
            <p className="text-[11px] text-outline mt-0.5">{user?.rol || ''}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
            {initials(user?.nombre || '')}
          </div>
        </div>
      </div>
    </header>
  )
}
