const colorMap = {
  active: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
  inactive: 'bg-slate-400',
  pending: 'bg-amber-500 shadow-[0_0_8px_rgba(245,188,114,0.5)]',
  error: 'bg-error shadow-[0_0_8px_rgba(186,26,26,0.5)]',
  warning: 'bg-amber-500 shadow-[0_0_8px_rgba(245,188,114,0.5)]',
}

const labelMap = {
  active: { text: 'Activo', cls: 'text-emerald-700' },
  inactive: { text: 'Inactivo', cls: 'text-slate-500' },
  pending: { text: 'Pendiente', cls: 'text-amber-700' },
  error: { text: 'Error', cls: 'text-error' },
  warning: { text: 'Advertencia', cls: 'text-amber-700' },
}

export default function StatusOrb({ status = 'active', label, className = '' }) {
  const orbCls = colorMap[status] || colorMap.inactive
  const defaultLabel = labelMap[status] || labelMap.inactive
  const displayLabel = label ?? defaultLabel.text
  const textCls = defaultLabel.cls

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`status-orb ${orbCls}`} />
      <span className={`text-xs font-semibold uppercase tracking-wider ${textCls}`}>
        {displayLabel}
      </span>
    </div>
  )
}
