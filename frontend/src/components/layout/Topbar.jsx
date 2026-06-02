import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function Topbar() {
  const { user } = useAuth()
  const [hasNotif] = useState(true)

  return (
    <header className="sticky top-0 right-0 w-full z-40 h-16 flex items-center justify-between px-8 glass border-b border-outline-variant/20">
      {/* Search */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar empleados, trámites..."
            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim/50 transition-all"
          />
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
            {user?.nombre
              ?.split(' ')
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase() || '?'}
          </div>
        </div>
      </div>
    </header>
  )
}
