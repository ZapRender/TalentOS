import { useState, useEffect, useRef } from 'react'

const STAGGER_DELAYS = [0, 50, 100, 150, 200, 250]

export default function SpeedDial({ actions = [] }) {
  const [open, setOpen] = useState(false)
  const dialRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!actions.length) return null

  return (
    <>
      {/* Backdrop — transparent, just catches outside clicks */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Speed dial container */}
      <div ref={dialRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Action buttons — fixed-width container so all icon buttons align in the same column */}
        <div className="flex flex-col-reverse gap-3" style={{ minWidth: '260px' }}>
          {actions.map((action, i) => (
            <div
              key={action.label}
              className={`flex items-center justify-between gap-3 transition-all duration-200 ${
                open
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
              style={{ transitionDelay: open ? `${STAGGER_DELAYS[i] || 0}ms` : '0ms' }}
            >
              {/* Label pill */}
              <span className="text-sm font-semibold text-on-surface bg-white px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap select-none">
                {action.label}
              </span>

              {/* Icon button — always at the right edge */}
              <button
                onClick={() => { setOpen(false); action.onClick() }}
                className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-surface-container-low transition-colors flex-shrink-0"
                aria-label={action.label}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ color: '#1f4e79' }}
                >
                  {action.icon}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Main FAB */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #00375e, #1f4e79)' }}
          aria-label={open ? 'Cerrar menú' : 'Nuevo trámite'}
        >
          <span
            className={`material-symbols-outlined text-white text-[28px] transition-transform duration-200 ${
              open ? 'rotate-45' : 'rotate-0'
            }`}
          >
            add
          </span>
        </button>
      </div>
    </>
  )
}
